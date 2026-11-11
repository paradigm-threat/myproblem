import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";

/** Change this when a public page's content changes. Do not use new Date(). */
const CONTENT_UPDATED = new Date("2026-11-11");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/how-we-run`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/demo`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/myproblem-for-businesses.pdf`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
