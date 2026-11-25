import { sitemapIndex, xmlResponse } from "@/lib/sitemap";

// Sitemap index (same URL as the WordPress/Yoast sitemap on the live site).
export const dynamic = "force-static";
export function GET() {
  return xmlResponse(sitemapIndex());
}
