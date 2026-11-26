// XML sitemap builders for app/sitemap_index.xml, app/page-sitemap.xml, app/product-sitemap.xml and app/post-sitemap.xml.
import products from "@/data/products.json";
import { blogPosts } from "@/data/blog-posts";
import { toolkitPages } from "@/data/toolkit";
import { customPages } from "@/lib/customPages";
import { isNoindex } from "@/lib/seo";
import { CATEGORY_PAGES, SITE_URL, STATIC_PAGES, absUrl } from "@/lib/site";

type Entry = { loc: string; lastmod?: string; priority?: number; images?: string[] };

const BUILT = new Date().toISOString();
const xmlEsc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const SITEMAPS = ["page-sitemap.xml", "product-sitemap.xml", "post-sitemap.xml"] as const;

export function xmlResponse(body: string) {
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

export function sitemapIndex() {
  const lastmod: Record<string, string> = {
    "post-sitemap.xml": blogPosts.reduce((m, p) => (p.date > m ? p.date : m), "1970-01-01"),
  };
  const items = SITEMAPS.map((f) => `<sitemap><loc>${xmlEsc(absUrl(`/${f}`))}</loc><lastmod>${lastmod[f] || BUILT}</lastmod></sitemap>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>\n`;
}

function urlset(entries: Entry[]) {
  const urls = entries
    .filter((e) => !isNoindex(e.loc.slice(SITE_URL.length)))
    .map((e) => {
      const img = (e.images || []).map((i) => `<image:image><image:loc>${xmlEsc(absUrl(i))}</image:loc></image:image>`).join("");
      return `<url><loc>${xmlEsc(e.loc)}</loc><lastmod>${e.lastmod || BUILT}</lastmod>${e.priority !== undefined ? `<priority>${e.priority.toFixed(1)}</priority>` : ""}${img}</url>`;
    })
    .join("");
  const imageNs = entries.some((e) => e.images?.length) ? ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNs}>${urls}</urlset>\n`;
}

/** Company, help and policy pages plus category pages. */
export function pageSitemap() {
  return urlset([
    ...STATIC_PAGES.map((p) => ({ loc: absUrl(p.path), priority: p.priority })),
    ...CATEGORY_PAGES.map((p) => ({ loc: absUrl(p.path), priority: 0.8 })),
    ...["", ...Object.keys(toolkitPages).map((t) => `${t}/`)].map((t) => ({ loc: absUrl(`/tools/${t}`), priority: 0.6 })),
    ...customPages.map((p) => ({ loc: absUrl(`/${p.slug}/`), priority: 0.6 })),
  ]);
}

export function productSitemap() {
  // Product page URLs only, no image entries.
  return urlset((products as { slug: string }[]).map((p) => ({ loc: absUrl(`/product/${p.slug}/`), priority: 0.8 })));
}

export function postSitemap() {
  return urlset(blogPosts.map((p) => ({ loc: absUrl(`/blog/${p.slug}/`), lastmod: p.date, priority: 0.6, images: [p.image] })));
}
