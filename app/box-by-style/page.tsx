// "Box By Style" (/box-by-style/), built from the reference PDF and https://packlegacy.com/box-by-style/.
// Layout: hero + rating, two style grids with the shared quote form on the right and the specifications between them,
// then FAQs, reviews, Instagram strip and closing call to action. Styles: custom-boxes.css (.plcb) + industries.css.
import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd, breadcrumbSchema } from "@/lib/schema";
import InstaMarquee from "@/components/InstaMarquee";
import FaqCards, { type FaqItem } from "@/components/FaqCards";
import ReviewsSection from "@/components/home/ReviewsSection";
import quotePanelMarkup from "@/components/quote/quotePanelMarkup";
import MagneticBoxesScript from "@/components/magnetic/MagneticBoxesScript";
import { allProducts } from "@/components/product/ProductPage";
import "@/styles/magnetic-boxes.css";
import "@/styles/custom-boxes.css";
import "@/styles/industries.css";
import { reviewLinkProps } from "@/lib/reviewProfiles";

export const metadata: Metadata = withSeo("/box-by-style/", {
  alternates: { canonical: "/box-by-style/" },
  title: "Box By Style | Custom Packaging Styles & Designs | Pack Legacy",
  description:
    "Choose your custom box by style: tuck end, auto lock, pillow, gable and handle boxes, plus luxury book, magnetic, two-piece and drawer styles. No minimum order and free shipping.",
});

const instagram = ["/cat-cbd.webp", "/cat-magnetic.webp", "/ig-cake.webp", "/ig-cookie.webp", "/ig-pastry.webp", "/cat-cosmetic.webp"];

// [card label, product slug], in the order shown on packlegacy.com/box-by-style/.
const trendy: [string, string][] = [
  ["Straight Tuck End Box", "straight-tuck-end-boxes"],
  ["Roll End Tuck Top Box", "roll-end-tuck-top-boxes"],
  ["Auto Lock Bottom Box", "auto-lock-bottom-boxes"],
  ["Reverse Tuck End Box", "reverse-tuck-end-boxes"],
  ["Pillow Box", "pillow-boxes"],
  ["Handle Box", "handle-boxes"],
  ["Gable Box", "gable-boxes"],
  ["123 Bottom Boxes", "123-bottom-boxes"],
];
const luxury: [string, string][] = [
  ["Book Style Boxes", "book-boxes"],
  ["Shoulder Neck Boxes", "shoulder-neck-rigid-boxes"],
  ["Collapsible Boxes", "collapsible-rigid-boxes"],
  ["Magnetic Closure Boxes", "magnetic-closure-boxes"],
  ["Two Piece Boxes", "two-piece-rigid-boxes"],
  ["Match Slide Boxes", "match-slide-boxes"],
];

const specs: [string, string][] = [
  ["Dimensions", "All Custom Sizes & Shapes"],
  ["Material", "Paperboard, Cardboard, Kraft, Corrugated, Rigid Stock"],
  ["Stock Thickness", "12pt, 16pt, 18pt, 20pt"],
  ["Color Print", "CMYK, Pantone (PMS)"],
  ["Printing Options", "Inside, Outside or Both"],
  ["Coating & Laminations", "AQ Coating, UV Coating, Spot UV, Varnish, Lamination, Soft Touch"],
  ["Add-ons", "Die-Cut Windows, Ribbons"],
  ["Inserts", "Inserts, Die-cut Dividers"],
  ["Production", "8 to 10 Business Days"],
  ["Shipping", "Standard (Free Shipping) and Rush"],
  ["Finishing", "Foil Stamping, Embossing/Debossing, Textured Finishes, Raised UV, Holographic Foiling, Combination Embossing"],
];

const faqs: FaqItem[] = [
  { q: "How can I know what box style is right for my product?", a: "Our free design support helps you choose the style that suits your product, size and budget." },
  { q: "Can I submit my artwork for boxes by style?", a: "Of course, you can. We will print your artwork on the box style you choose and send you a 3D mockup for your approval." },
  { q: "Do you provide custom printing for each box style?", a: "Yes. Every style can be printed digitally or with offset printing, in CMYK and Pantone-matched colors." },
  { q: "Do you offer eco-friendly box style options?", a: "Yes. Kraft and paperboard styles are the most eco-friendly choices, and our materials are recyclable." },
  { q: "Can I get a box style that’s not included in your boxes by style?", a: "Absolutely. We can create a custom box style for your product according to your specifications." },
  { q: "Can I order multiple box styles for different products at once?", a: "Yes. You can order different styles for different products in a single order." },
];

const LayersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 2 10 5-10 5L2 7l10-5z" />
    <path d="m2 12 10 5 10-5" />
    <path d="m2 17 10 5 10-5" />
  </svg>
);

