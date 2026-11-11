#!/usr/bin/env bash
# Phone APK ↔ Intake (regional git SoT) E2E via debug broadcast receiver + ops process.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG=app.myproblem.testmode
RECV="$PKG/.E2eDebugReceiver"
ACTION=app.myproblem.testmode.E2E
# Public Intake TLS host (APK uses same). Override with TICKETS_BASE for direct IP.
BASE="${TICKETS_BASE:-https://intake.myproblem.app}"

if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi
OPS="${OPS_WAKE_SECRET:-}"

# curl on the laptop may still hit stale Vercel wildcards; pin A when known.
CURL_RESOLVE=()
if [[ "$BASE" == https://intake.myproblem.app* ]]; then
  INTAKE_A="${INTAKE_A:-$(dig +short intake.myproblem.app A @ns1.vercel-dns.com | head -1)}"
  if [[ -n "$INTAKE_A" ]]; then
    CURL_RESOLVE=(--resolve "intake.myproblem.app:443:${INTAKE_A}")
  fi
fi
curl_intake() {
  curl -fsS "${CURL_RESOLVE[@]}" "$@"
}
curl_intake_code() {
  curl -sS "${CURL_RESOLVE[@]}" "$@"
}

need_device() {
  adb get-state >/dev/null 2>&1 || { echo "No adb device"; exit 1; }
}

broadcast() {
  adb logcat -c >/dev/null 2>&1 || true
  # shellcheck disable=SC2068
  adb shell am broadcast -a "$ACTION" -n "$RECV" "$@" >/dev/null
  sleep 0.5
  for _ in $(seq 1 40); do
    if adb logcat -d -s MyProblemE2E:I 2>/dev/null | grep -q E2E_RESULT; then
      break
    fi
    sleep 0.4
  done
}

last_e2e() {
  adb logcat -d -s MyProblemE2E:I 2>/dev/null | grep E2E_RESULT | tail -1 | sed 's/.*E2E_RESULT //'
}

echo "== unlock + ensure app installed =="
need_device
adb shell input keyevent KEYCODE_WAKEUP >/dev/null || true
adb shell wm dismiss-keyguard >/dev/null 2>&1 || true
adb shell am force-stop "$PKG" >/dev/null || true
# ColorOS / app standby blocks background DNS (blockedReasons includes APP_STANDBY).
# Keep the process in the active bucket and on screen so Intake calls can resolve.
adb shell am set-standby-bucket "$PKG" active >/dev/null || true
adb shell cmd deviceidle whitelist +"$PKG" >/dev/null 2>&1 || true
adb shell am start -n "$PKG/.MainActivity" >/dev/null
sleep 1
adb logcat -c >/dev/null || true

# Stage fixtures into app private files/ via run-as (no storage permission)
WAV="$ROOT/fixtures/intakes/generated/easy/flat_tire_roadside.wav"
STILL="$ROOT/docs/testmode-screen-1.png"
if [[ ! -f "$WAV" ]]; then
  WAV="$ROOT/fixtures/intakes/smoke/flat_tire_roadside_2s.wav"
fi
adb push "$WAV" /data/local/tmp/mp_e2e_audio.wav >/dev/null
adb push "$STILL" /data/local/tmp/mp_e2e_still.jpg >/dev/null
adb shell run-as "$PKG" mkdir -p files/e2e >/dev/null
adb shell run-as "$PKG" cp /data/local/tmp/mp_e2e_audio.wav files/e2e/audio.wav
adb shell run-as "$PKG" cp /data/local/tmp/mp_e2e_still.jpg files/e2e/still.jpg

echo "== create_text via APK (BASE=$BASE) =="
# am --es drops after first space — use underscores in extras
broadcast --es cmd create_text \
  --es title "Phone_E2E_flat_tire" \
  --es description "Spare_in_trunk_from_APK_broadcast"
CREATE=$(last_e2e)
echo "$CREATE" | python3 -c '
import json,sys
j=json.load(sys.stdin)
print("ok", j.get("ok"), "intake", j.get("intake"), "phase", j.get("phase"), "understanding", j.get("understanding"))
'
LOCAL=$(echo "$CREATE" | python3 -c 'import sys,json; print(json.load(sys.stdin)["localId"])')
SERVER=$(echo "$CREATE" | python3 -c 'import sys,json; print(json.load(sys.stdin)["serverTicketId"])')
CLAIM=$(echo "$CREATE" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("claim") or "")')
echo "local=$LOCAL server=$SERVER"

echo "== upload_audio via APK TicketsApi =="
broadcast --es cmd upload_audio --es localId "$LOCAL" --es path e2e/audio.wav
echo "$(last_e2e)"

echo "== upload_still via APK TicketsApi =="
broadcast --es cmd upload_still --es localId "$LOCAL" --es path e2e/still.jpg
echo "$(last_e2e)"

echo "== server tip before process =="
AUTH=()
if [[ -n "$CLAIM" ]]; then AUTH=(-H "Authorization: Bearer $CLAIM"); fi
curl_intake "${AUTH[@]}" "$BASE/api/tickets/$SERVER" | python3 -c '
import sys,json
t=json.load(sys.stdin)
print("intake", t.get("intake"))
print("title", (t.get("fields") or {}).get("title",{}).get("value","")[:60])
print("evidence", [(e["kind"], bool(e.get("uri")), e.get("processed")) for e in t.get("evidence",[])])
print("jobs", [(j.get("bin"), j.get("state")) for j in t.get("jobs",[])])
assert t.get("intake") in ("queued","listening","figuring_out","named_and_questions","investigating","queue_project"), t.get("intake")
# Honesty: must not claim transcribing while jobs only queued
jobs=t.get("jobs") or []
if any(j.get("bin")=="asr" and j.get("state")=="queued" for j in jobs):
  assert t.get("intake") != "transcribing", "regression: stuck/fake transcribing"
'

echo "== list must 404 =="
code=$(curl_intake_code -o /dev/null -w "%{http_code}" "$BASE/api/tickets")
echo "GET /api/tickets → $code"
[[ "$code" == "404" ]]

echo "== wake =="
if [[ -n "$OPS" ]]; then
  curl_intake -H "x-ops-secret: $OPS" "$BASE/api/ops/wake-batch"
  echo
  echo "== process-jobs =="
  curl_intake -H "x-ops-secret: $OPS" -X POST "$BASE/api/ops/process-jobs?limit=10"
  echo
else
  echo "No OPS_WAKE_SECRET — process without ops auth (dev Intake)"
  curl_intake -X POST "$BASE/api/ops/process-jobs?limit=10" || \
    curl_intake -H "x-ops-secret: ${OPS:-dev}" -X POST "$BASE/api/ops/process-jobs?limit=10"
  echo
fi

echo "== tip after process =="
curl_intake "${AUTH[@]}" "$BASE/api/tickets/$SERVER" | python3 -c '
import sys,json
t=json.load(sys.stdin)
print("intake", t.get("intake"))
for e in t.get("evidence",[]):
  print(e["kind"], "uri=", repr(e.get("uri") or ""), "processed=", e.get("processed"), "text=", (e.get("text") or "")[:80])
'

echo "== reprocess empty (expect fail) =="
broadcast --es cmd reprocess --es localId "$LOCAL"
echo "$(last_e2e)"

echo "== reprocess with new context =="
broadcast --es cmd reprocess --es localId "$LOCAL" --es names "Michelin,P215" --es note "Michelin_tire_context"
RE=$(last_e2e)
echo "$RE"
NEED=$(echo "$RE" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("needsReupload"))')
if [[ "$NEED" == "True" || "$NEED" == "true" ]]; then
  echo "== re-upload audio after gate =="
  adb shell run-as "$PKG" mkdir -p files/e2e >/dev/null
  adb shell run-as "$PKG" cp /data/local/tmp/mp_e2e_audio.wav files/e2e/audio.wav 2>/dev/null || \
    (adb push "$WAV" /data/local/tmp/mp_e2e_audio.wav >/dev/null && adb shell run-as "$PKG" cp /data/local/tmp/mp_e2e_audio.wav files/e2e/audio.wav)
  broadcast --es cmd upload_audio --es localId "$LOCAL" --es path e2e/audio.wav
  echo "$(last_e2e)"
  echo "== wait until the re-uploaded audio is transcribed =="
  READY=""
  for _ in $(seq 1 24); do
    TIP=$(curl_intake "${AUTH[@]}" "$BASE/api/tickets/$SERVER")
    if echo "$TIP" | python3 -c '
import json,sys
t=json.load(sys.stdin)
jobs=t.get("jobs") or []
busy=[j for j in jobs if j.get("bin")=="asr" and j.get("state") in ("queued","leased")]
txs=[e for e in t.get("evidence") or [] if e.get("kind")=="transcript" and (e.get("text") or "").strip()]
errs=[j for j in jobs if j.get("state")=="error"]
assert not errs, errs
sys.exit(0 if len(txs) >= 2 and not busy else 1)
'; then
      READY=1
      echo "$TIP" | python3 -c '
import json,sys
t=json.load(sys.stdin)
print("intake", t.get("intake"))
print("transcripts", sum(1 for e in t.get("evidence") or [] if e.get("kind")=="transcript"))
print("jobs", [(j.get("bin"), j.get("state")) for j in t.get("jobs") or []])
'
      break
    fi
    sleep 2
  done
  [[ -n "$READY" ]]
fi

echo "== APK sync pull =="
broadcast --es cmd sync --es localId "$LOCAL"
SYNC=$(last_e2e)
echo "$SYNC" | python3 -c '
import json,sys
j=json.load(sys.stdin)
assert j.get("ok") is True, j.get("error")
print("intake", j.get("intake"), "phase", j.get("phase"), "understanding", j.get("understanding"), "solution", j.get("solution"))
'
if [[ -n "$CLAIM" ]]; then
  curl_intake "${AUTH[@]}" -X POST "$BASE/api/tickets/$SERVER/close" -H "content-type: application/json" -d '{}' >/dev/null
  echo "closed"
fi

echo "== cleanup phone media =="
adb shell rm -f /data/local/tmp/mp_e2e_audio.wav /data/local/tmp/mp_e2e_still.jpg >/dev/null || true
adb shell run-as "$PKG" rm -rf files/e2e >/dev/null || true

echo "E2E phone APK done. server=$SERVER base=$BASE"
