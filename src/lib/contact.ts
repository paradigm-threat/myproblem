export const CONTACT_EMAIL = "ari@asu.edu";
export const SITE_URL = "https://myproblem.app";
export const BUSINESS_PDF_PATH = "/myproblem-for-businesses.pdf";
export const DEMO_PATH = "/demo";

/** Preferred product term for the investigating software. */
export const SI = "SI";
/** First-mention gloss when SI alone would be unclear. */
export const SI_FULL = "SI (Super Intelligence, i.e. AI)";
/** Ticket submission / legal notice — anonymized tips may train SI. */
export const TICKET_TRAINING_NOTICE =
  "All tickets are anonymized but will be used to train the SI (Super Intelligence, i.e. AI).";

/** Shared social preview — subpages must set openGraph.images or Next omits og:image. */
export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1024,
  height: 576,
  alt: "MyProblem — turn any problem into a solution",
} as const;
/** Public Relay splash. GitLab clevertree/relay is private/archived. */
export const RELAY_URL = "https://relaygateway.net/info";
/** Public Relay source repository. */
export const RELAY_SOURCE_URL = "https://github.com/paradigm-threat/relay";

/** Clevertree Chat host for ticket mounts (Intake). Override with NEXT_PUBLIC_CHAT_API_BASE. */
export const CHAT_API_BASE =
  process.env.NEXT_PUBLIC_CHAT_API_BASE?.replace(/\/$/, "") ||
  "https://intake.myproblem.app";
