import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MagneticBoxesScript from "@/components/magnetic/MagneticBoxesScript";
import ProductPage, { allProducts, categoryOf, getProduct } from "@/components/product/ProductPage";
import { categoryPageFor } from "@/data/categories";
import { JsonLd, breadcrumbSchema, faqSchema, productSchema } from "@/lib/schema";
import "@/styles/magnetic-boxes.css";
import "@/styles/product.css";
import "@/styles/product-typography.css";

// Magnetic Closure Boxes has its own hand-built page in app/product/magnetic-closure-boxes.
export function generateStaticParams() {
  return allProducts.filter((p) => p.slug !== "magnetic-closure-boxes").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const title = p.metaTitle || `${p.title} | Pack Legacy`;
  const path = `/product/${p.slug}/`;
  return withSeo(path, {
    title,
    description: p.metaDescription,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title, description: p.metaDescription, images: p.gallery.slice(0, 1) },
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const path = `/product/${p.slug}/`;
  const category = categoryOf(p);
  const categoryPath = categoryPageFor[category];
  const schema = [
    productSchema({ name: p.title, path, description: p.metaDescription || p.intro[0] || p.title, images: p.gallery, category: category || undefined }),
    breadcrumbSchema([
      categoryPath ? { name: category, path: categoryPath } : { name: "Custom Boxes", path: "/custom-boxes/" },
      { name: p.title, path },
    ]),
    faqSchema(p.faqs),
  ].filter(Boolean) as Record<string, unknown>[];

  return (
    <>
      <JsonLd data={schema} />
      <Header />
      <div className="plmb pl-product-page">
        <ProductPage product={p} />
      </div>
      <MagneticBoxesScript />
      <Footer />
    </>
  );
}
