# Intake fixtures

Shared audio + golden metadata for testing progressive intake (ASR → proposed
title/description). Location: [`fixtures/intakes/`](../fixtures/intakes/).

## What is scored today

Until server Whisper / intake jobs land, goldens are **keyword must-include**:

- `expect.title_must_include` — every token should appear in the produced title (case-insensitive substring).
- `expect.description_must_include_any` — at least one token in the description.
- `expect.intake_targets` — allowed intake chip outcomes.
- `expect.eval_surface` — `apk_or_server` vs `server_only` (hardest stretch goals).

Vitest / Android:

- Catalog schema + smoke/noise presence (`src/lib/intakeFixtures.test.ts`)
- Keyword scorer + golden self-consistency (`src/lib/intakeFixtureScore.ts`)
- Realtime status lockstep + timeliness (`src/lib/realtimeIntakeStages.ts` ↔ Kotlin `RealtimeIntakeStages` / `LiveAudioSession`)

```bash
npm run test:intake-fixtures
npm run test:android
npm run generate:intake-fixtures   # needs fixtures/intakes/.venv + ffmpeg
```

Photo stills live in [`fixtures/photos/catalog.json`](../fixtures/photos/catalog.json) and are scored by `src/lib/photoAnalysis.test.ts` (and the Android `PhotoAnalysisTest`). They cover blur, glare, exposure, duplicates, label OCR, and PII on a shipping label. Patterns are synthetic grayscale. Intake does not caption photos yet, so these tests do not expect a vision-model description.

Ids prefixed `asr_` are transcription-analysis cases: homophones, spoken codes, self-corrections, spelled names, measurements, negation, and PII that Intake must scrub before the transcript is stored. `analysis.transcript_must_include` / `transcript_must_exclude` score the stored transcript, after PII conversion. Spoken numbers are scored in the form Whisper usually writes (`E fifteen` → `E15`, `sixty two percent` → `62%`).

## Difficulty legend

| Tier | Challenge |
|------|-----------|
| easy | Clear single problem |
| medium | Mild ramble / light noise |
| hard | Disorganized, multi-concern, heavy noise |
| extreme | Whisper, contradictions, interleaved crises — server later |

## Regeneration

See [`fixtures/intakes/README.md`](../fixtures/intakes/README.md). Speech is TTS;
noise beds are procedural (license-clean). Do not vendor CC BY-NC call-center corpora.

## Related

- [`apk-ticket-ux.md`](./apk-ticket-ux.md) — live audio intake UX  
- [`progressive-transcription.md`](./progressive-transcription.md) — Evidence / ASR jobs  
