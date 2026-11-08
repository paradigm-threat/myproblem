#!/usr/bin/env python3
"""Generate MyProblem intake fixture WAVs from catalog.json (TTS + noise mix)."""

from __future__ import annotations

import argparse
import asyncio
import json
import math
import struct
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog.json"
NOISE_DIR = ROOT / "noise"
GENERATED = ROOT / "generated"
SMOKE = ROOT / "smoke"
TMP = ROOT / ".tmp_tts"

VOICE_DEFAULT = "en-US-JennyNeural"


def load_catalog() -> dict:
    return json.loads(CATALOG.read_text(encoding="utf-8"))


def write_wav_pcm16(path: Path, samples: list[float], sr: int = 16000) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        frames = bytearray()
        for s in samples:
            v = max(-1.0, min(1.0, s))
            frames += struct.pack("<h", int(v * 32767))
        w.writeframes(frames)


def synth_noise_bed(name: str, seconds: float = 12.0, sr: int = 16000) -> Path:
    """Procedural CC0-style noise beds (no third-party download required)."""
    out = NOISE_DIR / f"{name}.wav"
    if out.exists() and out.stat().st_size > 1000:
        return out
    n = int(seconds * sr)
    samples: list[float] = []
    # Simple LCG for reproducibility
    state = (hash(name) & 0xFFFFFFFF) or 1

    def rnd() -> float:
        nonlocal state
        state = (1664525 * state + 1013904223) & 0xFFFFFFFF
        return state / 0xFFFFFFFF

    for i in range(n):
        t = i / sr
        u = rnd() * 2 - 1
        if name == "room_tone":
            s = u * 0.02
        elif name == "traffic_light":
            s = u * 0.08 + 0.04 * math.sin(2 * math.pi * 40 * t) * (0.5 + 0.5 * math.sin(0.3 * t))
        elif name == "traffic_heavy":
            s = u * 0.18 + 0.1 * math.sin(2 * math.pi * 35 * t) + 0.05 * math.sin(2 * math.pi * 70 * t)
        elif name == "wind_light":
            s = u * 0.06 * (0.4 + 0.6 * abs(math.sin(0.7 * t)))
        elif name == "wind_heavy":
            s = u * 0.2 * (0.3 + 0.7 * abs(math.sin(1.1 * t)))
        elif name == "cafe_murmur":
            s = u * 0.07 + 0.02 * math.sin(2 * math.pi * 220 * t) * math.sin(3.1 * t)
        elif name == "appliance_hum":
            s = 0.08 * math.sin(2 * math.pi * 60 * t) + 0.04 * math.sin(2 * math.pi * 120 * t) + u * 0.02
        elif name == "beep_chirp":
            # Periodic chirp every ~1.2s
            phase = t % 1.2
            chirp = 0.25 * math.sin(2 * math.pi * 3200 * t) if phase < 0.08 else 0.0
            s = u * 0.03 + chirp
        elif name == "rain":
            s = u * 0.12
        elif name == "water_rush":
            s = u * 0.15 + 0.05 * math.sin(2 * math.pi * 180 * t)
        else:
            s = u * 0.05
        samples.append(s)
    write_wav_pcm16(out, samples, sr)
    return out


def ensure_noise_beds(names: set[str]) -> None:
    NOISE_DIR.mkdir(parents=True, exist_ok=True)
    for name in names:
        synth_noise_bed(name)


async def tts_to_mp3(text: str, mp3_path: Path, voice: str) -> None:
    import edge_tts

    mp3_path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(mp3_path))


