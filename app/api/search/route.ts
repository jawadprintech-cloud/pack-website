// Search index for the header search box (components/SearchBox.tsx).
// Built once at build time; the browser only downloads it when someone focuses the search box.
import products from "@/data/products.json";
import { categories } from "@/data/categories";

export const dynamic = "force-static";

export type SearchItem = { t: string; u: string; k: "Category" | "Product" | "Page"; i?: string; x?: string };

type P = { slug: string; title: string; category: string; gallery: string[] };
const list = products as unknown as P[];
const img = (slug: string) => list.find((p) => p.slug === slug)?.gallery[0];

const pages: [string, string][] = [
  ["All Products (Shop)", "/shop/"],
  ["Industries", "/industries/"],
  ["Box By Style", "/box-by-style/"],
  ["Custom Boxes", "/custom-boxes/"],
  ["How To Order", "/how-to-order/"],
  ["Sample Kits", "/sample-kits/"],
  ["Materials", "/materials/"],
  ["Free Dieline Templates", "/free-dieline-templates/"],
  ["Track Your Order", "/track-your-order/"],
  ["FAQs", "/faqs/"],
  ["Reviews", "/reviews/"],
  ["About Us", "/about-us/"],
  ["Contact Us", "/contact-us/"],
  ["Blog", "/blog/"],
  ["Shipping Policy", "/shipping-policy/"],
  ["Refund and Return Policy", "/refund-and-return-policy/"],
  ["Privacy Policy", "/privacy-policy/"],
  ["Terms and Conditions", "/terms-and-conditions/"],
];

export function GET() {
  const items: SearchItem[] = [
    ...Object.values(categories).map((c): SearchItem => ({
      t: c.name,
      u: `/${c.slug}/`,
      k: "Category",
      i: c.customCards?.[0]?.img || img(c.products[0]),
    })),
    ...list.map((p): SearchItem => ({
      t: p.title.replace(/^Custom\s+/i, ""),
      u: `/product/${p.slug}/`,
      k: "Product",
      i: p.gallery[0],
      x: p.category.replace(/\s+Custom$/, ""), // extra words to match on, e.g. "Bakery Boxes"
    })),
    ...pages.map(([t, u]): SearchItem => ({ t, u, k: "Page" })),
  ];
  return Response.json(items);
}
