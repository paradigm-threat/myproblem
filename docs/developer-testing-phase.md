# MyProblem — Developer Guide: Testing Phase (Frontend / Device)

**Audience:** Other developers (or LLM-assisted work) building and fine-tuning the Android (and later iOS) frontend.  
**Goal:** Get the app into real device testing with a finished product UI for the full capture experience.

You can connect the APK (or source) to an LLM and point it at this document + the existing contracts in `docs/`. Stay inside the architecture: tickets, stills + audio only (no video files uploaded), batch Projects for deep work, free forever with optional tip.

## What Needs to Be Done (Priority Order)

### 1. Finish the product UI (highest priority)
Right now there are mostly test pages. Deliver a clear, usable product flow:

- **Home:** Open tickets list + big “New ticket”.
- **New ticket:** Choose Text / Audio / Audio+frames, then jump straight in.
- **Capture screen (Audio + frames):** Simultaneous experience — camera preview, audio recording, and live AI coaching/questions all at once. User talks and shows the problem; one clear question or coach line stays visible. Stills are gated and uploaded; no video files to the server.
- **Ticket timeline:** Evidence, status chips (Listening / Transcribing / Figuring out / Investigating…), confidence gauge, proposed vs locked title/description.
- Settings, Test Mode (debug) still accessible but not the main path.

Reference: `docs/apk-ticket-ux.md`, existing Kotlin shell in `apps/android-testmode`.

### 2. Full simultaneous capture + AI conversation
- User can record audio and show the problem with the camera while talking to the AI.
- AI coaches in real time (capture guidance, clarifying questions) to gather requirements for the ticket.
- Package a complete ticket and send it to the server for higher-end **batch** AI processing (Project) and/or human review. Prefer both.
- Local experience should feel continuous and responsive even though deep answers are deferred.

### 3. Everyday problems & least-resistance path (testing focus)
Validate the full loop on real cases such as “fixing a fence”:

- Analyze the problem from what the user shows and says.
- Identify tools needed.
- Scan existing tools (photos + OCR/context) to see if the user already has enough to fix it themselves.
- Recommend what to buy and where (local, cheap, free options first).
- If local/DIY solutions fail, surface local hired help (list resources, draft outreach, or post the ticket publicly on the MyProblem network so anyone — including automated AI — can help).
- Always prefer the free / least path of resistance.

Public posting of a PII-safe ticket is part of the testing goal so the network can participate.

### 4. Tip at the end (optional)
After the process (investigation complete or handed off), offer an optional tip (Lyft-style).  
If the user does not tip, the entire process remains completely free. No obligation.

### 5. Device testing & performance
- Build and install on real Android devices.
- Test the full flow end-to-end: start → capture (audio + stills + coaching) → upload → server intake → Project queue.
- Fine-tune for performance and experience (smooth preview, reliable stop/start, battery, frame quality, clear coach UI).
- Report issues with logs; server logging is handled separately.

## How to Work With an LLM

1. Clone or open the Android module: `apps/android-testmode`.
2. Point the LLM at this document + `docs/apk-ticket-ux.md`, `docs/capture-guidance.md`, `docs/projects.md`, `docs/progressive-transcription.md`.
3. Ask it to implement the missing product screens and simultaneous capture experience while reusing existing ticket models, sync, and camera/audio code.
4. Build the debug APK, install on a device, and test.
5. Iterate on UX and performance.

## Architecture Constraints (do not break)

- Stills + audio only to the server. No video file uploads.
- Realtime AI = thin capture coach only. Deep investigation = deferred batch Project.
- Anonymous tickets by default (UUID = access).
- Free forever; tip is optional.
- Region pilots (Georgia & Israel) and KB-first approach remain.

## Deliverables for this phase

- Polished Android product UI for the full capture → ticket flow.
- Device-tested build that successfully creates and sends tickets for real everyday problems.
- Notes on what worked / broke so server logging and batch investigation can be refined.

Once Android is solid, the same document and contracts can guide an iOS version.

---

See also the companion roadmap: `docs/roadmap-testing-phase.md`.
