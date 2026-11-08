"use client";

import { useId, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/contact";
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

function roleLabel(role: SignupRole) {
  return roles.find((r) => r.value === role)?.label ?? role;
}

export function SignupForm({ defaultRole = "business", id }: Props) {
  const uid = useId();
  const [role, setRole] = useState<SignupRole>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");

  const nameId = `${uid}-name`;
  const emailId = `${uid}-email`;
  const businessId = `${uid}-business`;
  const regionId = `${uid}-region`;
  const messageId = `${uid}-message`;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lines = [
      `Role: ${roleLabel(role)}`,
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
    ];
    if (role === "business" && businessName.trim()) {
      lines.push(`Business: ${businessName.trim()}`);
    }
    if (region.trim()) {
      lines.push(`Region: ${region.trim()}`);
    }
    if (message.trim()) {
      lines.push("", message.trim());
    }
    const subject = encodeURIComponent(
      `MyProblem waitlist — ${roleLabel(role)}`,
    );
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  function onRoleKeyDown(e: React.KeyboardEvent, index: number) {
    if (
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft" &&
      e.key !== "Home" &&
      e.key !== "End"
    ) {
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
    <form id={id} onSubmit={onSubmit} className="signup-form">
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

      <button type="submit" className="btn-primary">
        Open email to join
      </button>

      <p className="signup-mailto-hint">
        Or email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> directly —
        no account required.
      </p>
    </form>
  );
}
