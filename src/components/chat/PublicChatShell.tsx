"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatChannel } from "@/lib/chat/channels";
import { HiddenChannelMenu } from "./HiddenChannelMenu";
import { PublicRoomMount } from "./PublicRoomMount";
import { SubmitProblemOverlay } from "./SubmitProblemOverlay";

type Props = {
  channel: ChatChannel;
  /** Open media/type overlay on mount */
  openSubmit?: boolean;
};

export function PublicChatShell({ channel, openSubmit = false }: Props) {
  const [submitOpen, setSubmitOpen] = useState(openSubmit);

  const focusComposer = useCallback(() => {
    const root = document.getElementById("room");
    root?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      const ta = document.querySelector<HTMLTextAreaElement>(
        ".public-room-mount textarea, .public-room-mount [data-role='draft']",
      );
      ta?.focus();
    }, 250);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#room") {
      focusComposer();
    }
    const onHash = () => {
      if (window.location.hash === "#room") focusComposer();
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [focusComposer]);

  return (
    <div className="public-chat-shell">
      <div className="public-chat-toolbar">
        <div className="public-chat-toolbar-copy">
          <p className="public-chat-channel">
            <code>{channel.ircChannel}</code>
            <span>{channel.title}</span>
          </p>
          <p className="public-chat-hint">
            Public help room — history loads from IRC when connected. AI and
            people can see what you post. Free forever.
          </p>
        </div>
        <div className="public-chat-toolbar-actions">
          <button
            type="button"
            className="btn-primary"
            id="ask-in-room-cta"
            onClick={focusComposer}
          >
            Ask in this room
          </button>
          <button
            type="button"
            className="btn-secondary"
            id="submit-problem-cta"
            onClick={() => setSubmitOpen(true)}
          >
            Type / speak / video
          </button>
          <HiddenChannelMenu current={channel} />
        </div>
      </div>
      <PublicRoomMount channel={channel} />
      <SubmitProblemOverlay
        open={submitOpen}
        channel={channel}
        onClose={() => setSubmitOpen(false)}
        onFocusComposer={focusComposer}
      />
    </div>
  );
}
