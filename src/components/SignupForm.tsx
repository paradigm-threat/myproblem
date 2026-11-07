"use client";

import { useState } from "react";
import type { SignupRole } from "@/lib/types";

type Props = {
  defaultRole?: SignupRole;
  id?: string;
};

const roles: { value: SignupRole; label: string }[] = [
  { value: "business", label: "Local business" },
  { value: "user", label: "I have a Problem" },
  { value: "investor", label: "Investor" },
  { value: "region_interest", label: "Bring it to my region" },
];

export function SignupForm({ defaultRole = "business", id }: Props) {
  const [role, setRole] = useState<SignupRole>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name,
          email,
          businessName: role === "business" ? businessName : null,
          region:
            role === "region_interest" || region.trim() ? region : null,
          message: message.trim() || null,
          company_website: honeypot,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Something went wrong");
        return;
      }
      setStatus("ok");
      setName("");
      setEmail("");
      setBusinessName("");
      setRegion("");
      setMessage("");
    } catch {
      setStatus("error");
      setError("Network error — try again or email us");
    }
  }

  return (
    <form id={id} onSubmit={onSubmit} className="signup-form">
      <div className="role-tabs" role="tablist" aria-label="Signup type">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            role="tab"
            aria-selected={role === r.value}
            className={role === r.value ? "active" : undefined}
            onClick={() => setRole(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <label>
        Name
        <input
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label>
        Email
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      {role === "business" ? (
        <label>
          Business name
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </label>
      ) : null}

      {role === "region_interest" || role === "business" ? (
        <label>
          Region / city
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder={
              role === "region_interest"
                ? "Where should we pilot next?"
                : "Georgia, Israel, …"
            }
          />
        </label>
      ) : null}

      <label>
        Note (optional)
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What do you want us to know?"
        />
      </label>

      {/* honeypot */}
      <label className="hp" aria-hidden="true">
        Company website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </label>

      <button type="submit" className="btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Join the waitlist"}
      </button>

      {status === "ok" ? (
        <p className="form-ok" role="status">
          Thanks — we will be in touch.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="form-err" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