def ffmpeg_mix(speech_mp3: Path, noise_wav: Path, out_wav: Path, snr_db: float, sr: int = 16000) -> None:
    """Mix speech over noise targeting approximate SNR (speech louder by snr_db)."""
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    # noise volume relative: speech at 1.0, noise attenuated by snr
    noise_vol = 10 ** (-snr_db / 20.0)
    # Loop/trim noise to speech length, then amix
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(speech_mp3),
        "-stream_loop",
        "-1",
        "-i",
        str(noise_wav),
        "-filter_complex",
        (
            f"[0:a]aformat=sample_rates={sr}:channel_layouts=mono,volume=1.0[s];"
            f"[1:a]aformat=sample_rates={sr}:channel_layouts=mono,volume={noise_vol:.6f}[n];"
            f"[s][n]amix=inputs=2:duration=first:dropout_transition=0,"
            f"aformat=sample_rates={sr}:channel_layouts=mono"
        ),
        "-ac",
        "1",
        "-ar",
        str(sr),
        str(out_wav),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def write_meta(scenario: dict, wav_path: Path) -> None:
    meta = {
        "id": scenario["id"],
        "difficulty": scenario["difficulty"],
        "style": scenario["style"],
        "status": "generated",
        "audio": str(wav_path.relative_to(ROOT)),
        "noise": scenario.get("noise"),
        "snr_db": scenario.get("snr_db"),
        "expect": scenario.get("expect"),
        "script": scenario.get("script"),
    }
    meta_path = wav_path.with_suffix(".meta.json")
    meta_path.write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")


def make_smoke_copy(wav_path: Path, scenario_id: str) -> None:
    """Copy first ~2s as a tiny committed smoke sample (via ffmpeg)."""
    SMOKE.mkdir(parents=True, exist_ok=True)
    out = SMOKE / f"{scenario_id}_2s.wav"
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(wav_path),
        "-t",
        "2",
        "-ac",
        "1",
        "-ar",
        "16000",
        str(out),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


async def generate_one(scenario: dict, voice: str, force: bool) -> Path | None:
    sid = scenario["id"]
    difficulty = scenario["difficulty"]
    out = GENERATED / difficulty / f"{sid}.wav"
    if out.exists() and not force and out.stat().st_size > 1000:
        print(f"skip {sid} (exists)")
        return out

    noise_name = scenario.get("noise") or "room_tone"
    noise_path = synth_noise_bed(noise_name)
    tmp_mp3 = TMP / f"{sid}.mp3"
    print(f"tts {sid}…")
    await tts_to_mp3(scenario["script"], tmp_mp3, voice)
    print(f"mix {sid} snr={scenario.get('snr_db')} noise={noise_name}")
    ffmpeg_mix(tmp_mp3, noise_path, out, float(scenario.get("snr_db", 12)))
    write_meta(scenario, out)
    return out


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--tier",
        default="easy,medium,hard",
        help="Comma-separated difficulties to generate (default: easy,medium,hard)",
    )
    parser.add_argument("--ids", default="", help="Comma-separated scenario ids (optional filter)")
    parser.add_argument("--voice", default=VOICE_DEFAULT)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--smoke-ids", default="flat_tire_roadside,glasses_frame_cracked")
    parser.add_argument("--noise-only", action="store_true")
    args = parser.parse_args()

    catalog = load_catalog()
    tiers = {t.strip() for t in args.tier.split(",") if t.strip()}
    id_filter = {i.strip() for i in args.ids.split(",") if i.strip()}

    noise_names = {s.get("noise") or "room_tone" for s in catalog["scenarios"]}
    ensure_noise_beds(noise_names)
    if args.noise_only:
        print(f"noise beds ready in {NOISE_DIR}")
        return 0

    try:
        import edge_tts  # noqa: F401
    except ImportError:
        print(
            "edge_tts missing. Create venv:\n"
            "  python3 -m venv fixtures/intakes/.venv\n"
            "  fixtures/intakes/.venv/bin/pip install -r fixtures/intakes/scripts/requirements-intakes.txt",
            file=sys.stderr,
        )
        return 1

    TMP.mkdir(parents=True, exist_ok=True)
    generated_paths: list[Path] = []
    for scenario in catalog["scenarios"]:
        if scenario.get("status") != "generate":
            continue
        if scenario["difficulty"] not in tiers:
            continue
        if id_filter and scenario["id"] not in id_filter:
            continue
        path = await generate_one(scenario, args.voice, args.force)
        if path:
            generated_paths.append(path)

    smoke_ids = {i.strip() for i in args.smoke_ids.split(",") if i.strip()}
    for p in generated_paths:
        if p.stem in smoke_ids:
            make_smoke_copy(p, p.stem)
            print(f"smoke {p.stem}")

    print(f"done: {len(generated_paths)} wav(s) under {GENERATED}")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
