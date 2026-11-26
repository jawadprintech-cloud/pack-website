import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { CtaBand, InfoShell, PageHero, Stars } from "@/components/info/InfoParts";
import InfoForm from "@/components/info/InfoForm";
import { REVIEW_PROFILES, reviewLinkProps } from "@/lib/reviewProfiles";

export const metadata: Metadata = withSeo("/reviews/", {
  alternates: { canonical: "/reviews/" },
  title: "Reviews | What Our Clients Say | Pack Legacy",
  description: "Read reviews from brands that trust Pack Legacy for premium custom packaging, and share your own experience.",
});

// Reviews shown on https://packlegacy.com/reviews/ (all 5 stars). `src` picks the badge in the card corner.
// `featured` cards span two columns; with this order the 7 cards fill a 3-column grid with no gaps
// (row 1: featured + 1, row 2: 1 + featured, row 3: three cards).
type Source = "pl" | "trustpilot" | "clutch";
const reviews: { name: string; src: Source; color: string; featured?: boolean; text: string }[] = [
  { name: "Clarke Wayne", src: "pl", color: "#0b8743", featured: true, text: "Great communication from start to finish. The whole process was smooth and my order shipped right on time. Highly recommended." },
  { name: "Emily Ron", src: "pl", color: "#2f6b3c", text: "Our perfume boxes with foiling and embossing feel so luxurious. Worth every penny." },
  { name: "Carrie Suda", src: "pl", color: "#ff4343", text: "Really happy with the custom boxes for my beauty brand. They look lovely and the quality is great." },
  // Olivia and Johnson Ron are the two reviews on https://www.trustpilot.com/review/packlegacy.com
  { name: "Johnson Ron", src: "trustpilot", color: "#1d1d1b", featured: true, text: "The magnetic closure boxes matched exactly what I expected, with great quality. Kevin was so helpful throughout. I will definitely reorder." },
  { name: "Olivia", src: "trustpilot", color: "#c4935c", text: "Excellent service from PL. Excellent communication and timely shipped." },
  { name: "Lina Karl", src: "pl", color: "#5fa04e", text: "Unlike other suppliers I have used, Pack Legacy actually delivers on time. My printed boxes arrived on schedule with free shipping." },
  { name: "Andy Roy", src: "clutch", color: "#b03a12", text: "The project was delivered on time and met all my expectations. The team kept me updated and was very attentive. Impressed with the support." },
];

const sources: Record<Source, { label: string; img: string; alt: string; cls: string }> = {
  pl: { label: "Verified customer", img: "/pack-legacy-logo.svg", alt: "Pack Legacy review", cls: "is-pl" },
  trustpilot: { label: "Review on Trustpilot", img: "/r-trustpilot.png", alt: "Trustpilot review", cls: "is-tp" },
  clutch: { label: "Review on Clutch", img: "/r-clutch.webp", alt: "Clutch review", cls: "is-clutch" },
};
const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

// Hero photo collage: each tile shows boxes a reviewer talked about. Hover zooms the photo and reveals the quote.
// `pos` keeps the boxes in frame.
const heroTiles = [
  { img: "/cat-gift.webp", pos: "50% 50%", href: "/gift-boxes/", title: "Luxury gift boxes", name: "Emily Ron", quote: "Feel so luxurious. Worth every penny.", big: true },
  { img: "/cat-magnetic.webp", pos: "50% 60%", href: "/product/magnetic-closure-boxes/", title: "Magnetic closure boxes", name: "Johnson Ron", quote: "Matched exactly what I expected." },
  { img: "/cat-cosmetic.webp", pos: "50% 60%", href: "/cosmetic-boxes/", title: "Cosmetic boxes", name: "Carrie Suda", quote: "They look lovely and the quality is great." },
];

const platforms = [
  { name: "Clutch", img: "/image-234.svg", href: REVIEW_PROFILES.clutch },
  { name: "Bark", img: "/image-235.svg", href: REVIEW_PROFILES.bark },
  { name: "Trustpilot", img: "/image-233.svg", href: REVIEW_PROFILES.trustpilot },
];

