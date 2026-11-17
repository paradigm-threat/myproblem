import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Live Intake tickets are noindex via page metadata. Curated pilots
        // under /t/ (e.g. garage-ring-power) stay crawlable via sitemap.
        disallow: ["/test-mode", "/api/", "/r/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
