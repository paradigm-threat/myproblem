import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";

/** Change this when a public page's content changes. Do not use new Date(). */
const CONTENT_UPDATED = new Date("2026-11-27");

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: { path: string; priority: number; freq: MetadataRoute.Sitemap[0]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/businesses", priority: 0.92, freq: "weekly" },
    { path: "/investors", priority: 0.92, freq: "weekly" },
    { path: "/c/mp-general", priority: 0.94, freq: "weekly" },
    { path: "/c/ga-savannah-cat-rescue", priority: 0.9, freq: "weekly" },
    { path: "/extension", priority: 0.9, freq: "weekly" },
    { path: "/networkers", priority: 0.88, freq: "weekly" },
    { path: "/how-we-run", priority: 0.9, freq: "monthly" },
    { path: "/rules", priority: 0.85, freq: "monthly" },
    { path: "/disclaimers", priority: 0.7, freq: "monthly" },
    { path: "/dev", priority: 0.8, freq: "weekly" },
    { path: "/demo", priority: 0.6, freq: "weekly" },
    { path: "/terms", priority: 0.5, freq: "monthly" },
    { path: "/privacy", priority: 0.5, freq: "monthly" },
    { path: "/myproblem-for-businesses.pdf", priority: 0.4, freq: "monthly" },
  ];

  return paths.map(({ path, priority, freq }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: freq,
    priority,
  }));
}
