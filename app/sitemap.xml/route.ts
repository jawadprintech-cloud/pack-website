import { sitemapIndex, xmlResponse } from "@/lib/sitemap";

// /sitemap.xml returns the same sitemap index, for crawlers that look here first.
export const dynamic = "force-static";
export function GET() {
  return xmlResponse(sitemapIndex());
}
