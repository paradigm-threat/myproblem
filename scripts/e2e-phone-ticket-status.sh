#!/usr/bin/env bash
# Phone Chrome opens the public ticket and reads the status card.
# The page is the local Next server, forwarded over adb so the phone
# does not depend on the deployed site.
set -euo pipefail
PORT="${STATUS_PORT:-3017}"
PATH_PART="${STATUS_PATH:-/t/garage-ring-power}"
HOST_URL="http://127.0.0.1:${PORT}${PATH_PART}"

adb get-state >/dev/null 2>&1 || { echo "No adb device"; exit 1; }
curl -fsS --max-time 8 "$HOST_URL" >/dev/null || {
  echo "No page at $HOST_URL. Start the site with: npm run start -- -p $PORT" >&2
  exit 1
}

adb reverse "tcp:${PORT}" "tcp:${PORT}" >/dev/null
adb shell input keyevent KEYCODE_WAKEUP >/dev/null || true
adb shell wm dismiss-keyguard >/dev/null 2>&1 || true
adb shell cmd statusbar collapse >/dev/null 2>&1 || true
adb shell am start -a android.intent.action.VIEW -d "$HOST_URL" com.android.chrome >/dev/null
sleep 2
adb forward tcp:9222 localabstract:chrome_devtools_remote >/dev/null

PHONE_URL="$HOST_URL" node <<'EOF'
const target = process.env.PHONE_URL;
const list = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
const page = list.find((t) => t.type === "page" && t.url === target);
if (!page) {
  console.error("Phone Chrome has no tab for the ticket page");
  process.exit(1);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
const text = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("devtools timeout")), 8000);
  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({
      id: 1,
      method: "Runtime.evaluate",
      params: { expression: "document.body.innerText", returnByValue: true },
    }));
  });
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id !== 1) return;
    clearTimeout(timer);
    if (msg.result?.exceptionDetails) reject(new Error("evaluate failed"));
    else resolve(msg.result?.result?.value || "");
  });
  ws.addEventListener("error", () => reject(new Error("devtools socket")));
});
ws.close();

const need = [
  "Awaiting review",
  "Submitted. Waiting for the AI pass and for people to advise.",
  "AI review",
  "People",
  "Fix plan",
  "Solved",
  "Waiting for posts",
  "Safety warning",
];
for (const line of need) {
  if (!text.includes(line)) {
    console.error("Phone page missing: " + line);
    process.exit(1);
  }
}
const order = ["Submitted", "AI review", "People", "Fix plan", "Solved"].map((s) => text.indexOf(s));
if (order.some((n) => n < 0) || order.some((n, i) => i > 0 && n < order[i - 1])) {
  console.error("Status steps are out of order");
  process.exit(1);
}
if (/Create a fix plan/i.test(text)) {
  console.error("Page claimed a fix plan is underway");
  process.exit(1);
}
console.log("Phone status page ok");
console.log("Awaiting review — submitted, AI review and people current, fix plan later");
EOF
