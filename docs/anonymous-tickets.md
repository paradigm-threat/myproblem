# Anonymous tickets — UUID SoT, free recover, Relay tip

Tickets are **anonymous by default**. The server keys each Problem by an internal **`ticket_uuid`**. Durable recovery is optional and **always free**: secret recover email and/or register. Pure anon must warn that **losing the phone (without local backup or recover email) loses those tickets**.

Related: [`projects.md`](./projects.md) · [`apk-ticket-ux.md`](./apk-ticket-ux.md) · [`progressive-transcription.md`](./progressive-transcription.md) · [`infra-definition.md`](./infra-definition.md) · [`knowledge-base.md`](./knowledge-base.md) · plan [`06-infrastructure.md`](../../relay/clevertree-llc-plan/06-infrastructure.md).

---

## One-sentence rule

> **Anon = device + local backup; attach a free recover email or register if you don’t want a lost phone to lose your tickets. Network tickets are PII-scrubbed; raw personal identifiers stay on the client (or move only via secure DM on request).**

---

## PII — client-held, automatic conversion

**Product policy (public copy on myproblem.app /terms §7):**

| Layer | Holds |
|---|---|
| **Client device** (APK / browser / local backup) | Raw PII the user spoke or typed (street address, phone, etc.) when not needed on the mesh |
| **Network ticket / Relay tip / shared cache** | **Converted safe context only** — city, coarse location band, problem facts without exact personal identifiers |
| **Secure 2-way DM** | Exact PII **only on request** when a service provider needs it and the user releases it — not published onto the dossier timeline |

When the LLM packages a ticket it **must** protect the creator: auto-convert personal detail that is not required for shared context (e.g. full address → city / safe radius). If it is personal, unused for ticket context, and not requested by a provider, it **never enters the network** (no server durable store / mesh cache of that PII).

Audio/stills Evidence used for investigation should follow the same spirit: prefer on-device hold of raw identifying media; network Evidence is for problem-solving content. Exact retention of blobs is an implementation workstream — do not regress the public promise that PII is not treated as shared-dossier material.

---

## Identity ladder

| Mode | What the user has | Lose phone alone? | Anonymous? |
|---|---|---|---|
| **Pure anon** | APK local backup of ticket list + claim material; server `ticket_uuid` | **Yes — tickets gone** (must warn in UI) | Yes |
| **Recover email** | Secret email on server (not public); magic link / OTP | No — reclaim via inbox | **No** (exits pure anon) |
| **Registered** | Free account linked to same tip ids | No — sign in on new device | **No** |

- **$0** to attach recover email or register. Never paywall recovery.  
- Recover email stays **secret** (ops/support only; not on public timeline or KB).  
- Copy when attaching identity: *“You’re no longer fully anonymous.”*

### Server vs APK

| Layer | Role |
|---|---|
| **`ticket_uuid`** | Internal server / Relay tip id — not the user’s recovery story |
| **Claim material** | API auth for that ticket (device-held; in local backup) |
| **APK local backup** | Offline safety net for reinstall / OS backup restore on same identity |
| **Recover email / account** | Cross-device durable root when user opts out of pure anon |

Absolute “never lose” is impossible (lose email access, ignore recover mail, delete account). Product bar: **phone loss alone should not lose tickets** once recover email or register is attached.

---

## Storage split (Relay SoT + cheap blobs)

```
APK / web (anon or identified)
   │  stills + audio Evidence (never video files)
   ▼
ticket_uuid ──► Relay tip = Problem dossier SoT
   │              (status, timeline, Evidence refs, patches)
   ├──► Thin queue index (Neon/Redis) — job leases only
   └──► Object store (prefer Bunny; S3-compatible OK)
            audio + still blobs; tip stores URI + hash
```

| Store | Holds | Does not hold |
|---|---|---|
| **Relay tip** | Problem file, InvestigationUpdate timeline, Evidence metadata | Multi-MB audio pinned on every node |
| **Object store** | Audio + still bytes (infra-funded; scale cheap) | Dossier semantics |
| **Thin queue index** | `asr_job` / Project leases, retries | Second copy of the dossier |

Prefer **Bunny** (or peer CDN/object) for $/GB; S3/R2/Vercel Blob acceptable. Funded as **infrastructure**, not an afterthought ([`05-spend-and-use-of-funds.md`](../../relay/clevertree-llc-plan/05-spend-and-use-of-funds.md)).

---

## Media rules

| Allowed on ticket | Forbidden server-side |
|---|---|
| Worthy/unique **stills** (APK gate + rate limit) | **Video files** / server-side video analysis |
| **Audio** Evidence → batched ASR | Client `/api/transcribe` |
| Local camera preview (never uploaded as video blob) | Pinning blobs inside the Relay tip body |

See [`progressive-transcription.md`](./progressive-transcription.md) · [`context-for-server.md`](./context-for-server.md).

---

## Notify (deferred Projects)

| Mode | How user learns batch finished |
|---|---|
| Pure anon | In-app poll / open ticket via local backup; no email |
| Recover email / account | Optional email + in-app; push later |

---

## Abuse / retention

- Soft caps on anon creates + audio minutes; stills rate limits unchanged.  
- TTL / archive for unclaimed silent tickets.  
- Channels / KB: anon tickets may tag `channel_id`s; public extracts stay redacted.

---

## Product copy (canonical)

- Tickets start anonymous.  
- Lose phone without recover email or register → tickets can be gone — we say so up front.  
- Recover email or register is **free** and enough that losing the phone alone should not lose tickets.  
- **PII stays on your device**; network tickets get automatic safe conversion; exact personal detail only via secure DM on request.  
- Investigation dossiers on Relay are **not** the place for raw street addresses / phone numbers.
