/**
 * Social / neighborhood hosts where MyProblem X may appear (toolbar + side panel).
 * Capture content scripts remain network-specific (Nextdoor first); this list only
 * gates visibility so the extension stays out of the way elsewhere.
 */
(function (global) {
  "use strict";

  /** hostSuffix matchers (lowercase, no port) — subdomain-friendly */
  const HOST_SUFFIXES = [
    // Neighborhood / local
    "nextdoor.com",
    "nextdoor.co.uk",
    "nextdoor.ca",
    "nextdoor.com.au",
    "nextdoor.de",
    "nextdoor.nl",
    "nextdoor.fr",
    "nextdoor.es",
    "nextdoor.it",
    "nextdoor.se",
    "nextdoor.dk",
    // Meta
    "facebook.com",
    "fb.com",
    "messenger.com",
    "instagram.com",
    "threads.net",
    // X / Twitter
    "x.com",
    "twitter.com",
    // Google / YouTube
    "youtube.com",
    "youtu.be",
    "reddit.com",
    // Professional / community
    "linkedin.com",
    "discord.com",
    "discordapp.com",
    // Messaging / social
    "whatsapp.com",
    "telegram.org",
    "t.me",
    "signal.org",
    // Other common social / forums
    "tiktok.com",
    "snapchat.com",
    "pinterest.com",
    "tumblr.com",
    "truthsocial.com",
    "bsky.app",
    "blueskyweb.xyz",
    "mastodon.social",
    "threads.com",
    "quora.com",
    "medium.com",
    "substack.com",
    "patreon.com",
    // Craigslist / marketplace-adjacent (local asks)
    "craigslist.org",
    // Neighborhood / parenting / mutual aid style
    "band.us",
    "neighborhood.com",
    "patch.com",
    "ring.com",
    // NextDoor-like / civic
    "citizen.com",
  ];

  /** Exact hosts (optional extras when suffix matching is awkward) */
  const HOST_EQUALS = [
    "www.reddit.com",
    "old.reddit.com",
    "new.reddit.com",
  ];

  function hostOf(url) {
    if (!url || typeof url !== "string") return null;
    if (/^(chrome|chrome-extension|devtools|about|edge|brave|opera):/i.test(url)) {
      return null;
    }
    try {
      return new URL(url).hostname.toLowerCase().replace(/\.$/, "");
    } catch (_) {
      return null;
    }
  }

  function isAllowed(url) {
    const host = hostOf(url);
    if (!host) return false;
    if (HOST_EQUALS.includes(host)) return true;
    for (const suffix of HOST_SUFFIXES) {
      if (host === suffix || host.endsWith("." + suffix)) return true;
    }
    return false;
  }

  /** For chrome.declarativeContent PageStateMatcher pageUrl.hostSuffix */
  function declarativeHostSuffixes() {
    // Dedupe
    return [...new Set(HOST_SUFFIXES)];
  }

  global.MyProblemSocialHosts = {
    HOST_SUFFIXES,
    HOST_EQUALS,
    isAllowed,
    hostOf,
    declarativeHostSuffixes,
  };
})(typeof globalThis !== "undefined" ? globalThis : self);
