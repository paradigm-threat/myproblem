"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppHint() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isIos =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      navigator.standalone === true;
    if (standalone) return;
    if (isIos) setIosHint(true);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (dismissed || (!deferred && !iosHint)) return null;

  return (
    <div className="install-app-hint">
      <p>
        {deferred
          ? "Install MyProblem as an app to submit offline and sync when you are back on Wi‑Fi."
          : "On iPhone: Share → Add to Home Screen. Works offline; batches sync when you reconnect."}
      </p>
      <div className="install-app-hint-actions">
        {deferred ? (
          <button
            type="button"
            className="btn-primary"
            onClick={async () => {
              await deferred.prompt();
              setDeferred(null);
            }}
          >
            Install app
          </button>
        ) : null}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
