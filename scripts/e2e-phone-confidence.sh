#!/usr/bin/env bash
# Phone APK confidence gauge. The phone creates and pulls each ticket.
# The batch handoff is a server pass, then the phone pulls the result.
# Prints scores and coach text only.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG=app.myproblem.testmode
RECV="$PKG/.E2eDebugReceiver"
ACTION=app.myproblem.testmode.E2E
BASE="${TICKETS_BASE:-https://intake.myproblem.app}"

CURL_RESOLVE=()
if [[ "$BASE" == https://intake.myproblem.app* ]]; then
  INTAKE_A="${INTAKE_A:-$(dig +short intake.myproblem.app A @ns1.vercel-dns.com | head -1)}"
  if [[ -n "$INTAKE_A" ]]; then
    CURL_RESOLVE=(--resolve "intake.myproblem.app:443:${INTAKE_A}")
  fi
fi

adb get-state >/dev/null 2>&1 || { echo "No adb device"; exit 1; }
adb shell input keyevent KEYCODE_WAKEUP >/dev/null || true
adb shell wm dismiss-keyguard >/dev/null 2>&1 || true
adb shell am set-standby-bucket "$PKG" active >/dev/null || true
adb shell cmd deviceidle whitelist +"$PKG" >/dev/null 2>&1 || true
adb shell am start -n "$PKG/.MainActivity" >/dev/null
sleep 1

adb shell run-as "$PKG" mkdir -p files/e2e >/dev/null
stage() {
  local name="$1"
  local body="$2"
  printf '%s' "$body" > "/tmp/mp-$name.txt"
  adb push "/tmp/mp-$name.txt" "/data/local/tmp/mp-$name.txt" >/dev/null
  adb shell run-as "$PKG" cp "/data/local/tmp/mp-$name.txt" "files/e2e/$name.txt"
}

broadcast() {
  adb logcat -c >/dev/null 2>&1 || true
  adb shell am broadcast -a "$ACTION" -n "$RECV" "$@" >/dev/null
  sleep 0.5
  for _ in $(seq 1 40); do
    if adb logcat -d -s MyProblemE2E:I 2>/dev/null | grep -q E2E_RESULT; then
      break
    fi
    sleep 0.4
  done
  adb logcat -d -s MyProblemE2E:I 2>/dev/null | grep E2E_RESULT | tail -1 | sed 's/.*E2E_RESULT //'
}

show() {
  python3 -c '
import json,sys
j=json.loads(sys.stdin.read())
keep=("ok","cmd","intake","coach","understanding","solution","phase","ask","error")
print(json.dumps({k:j.get(k) for k in keep}))
'
}

stage vague "It is broken."
stage sink "The kitchen sink is clogged since yesterday. I tried a plunger. I need it to drain."
stage wiring "I need to repair the electric wiring in my garage. It started this morning. Call me at 404-555-0199. I live at 18 Oak Street. Strip the wire and splice the hot to the neutral."

echo "== phone vague =="
VAGUE=$(broadcast --es cmd create_text --es title Vague --es descriptionFile e2e/vague.txt)
echo "$VAGUE" | show
echo "$VAGUE" | python3 -c '
import json,sys
j=json.loads(sys.stdin.read())
assert j["ok"] is True, j.get("error")
assert j["phase"]=="understand", j["phase"]
assert j["solution"] is None, j["solution"]
assert j.get("ask")=="What is happening, in one sentence?", j.get("ask")
'

echo "== phone sink =="
SINK=$(broadcast --es cmd create_text --es title Sink --es descriptionFile e2e/sink.txt)
echo "$SINK" | show
echo "$SINK" | python3 -c '
import json,sys
j=json.loads(sys.stdin.read())
assert j["ok"] is True, j.get("error")
assert j["phase"]=="advise", j["phase"]
assert j["solution"]>=65, j["solution"]
assert j["understanding"]>=80, j["understanding"]
assert j.get("ask")=="Keep showing the problem, or stop when you are done.", j.get("ask")
'

echo "== phone garage wiring =="
WIRE=$(broadcast --es cmd create_text --es title Garage_wiring --es descriptionFile e2e/wiring.txt)
echo "$WIRE" | show
echo "$WIRE" | python3 -c '
import json,sys
j=json.loads(sys.stdin.read())
assert j["ok"] is True, j.get("error")
assert str(j["coach"]).startswith("Safety warning"), j["coach"]
assert j["phase"]=="batch", j["phase"]
assert j["solution"]<=28, j["solution"]
assert "splice" not in str(j["coach"]).lower()
assert "look closer" not in str(j.get("ask") or "").lower()
assert "sparks" in str(j.get("ask") or "").lower() or "hurt" in str(j.get("ask") or "").lower()
'
SERVER=$(echo "$WIRE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["serverTicketId"])')
CLAIM=$(echo "$WIRE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["claim"])')
LOCAL=$(echo "$WIRE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["localId"])')

echo "== batch pass, then phone pull =="
curl -fsS "${CURL_RESOLVE[@]}" -X POST "$BASE/api/tickets/$SERVER/batch-review" \
  -H "content-type: application/json" -H "x-ticket-claim: $CLAIM" -d '{"kbHit":true}' >/dev/null
PULLED=$(broadcast --es cmd sync --es localId "$LOCAL")
echo "$PULLED" | show
echo "$PULLED" | python3 -c '
import json,sys
j=json.loads(sys.stdin.read())
assert j["ok"] is True, j.get("error")
assert j["phase"]=="human", j["phase"]
assert str(j["coach"]).startswith("Safety warning"), j["coach"]
assert j["solution"]<=28, j["solution"]
assert "look closer" not in str(j.get("ask") or "").lower()
'

close_one() {
  local id claim
  id=$(echo "$1" | python3 -c 'import json,sys; print(json.load(sys.stdin)["serverTicketId"])')
  claim=$(echo "$1" | python3 -c 'import json,sys; print(json.load(sys.stdin)["claim"])')
  curl -fsS "${CURL_RESOLVE[@]}" -X POST "$BASE/api/tickets/$id/close" \
    -H "content-type: application/json" -H "x-ticket-claim: $claim" -d '{}' >/dev/null
}

echo "== close phone tickets =="
close_one "$VAGUE"
close_one "$SINK"
close_one "$WIRE"

adb shell rm -f /data/local/tmp/mp-vague.txt /data/local/tmp/mp-sink.txt /data/local/tmp/mp-wiring.txt >/dev/null || true
echo "Phone confidence E2E done."
