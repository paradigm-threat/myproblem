"use client";

import { useId, useState } from "react";
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
  const uid = useId();
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

  const nameId = `${uid}-name`;
  const emailId = `${uid}-email`;
  const businessId = `${uid}-business`;
  const regionId = `${uid}-region`;
  const messageId = `${uid}-message`;
  const errorId = `${uid}-error`;
  const okId = `${uid}-ok`;

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

  function onRoleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") {
      return;
    }
    e.preventDefault();
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % roles.length;
    if (e.key === "ArrowLeft") next = (index - 1 + roles.length) % roles.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = roles.length - 1;
    setRole(roles[next].value);
    const btn = document.getElementById(`${uid}-role-${roles[next].value}`);
    btn?.focus();
  }

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className="signup-form"
      noValidate={false}
      aria-describedby={
        status === "error" ? errorId : status === "ok" ? okId : undefined
      }
    >
      <div className="role-tabs" role="tablist" aria-label="Signup type">
        {roles.map((r, index) => (
          <button
            key={r.value}
            id={`${uid}-role-${r.value}`}
            type="button"
            role="tab"
            aria-selected={role === r.value}
            tabIndex={role === r.value ? 0 : -1}
            className={role === r.value ? "active" : undefined}
            onClick={() => setRole(r.value)}
            onKeyDown={(e) => onRoleKeyDown(e, index)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <label htmlFor={nameId}>
        Name
        <span className="req" aria-hidden="true">
          *
        </span>
        <input
          id={nameId}
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-required="true"
        />
      </label>

      <label htmlFor={emailId}>
        Email
        <span className="req" aria-hidden="true">
          *
        </span>
        <input
          id={emailId}
          name="email"
          required
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-required="true"
          aria-invalid={status === "error" ? true : undefined}
        />
      </label>

      {role === "business" ? (
        <label htmlFor={businessId}>
          Business name
          <span className="req" aria-hidden="true">
            *
          </span>
          <input
            id={businessId}
            name="businessName"
            required
            autoComplete="organization"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            aria-required="true"
          />
        </label>
      ) : null}

      {role === "region_interest" || role === "business" ? (
        <label htmlFor={regionId}>
          Region / city
          <input
            id={regionId}
            name="region"
            autoComplete="address-level2"
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

      <label htmlFor={messageId}>
        Note (optional)
        <textarea
          id={messageId}
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What do you want us to know?"
        />
      </label>

      <label className="hp" aria-hidden="true">
        Company website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </label>

      <button
        type="submit"
        className="btn-primary"
        disabled={status === "loading"}
        aria-busy={status === "loading"}
      >
        {status === "loading" ? "Sending…" : "Join the waitlist"}
      </button>

      {status === "ok" ? (
        <p id={okId} className="form-ok" role="status" aria-live="polite">
          Thanks — we will be in touch.
        </p>
      ) : null}
      {status === "error" ? (
        <p id={errorId} className="form-err" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
