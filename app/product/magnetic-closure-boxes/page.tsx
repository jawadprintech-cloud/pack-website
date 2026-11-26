import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import baseMarkup from "@/components/magnetic/markup";
import { faqDetailsToCards } from "@/components/FaqCards";

// Same FAQ card design as the other product pages.
const markup = faqDetailsToCards(baseMarkup);
import MagneticBoxesScript from "@/components/magnetic/MagneticBoxesScript";
import { getProduct } from "@/components/product/ProductPage";
import { JsonLd, breadcrumbSchema, faqSchema, productSchema } from "@/lib/schema";
import "@/styles/magnetic-boxes.css";
import "@/styles/product-typography.css";

const PATH = "/product/magnetic-closure-boxes/";
const TITLE = "Custom Magnetic Closure Boxes (Wholesale Rates)";
const DESCRIPTION =
  "Order custom magnetic rigid boxes at competitive prices with no minimum order quantity. Available in custom sizes, shapes, styles, and colors. Free Shipping.";

export const metadata: Metadata = withSeo("/product/magnetic-closure-boxes/", {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: TITLE, description: DESCRIPTION },
});

// The FAQs shown on this page, read from its markup so the structured data matches what visitors see.
const pageFaqs = [...baseMarkup.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map((m) => ({ q: m[1], a: m[2] }));
// Product photos for structured data: the hero gallery (every image before the product title).
const gallery = [...new Set([...baseMarkup.slice(0, baseMarkup.indexOf('id="product-title"')).matchAll(/src="(\/images\/[^"]+)"/g)].map((m) => m[1]))];
const schema = [
  productSchema({ name: "Custom Magnetic Closure Boxes", path: PATH, description: DESCRIPTION, images: gallery.length ? gallery : getProduct("magnetic-closure-boxes")?.gallery || [], category: "Rigid Boxes" }),
  breadcrumbSchema([{ name: "Rigid Boxes", path: "/rigid-boxes/" }, { name: "Magnetic Closure Boxes", path: PATH }]),
  faqSchema(pageFaqs),
].filter(Boolean) as Record<string, unknown>[];

export default function ProductPage() {
  return (
    <>
      <JsonLd data={schema} />
      <Header />
      {/* Product page body from packlegacy-magnetic-boxes (its own header and footer are not used). */}
      <div className="plmb pl-product-page pl-magnetic-page" dangerouslySetInnerHTML={{ __html: markup }} suppressHydrationWarning />
      <MagneticBoxesScript />
      <Footer />
    </>
  );
}
