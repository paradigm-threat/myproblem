# Capture follow-up (deferred instructions)

**Status:** Architecture for a later release. Not implemented on the APK yet.

Related: [`android-retired.md`](./android-retired.md) · [`ephemeral-media.md`](./ephemeral-media.md) · [`pii-and-privacy.md`](./pii-and-privacy.md).

## Product rule

New ticket is **Chat** or **Record**. Record is one feed (mic and camera toggles). The first clip uploads into the private batch inbox. The batch does a full investigation at its own pace. It does **not** coach the first recording in real time.

If the batch needs more media, it writes **capture instructions** on the tip. The app shows that on the ticket (push later). The next Record run may use on-device features the server names (object match, angles, auto-stop). Then upload another deferred file. Live rolling stills / chunked realtime capture is shelved.

## Tip shape (proposed)

```json
{
  "needs_capture": true,
  "capture_instructions": {
    "v": 1,
    "coach": "Show the other side of the tire, then the sidewall crack.",
    "goals": [
      { "id": "angle_other", "kind": "angle", "hint": "Other side of the object" },
      { "id": "match_sidewall", "kind": "object_match", "template_uri": "cache://…/template.jpg" }
    ],
    "auto_stop": true,
    "capabilities": ["object_match", "angle_coach", "auto_stop"]
  }
}
```

- First tickets usually have `needs_capture: false` or omit the field.
- After batch: either enough media → advice / next steps, or `needs_capture` + instructions.
- Public tip and git never link the raw video. Only scrubbed choice stills last.
- Spoken addresses and faces stay private; fail closed → delete the file, no tip update with unsafe media.

## On-device handlers (later)

| Capability | App does |
|---|---|
| `object_match` | Match preview to a server template; coach until close enough |
| `angle_coach` | Prompt for listed angles / closer looks |
| `auto_stop` | Stop recording when goals are met, then upload |

Unknown capabilities: show the coach text only; person records and Sends as today.

## Max and simple

Chat + Record is the capture surface. Mic and camera are toggles on one feed, not separate start modes. Follow-up instructions deepen Record; they do not revive a third “Live” product mode.
