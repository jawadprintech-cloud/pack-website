// /llms.txt: a plain-text guide to the site for AI assistants and LLM crawlers (format: https://llmstxt.org).
// Built from the site's own data, so new products, categories and posts appear automatically.
import products from "@/data/products.json";
import { blogPosts } from "@/data/blog-posts";
import { BUSINESS, CATEGORY_PAGES, STATIC_PAGES, absUrl } from "@/lib/site";

export const dynamic = "force-static";

const clean = (s = "") => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const link = (title: string, path: string, note?: string) => `- [${title}](${absUrl(path)})${note ? `: ${clean(note)}` : ""}`;

export function GET() {
  const a = BUSINESS.address;
  const help = STATIC_PAGES.filter((p) => !["/", "/shipping-policy/", "/refund-and-return-policy/", "/privacy-policy/", "/terms-and-conditions/"].includes(p.path));
  const policies = STATIC_PAGES.filter((p) => /policy|terms/.test(p.path));

  const body = [
    `# ${BUSINESS.name}`,
    "",
    `> ${BUSINESS.description}`,
    "",
    "Pack Legacy is a US custom packaging manufacturer. Key facts:",
    "",
    "- No minimum order quantity on custom boxes (custom paper bags start at 100 units).",
    "- Free design support, digital proofs, and no die or plate charges.",
    "- Standard production 8–12 business days after artwork approval; rush orders available.",
    "- Free shipping; ships to the United States, Canada, the United Kingdom and Australia.",
    "- Materials: paperboard/cardboard, kraft, corrugated, rigid stock (chipboard) and BoPET (mylar).",
    "- Printing: CMYK and Pantone, digital and offset, inside and outside. Finishes include foil stamping, embossing, debossing, Spot UV, soft-touch, matte and gloss.",
    `- Contact: ${BUSINESS.email}, ${BUSINESS.phone}, ${a.street}, ${a.city}, ${a.region} ${a.postalCode}, USA.`,
    `- Request a quote: ${absUrl("/get-a-quote/")} (only name, email and phone are required).`,
    "",
    "## Main pages",
    "",
    link("Home", "/", "Overview of custom packaging, box styles, materials and finishes."),
    ...help.map((p) => link(p.title, p.path)),
    "",
    "## Packaging categories",
    "",
    ...CATEGORY_PAGES.map((c) => link(c.title, c.path, c.description)),
    "",
    "## Products",
    "",
    ...(products as { slug: string; title: string; metaDescription?: string }[]).map((p) => link(p.title, `/product/${p.slug}/`, p.metaDescription)),
    "",
    "## Guides and blog",
    "",
    ...blogPosts.map((p) => link(p.title, `/blog/${p.slug}/`, p.excerpt)),
    "",
    "## Policies",
    "",
    ...policies.map((p) => link(p.title, p.path)),
    "",
    "## Optional",
    "",
    link("Sitemap index", "/sitemap_index.xml"),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