export default function ReviewsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pack Legacy",
    aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: reviews.length },
  };
  return (
    <InfoShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHero
        crumb="Reviews"
        eyebrow="Customer reviews"
        title={<>What our <em>clients say.</em></>}
        lead="Businesses trust Pack Legacy for premium custom packaging. Here is what some of the brands we have helped grow say about working with us."
        media={
          <div className="ip-rv-collage">
            {heroTiles.map((t) => (
              <a key={t.title} className={`ip-rv-tile${t.big ? " is-big" : ""}`} href={t.href}>
                <img src={t.img} alt={t.title} style={{ objectPosition: t.pos }} loading="eager" />
                <span className="ip-rv-cap">
                  <strong>{t.title}</strong>
                  <span className="ip-rv-quote">“{t.quote}” <em>— {t.name}</em></span>
                </span>
              </a>
            ))}
            <span className="ip-rv-chip" aria-hidden="true">
              <Stars size={14} /> <b>5.0</b> from happy clients
            </span>
          </div>
        }
      >
        <div className="ip-score">
          <span className="ip-score-num">5.0</span>
          <div>
            <Stars size={22} />
            <p>More than <strong>100+ customers</strong> love us. Based on {reviews.length}+ reviews.</p>
          </div>
        </div>
      </PageHero>

      <section className="ip-section" aria-label="Customer reviews">
        <div className="ip-wrap">
          {/* Review cards based on the homepage card (.h-review in home.css). */}
          <ul className="ip-hreview-grid">
            {reviews.map((r) => {
              const s = sources[r.src];
              return (
                <li key={r.name} className={r.featured ? "is-featured" : undefined}>
                  <figure className="ip-hreview">
                    <div className="ip-hreview-top">
                      <span className="ip-hreview-stars"><Stars size={20} /></span>
                      {r.src === "pl" ? (
                        <span className={`ip-hreview-badge ${s.cls}`}>
                          <img src={s.img} alt={s.alt} loading="lazy" />
                        </span>
                      ) : (
                        <a className={`ip-hreview-badge ${s.cls}`} {...reviewLinkProps(r.src)}>
                          <img src={s.img} alt={`Read this review on ${r.src === "clutch" ? "Clutch" : "Trustpilot"}`} loading="lazy" />
                        </a>
                      )}
                    </div>
                    <blockquote>{r.text}</blockquote>
                    <figcaption>
                      <span className="ip-hreview-avatar" style={{ background: r.color }} aria-hidden="true">{initials(r.name)}</span>
                      <span className="ip-hreview-who"><strong>{r.name}</strong><span>{s.label}</span></span>
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="ip-section ip-band" aria-labelledby="trust-h">
        <div className="ip-wrap">
          <div className="ip-head ip-head-center">
            <p className="ip-eyebrow">Trusted everywhere</p>
            <h2 id="trust-h">Trusted by brands across industries.</h2>
            <p className="ip-lead">Startups and established businesses count on us for premium packaging, reliable service and consistent quality. Read more reviews, or share your own.</p>
          </div>
          <div className="ip-platforms">
            {platforms.map((p) => (
              <a className="ip-card" key={p.name} href={p.href} target="_blank" rel="noopener nofollow" aria-label={`Pack Legacy on ${p.name}`}>
                <img src={p.img} alt={p.name} width={140} height={44} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="ip-section" aria-labelledby="write-h">
        <div className="ip-wrap-narrow">
          <div className="ip-form-card">
            <h2 id="write-h">Share your experience</h2>
            <p>Ordered from us? We would love to hear how it went.</p>
            <InfoForm
              formName="review"
              submitLabel="Submit review"
              fields={[
                { type: "rating", name: "rating", label: "Your overall rating" },
                { type: "textarea", name: "review", label: "Your review", required: true, placeholder: "Tell us about your boxes and your experience..." },
                { type: "text", name: "name", label: "Your name", required: true, autoComplete: "name" },
                { type: "email", name: "email", label: "Your email", required: true, autoComplete: "email" },
              ]}
            />
          </div>
        </div>
      </section>
      <CtaBand title="Join our happy customers." />
    </InfoShell>
  );
}
