import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstagramSection from "@/components/home/InstagramSection";
import OrderSection from "@/components/home/OrderSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import { reviewLinkProps } from "@/lib/reviewProfiles";
import {
  ArrowRight,
  ArrowUpRight,
  Builder,
  FinishingStudio,
  FormatGrid,
  HeroSlider,
  HelpDesk,
  MaterialsLab,
} from "@/components/home/HomeClient";
import "@/styles/home.css";

export const metadata: Metadata = withSeo("/", {
  alternates: { canonical: "/" },
  title: "Custom Packaging & Printed Boxes | Pack Legacy",
  description:
    "Custom packaging for brands of every size. No minimum order, free design support and free US shipping on custom mailer boxes, rigid boxes and folding cartons.",
});


const perks = [
  {
    title: "No minimum order",
    text: "Start with the quantity you need.",
    icon: (
      <>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M12 13v8" />
      </>
    ),
  },
  {
    title: "Free design support",
    text: "Get help with your artwork and fit.",
    icon: (
      <>
        <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="M2 22h20" />
      </>
    ),
  },
  {
    title: "Free US shipping",
    text: "From production to your doorstep.",
    icon: (
      <>
        <path d="M14 18V6a1 1 0 0 0-1-1H4" />
        <path d="M14 9h4l4 4v5h-2" />
        <path d="M2 9h6M3 13h5" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path d="M9 18h6" />
      </>
    ),
  },
  {
    title: "3D Design Previews",
    text: "Visualize your packaging.",
    // Monitor showing a small 3D box, with a "3D" label at the top right.
    icon: (
      <>
        <rect x="1" y="7" width="16" height="11" rx="1.5" />
        <path d="M6 22h6M9 18v4" />
        <path d="m9 9.4 3 1.6v3.3l-3 1.6-3-1.6V11z" />
        <path d="m6 11 3 1.6 3-1.6M9 12.6v3.3" />
        <text x="23.5" y="7" textAnchor="end" fontSize="7" fontWeight="800" fill="currentColor" stroke="none" fontFamily="Inter, sans-serif">3D</text>
      </>
    ),
  },
];

const notes = [
  { tag: "02 / Structure", title: "Different types of packaging boxes", img: "/images/cat-display.webp", href: "/blog/types-of-boxes/" },
  { tag: "03 / Fundamentals", title: "What is packaging?", img: "/images/cat-cosmetic.webp", href: "/blog/what-is-packaging/" },
  { tag: "04 / Budget", title: "How much does packaging cost?", img: "/images/cat-food.webp", href: "/blog/how-much-does-packaging-cost/" },
];

