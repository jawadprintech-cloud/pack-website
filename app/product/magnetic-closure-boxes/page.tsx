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

const PATH = "/product/magnetic-closure-boxes/";
const DESCRIPTION =
  "Custom magnetic closure boxes with rigid board, printed wraps, fitted inserts and premium finishes. No minimums, free design support and free US shipping.";

export const metadata: Metadata = withSeo("/product/magnetic-closure-boxes/", {
  title: "Custom Magnetic Closure Boxes | Pack Legacy",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Custom Magnetic Closure Boxes | Pack Legacy", description: DESCRIPTION },
});

// The FAQs shown on this page, read from its markup so the structured data matches what visitors see.
const pageFaqs = [...baseMarkup.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map((m) => ({ q: m[1], a: m[2] }));
const gallery = [...new Set([...baseMarkup.matchAll(/src="(\/magnetic-closure-boxes\/images\/[^"]+)"/g)].map((m) => m[1]))].filter((s) => !/icon|logo|review|bark|clutch|trust/i.test(s));
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
      <div className="plmb" dangerouslySetInnerHTML={{ __html: markup }} suppressHydrationWarning />
      <MagneticBoxesScript />
      <Footer />
    </>
  );
}
