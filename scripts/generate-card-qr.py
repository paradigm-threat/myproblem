#!/usr/bin/env python3
"""Generate print-card QR → https://myproblem.app/r/card"""
from pathlib import Path

import qrcode
from PIL import Image
from qrcode.constants import ERROR_CORRECT_H

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "qr"
URL = "https://myproblem.app/r/card"


def make(url: str, with_logo: bool) -> Image.Image:
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=16, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0b1a2e", back_color="white").convert("RGBA")
    if not with_logo:
        return img
    logo_path = ROOT / "public" / "icons" / "icon-512.png"
    logo = Image.open(logo_path).convert("RGBA")
    lw = img.size[0] // 5
    logo = logo.resize((lw, lw), Image.Resampling.LANCZOS)
    pad = 10
    badge = Image.new("RGBA", (lw + pad * 2, lw + pad * 2), (255, 255, 255, 255))
    badge.paste(logo, (pad, pad), logo)
    pos = ((img.size[0] - badge.size[0]) // 2, (img.size[1] - badge.size[1]) // 2)
    img.alpha_composite(badge, dest=pos)
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    branded = make(URL, with_logo=True)
    branded.save(OUT_DIR / "card.png", optimize=True)
    branded.convert("RGB").save(ROOT / "branding" / "qr-card.png", optimize=True)
    make(URL, with_logo=False).save(OUT_DIR / "card-plain.png", optimize=True)
    print(f"URL {URL}")
    print(f"Wrote {OUT_DIR / 'card.png'} and card-plain.png + branding/qr-card.png")


if __name__ == "__main__":
    main()
