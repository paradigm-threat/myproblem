"use client";

import { useEffect, useRef } from "react";
import type { ChatChannel } from "@/lib/chat/channels";
import { CHAT_API_BASE } from "@/lib/contact";

type RoomApi = {
  destroy: () => void;
  el: HTMLElement;
  setView?: (view: unknown) => void;
};

type CleverTreeRoomGlobal = {
  mount: (
    el: HTMLElement,
    opts: Record<string, unknown>,
  ) => RoomApi;
};

declare global {
  interface Window {
    CleverTreeRoom?: CleverTreeRoomGlobal;
    CleverTreeContextTags?: unknown;
  }
}

type Props = {
  channel: ChatChannel;
  className?: string;
};

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed ${src}`));
    document.body.appendChild(s);
  });
}

function ensureCss(href: string, id: string) {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function wsBaseFromHttp(httpBase: string): string {
  const u = httpBase.replace(/\/$/, "");
  if (u.startsWith("https://")) return `wss://${u.slice("https://".length)}`;
  if (u.startsWith("http://")) return `ws://${u.slice("http://".length)}`;
  return u.replace(/^http/, "ws");
}

/**
 * Mounts shared Clevertree room (no gather). Always a public IRC room.
 */
export function PublicRoomMount({ channel, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<RoomApi | null>(null);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;

    (async () => {
      ensureCss("/chat-room/tokens.css", "ct-room-tokens");
      ensureCss("/chat-room/clevertree-room.css", "ct-room-css");
      try {
        await loadScript("/chat-room/context-tags.js", "ct-context-tags");
        await loadScript("/chat-room/clevertree-room.js", "ct-room-js");
      } catch {
        return;
      }
      if (cancelled || !hostRef.current || !window.CleverTreeRoom) return;

      if (apiRef.current) {
        apiRef.current.destroy();
        apiRef.current = null;
      }
      host.innerHTML = "";
      const root = document.createElement("div");
      host.appendChild(root);

      const topic = channel.ircChannel.replace(/^#/, "");
      const intakeWs = `${wsBaseFromHttp(CHAT_API_BASE)}/api/chat/ws?topic=${encodeURIComponent(topic)}`;
      const mirrors = [
        intakeWs,
        `wss://api.clevertree.chat/api/chat/ws?topic=${encodeURIComponent(topic)}`,
        `wss://pub1.relaygateway.net/chat/ws?topic=${encodeURIComponent(topic)}`,
      ];

      apiRef.current = window.CleverTreeRoom.mount(root, {
        mode: "embed",
        channel: channel.ircChannel,
        title: channel.title,
        collectionId: channel.collectionId || channel.slug,
        apiBase: CHAT_API_BASE,
        context: {
          collection: channel.collectionId || undefined,
          topic: topic,
        },
        showGather: false,
        mirrors,
        seedMessages: [
          {
            nick: "clevertree",
            text: `Welcome to ${channel.ircChannel}. Connecting for live history…`,
            time: "",
          },
        ],
        onNeedView: async () => {
          try {
            const res = await fetch(`${CHAT_API_BASE}/api/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "view",
                topic,
                visitor: crypto.randomUUID(),
              }),
            });
            if (!res.ok) return;
            const data = await res.json();
            apiRef.current?.setView?.(data.view || data);
          } catch {
            /* empty findings OK */
          }
        },
      });
    })();

    return () => {
      cancelled = true;
      if (apiRef.current) {
        apiRef.current.destroy();
        apiRef.current = null;
      }
    };
  }, [channel.ircChannel, channel.title, channel.slug, channel.collectionId]);

  return (
    <div
      ref={hostRef}
      className={className ? `public-room-mount ${className}` : "public-room-mount"}
      data-channel={channel.slug}
    />
  );
}