const Stars = ({ label = "5 out of 5 stars" }: { label?: string }) => (
  <span className="h-stars" role="img" aria-label={label}>★★★★★</span>
);

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="plh" id="main">
        {/* Hero */}
        <section className="h-hero" aria-labelledby="h-title">
          <div className="h-hero-copy">
            <h1 id="h-title">
              Custom Packaging &amp; Boxes <em className="h-accent">Made to Impress</em>
            </h1>
            <p>
              Make your brand stand out with high-quality custom packaging and boxes tailored to your needs. Choose from
              unique styles, sizes, and finishes that protect your products and impress your customers.
            </p>
            <div className="h-actions">
              <a className="h-btn h-btn-red" href="#quote">
                Get a Quote <ArrowUpRight />
              </a>
              <a className="h-btn h-btn-outline" href="/sample-kits/">
                Request a Sample Kit <ArrowRight />
              </a>
            </div>
            <div className="h-proof">
              <a className="h-proof-score" href="#reviews">
                <span><strong>5.0</strong> <Stars /></span>
                <small>Verified Customer Reviews</small>
              </a>
              <a {...reviewLinkProps("clutch")}><img src={"/images/r-clutch.webp"} alt="Pack Legacy reviews on Clutch" height={32} /></a>
              <a {...reviewLinkProps("bark")}><img src={"/images/r-bark.webp"} alt="Pack Legacy reviews on Bark" height={32} /></a>
              <a {...reviewLinkProps("trustpilot")}><img src={"/images/r-trustpilot.png"} alt="Pack Legacy reviews on Trustpilot" height={32} /></a>
            </div>
          </div>
          <HeroSlider />
        </section>

        {/* Perks strip */}
        <ul className="h-perks" aria-label="Why order from Pack Legacy">
          {perks.map((p) => (
            <li key={p.title}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {p.icon}
              </svg>
              <span>
                <strong>{p.title}</strong>
                {p.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Find your format */}
        <section className="h-wrap h-section" aria-labelledby="h-format-title">
          <div className="h-head">
            <div>
              <p className="h-eyebrow">Find Your Perfect Packaging</p>
              <h2 className="h-display" id="h-format-title">Explore Our Range of Custom Packaging &amp; Box Styles</h2>
            </div>
            <a className="h-link" href="#design">
              Design Your Own Packaging <ArrowUpRight />
            </a>
          </div>
          <FormatGrid />
        </section>

        <Builder />

        {/* Built for growing brands */}
        <section className="h-wrap h-section h-split h-brands" aria-labelledby="h-brands-title">
          <img
            className="h-brands-img"
            src="/images/custom-packaging-for-growing-brands.webp"
            alt="Custom printed green mailer box with branded skincare products and kraft paper fill"
            width={750}
            height={499}
            loading="lazy"
          />
          <div className="h-brands-copy">
            {/* Eyebrow and heading sit directly above the paragraphs. */}
            <div>
              <p className="h-eyebrow h-eyebrow-green">Built for Growing Brands</p>
              <h2 className="h-display" id="h-brands-title">
                Custom Packaging for Every Stage of Your <em className="h-italic">Business</em>
              </h2>
            </div>
            <p>
              Whether you&apos;re launching a new product or ordering packaging in bulk, we offer custom packaging boxes that
              fit your needs. Choose from mailer boxes, rigid boxes, folding cartons, or mylar bags in your preferred sizes,
              styles, and materials.
            </p>
            <p>
              Start with small quantities or order in bulk at wholesale rates. We help you find the right packaging as your
              business grows.
            </p>
            <a className="h-link h-link-green" href="/shop/">
              Explore All Packaging <ArrowRight />
            </a>
          </div>
        </section>

        <section className="h-wrap h-section" aria-label="Materials">
          <MaterialsLab />
        </section>

        <section className="h-wrap h-section" aria-label="Finishes">
          <FinishingStudio />
        </section>

        {/* Process + quote */}
        <OrderSection />

        {/* CTA */}
        <section className="h-wrap h-cta" aria-labelledby="h-cta-title">
          <div>
            <p className="h-eyebrow h-eyebrow-light">Need Custom Packaging?</p>
            <h2 className="h-display" id="h-cta-title">Did not find what you were looking for?</h2>
            <p>
              Contact our live chat support team and let us know your packaging requirements. We’ll help you find the
              right solution for your products.
            </p>
          </div>
          <a className="h-btn h-btn-cream" href="/contact-us/">
            Contact Us <ArrowUpRight />
          </a>
        </section>

        <section className="h-wrap h-section h-ruled" id="faq" aria-label="Frequently asked questions">
          <HelpDesk />
        </section>

        {/* Field notes */}
        <section className="h-wrap h-section" aria-labelledby="h-notes-title">
          <div className="h-head">
            <div>
              <p className="h-eyebrow">The Packaging Field Notes</p>
              <h2 className="h-display" id="h-notes-title">Packaging Insight To Get Inspired</h2>
            </div>
            <a className="h-link" href="/blog/">
              Browse all articles <ArrowUpRight />
            </a>
          </div>
          <div className="h-notes">
            <a className="h-note-card h-note-feature" href="/blog/measure-your-box-dimensions/">
              <span className="h-note-img">
                <img src={"/images/cat-mailer.webp"} alt="" width={600} height={600} loading="lazy" />
              </span>
              <span className="h-note-body">
                <span className="h-note-tag">01 / Measuring</span>
                <strong>Measure your box dimensions</strong>
                <span className="h-note-desc">Find the length, width and height before you request a quote.</span>
              </span>
              <span className="h-note-arrow"><ArrowUpRight /></span>
            </a>
            <div className="h-note-list">
              {notes.map((n) => (
                <a className="h-note-card" href={n.href} key={n.title}>
                  <span className="h-note-img">
                    <img src={n.img} alt="" width={300} height={300} loading="lazy" />
                  </span>
                  <span className="h-note-body">
                    <span className="h-note-tag">{n.tag}</span>
                    <strong>{n.title}</strong>
                  </span>
                  <span className="h-note-arrow"><ArrowUpRight /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <ReviewsSection />

        {/* Instagram */}
        <InstagramSection />
      </main>
      <Footer />
    </>
  );
}
