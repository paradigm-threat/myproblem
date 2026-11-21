#!/usr/bin/env bash
# Native ticket screen: same status words as the site, and the 900px layout split.
# Does not open a WebView. The phone is phone-width, so the window is mobile.
set -euo pipefail
PKG=app.myproblem.testmode
RECV="$PKG/.E2eDebugReceiver"
ACTION=app.myproblem.testmode.E2E

adb get-state >/dev/null 2>&1 || { echo "No adb device"; exit 1; }
adb shell input keyevent KEYCODE_WAKEUP >/dev/null || true
adb shell wm dismiss-keyguard >/dev/null 2>&1 || true
adb shell am set-standby-bucket "$PKG" active >/dev/null || true
adb shell cmd deviceidle whitelist +"$PKG" >/dev/null 2>&1 || true
adb shell am start -n "$PKG/.MainActivity" >/dev/null
sleep 1

adb logcat -c >/dev/null 2>&1 || true
adb shell "am broadcast -a $ACTION -n $RECV --es cmd page_status --es title 'Garage lights kill outdoor / Ring power' --es description 'Submitted from the phone.'" >/dev/null
sleep 0.6
LINE="$(adb logcat -d -s MyProblemE2E:I | grep 'E2E_RESULT' | tail -1 || true)"
python3 - "$LINE" <<'PY'
import json, sys
raw = sys.argv[1]
start = raw.find("{")
if start < 0:
    sys.exit("no page_status result")
data = json.loads(raw[start:])
assert data.get("ok") is True, data
assert data["pill"] == "Awaiting review"
assert "Waiting for the AI pass" in data["summary"]
assert "people" in data["summary"]
assert "fix plan" not in data["summary"].lower()
states = [(s["id"], s["state"]) for s in data["steps"]]
assert states == [
    ("submitted", "done"),
    ("ai", "current"),
    ("people", "current"),
    ("plan", "later"),
    ("solved", "later"),
], states
assert data["layout412"] == "mobile"
assert data["layout900"] == "desktop"
assert data["layout1280"] == "desktop"
open("/tmp/mp-apk-status-id", "w").write(data["localId"])
print("page_status ok", data["pill"], data["layout412"], data["layout900"])
PY
LOCAL="$(cat /tmp/mp-apk-status-id)"

adb shell am start -S -n "$PKG/.MainActivity" --es openTicket "$LOCAL" >/dev/null
sleep 2
adb shell uiautomator dump /sdcard/mp-status.xml >/dev/null
adb pull /sdcard/mp-status.xml /tmp/mp-status.xml >/dev/null
python3 - <<'PY'
import xml.etree.ElementTree as ET
root = ET.parse("/tmp/mp-status.xml").getroot()
texts = []
for node in root.iter("node"):
    text = node.attrib.get("text") or ""
    if text:
        texts.append(text)
blob = "\n".join(texts)
for needle in (
    "Awaiting review",
    "Garage lights kill outdoor / Ring power",
    "Waiting for the AI pass and for people to advise.",
    "Submitted",
    "AI review",
    "People",
    "Fix plan",
    "Solved",
):
    if needle not in blob:
        raise SystemExit(f"missing on screen: {needle}\n---\n{blob[:1200]}")
if "Create a fix plan" in blob:
    raise SystemExit("screen claims a fix plan is underway")
print("Phone status screen ok")
PY
echo "Awaiting review — native card, phone layout mobile, 900px desktop"
