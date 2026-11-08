/**
 * When INTAKE_URL is set, edge proxies ticket APIs to the Intake host.
 * Otherwise handlers run in-process (local/dev / Vercel until Intake is up).
 */
export function intakeBaseUrl(): string | null {
  const u = process.env.INTAKE_URL?.trim();
  return u ? u.replace(/\/$/, "") : null;
}

export async function proxyToIntake(req: Request, pathWithQuery: string): Promise<Response | null> {
  const base = intakeBaseUrl();
  if (!base) return null;
  const url = `${base}${pathWithQuery}`;
  const headers = new Headers(req.headers);
  headers.delete("host");
  const init: RequestInit = {
    method: req.method,
    headers,
    duplex: "half",
  } as RequestInit;
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }
  return fetch(url, init);
}
