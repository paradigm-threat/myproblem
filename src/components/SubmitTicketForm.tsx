"use client";

import Link from "next/link";
import { useState } from "react";
import { TICKET_TRAINING_NOTICE } from "@/lib/contact";
import {
  getOrCreateVisitorId,
  rememberTicket,
  shareUrlForSlug,
} from "@/lib/tickets/vault";

type Region = "georgia" | "israel";

type Success = {
  ticket_uuid: string;
  claim: string;
  slug: string | null;
  region: Region;
  title: string;
};

export function SubmitTicketForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState<Region>("georgia");
  const [files, setFiles] = useState<FileList | null>(null);
  const [wantPublic, setWantPublic] = useState(false);
  const [publicSlug, setPublicSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);
  const [copied, setCopied] = useState<"uuid" | "slug" | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const visitor = getOrCreateVisitorId();
      const createRes = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-visitor-id": visitor,
        },
        body: JSON.stringify({
          region,
          raiser_visitor_id: visitor,
          mint_slug: false,
        }),
      });
      const createData = (await createRes.json()) as {
        ticket_uuid?: string;
        claim?: string;
        error?: string;
        message?: string;
      };
      if (!createRes.ok || !createData.ticket_uuid || !createData.claim) {
        throw new Error(
          createData.message || createData.error || "Could not create ticket",
        );
      }
      const { ticket_uuid, claim } = createData;
      const headers: HeadersInit = {
        "content-type": "application/json",
        "x-ticket-claim": claim,
        "x-visitor-id": visitor,
      };

      const patchRes = await fetch(`/api/tickets/${encodeURIComponent(ticket_uuid)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          title: title.trim() || "Untitled problem",
          description: description.trim(),
        }),
      });
      if (!patchRes.ok) {
        const err = (await patchRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Could not save ticket details");
      }

      if (files?.length) {
        for (const file of Array.from(files)) {
          if (file.type.startsWith("video/")) {
            throw new Error("Video uploads are not allowed — photos only");
          }
          if (!file.type.startsWith("image/")) continue;
          const form = new FormData();
          form.set("kind", "still");
          form.set("file", file);
          const evRes = await fetch(
            `/api/tickets/${encodeURIComponent(ticket_uuid)}/evidence`,
            {
              method: "POST",
              headers: {
                "x-ticket-claim": claim,
                "x-visitor-id": visitor,
              },
              body: form,
            },
          );
          if (!evRes.ok) {
            const err = (await evRes.json().catch(() => ({}))) as {
              error?: string;
            };
            throw new Error(err.error || `Photo upload failed (${file.name})`);
          }
        }
      }

      let slug: string | null = null;
      if (wantPublic) {
        const slugRes = await fetch(
          `/api/tickets/${encodeURIComponent(ticket_uuid)}/suggest-slug`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              apply: true,
              title: title.trim(),
              description: description.trim(),
              slug: publicSlug.trim() || undefined,
            }),
          },
        );
        const slugData = (await slugRes.json()) as {
          slug?: string;
          error?: string;
        };
        if (!slugRes.ok) {
          throw new Error(slugData.error || "Could not create public slug");
        }
        slug = slugData.slug || null;
      }

      rememberTicket({
        ticket_uuid,
        claim,
        slug,
        title: title.trim() || "Untitled problem",
        resolution: "unsolved",
      });
      setSuccess({
        ticket_uuid,
        claim,
        slug,
        region,
        title: title.trim() || "Untitled problem",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyText(kind: "uuid" | "slug", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  if (success) {
    const share =
      success.slug ? shareUrlForSlug(success.slug) : null;
    return (
      <div className="submit-success" role="status">
        <h2 className="ticket-section-title">Ticket created</h2>
        <p>
          <strong>{success.title}</strong> is saved on this device ({success.region}
          ). Keep the private ticket id — it is your capability key if you clear
          site data without a recover email.
        </p>
        <p className="submit-mono">
          <span className="muted">Ticket id</span>
          <br />
          <code>{success.ticket_uuid}</code>{" "}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => copyText("uuid", success.ticket_uuid)}
          >
            {copied === "uuid" ? "Copied" : "Copy id"}
          </button>
        </p>
        {share ? (
          <p>
            Public link (others with this URL can view and comment while it is
            live):{" "}
            <a href={share}>{share}</a>{" "}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => copyText("slug", share)}
            >
              {copied === "slug" ? "Copied" : "Copy link"}
            </button>
          </p>
        ) : (
          <p className="muted">
            This ticket is private — no public slug. You can still open it from
            “On this device” on public ticket pages after you publish later.
          </p>
        )}
        <p className="signup-disclaimer">
          {TICKET_TRAINING_NOTICE} Deleting a ticket or marking it resolved
          deletes uploaded assets (including photos) unless instructions say
          otherwise. You can unpublish a public slug later without deleting the
          tip.
        </p>
        <p className="cta-row">
          {share ? (
            <a className="btn-primary" href={share}>
              Open public page
            </a>
          ) : null}
          <Link className="btn-secondary" href="/">
            Home
          </Link>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSuccess(null);
              setTitle("");
              setDescription("");
              setFiles(null);
              setWantPublic(false);
              setPublicSlug("");
            }}
          >
            Submit another
          </button>
        </p>
      </div>
    );
  }

  return (
    <form className="signup-form submit-form" onSubmit={onSubmit}>
      <label>
        Title
        <input
          name="title"
          required
          maxLength={160}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short name for the problem"
        />
      </label>
      <label>
        What&apos;s going on?
        <textarea
          name="description"
          required
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the problem. Photos help a lot."
        />
      </label>
      <label>
        Region
        <select
          name="region"
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
        >
          <option value="georgia">Georgia (US)</option>
          <option value="israel">Israel</option>
        </select>
      </label>
      <label>
        Photos (optional)
        <input
          name="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />
      </label>
      <p className="muted">Images only — no video. Scrub faces/plates when you can.</p>

      <fieldset className="submit-public">
        <legend>Public share</legend>
        <label className="submit-check">
          <input
            type="checkbox"
            checked={wantPublic}
            onChange={(e) => setWantPublic(e.target.checked)}
          />
          Create a public slug so others can open a short link and help
        </label>
        {wantPublic ? (
          <>
            <p className="signup-disclaimer" role="note">
              While a public slug exists, anyone with the link can view this
              ticket and comment. You can remove the public link later
              (unpublish) without deleting the ticket. Deleting the ticket or
              marking it resolved deletes uploaded assets including photos
              unless instructions say otherwise.
            </p>
            <label>
              Preferred slug (optional)
              <input
                name="slug"
                value={publicSlug}
                onChange={(e) => setPublicSlug(e.target.value)}
                placeholder="e.g. garage-ring-power"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
              />
            </label>
          </>
        ) : null}
      </fieldset>

      <p className="signup-disclaimer" role="note">
        {TICKET_TRAINING_NOTICE}
      </p>

      {error ? <p className="form-err">{error}</p> : null}

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Submitting…" : "Create ticket"}
      </button>
    </form>
  );
}
