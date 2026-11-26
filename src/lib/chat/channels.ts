/** Demo allowlist: homepage always resolves to a room. */

export type ChatChannel = {
  slug: string;
  ircChannel: string;
  title: string;
  path: string;
  collectionId?: string;
};

export const DEFAULT_CHANNEL_SLUG = "mp-general";

export const DEMO_CHANNELS: Record<string, ChatChannel> = {
  "mp-general": {
    slug: "mp-general",
    ircChannel: "#mp-general",
    title: "MyProblem general",
    path: "/c/mp-general",
  },
  "ga-savannah-cat-rescue": {
    slug: "ga-savannah-cat-rescue",
    ircChannel: "#ga-savannah-cat-rescue",
    title: "Savannah Cat Rescue",
    path: "/c/ga-savannah-cat-rescue",
    collectionId: "savannah-cat-rescue",
  },
  /** Collection id alias → same IRC room */
  "savannah-cat-rescue": {
    slug: "ga-savannah-cat-rescue",
    ircChannel: "#ga-savannah-cat-rescue",
    title: "Savannah Cat Rescue",
    path: "/c/ga-savannah-cat-rescue",
    collectionId: "savannah-cat-rescue",
  },
};

export function normalizeChannelSlug(raw: string | undefined | null): string {
  return String(raw || "")
    .trim()
    .replace(/^#/, "")
    .toLowerCase();
}

/** Always returns a channel — unknown → mp-general. */
export function resolveChannel(slug?: string | null): ChatChannel {
  const key = normalizeChannelSlug(slug);
  if (key && DEMO_CHANNELS[key]) {
    const ch = DEMO_CHANNELS[key];
    // Prefer canonical slug entry when alias used
    if (key === "savannah-cat-rescue") {
      return DEMO_CHANNELS["ga-savannah-cat-rescue"];
    }
    return ch;
  }
  return DEMO_CHANNELS[DEFAULT_CHANNEL_SLUG];
}

export function demoChannelList(): ChatChannel[] {
  return [
    DEMO_CHANNELS["mp-general"],
    DEMO_CHANNELS["ga-savannah-cat-rescue"],
  ];
}
