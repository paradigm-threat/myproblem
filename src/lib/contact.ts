export const CONTACT_EMAIL = "ari@asu.edu";
export const SITE_URL = "https://myproblem.app";
export const BUSINESS_PDF_PATH = "/myproblem-for-businesses.pdf";
export const DEMO_PATH = "/demo";

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