function StyleGrid({ items }: { items: [string, string][] }) {
  const cards = items.flatMap(([name, slug]) => {
    const p = allProducts.find((x) => x.slug === slug);
    return p?.gallery[0] ? [{ name, href: `/product/${slug}/`, img: p.gallery[0] }] : [];
  });
  return (
    <ul className="cb-cat-grid">
      {cards.map((c) => (
        <li key={c.href}>
          <a className="cb-card" href={c.href}>
            <span className="cb-cat-img">
              <img src={c.img} alt={c.name} width={600} height={600} loading="lazy" />
            </span>
            <span className="cb-card-body">
              <span className="cb-card-top">
                <span className="cb-cat-name">{c.name}</span>
                <span className="cb-badge">Instock</span>
              </span>
              <span className="cb-chips">
                <span className="cb-chip"><span className="cb-chip-icon"><LayersIcon /></span>No MOQ</span>
                <span className="cb-chip"><span className="cb-chip-icon"><LayersIcon /></span>Free Shipping</span>
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function BoxByStylePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Box By Style", path: "/box-by-style/" }])} />
      <Header />
      <main className="plcb" id="main">
        <div className="cb-wrap">
          <nav className="cb-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Box By Styles</span>
          </nav>

          <div className="cb-top ind-top">
            <section className="cb-hero" aria-labelledby="bbs-h1">
              <h1 id="bbs-h1">Box By Style</h1>
              <p className="bbs-tagline">Your packaging is not just a box — it’s the first handshake with customers.</p>
              <p>
                Our custom box styles are built to your product dimensions, printed with your branding, and made from high-quality
                materials. Whether you’re shipping retail products or sending e-commerce orders, each style is built to protect,
                preserve, and present.
              </p>
              <p>
                By choosing the right box style, you can differentiate your product, increase customer loyalty, and make a strong
                impression in a crowded marketplace.
              </p>
              <p className="cb-hero-strong">Find your ideal box by style or get a custom one!</p>
              <div className="ind-rating">
                <a className="ind-score" href="#reviews">
                  <strong>5.0</strong> <span className="cb-stars" aria-label="5 out of 5 stars">★★★★★</span>
                  <small>Verified Customer Reviews</small>
                </a>
                <a {...reviewLinkProps("clutch")}><img src={"/r-clutch.webp"} alt="Pack Legacy reviews on Clutch" height={26} /></a>
                <a {...reviewLinkProps("bark")}><img src={"/r-bark.webp"} alt="Pack Legacy reviews on Bark" height={26} /></a>
                <a {...reviewLinkProps("trustpilot")}><img src={"/r-trustpilot.png"} alt="Pack Legacy reviews on Trustpilot" height={26} /></a>
              </div>
            </section>

            <div className="plmb cb-quote" id="quote" tabIndex={-1} dangerouslySetInnerHTML={{ __html: quotePanelMarkup }} suppressHydrationWarning />

            <div className="cb-categories ind-grid" id="categories">
              <section aria-labelledby="bbs-trendy">
                <div className="ind-grid-head">
                  <h2 id="bbs-trendy">Trendy &amp; Functional Box Styles</h2>
                  <p>Discover our trendy, functional box styles and choose the one that best suits your packaging needs.</p>
                </div>
                <StyleGrid items={trendy} />
              </section>

              <section className="bbs-specs" aria-labelledby="bbs-specs-title">
                <h2 id="bbs-specs-title">Specifications</h2>
                <table className="cb-specs">
                  <tbody>
                    {specs.map(([k, v]) => (
                      <tr key={k}>
                        <th scope="row">{k}</th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="bbs-luxury" aria-labelledby="bbs-luxury-title">
                <div className="ind-grid-head">
                  <h2 id="bbs-luxury-title">Elegant &amp; Luxury Box Styles</h2>
                  <p>Explore the elegant, luxury box styles we offer; each is customizable to your brand’s vibe.</p>
                </div>
                <StyleGrid items={luxury} />
              </section>
            </div>
          </div>
        </div>

        <section className="cb-wrap cb-section cb-faq" id="faq" aria-labelledby="bbs-faq-title">
          <h2 id="bbs-faq-title">
            Frequently <em>Asked</em> Questions
          </h2>
          <p className="cb-center-sub">We’ve answered all the common questions you may have before ordering custom boxes.</p>
          <FaqCards items={faqs} />
        </section>

        <div className="plh">
          <ReviewsSection />
        </div>

        <section className="cb-wrap cb-section cb-insta" aria-labelledby="bbs-insta-title">
          <div className="cb-insta-head">
            <h2 id="bbs-insta-title">
              Follow <a href="https://www.instagram.com/pack_legacy/" rel="nofollow">Packlegacy</a> on Instagram for ideas and
              inspiration to make your custom packaging look amazing.
            </h2>
            <div className="cb-social">
              <a href="https://www.instagram.com/pack_legacy/" rel="nofollow" aria-label="Instagram">
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          <InstaMarquee images={instagram.map((img) => img)} />
        </section>

        <section className="cb-wrap cb-cta-wrap" aria-labelledby="bbs-cta-title">
          <div className="cb-cta">
            <div>
              <h2 id="bbs-cta-title">Can’t Find the Right Custom Box?</h2>
              <p>
                Need something specific? Fill out the form and our team will create a custom box solution that’s made to fit your
                product perfectly.
              </p>
            </div>
            <div className="cb-cta-actions">
              <a className="cb-btn cb-btn-red" href="#quote">Get a Quote</a>
              <a className="cb-btn cb-btn-outline" href="/blog/">View All Blogs</a>
            </div>
          </div>
        </section>
      </main>
      <MagneticBoxesScript />
      <Footer />
    </>
  );
}
