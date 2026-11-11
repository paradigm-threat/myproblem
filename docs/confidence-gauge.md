# Confidence gauge

The live assistant gathers the problem and stops when it should not keep advising. It is not a general chat product. Grok and other models are a **backup** for a clearer wording or a better image read. They do not decide the gauge, and they do not take the product outside problem solving and requirements.

Related: [`projects.md`](./projects.md) · [`backbone-escalate.md`](./backbone-escalate.md) · [`pii-and-privacy.md`](./pii-and-privacy.md) · [`anonymous-tickets.md`](./anonymous-tickets.md) · [`apk-ticket-ux.md`](./apk-ticket-ux.md).

---

## Two numbers

| Gauge | Range | What it means |
|---|---|---|
| **Understanding** | 0–100 | How specific the problem is: what, where, when, what was already tried, and what done looks like. |
| **Solution** | empty, then 0–100 | How likely a short next step is to be clear and useful. Empty until understanding is ready. |

Thresholds in `workers/lib/confidenceGauge.mjs`:

- Ordinary problems keep one question until understanding is **80**.
- Hazardous problems do not ask “what have you already tried,” because that invites a repair attempt. They move on at **70**, or immediately when the situation is an emergency.
- A next step is shown only when solution confidence is **65** or higher **and** the problem matches a known ordinary pattern.
- Anything under 65 is not advised.

The number is a requirements score. It is not a claim that the physical work was verified.

---

## The question on the capture screen

While you talk and show the problem, **one question** stays on screen, above the camera, until the requirements are specific. You answer by talking and moving the phone. The field is `confidence.ask`.

- A safety stop wins. The screen does not ask for a closer look at live wiring, gas, fire, or a medical emergency.
- Otherwise it asks the next missing fact: what is happening, where, when, what you tried, what fixed looks like.
- If those are filled and a still does not show the problem, it asks for the missing shot.
- When nothing is left to ask, it says to keep showing the problem or stop.

Clips of speech upload about every 12 seconds so the question can change before you press stop. A spoken reply from the AI is a later phase.

## What the live pass may say

One missing fact at a time, in this order: what is happening, where, when, what you tried, what fixed looks like.

When the solution gauge clears 65, the ticket gets one short next step. Known ordinary cases today: a flat tire, a clogged sink, a chirping alarm with no smoke, and being locked out. The locked-out step is “use a spare or call a locksmith.” It does not include forcing a lock.

When the solution gauge stays under 65, the coach says we are not confident enough to advise further and that the ticket can be posted for the **batch pass**. No repair steps are attached.

Hazardous problems (electrical, gas, fire, medical, structural, and the other stops in the safety restraint) keep the safety warning. Their solution score is capped at **28**. The gauge never attaches wiring, gas, medical, or similar steps.

---

## Batch pass, then a person

`POST /api/tickets/:id/batch-review` (claim required) is the batch tier’s confidence check.

- If a required fact is still missing, the batch pass does not invent it.
- A knowledge-base hit may lift a **known ordinary** pattern over 65. The instruction is still the short next step, not a manual.
- A knowledge-base hit does **not** lift a hazard over the cap.
- The review records that a backup model such as Grok **may** be asked later for wording or a still. `used` stays false until a worker actually calls one. The gauge still decides.

If the batch pass is still under 65, the phase becomes **human**:

- The coach says a person should continue.
- A redacted post is written to `public/<ticket_uuid>.json` in the regional repo.
- `GET /api/public/posts/:uuid` returns that post with no claim and no media URIs.
- `GET /api/public/posts` lists **published posts only**. `GET /api/tickets` is still not a list.
- The private tip still requires the claim. Publishing the UUID does not grant edit access.
- Street, phone, email, and repair-step sentences are removed before the post is stored.
- Closing a ticket without preserve removes the public post.

---

## Product copy

- Understanding N% — one question, until the problem is specific.
- Solution N% — a next step, only when that number clears 65.
- Solution N% — not confident enough to advise further. Post this ticket so the batch pass can try.
- Solution N% — not confident advising further. A person should continue. The redacted post is public.
