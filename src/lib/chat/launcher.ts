import type { ChatChannel } from "@/lib/chat/channels";
import { resolveChannel } from "@/lib/chat/channels";
import { CHAT_API_BASE } from "@/lib/contact";

/** Bump when public/chat-room assets change. */
export const ROOM_ASSET_V = "20261127-swipe2";

export type ChatLauncherGlobal = {
  mountButton: (
    selOrEl: string | Element | null,
    opts?: Record<string, unknown>,
  ) => {
    open: (opts?: Record<string, unknown>) => void;
    close: () => void;
    toggle: (opts?: Record<string, unknown>) => void;
    setOptions: (o: Record<string, unknown>) => void;
  };
  open: (opts?: Record<string, unknown>) => void;
  close: () => void;
  toggle: (opts?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    ClevertreeChatLauncher?: ChatLauncherGlobal;
    CleverTreeChannelRoute?: unknown;
    __mpChatReady?: Promise<ChatLauncherGlobal | null>;
  }
}

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
  const existing = document.getElementById(id) as HTMLLinkElement | null;
  if (existing) return;
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

export function launcherOptsForChannel(
  channel: ChatChannel = resolveChannel("mp-general"),
): Record<string, unknown> {
  const topic = channel.ircChannel.replace(/^#/, "");
  const intakeWs = `${wsBaseFromHttp(CHAT_API_BASE)}/api/chat/ws?topic=${encodeURIComponent(topic)}`;
  return {
    channel: channel.ircChannel,
    title: channel.title,
    collectionId: channel.collectionId || channel.slug,
    apiBase: CHAT_API_BASE,
    dock: "fullscreen",
    mirrors: [
      intakeWs,
      `wss://api.clevertree.chat/api/chat/ws?topic=${encodeURIComponent(topic)}`,
      `wss://pub1.relaygateway.net/chat/ws?topic=${encodeURIComponent(topic)}`,
    ],
  };
}

/** Load room + launcher scripts once; resolve ClevertreeChatLauncher. */
export function ensureChatLauncher(): Promise<ChatLauncherGlobal | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.ClevertreeChatLauncher) {
    return Promise.resolve(window.ClevertreeChatLauncher);
  }
  if (window.__mpChatReady) return window.__mpChatReady;

  window.__mpChatReady = (async () => {
    ensureCss(`/chat-room/tokens.css?v=${ROOM_ASSET_V}`, "ct-room-tokens");
    ensureCss(
      `/chat-room/clevertree-room.css?v=${ROOM_ASSET_V}`,
      "ct-room-css",
    );
    try {
      await loadScript(
        `/chat-room/context-tags.js?v=${ROOM_ASSET_V}`,
        "ct-context-tags",
      );
      await loadScript(
        `/chat-room/channel-route.js?v=${ROOM_ASSET_V}`,
        "ct-channel-route",
      );
      await loadScript(
        `/chat-room/clevertree-room.js?v=${ROOM_ASSET_V}`,
        "ct-room-js",
      );
      await loadScript(
        `/chat-room/chat-launcher.js?v=${ROOM_ASSET_V}`,
        "ct-chat-launcher",
      );
    } catch {
      return null;
    }
    return window.ClevertreeChatLauncher || null;
  })();

  return window.__mpChatReady;
}

export async function openPublicChat(
  channel?: ChatChannel,
  extra?: Record<string, unknown>,
): Promise<boolean> {
  const api = await ensureChatLauncher();
  if (!api) return false;
  const opts = {
    ...launcherOptsForChannel(channel || resolveChannel("mp-general")),
    ...extra,
  };
  api.open(opts);
  return true;
}

export async function togglePublicChat(
  channel?: ChatChannel,
): Promise<boolean> {
  const api = await ensureChatLauncher();
  if (!api) return false;
  api.toggle(launcherOptsForChannel(channel || resolveChannel("mp-general")));
  return true;
}
