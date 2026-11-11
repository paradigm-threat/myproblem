#!/usr/bin/env bash
# Phone APK: the one question above the camera, and the slow / unreachable banner.
# UIAutomator cannot drive CameraX, so the phone reports the same fields the
# capture screen binds. Prints those fields only.
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
  sleep 0.4
  local line=""
  for _ in $(seq 1 40); do
    line=$(adb logcat -d -s MyProblemE2E:I 2>/dev/null | grep E2E_RESULT | tail -1 | sed 's/.*E2E_RESULT //' || true)
    if [[ -n "$line" ]]; then
      printf '%s' "$line"
      return
    fi
    sleep 0.4
  done
  echo "no E2E_RESULT" >&2
  exit 1
}

show() {
  python3 -c '
import json,sys
j=json.loads(sys.stdin.read())
keep=("ok","cmd","ask","answerByTalking","chrome","questionAbovePreview","bannerTitle","bannerBody","bannerProblem","bannerWaiting","chip","syncHealth","error")
print(json.dumps({k:j.get(k) for k in keep}))
'
}

expect() {
  local label="$1"
  local raw="$2"
  shift 2
  echo "== $label =="
  echo "$raw" | show
  echo "$raw" | python3 -c "$1"
}

stage vague "It is broken."
stage wiring "I need to repair the electric wiring in my garage. It started this morning. Call me at 404-555-0199. I live at 18 Oak Street. Strip the wire and splice the hot to the neutral."

VAGUE=$(broadcast --es cmd create_text --es title Vague --es descriptionFile e2e/vague.txt)
LOCAL=$(echo "$VAGUE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["localId"])')

CAP=$(broadcast --es cmd capture --es localId "$LOCAL")
expect "opening question, no banner" "$CAP" '
import json,sys
j=json.loads(sys.stdin.read())
assert j["ok"] is True, j.get("error")
assert j["ask"]=="What is happening, in one sentence?", j.get("ask")
assert j["answerByTalking"]=="Answer by talking"
assert j["chrome"]==["question","preview"], j["chrome"]
assert j["questionAbovePreview"] is True
assert j["bannerTitle"] is None, j.get("bannerTitle")
'

SLOW=$(broadcast --es cmd mark_slow --es localId "$LOCAL")
expect "still waiting" "$SLOW" '
import json,sys
j=json.loads(sys.stdin.read())
assert j["ok"] is True, j.get("error")
assert j["bannerTitle"]=="Server is slow", j.get("bannerTitle")
assert j["bannerWaiting"] is True
assert j["chrome"]==["question","server","preview"], j["chrome"]
assert "keep talking" in (j.get("bannerBody") or "")
assert j["ask"]=="What is happening, in one sentence?"
'

TIMED=$(broadcast --es cmd inject_reach --es localId "$LOCAL" --es raw "java.net.SocketTimeoutException: timeout")
expect "timed out" "$TIMED" '
import json,sys
j=json.loads(sys.stdin.read())
assert j["bannerProblem"]=="SLOW", j.get("bannerProblem")
assert j["bannerTitle"]=="Server is slow"
assert j["bannerWaiting"] is False
assert j["chip"]=="Server slow", j.get("chip")
body=(j.get("bannerBody") or "").lower()
assert "sockettimeout" not in body
assert "http" not in body
assert j["chrome"][0]=="question" and j["chrome"][-1]=="preview"
'

DOWN=$(broadcast --es cmd inject_reach --es localId "$LOCAL" --es raw "failed to connect to intake.myproblem.app")
expect "unreachable" "$DOWN" '
import json,sys
j=json.loads(sys.stdin.read())
assert j["bannerProblem"]=="UNAVAILABLE"
assert "available" in (j.get("bannerTitle") or ""), j.get("bannerTitle")
assert "on this phone" in (j.get("bannerBody") or "")
assert "intake.myproblem.app" not in (j.get("bannerBody") or "")
assert j["chip"]=="Server unavailable"
'

OFF=$(broadcast --es cmd inject_reach --es localId "$LOCAL" --es raw "Offline — ticket stays on this device until online sync is available")
expect "sync switched off" "$OFF" '
import json,sys
j=json.loads(sys.stdin.read())
assert j["bannerTitle"]=="Phone is offline", j.get("bannerTitle")
assert "Online sync is off" in (j.get("bannerBody") or "")
'

PULLED=$(broadcast --es cmd sync --es localId "$LOCAL")
expect "banner clears after a pull" "$PULLED" '
import json,sys
j=json.loads(sys.stdin.read())
assert j["ok"] is True, j.get("error")
assert j.get("ask")=="What is happening, in one sentence?", j.get("ask")
'
CLEAR=$(broadcast --es cmd capture --es localId "$LOCAL")
expect "question only again" "$CLEAR" '
import json,sys
j=json.loads(sys.stdin.read())
assert j["bannerTitle"] is None, j.get("bannerTitle")
assert j["chrome"]==["question","preview"], j["chrome"]
assert j["chip"]=="Synced", j.get("chip")
'

WIRE=$(broadcast --es cmd create_text --es title Garage_wiring --es descriptionFile e2e/wiring.txt)
WLOCAL=$(echo "$WIRE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["localId"])')
WCAP=$(broadcast --es cmd capture --es localId "$WLOCAL")
expect "safety question above the preview" "$WCAP" '
import json,sys
j=json.loads(sys.stdin.read())
ask=(j.get("ask") or "").lower()
assert "look closer" not in ask
assert "photo of" not in ask
assert "sparks" in ask or "hurt" in ask, j.get("ask")
assert j["chrome"][0]=="question" and j["chrome"][-1]=="preview"
assert j["bannerTitle"] is None
'
WDOWN=$(broadcast --es cmd inject_reach --es localId "$WLOCAL" --es raw "createTicket HTTP 502: bad gateway")
expect "safety question stays while the server is down" "$WDOWN" '
import json,sys
j=json.loads(sys.stdin.read())
ask=(j.get("ask") or "").lower()
assert "sparks" in ask or "hurt" in ask, j.get("ask")
assert "502" not in (j.get("bannerBody") or "")
assert j["bannerProblem"]=="UNAVAILABLE"
assert j["chrome"]==["question","server","preview"]
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
close_one "$WIRE"
adb shell rm -f /data/local/tmp/mp-vague.txt /data/local/tmp/mp-wiring.txt >/dev/null || true
echo "Phone capture E2E done."
