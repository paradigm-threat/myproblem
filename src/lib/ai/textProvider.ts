/**
 * Text SI: Groq free tier first, Bedrock on rate-limit / optional 5xx.
 * Mirrors clevertree_chat/providers.py. Whisper ASR is Groq-only — no Bedrock path.
 */

import { createHash, createHmac } from "node:crypto";

export type TextCompletion = {
  text: string;
  provider: "groq" | "bedrock";
  model: string;
  failover: boolean;
};

function truthy(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase());
}

export function failoverEnabled(): boolean {
  const raw = process.env.CLEVERTREE_PROVIDER_FAILOVER;
  if (raw === undefined || raw.trim() === "") return true;
  return truthy("CLEVERTREE_PROVIDER_FAILOVER", true);
}

function failoverOn5xx(): boolean {
  return truthy("CLEVERTREE_BEDROCK_FAILOVER_ON_5XX", true);
}

function groqKey(): string {
  return (process.env.GROQ_API_KEY || "").trim();
}

function groqModel(): string {
  return (
    process.env.GROQ_TEXT_MODEL ||
    process.env.GROQ_INTAKE_MODEL ||
    process.env.GROQ_SI_MODEL ||
    "openai/gpt-oss-20b"
  ).trim();
}

function bedrockRegion(): string {
  return (
    process.env.CLEVERTREE_BEDROCK_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    "us-east-1"
  ).trim();
}

function bedrockModelId(): string {
  return (
    process.env.CLEVERTREE_BEDROCK_MODEL_ID ||
    process.env.BEDROCK_MODEL_ID ||
    "anthropic.claude-3-haiku-20240307-v1:0"
  ).trim();
}

function bedrockCreds():
  | { accessKey: string; secretKey: string; sessionToken: string }
  | null {
  const accessKey = (process.env.AWS_ACCESS_KEY_ID || "").trim();
  const secretKey = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();
  const sessionToken = (process.env.AWS_SESSION_TOKEN || "").trim();
  if (!accessKey || !secretKey) return null;
  return { accessKey, secretKey, sessionToken };
}

export function isRateLimitError(status: number, body = ""): boolean {
  if (status === 429) return true;
  const lower = body.toLowerCase();
  return [
    "rate limit",
    "rate_limit",
    "ratelimit",
    "too many requests",
    "quota",
    "tokens per day",
    "tpm",
    "rpm",
    "over capacity",
  ].some((n) => lower.includes(n));
}

function shouldFailover(status: number, body = ""): boolean {
  if (isRateLimitError(status, body)) return true;
  if (failoverOn5xx() && status >= 500 && status <= 599) return true;
  return false;
}

type ChatMessage = { role: string; content: string };

export async function completeGroq(
  messages: ChatMessage[],
  opts: { model?: string; temperature?: number; responseJson?: boolean } = {},
): Promise<TextCompletion> {
  const key = groqKey();
  if (!key) throw Object.assign(new Error("missing_GROQ_API_KEY"), { status: 0, provider: "groq" });
  const model = (opts.model || groqModel()).trim();
  const body: Record<string, unknown> = {
    model,
    temperature: opts.temperature ?? 0.2,
    messages,
  };
  if (opts.responseJson) body.response_format = { type: "json_object" };
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw Object.assign(new Error(`groq_http_${res.status}:${raw.slice(0, 300)}`), {
      status: res.status,
      provider: "groq",
      body: raw,
    });
  }
  const json = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = (json.choices?.[0]?.message?.content || "").trim();
  if (!text) {
    throw Object.assign(new Error("groq_empty_content"), {
      status: res.status,
      provider: "groq",
    });
  }
  return { text, provider: "groq", model, failover: false };
}

function hmac(key: Buffer | string, msg: string): Buffer {
  return createHmac("sha256", key).update(msg, "utf8").digest();
}

