"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ChatChannel } from "@/lib/chat/channels";
import { resolveChannel } from "@/lib/chat/channels";
import { openPublicChat } from "@/lib/chat/launcher";

type Props = {
  channel?: ChatChannel | string;
  className?: string;
  children?: ReactNode;
  /** Open type/speak/video overlay after chat (dispatches event). */
  submit?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type" | "className">;

/**
 * Opens fullscreen Clevertree Chat (extension side panel when installed).
 * Use instead of inline room embeds on marketing pages.
 */
export function OpenChatButton({
  channel,
  className = "btn-primary",
  children = "Enter the public room",
  submit = false,
  ...rest
}: Props) {
  const ch =
    typeof channel === "string" || channel == null
      ? resolveChannel(channel)
      : channel;

  return (
    <button
      type="button"
      className={className}
      {...rest}
      onClick={() => {
        void openPublicChat(ch, { dock: "fullscreen" }).then((ok) => {
          if (ok && submit) {
            window.dispatchEvent(
              new CustomEvent("mp:chat-submit", { detail: { channel: ch } }),
            );
          }
        });
      }}
    >
      {children}
    </button>
  );
}
