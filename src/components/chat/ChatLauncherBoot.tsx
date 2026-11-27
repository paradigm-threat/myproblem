"use client";

import { useEffect, useState } from "react";
import type { ChatChannel } from "@/lib/chat/channels";
import { resolveChannel } from "@/lib/chat/channels";
import {
  ensureChatLauncher,
  launcherOptsForChannel,
  openPublicChat,
} from "@/lib/chat/launcher";
import { SubmitProblemOverlay } from "./SubmitProblemOverlay";

export const SITE_CHAT_BTN_ID = "site-chat-btn";

type Props = {
  /** Default channel for header Chat button */
  channelSlug?: string;
};

/**
 * Boots ClevertreeChatLauncher against the header Chat control.
 * Extension side panel when available; otherwise fullscreen in-page room.
 */
export function ChatLauncherBoot({ channelSlug = "mp-general" }: Props) {
  const channel = resolveChannel(channelSlug);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [overlayChannel, setOverlayChannel] = useState<ChatChannel>(channel);

  useEffect(() => {
    let cancelled = false;
    const btnSel = `#${SITE_CHAT_BTN_ID}`;

    (async () => {
      const api = await ensureChatLauncher();
      if (cancelled || !api) return;
      const opts = launcherOptsForChannel(channel);
      const el = document.querySelector(btnSel);
      if (el && !el.getAttribute("data-ct-launcher")) {
        el.setAttribute("data-ct-launcher", "1");
        api.mountButton(el, opts);
      } else {
        api.mountButton(btnSel, opts);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [channel]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const openFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const wantsSubmit =
        params.get("submit") === "1" || params.get("submit") === "true";
      const wantsRoom =
        window.location.hash === "#room" ||
        wantsSubmit ||
        params.get("chat") === "1";
      if (!wantsRoom) return;
      void openPublicChat(channel, { dock: "fullscreen" }).then((ok) => {
        if (ok && wantsSubmit) {
          setOverlayChannel(channel);
          setSubmitOpen(true);
        }
      });
    };

    openFromUrl();
    const onHash = () => {
      if (window.location.hash === "#room") openFromUrl();
    };
    const onSubmitEvt = (ev: Event) => {
      const detail = (ev as CustomEvent<{ channel?: ChatChannel }>).detail;
      if (detail?.channel) setOverlayChannel(detail.channel);
      setSubmitOpen(true);
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("mp:chat-submit", onSubmitEvt as EventListener);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener(
        "mp:chat-submit",
        onSubmitEvt as EventListener,
      );
    };
  }, [channel]);

  return (
    <SubmitProblemOverlay
      open={submitOpen}
      channel={overlayChannel}
      onClose={() => setSubmitOpen(false)}
      onFocusComposer={() => {
        void openPublicChat(overlayChannel, { dock: "fullscreen" });
      }}
    />
  );
}
