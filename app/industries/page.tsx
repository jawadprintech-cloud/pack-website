// "Custom Boxes for Every Industry" (/industries/), built from the reference PDF and https://packlegacy.com/industries/.
// Layout: hero + rating, industry grid with the shared quote form on the right, builder banner, FAQs, reviews,
// Instagram strip and closing call to action. Card and section styles come from custom-boxes.css (.plcb).
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
import { Builder } from "@/components/home/HomeClient";
import "@/styles/magnetic-boxes.css";
import "@/styles/custom-boxes.css";
import "@/styles/home.css";
import "@/styles/industries.css";
import { reviewLinkProps } from "@/lib/reviewProfiles";

export const metadata: Metadata = withSeo("/industries/", {
  alternates: { canonical: "/industries/" },
  title: "Custom Boxes & Packaging By Industry | Pack Legacy",
  description:
    "Custom boxes made for every industry: food, retail, bakery, CBD, gift, cosmetic, apparel and jewelry packaging. No minimum order, free design support and free shipping.",
});

const IMG = "/custom-boxes/images/";
const instagram = ["cat-cbd.webp", "cat-magnetic.webp", "ig-cake.webp", "ig-cookie.webp", "ig-pastry.webp", "cat-cosmetic.webp"];

// Same 8 industries, order and photos as packlegacy.com/industries/.
const industries = [
  { name: "Food Boxes", href: "/food-boxes/", img: "/categories/Food%20Boxes/Category%20Images/Custom-Food-Boxes-pic.webp" },
  { name: "Retail Boxes", href: "/retail-boxes/", img: "/categories/Retail%20Boxes/Category%20Images/Retail-Boxes-pic.webp" },
  { name: "Bakery Boxes", href: "/bakery-boxes/", img: "/categories/Bakery%20Boxes/Category%20Images/Custom-Bakery-Boxes-pic.webp" },
  { name: "CBD Boxes", href: "/cbd-boxes/", img: "/categories/CBD%20Boxes/Category%20Images/Custom-CBD-Boxes-pic.webp" },
  { name: "Gift Boxes", href: "/gift-boxes/", img: "/categories/Gift%20Boxes/Category%20Images/Gift-Boxes-pic.webp" },
  { name: "Cosmetic Boxes", href: "/cosmetic-boxes/", img: "/categories/Cosmetic%20Boxes/Category%20Images/Cosmetic-Boxes-pic.webp" },
  { name: "Apparel Boxes", href: "/apparel-boxes/", img: "/categories/Food%20Boxes/Apparel%20Boxes/Category%20Images/custom-apparel-boxes.webp" },
  { name: "Jewelry Boxes", href: "/jewelry-boxes/", img: "/categories/Jewelry%20Boxes/Category%20Images/custom-jewelry-Boxes.webp" },
];

const faqs: FaqItem[] = [
  { q: "What industries do you provide custom boxes for?", a: "We manufacture custom boxes for virtually every industry. Our packaging solutions serve retail, gifting, food, electronics, apparel, CBD, bakery, cosmetics, healthcare, and many other industries." },
  { q: "Do you have a minimum order quantity?", a: "No. We do not have a minimum order quantity requirement. You can order according to your needs, whether you need a single box, a small batch, or a large bulk order." },
  { q: "Can I order two different box styles in the same order?", a: "Absolutely. You can order multiple box styles within a single order. Simply share your requirements with our packaging experts, and we will customize the order accordingly." },
  { q: "Are your boxes eco-friendly?", a: "Yes. We use environmentally friendly materials such as cardboard, kraft stock, and corrugated cardboard to manufacture custom boxes. Our packaging solutions are designed to be recyclable and sustainable." },
  { q: "Can I customize the size, shape, and design of my boxes?", a: "Yes. Size, shape, material, printing and finishing can all be customized." },
  { q: "Do you offer free design support?", a: "Yes. Our design team helps you create, adjust or optimize your artwork so it is print-ready." },
];

const LayersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 2 10 5-10 5L2 7l10-5z" />
    <path d="m2 12 10 5 10-5" />
    <path d="m2 17 10 5 10-5" />
  </svg>
);

export default function IndustriesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Industries", path: "/industries/" }])} />
      <Header />
      <main className="plcb" id="main">
        <div className="cb-wrap">
          <nav className="cb-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Industries</span>
          </nav>

          <div className="cb-top ind-top">
            <section className="cb-hero" aria-labelledby="ind-h1">
              <h1 id="ind-h1">Custom Boxes for Every Industry: Built to Protect, Designed to Sell</h1>
              <p>
                We offer custom boxes and packaging solutions tailor-made to meet every industry’s unique demands. From food to cosmetics boxes, and from electronic to rigid boxes.
              </p>
              <div className="ind-rating">
                <a className="ind-score" href="#reviews">
                  <strong>5.0</strong> <span className="cb-stars" aria-label="5 out of 5 stars">★★★★★</span>
                  <small>Verified Customer Reviews</small>
                </a>
                <a {...reviewLinkProps("clutch")}><img src={IMG + "r-clutch.webp"} alt="Pack Legacy reviews on Clutch" height={26} /></a>
                <a {...reviewLinkProps("bark")}><img src={IMG + "r-bark.webp"} alt="Pack Legacy reviews on Bark" height={26} /></a>
                <a {...reviewLinkProps("trustpilot")}><img src={IMG + "r-trustpilot.png"} alt="Pack Legacy reviews on Trustpilot" height={26} /></a>
              </div>
            </section>

            <div className="plmb cb-quote" id="quote" tabIndex={-1} dangerouslySetInnerHTML={{ __html: quotePanelMarkup }} suppressHydrationWarning />

            <section className="cb-categories ind-grid" id="categories" aria-labelledby="ind-grid-title">
              <div className="ind-grid-head">
                <h2 id="ind-grid-title">Custom Boxes &amp; Packaging By Industry</h2>
                <p>Explore our range of custom boxes and packaging solutions for every industry:</p>
              </div>
              <ul className="cb-cat-grid">
                {industries.map((c) => (
                  <li key={c.name}>
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
            </section>
          </div>
        </div>

        <div className="plh ind-builder">
          <Builder />
        </div>

        <section className="cb-wrap cb-section cb-faq" id="faq" aria-labelledby="ind-faq-title">
          <h2 id="ind-faq-title">
            Frequently <em>Asked</em> Questions
          </h2>
          <p className="cb-center-sub">We’ve answered all the common questions you may have before ordering custom boxes.</p>
          <FaqCards items={faqs} />
        </section>

        <div className="plh">
          <ReviewsSection />
        </div>

        <section className="cb-wrap cb-section cb-insta" aria-labelledby="ind-insta-title">
          <div className="cb-insta-head">
            <h2 id="ind-insta-title">
              Follow <a href="https://www.instagram.com/pack_legacy/" rel="nofollow">Packlegacy</a> on Instagram for ideas and
              inspiration to make your custom packaging look amazing.
            </h2>
            <div className="cb-social">
              <a href="https://www.instagram.com/pack_legacy/" rel="nofollow" aria-label="Instagram">
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          <InstaMarquee images={instagram.map((img) => IMG + img)} />
        </section>

        <section className="cb-wrap cb-cta-wrap" aria-labelledby="ind-cta-title">
          <div className="cb-cta">
            <div>
              <h2 id="ind-cta-title">Can’t Find the Right Packaging for Your Industry?</h2>
              <p>
                Not finding the perfect packaging solution for your products? No worries! Share your requirements with us, and
                our packaging experts will help you create custom boxes tailored to your industry, products, and budget.
              </p>
            </div>
            <div className="cb-cta-actions">
              <a className="cb-btn cb-btn-red" href="#quote">Get a Custom Quote</a>
              <a className="cb-btn cb-btn-outline" href="/shop/">Explore All Packaging</a>
            </div>
          </div>
        </section>
      </main>
      <MagneticBoxesScript />
      <Footer />
    </>
  );
}
