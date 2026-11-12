# MyProblem — LLM Developer Guide: Testing Phase (Android Frontend / Device)

**Purpose:** Drop this document into an LLM (along with the Android source in `apps/android-testmode` and the linked docs). The LLM should drive as much work as possible autonomously. The human developer only intervenes for physical device actions, real-world scenario invention, and final judgment calls.

**Goal:** Produce a device-tested Android build with a finished product UI that supports simultaneous audio + camera stills + live AI coaching, packages a complete ticket, and sends it for batch Project investigation. Prefer free / least-resistance paths. Optional tip at the end.

## Hard Constraints (never violate)

- Upload **stills + audio only**. Never upload video files.
- Realtime AI = thin capture coach only (questions, guidance, field filling). Deep investigation = deferred batch Project.
- Anonymous tickets by default (UUID = access).
- Free forever; tip is optional and never required.
- Reuse existing ticket models, local store, sync, CameraX, audio capture, and coach code. Do not rewrite from scratch.
- Stay consistent with: `docs/apk-ticket-ux.md`, `docs/capture-guidance.md`, `docs/projects.md`, `docs/progressive-transcription.md`, `docs/confidence-gauge.md`.

## Task Execution Model

For every task below:
1. The LLM implements code / UI changes.
2. The LLM builds the debug APK (`./gradlew :app:assembleDebug` from `apps/android-testmode`).
3. The LLM outputs clear install/test commands and expected results.
4. **HUMAN CHECKPOINT** only when a physical device, real-world input, or new scenario is required.
5. After human feedback, the LLM iterates.

Automate everything that does not require a physical phone, real human voice, or real physical problem.

## Priority Tasks

### Task 1: Finish product UI (highest priority)
**LLM does:**
- Replace test/debug surfaces with a clear product flow:
  - Home: list of open tickets + prominent “New ticket” button.
  - New ticket: chooser for Text / Audio / Audio+frames → immediately enter that mode.
  - Capture (Audio+frames): simultaneous camera preview, audio recording, and one clear coach question/line always visible.
  - Ticket timeline: evidence list, status chips (Listening / Transcribing / Figuring out… / Investigating), confidence gauge, proposed vs locked title/description.
- Keep Settings and Test Mode reachable but secondary.
- Wire to existing ViewModels, ticket store, and sync.

**HUMAN CHECKPOINT:**
- Install the APK on a real Android device.
- Walk through the new screens and report visual/layout issues, missing states, or navigation problems.
- Confirm the coach line is readable while the camera is active.

### Task 2: Simultaneous capture + AI coaching experience
**LLM does:**
- Ensure audio recording, camera stills gating, and live coach updates run together without blocking the UI.
- Surface server-driven `capture_request` hints and progressive title/description proposals.
- Make stop conditions clear (button + spoken “stop recording”).
- Keep the experience feeling continuous even though deep answers are deferred.

**HUMAN CHECKPOINT:**
- On device: start an Audio+frames ticket, talk about a real problem while showing it to the camera.
- Note whether the coach responds, stills are captured usefully, and the ticket packages correctly.
- Report any lag, crashes, or confusing states.

### Task 3: Everyday problem scenarios (testing catalog)
**LLM does:**
- Prepare the ticket flow so it can handle typical DIY cases (analyze problem, identify tools, scan existing tools via stills+OCR, suggest free/cheap buys, fall back to local help or public post).
- Add or improve any missing UI for “scan tools”, “what to buy”, “post publicly”, and “hire local help”.
- Generate sample test data or fixtures if useful for offline development.

**HUMAN CHECKPOINT — invent and run scenarios:**
- Create 2–3 real-world problems (examples: fixing a fence, clogged sink, broken chair, missing tool).
- For each: capture audio + stills of the problem and of tools you already have.
- Observe whether the ticket gathers enough info for a later batch Project.
- Note what the AI coach asked, what was missing, and whether the least-resistance (preferably free) path is clear.
- Suggest any new scenarios that should be added to the catalog.

### Task 4: Optional tip at the end
**LLM does:**
- After a ticket reaches a terminal state (investigation done, handed off, or closed), show an optional tip UI (Lyft-style).
- Make it clear that skipping the tip leaves the entire process free.
- Do not block any core flow on tipping.

**HUMAN CHECKPOINT:**
- Complete a ticket flow on device and verify the tip prompt appears only at the end and is skippable.

### Task 5: Device testing, performance, and reliability
**LLM does:**
- Add or improve logging that helps diagnose issues (coach events, sync status, frame quality).
- Optimize obvious performance issues (UI jank on camera, memory, battery-friendly frame analysis).
- Prepare clear reproduction steps and expected logs for common failures.

**HUMAN CHECKPOINT (repeat as needed):**
- Install latest APK on one or more real devices.
- Run the full end-to-end flow: New ticket → simultaneous capture → stop → timeline → server sync.
- Test edge cases the LLM cannot: poor lighting, background noise, slow network, phone orientation changes, battery saver.
- Report crashes, high battery use, missed stills, or sync failures with any available logs.
- Invent additional stress scenarios if the basic ones pass.

## Automation Guidance for the LLM

- Prefer code changes, unit/UI tests (where feasible), and clear build/install instructions over asking the human to do manual coding.
- After each major change, output:
  - What changed
  - How to build and install
  - Exact steps for the human to test on device
  - What “success” looks like
- When the human reports a problem, fix it in code first; only ask for another device test when the fix needs physical verification.
- Keep changes small and reviewable.
- Never claim something works on device until a human has confirmed it.

## Deliverables

- Working Android product UI for the full capture → ticket flow.
- Device-tested APK that successfully creates and sends tickets for real everyday problems.
- Short notes (from human + LLM) on what worked, what broke, and any new scenarios discovered.

Once the Android path is solid, the same guide and contracts can be adapted for iOS.

---

Companion roadmap: `docs/roadmap-testing-phase.md`.
