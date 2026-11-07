import { NextResponse } from "next/server";

/**
 * On-Device Pack CDN manifest — DEFERRED until L1 hints proven on device.
 * See docs/onboard-ai.md and scripts/export_hf_to_pack.md.
 *
 * When enabled: return signed pack metadata + Blob URL for APK loader.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "deferred",
      message:
        "On-device pack CDN is deferred until L1 color/angle hints are proven. Bundled APK assets/ondevice-pack/v1 is the baseline.",
      planned: {
        packVersion: "1.0.0",
        downloadUrl: null,
        signature: null,
        hfPins: [
          "timm/mobilenetv3_small_100.lamb_in1k",
          "Xenova/mobileclip_s0",
        ],
      },
    },
    { status: 501 },
  );
}
