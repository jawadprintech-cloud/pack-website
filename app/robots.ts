import type { MetadataRoute } from "next";
import { INDEXABLE, absUrl } from "@/lib/site";

// /robots.txt. Crawlers are blocked until the live site sets ALLOW_INDEXING=true (see lib/site.ts).
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absUrl("/sitemap_index.xml"),
    host: absUrl("/").replace(/\/$/, ""),
  };
}