function signBedrock(opts: {
  method: string;
  host: string;
  path: string;
  region: string;
  body: Buffer;
  accessKey: string;
  secretKey: string;
  sessionToken: string;
}): Record<string, string> {
  const service = "bedrock";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = createHash("sha256").update(opts.body).digest("hex");
  let canonicalHeaders = `content-type:application/json\nhost:${opts.host}\nx-amz-date:${amzDate}\n`;
  let signedHeaders = "content-type;host;x-amz-date";
  if (opts.sessionToken) {
    canonicalHeaders += `x-amz-security-token:${opts.sessionToken}\n`;
    signedHeaders += ";x-amz-security-token";
  }
  const canonicalRequest = [
    opts.method,
    opts.path,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/${opts.region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest, "utf8").digest("hex"),
  ].join("\n");
  const kDate = hmac(`AWS4${opts.secretKey}`, dateStamp);
  const kRegion = hmac(kDate, opts.region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Host: opts.host,
    "X-Amz-Date": amzDate,
    Authorization: `AWS4-HMAC-SHA256 Credential=${opts.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
  if (opts.sessionToken) headers["X-Amz-Security-Token"] = opts.sessionToken;
  return headers;
}

export async function completeBedrock(
  messages: ChatMessage[],
  opts: { model?: string; temperature?: number; maxTokens?: number } = {},
): Promise<TextCompletion> {
  const creds = bedrockCreds();
  if (!creds) {
    throw Object.assign(new Error("missing_AWS_credentials"), {
      status: 0,
      provider: "bedrock",
    });
  }
  const region = bedrockRegion();
  const model = (opts.model || bedrockModelId()).trim();
  const system = messages
    .filter((m) => m.role === "system" && m.content)
    .map((m) => m.content)
    .join("\n\n");
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: [{ text: m.content }],
    }));
  const payload: Record<string, unknown> = {
    messages: chatMessages,
    inferenceConfig: {
      temperature: opts.temperature ?? 0.2,
      maxTokens: opts.maxTokens ?? 1024,
    },
  };
  if (system) payload.system = [{ text: system }];
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const path = `/model/${encodeURIComponent(model)}/converse`;
  const host = `bedrock-runtime.${region}.amazonaws.com`;
  const headers = signBedrock({
    method: "POST",
    host,
    path,
    region,
    body,
    accessKey: creds.accessKey,
    secretKey: creds.secretKey,
    sessionToken: creds.sessionToken,
  });
  const res = await fetch(`https://${host}${path}`, {
    method: "POST",
    headers,
    body,
  });
  const raw = await res.text();
  if (!res.ok) {
    throw Object.assign(new Error(`bedrock_http_${res.status}:${raw.slice(0, 300)}`), {
      status: res.status,
      provider: "bedrock",
      body: raw,
    });
  }
  const json = JSON.parse(raw) as {
    output?: { message?: { content?: { text?: string }[] } };
  };
  const text = (json.output?.message?.content || [])
    .map((p) => p.text || "")
    .join("\n")
    .trim();
  if (!text) {
    throw Object.assign(new Error("bedrock_empty_content"), {
      status: res.status,
      provider: "bedrock",
    });
  }
  return { text, provider: "bedrock", model, failover: false };
}

export async function completeText(
  messages: ChatMessage[],
  opts: {
    temperature?: number;
    responseJson?: boolean;
    groqModel?: string;
    bedrockModel?: string;
  } = {},
): Promise<TextCompletion> {
  const hasGroq = Boolean(groqKey());
  const hasBedrock = Boolean(bedrockCreds());
  if (!hasGroq && !hasBedrock) {
    throw new Error("no_text_provider_configured");
  }
  if (!hasGroq && hasBedrock) {
    const result = await completeBedrock(messages, {
      model: opts.bedrockModel,
      temperature: opts.temperature,
    });
    return { ...result, failover: false };
  }
  try {
    return await completeGroq(messages, {
      model: opts.groqModel,
      temperature: opts.temperature,
      responseJson: opts.responseJson,
    });
  } catch (err) {
    const e = err as { status?: number; body?: string; message?: string };
    const status = e.status ?? 0;
    const body = e.body || e.message || "";
    if (!(failoverEnabled() && shouldFailover(status, body))) throw err;
    if (!hasBedrock) throw err;
    const result = await completeBedrock(messages, {
      model: opts.bedrockModel,
      temperature: opts.temperature,
    });
    return { ...result, failover: true };
  }
}
