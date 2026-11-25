// Builds an industry page (Food Boxes, Cosmetic Boxes …) from data/categories.ts and the product catalog.
import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import CategoryPage from "@/components/category/CategoryPage";
import { allProducts } from "@/components/product/ProductPage";
import { categories } from "@/data/categories";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/lib/schema";

export function industryMetadata(slug: string): Metadata {
  const c = categories[slug];
  const path = `/${c.slug}/`;
  return withSeo(path, {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title: c.metaTitle, description: c.metaDescription },
  });
}

export default function IndustryPage({ slug }: { slug: string }) {
  const c = categories[slug];
  // Products in the order listed for this industry; skip any not in the catalog.
  const cards = c.products.flatMap((s) => {
    const p = allProducts.find((x) => x.slug === s);
    if (!p || !p.gallery[0]) return [];
    return [{ name: p.title.replace(/^Custom\s+/, ""), href: `/product/${p.slug}/`, img: p.gallery[0], note: c.productNotes?.[p.slug] }];
  });
  // Style cards without a product page (e.g. Candle Boxes) open the quote form.
  for (const s of c.customCards ?? []) cards.push({ name: s.name, href: "#quote", img: s.img, note: undefined });

  const schema = [
    breadcrumbSchema([{ name: c.name, path: `/${c.slug}/` }]),
    faqSchema(c.faqs.map((f) => ({ q: f.q, a: f.a.replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1") })), c.faqs.length), // category pages show every FAQ (see CategoryPage)
  ].filter(Boolean) as Record<string, unknown>[];

  return (
    <>
    <JsonLd data={schema} />
    <CategoryPage
      crumb={c.name}
      h1={c.h1}
      intro={c.intro}
      strong={c.strong}
      takeaway={c.takeaway}
      grid={{ title: c.gridTitle, intro: c.gridIntro, cards }}
      why={{ title: c.whyTitle, intro: c.whyIntro, bullets: c.whyBullets }}
      content={{ title: c.contentTitle, intro: c.contentIntro, img: c.contentImg, blocks: c.sections }}
      specs={c.specs}
      faqs={c.faqs}
      maxFaqs={c.faqs.length}
      moqLabel={c.moqLabel}
    />
    </>
  );
}
