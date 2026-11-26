// Site-wide SEO settings used by robots.txt, the sitemaps, llms.txt and structured data.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   NEXT_PUBLIC_SITE_URL   the live domain, no trailing slash. Defaults to https://packlegacy.com
//   ALLOW_INDEXING         set to "true" on the live site to let search engines index it.
//                          Anything else keeps every page noindex and robots.txt blocking crawlers.
import { categories } from "@/data/categories";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://packlegacy.com").replace(/\/+$/, "");
export const INDEXABLE = process.env.ALLOW_INDEXING === "true";

export const BUSINESS = {
  name: "Pack Legacy",
  legalName: "Pack Legacy",
  description:
    "Custom printed packaging boxes, rigid boxes, folding cartons, mailer boxes and mylar bags with no minimum order, free design support and free shipping.",
  email: "sales@packlegacy.com",
  phone: "+1-424-321-6460",
  logo: "/pack-legacy-logo.webp",
  address: { street: "520 Vetterlein Ave", city: "Hamilton Township", region: "NJ", postalCode: "08619", country: "US" },
  sameAs: [
    "https://www.facebook.com/people/Pack-Legacy/61577888315684/",
    "https://www.pinterest.com/PackLegacy/",
    "https://www.linkedin.com/company/packlegacy/",
    "https://www.instagram.com/pack_legacy/",
  ],
};

/** Absolute URL with the site's trailing-slash convention. */
export function absUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  const withSlash = /\.[a-z0-9]+$/i.test(p) || p.endsWith("/") ? p : `${p}/`;
  return SITE_URL + withSlash;
}

/** Company, policy and help pages (everything that is not a product, category or blog post). */
export const STATIC_PAGES: { path: string; title: string; priority: number }[] = [
  { path: "/", title: "Home", priority: 1 },
  { path: "/custom-boxes/", title: "Custom Boxes", priority: 0.9 },
  { path: "/get-a-quote/", title: "Get a Quote", priority: 0.9 },
  { path: "/shop/", title: "Shop", priority: 0.8 },
  { path: "/box-by-style/", title: "Box by Style", priority: 0.8 },
  { path: "/industries/", title: "Industries", priority: 0.8 },
  { path: "/materials/", title: "Materials", priority: 0.7 },
  { path: "/about-us/", title: "About Us", priority: 0.7 },
  { path: "/how-to-order/", title: "How to Order", priority: 0.7 },
  { path: "/sample-kits/", title: "Sample Kits", priority: 0.7 },
  { path: "/free-dieline-templates/", title: "Free Dieline Templates", priority: 0.7 },
  { path: "/artwork/", title: "Artwork Guidelines", priority: 0.6 },
  { path: "/reviews/", title: "Reviews", priority: 0.6 },
  { path: "/faqs/", title: "FAQs", priority: 0.6 },
  { path: "/contact-us/", title: "Contact Us", priority: 0.6 },
  { path: "/blog/", title: "Blog", priority: 0.7 },
  { path: "/track-your-order/", title: "Track Your Order", priority: 0.4 },
  { path: "/for-ai-agents/", title: "For AI Agents", priority: 0.5 },
  { path: "/shipping-policy/", title: "Shipping Policy", priority: 0.3 },
  { path: "/refund-and-return-policy/", title: "Refund and Return Policy", priority: 0.3 },
  { path: "/privacy-policy/", title: "Privacy Policy", priority: 0.3 },
  { path: "/terms-and-conditions/", title: "Terms and Conditions", priority: 0.3 },
];

/** Category (industry) pages from data/categories.ts. */
export const CATEGORY_PAGES = Object.values(categories).map((c) => ({ path: `/${c.slug}/`, title: c.name, description: c.metaDescription }));
