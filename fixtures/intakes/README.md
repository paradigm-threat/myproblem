# Intake audio fixtures

License-clean **problem-statement** audio for unit / automation tests of
MyProblem ticket intake (ASR → title/description).

Exact real-world “I have a flat tire” field recordings are not available under
clean licenses for our domain. This pack uses:

1. **Scripted TTS** ([edge-tts](https://github.com/rany2/edge-tts)) for scenario-matched speech  
2. **Procedural noise beds** in `noise/` (synthetic, no third-party sample required)  
3. Optional **acoustic stress** clips in `acoustic_stress/` (real CC0/CC-BY only — not title gold)

See also [`docs/intake-fixtures.md`](../../docs/intake-fixtures.md).

## Layout

| Path | Purpose |
|------|---------|
| `catalog.json` | All scenarios (~28): scripts, difficulty, goldens, `generate` vs `script_only` |
| `noise/*.wav` | Procedural beds (traffic, wind, cafe, hum, …) |
| `generated/<tier>/*.wav` | Built mixes (**gitignored** — regenerate locally) |
| `generated/<tier>/*.meta.json` | Per-clip mirror of expect + paths |
| `smoke/*_2s.wav` | Tiny committed samples for CI presence checks |
| `scripts/generate_intakes.py` | TTS + ffmpeg mixer |

## Difficulty

| Tier | Intent | Eval surface |
|------|--------|--------------|
| `easy` | Clear, short | `apk_or_server` |
| `medium` | Mild ramble / light noise | `apk_or_server` |
| `hard` | Disorganized / heavy noise | mostly `apk_or_server` |
| `extreme` | Server stretch goals | `server_only` / often `script_only` |

Goldens use **keyword must-include** lists until an LLM judge exists.

## Regenerate / test

```bash
cd /path/to/myproblem
python3 -m venv fixtures/intakes/.venv
fixtures/intakes/.venv/bin/pip install -r fixtures/intakes/scripts/requirements-intakes.txt
npm run generate:intake-fixtures
npm run test:intake-fixtures
```

Requires `ffmpeg` on `PATH`. Keyword scorer: `src/lib/intakeFixtureScore.ts`. Noise-only: `…/generate_intakes.py --noise-only`.

## Noise beds (attribution)

All files under `noise/` are **procedurally synthesized** by
`generate_intakes.py` (deterministic PRNG + tones). No external sample download.
Treat as public-domain / CC0-equivalent for this repo.

| File | Character |
|------|-----------|
| `room_tone.wav` | Quiet hiss |
| `traffic_light.wav` | Light traffic rumble |
| `traffic_heavy.wav` | Louder road noise |
| `wind_light.wav` / `wind_heavy.wav` | Wind-like modulation |
| `cafe_murmur.wav` | Soft babble-ish |
| `appliance_hum.wav` | 60/120 Hz hum |
| `beep_chirp.wav` | Periodic alarm chirp |
| `rain.wav` | Broadband rain-like |
| `water_rush.wav` | Water spray-like |

## Counts (v1)

- Catalog scenarios: see `catalog.json`  
- Generated on `--tier easy,medium,hard` with `status: generate`: 17 WAVs  
- Remaining rows: `script_only` targets for later
