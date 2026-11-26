// "What Clients Say About Us": scrolling review cards on the homepage, the category pages, /industries/ and /box-by-style/.
// Styles: styles/home.css (.plh). Outside the homepage, wrap it in <div className="plh">.
import { reviewLinkProps } from "@/lib/reviewProfiles";
import "@/styles/home.css";


const reviews = [
  { name: "Lina Karl", src: "pl", text: "I’ve tried other suppliers, but Pack Legacy always delivers on time. Got my printed boxes arrived on time, and with free shipping, too. Well done!" },
  { name: "Emily Ron", src: "pl", text: "The perfume boxes I ordered had foiling and embossing that made my products feel luxurious. Worth every penny." },
  { name: "Andy Roy", src: "clutch", text: "Pack Legacy successfully delivered the project on time and met the client’s expectations. The team kept the client updated on the progress and was attentive to the client’s needs." },
  { name: "Clarke Wayne", src: "pl", text: "Great communication from start to finish. The whole process was smooth and my order shipped right on time. Highly recommended." },
  { name: "Carrie Suda", src: "pl", text: "Really happy with the custom boxes for my beauty brand. They look lovely and the quality is great." },
  { name: "Johnson Ron", src: "pl", text: "The magnetic closure boxes matched exactly what I expected, with great quality. Kevin was so helpful throughout. I will definitely reorder." },
  { name: "Olivia", src: "pl", text: "Excellent service and communication, and the boxes were shipped on time." },
];

const Stars = () => <span className="h-stars" role="img" aria-label="5 out of 5 stars">★★★★★</span>;

const ArrowUpRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export default function ReviewsSection() {
  return (
    <section className="h-wrap h-section h-reviews" id="reviews" aria-labelledby="h-reviews-title">
      <div className="h-reviews-head">
        <div>
          <h2 id="h-reviews-title">What Clients Say About Us</h2>
          <p>Real feedback from clients who have experienced our services first hand.</p>
        </div>
        <div className="h-review-logos">
          <a {...reviewLinkProps("clutch")}><img src={"/images/r-clutch.webp"} alt="Pack Legacy reviews on Clutch" height={40} loading="lazy" /></a>
          <a {...reviewLinkProps("bark")}><img src={"/images/r-bark.webp"} alt="Pack Legacy reviews on Bark" height={40} loading="lazy" /></a>
          <a {...reviewLinkProps("trustpilot")}><img src={"/images/r-trustpilot.png"} alt="Pack Legacy reviews on Trustpilot" height={40} loading="lazy" /></a>
        </div>
      </div>
      {/* Reviews scroll slowly from right to left and pause on hover. The list is drawn twice for a seamless loop;
          the copy is hidden from screen readers. */}
      <div className="h-review-marquee" style={{ "--review-count": reviews.length } as React.CSSProperties}>
      <div className="h-review-track">
      {[0, 1].map((copy) => (
      <ul className="h-review-grid" key={copy} aria-hidden={copy === 1 || undefined}>
        {reviews.map((r) => (
          <li key={r.name}>
            <figure className="h-review">
              <div className="h-review-top">
                <Stars />
                {r.src === "clutch" ? (
                  <a {...reviewLinkProps("clutch")}><img src={"/images/r-clutch.webp"} alt="Read this review on Clutch" height={26} loading="lazy" /></a>
                ) : (
                  <img className="h-review-mark" src="/images/pack-legacy-logo-compact.svg" alt="Pack Legacy review" width={138} height={28} loading="lazy" />
                )}
              </div>
              <blockquote>“{r.text}”</blockquote>
              <figcaption>{r.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      ))}
      </div>
      </div>
      <a className="h-link h-link-center" href="/reviews/">
        View all reviews <ArrowUpRight />
      </a>
    </section>
  );
}
