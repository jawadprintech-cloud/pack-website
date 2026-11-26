// Shared layout for every /product/<slug>/ page. It uses the same markup and classes as the
// Magnetic Closure Boxes page, so styles/magnetic-boxes.css and MagneticBoxesScript work unchanged.
// Content comes from data/products.json (scraped from packlegacy.com).
import type { ReactNode } from "react";
import quotePanelMarkup from "@/components/quote/quotePanelMarkup";
import FaqCards from "@/components/FaqCards";
import products from "@/data/products.json";
import { categoryPageFor } from "@/data/categories";
import { reviewLinkProps } from "@/lib/reviewProfiles";
import { isBagHref } from "@/lib/moq";

export type Block = { t: string; html?: string; items?: string[]; src?: string; alt?: string; head?: string[]; rows?: string[][] };
export type Product = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  gallery: string[];
  intro: string[];
  /** Optional exact hero copy (shown in full, no trimming): body paragraphs, then `cta` as the bold last line. */
  hero?: { body: string[]; cta?: string }; // no cta → the standard "Don't wait out…" line
  /** Optional "Key Takeaway" text; falls back to metaDescription. */
  takeaway?: string;
  /** "Last updated" date (YYYY-MM-DD); falls back to PRODUCTS_UPDATED. Set it whenever a product's copy changes. */
  updated?: string;
  whatYouGet?: string[];
  whyUs?: string[];
  quickFaqs?: string[];
  description: Block[];
  specs: [string, string][];
  faqs: { q: string; a: string }[];
  related: { name: string; href: string; img: string }[];
};

/** Default "Last updated" date for products without their own `updated` date. */
export const PRODUCTS_UPDATED = "2026-09-01";
/** "2026-09-01" → "September 1, 2026" */
export const formatUpdated = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export const allProducts = products as unknown as Product[];
export const getProduct = (slug: string) => allProducts.find((p) => p.slug === slug);


export const categoryOf = (p: Product) => p.category.replace(/\s+Custom$/, "").trim();

const Chevron = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const Arrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
// Scraped text is escaped on import; only links and bold/italic tags are kept.
const Html = ({ as: Tag = "p", html, className }: { as?: "p" | "h2" | "h3" | "li" | "span"; html: string; className?: string }) => (
  <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
);
const ArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-arrow-down" aria-hidden="true">
    <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
  </svg>
);
/** Hero copy: tags stripped (entities kept), cut at a sentence end to about `max` characters. */
function brief(html: string, max = 200, skip = 0) {
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(skip).trim();
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)/g) || [text];
  let out = "";
  for (const s of sentences) {
    if (out && (out + s).length > max) break;
    out += s;
  }
  return out.trim();
}
const pad = (n: number) => String(n).padStart(2, "0");
const spec = (p: Product, re: RegExp) => p.specs.find(([k]) => re.test(k))?.[1];

// Labels and the shared subtitle follow the packlegacy.com option cards.
const OPTION_NOTE = "A sturdy foundation for custom artwork";
const materialOptions = [
  ["/grey-chipboard.webp", "Grey-Chipboard", OPTION_NOTE],
  ["/cardstock.webp", "Thick-Cardstock", OPTION_NOTE],
  ["/duplex-chipboard-layers-with-green-checkmark.webp", "Duplex-Chipboard", OPTION_NOTE],
];
const finishOptions = [
  ["/gloss-lamination-sample-card.webp", "Gloss", OPTION_NOTE],
  ["/matte-lamination-product-banner.webp", "Matte", OPTION_NOTE],
  ["/gloss.webp", "Spot UV", OPTION_NOTE],
  ["/embossing-magnetic.webp", "Embossing", OPTION_NOTE],
  ["/debossing.webp", "Debossing", OPTION_NOTE],
  ["/foiling-stamp.webp", "Foil Stamping", OPTION_NOTE],
  ["/soft-touch-magnetic.webp", "Soft Touch Lamination", OPTION_NOTE],
  ["/varnish.webp", "Varnish", OPTION_NOTE],
];
// `src` is where the review was posted (same attribution as app/reviews/page.tsx); "pl" = collected directly by
// Pack Legacy, shown with our own logo as on the Reviews page. `rest` is the part hidden behind "Read more".
const REVIEW_LOGOS = {
  clutch: { img: "/r-clutch.webp", alt: "Clutch", note: "Review on Clutch" },
  trustpilot: { img: "/r-trustpilot.png", alt: "Trustpilot", note: "Review on Trustpilot" },
  bark: { img: "/r-bark.webp", alt: "Bark", note: "Review on Bark" },
  pl: { img: "/pack-legacy-logo.svg", alt: "Pack Legacy review", note: "Verified customer" },
} as const;
const heroReviews: { who: string; text: string; rest?: string; src: keyof typeof REVIEW_LOGOS }[] = [
  { who: "Andy Roy", src: "clutch", text: "Pack Legacy successfully delivered the project on time and met the client’s expectations.", rest: " The team kept the client updated on the progress and was attentive to the client’s needs. The client was also impressed with the team’s support and how they handled the project overall." },
  { who: "Emily Ron", src: "pl", text: "The perfume boxes I ordered had foiling and embossing that made my products feel luxurious. Worth every penny." },
  { who: "Olivia", src: "trustpilot", text: "Excellent service from PL. Excellent communication and timely shipped." },
  { who: "Carrie Suda", src: "pl", text: "They look nice and the quality is good." },
];

/** Related cards: the ones listed on packlegacy.com, topped up with products from the same category. */
function relatedFor(p: Product) {
  const list = p.related.filter((r) => r.img && r.href).map((r) => ({ ...r, note: "" }));
  const cat = categoryOf(p);
  for (const o of allProducts) {
    if (list.length >= 4) break;
    if (o.slug === p.slug || !o.gallery[0] || (cat && categoryOf(o) !== cat)) continue;
    const href = `/product/${o.slug}/`;
    if (!list.some((r) => r.href === href)) list.push({ name: o.title.replace(/^Custom\s+/, ""), href, img: o.gallery[0], note: "" });
  }
  return list.slice(0, 4);
}

/** Splits the scraped description into an intro (before the first heading) and the rest. */
function renderDescription(blocks: Block[]) {
  const out: ReactNode[] = [];
  blocks.forEach((b, i) => {
    if (b.t === "h2") out.push(<Html key={i} as="h2" html={b.html!} />);
    else if (b.t === "h3") out.push(<Html key={i} as="h3" html={b.html!} />);
    else if (b.t === "ul") out.push(<ul key={i}>{b.items!.map((it, j) => <Html key={j} as="li" html={it} />)}</ul>);
    else if (b.t === "img") out.push(<img key={i} className="feature-photo" src={b.src} alt={b.alt || ""} width={1080} height={720} loading="lazy" />);
    else if (b.t === "table") out.push(
      <div key={i} className="prod-table-wrap">
        <table className="prod-table">
          {/* Cells hold HTML (links, &amp;), like the other description blocks. */}
          <thead><tr>{b.head!.map((h, j) => <th key={j} scope="col" dangerouslySetInnerHTML={{ __html: h }} />)}</tr></thead>
          <tbody>
            {b.rows!.map((r, j) => (
              <tr key={j}>{r.map((c, k) => (k === 0
                ? <th key={k} scope="row" dangerouslySetInnerHTML={{ __html: c }} />
                : <td key={k} dangerouslySetInnerHTML={{ __html: c }} />))}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    else out.push(<Html key={i} html={b.html!} />);
  });
  return out;
}

export default function ProductPage({ product: p }: { product: Product }) {
  const cat = categoryOf(p);
  const name = p.title.replace(/^Custom\s+/, "");
  const bag = isBagHref(`/product/${p.slug}/`) || /\bbags?\b/i.test(p.category); // bags have a minimum order
  const moqSpec = spec(p, /minimum order|\bmoqs?\b/i); // a "Minimum Order Quantity" row in the product's own table
  const gallery = p.gallery.length ? p.gallery : ["/hero.webp"];
  const related = relatedFor(p);
  const takeaway = p.takeaway || p.metaDescription || p.intro[0]?.replace(/<[^>]+>/g, "") || "";
  const isCta = (h: string) => /^\s*<(em|strong|b|i)>/.test(h);
  const bodyParas = p.intro.filter((h) => !isCta(h));
  // One-paragraph intros are split into two short paragraphs so every hero has the same shape.
  const heroBody = p.hero ? p.hero.body : bodyParas.length >= 2
    ? bodyParas.slice(0, 2).map((h) => brief(h))
    : bodyParas.length === 1 ? [brief(bodyParas[0]), brief(bodyParas[0], 200, brief(bodyParas[0]).length)].filter(Boolean) : [];
  const heroCta = p.hero ? (p.hero.cta ? `<strong><em>${p.hero.cta}</em></strong>` : undefined) : [...p.intro].reverse().find(isCta);

  return (
    <main id="main">
      <a className="button red side-quote" href="#quote">Get a quote</a>
      <div className="wide-wrap">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <Chevron size={13} />
          {/* Home > Category > Product; products without a category fall back to Custom Boxes. */}
          {!cat ? <a href="/custom-boxes/">Custom Boxes</a> : categoryPageFor[cat] ? <a href={categoryPageFor[cat]}>{cat}</a> : <span>{cat}</span>}
          <Chevron size={13} />
          <span aria-current="page">{name}</span>
        </nav>
      </div>

      <div className="product-sticky-region">
        <div className="wide-wrap">
          <div className="product-grid">
            <div className="product-main">
              <section className="hero" aria-labelledby="product-title">
                <div className="hero-gallery">
                  <div className="gallery" aria-label="Product gallery">
                    <div className="thumbs">
                      {gallery.map((src, i) => (
                        <button key={src} type="button" aria-pressed={i === 0} aria-label={`Show ${p.title} image ${i + 1}`} style={{ "--bg": `url("${src}")` } as React.CSSProperties}>
                          <img src={src} alt="" width={650} height={650} />
                        </button>
                      ))}
                    </div>
                    <div className="gallery-main" style={{ "--bg": `url("${gallery[0]}")` } as React.CSSProperties}>
                      <img src={gallery[0]} alt={`${p.title} image 1`} width={650} height={650} fetchPriority="high" />
                      <button type="button" className="expand icon-button" aria-label="Enlarge product image">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m15 15 6 6" /><path d="m15 9 6-6" /><path d="M21 16v5h-5" /><path d="M21 8V3h-5" /><path d="M3 16v5h5" /><path d="m3 21 6-6" /><path d="M3 8V3h5" /><path d="M9 9 3 3" />
                        </svg>
                      </button>
                      <div className="gallery-nav">
                        <button type="button" className="icon-button" aria-label="Previous image"><ChevronLeft /></button>
                        <span aria-live="polite">01 / {pad(gallery.length)}</span>
                        <button type="button" className="icon-button" aria-label="Next image"><Chevron size={18} /></button>
                      </div>
                    </div>
                    <dialog className="lightbox" aria-label="Enlarged product image">
                      <div>
                        <img src={gallery[0]} alt={`${p.title} image 1`} width={650} height={650} />
                        <button type="button" className="expand icon-button" aria-label="Close image">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                          </svg>
                        </button>
                        <div className="gallery-nav">
                          <button type="button" className="icon-button" aria-label="Previous enlarged image"><ChevronLeft /></button>
                          <span>1 / {gallery.length}</span>
                          <button type="button" className="icon-button" aria-label="Next enlarged image"><Chevron size={18} /></button>
                        </div>
                      </div>
                    </dialog>
                  </div>
                  <aside className="takeaway">
                    <div className="takeaway-title">Key Takeaway</div>
                    <p>{takeaway}</p>
                    <a href="#materials" className="text-link">Explore your packaging options <ArrowDown /></a>
                  </aside>
                </div>
                <div className="hero-copy">
                  <p className="last-updated">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                    Last updated <time dateTime={p.updated || PRODUCTS_UPDATED}>{formatUpdated(p.updated || PRODUCTS_UPDATED)}</time>
                  </p>
                  <h1 id="product-title" style={{ "--chars": p.title.length } as React.CSSProperties}>{p.title}</h1>
                  <span className="rating">5.0 <span>★★★★★</span></span>
                  {/* Same shape as the Magnetic page: two short paragraphs from the product's own intro, then its bold call to action. */}
                  {heroBody.map((t, i) => <Html key={i} className="hero-description" html={t} />)}
                  {heroCta
                    ? <Html className="hero-description hero-cta-line" html={heroCta} />
                    : <p className="hero-description hero-cta-line"><strong><em>Don&rsquo;t wait out. Fill out the quote form and start designing your {name.toLowerCase()}.</em></strong></p>}
                  <div className="quote-card hero-review" role="region" aria-roledescription="carousel" aria-label="Customer reviews">
                    <div className="review-top"><span className="quote-mark">“</span><span>★★★★★</span></div>
                    <div className="review-slides" aria-live="polite">
                      {heroReviews.map(({ who, text, rest, src }, i) => (
                        <figure key={who} className={`review-slide${i === 0 ? " is-active" : ""}`} aria-hidden={i === 0 ? undefined : true}>
                          <blockquote>
                            “{text}
                            {rest && <><span className="review-rest">{rest}</span> <button type="button" className="review-more" aria-expanded="false">Read more»</button></>}
                          </blockquote>
                          <div className="review-footer">
                            <div><span className="review-name">{who}</span><small>{REVIEW_LOGOS[src].note}</small></div>
                            {src === "pl" ? (
                              <img className="review-source" src={REVIEW_LOGOS[src].img} alt={REVIEW_LOGOS[src].alt} height={22} loading="lazy" />
                            ) : (
                              <a {...reviewLinkProps(src)}><img className="review-source" src={REVIEW_LOGOS[src].img} alt={`Read this review on ${REVIEW_LOGOS[src].alt}`} height={22} loading="lazy" /></a>
                            )}
                          </div>
                        </figure>
                      ))}
                    </div>
                  </div>
                  {/* One image with all three logos; a link sits over each logo (styles: .rp-link in magnetic-boxes.css). */}
                  <div className="review-platforms">
                    <img src={"/reviews.webp"} width={500} height={67} alt="" />
                    <a className="rp-link rp-clutch" {...reviewLinkProps("clutch")} aria-label="Pack Legacy reviews on Clutch" />
                    <a className="rp-link rp-bark" {...reviewLinkProps("bark")} aria-label="Pack Legacy reviews on Bark" />
                    <a className="rp-link rp-trustpilot" {...reviewLinkProps("trustpilot")} aria-label="Pack Legacy reviews on Trustpilot" />
                  </div>
                </div>
              </section>
              {/* Same benefit copy as the Magnetic page, so the strip stays one tidy row on every product. */}
              <div className="benefits">
                <div><img src={"/materials.webp"} alt="" width={39} height={39} /><div><strong>Materials</strong><small>Corrugated, kraft, cardboard<br />&amp; rigid stock options</small></div></div>
                <div><img src={"/printing.webp"} alt="" width={39} height={39} /><div><strong>Printing</strong><small>CMYK &amp; PMS colors<br />Digital and offset printing</small></div></div>
                <div><img src={"/turnaround.webp"} alt="" width={39} height={39} /><div><strong>Turnaround</strong><small>Rush, standard &amp; economy<br />Confirm timing with your quote</small></div></div>
                <div><img src={"/shipping.webp"} alt="" width={39} height={39} /><div><strong>Free Shipping</strong><small>From our team<br />to your doorstep</small></div></div>
              </div>
            </div>
            <div className="quote-rail" id="quote" tabIndex={-1} dangerouslySetInnerHTML={{ __html: quotePanelMarkup }} />
          </div>
        </div>

        <div className="wide-wrap">
          <div className="section-bar">
            <nav aria-label="On this page">
              <a href="#glance">At a Glance</a>
              <a href="#materials">Make It Yours</a>
              <a href="#details">The Details</a>
              {p.faqs.length > 0 && <a href="#faq">FAQs</a>}
              <a href="#related">Related Packaging</a>
            </nav>
          </div>
        </div>

        <section className="wide-wrap section" id="glance">
          <div className="reading-width">
            <p className="eyebrow">A LITTLE BOX. A BIG BRAND MOMENT.</p>
            <div className="section-intro">
              <h2>{name} specifications.</h2>
            </div>
            <div className="specs">
              <div><strong>At a glance</strong><span>THE ESSENTIALS</span></div>
              <dl>
                <div><dt>Box style</dt><dd>{p.title}</dd></div>
                {p.specs.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
                {!moqSpec && <div><dt>Order quantity</dt><dd>{bag ? "Low MOQ" : "No minimum order quantity"}</dd></div>}
              </dl>
            </div>
          </div>
        </section>

        <section className="sage section" id="materials">
          <div className="wide-wrap">
            <div className="reading-width options-width">
              <p className="eyebrow">YOUR BRAND. EVERY DETAIL.</p>
              <h2>Materials &amp; Options</h2>
              <div className="options">
                <h3><span>01</span> Choose your material</h3>
                <div className="option-grid boards">
                  {materialOptions.map(([img, t, d]) => (
                    <div key={t} className="option-card">
                      <img src={img} alt="" loading="lazy" />
                      <span><strong>{t}</strong><small>{d}</small></span>
                    </div>
                  ))}
                </div>
                <hr className="options-divider" />
                <h3><span>02</span> Select printing &amp; finishes</h3>
                <div className="option-grid">
                  {finishOptions.map(([img, t, d]) => (
                    <div key={t} className="option-card">
                      <img src={img} alt="" loading="lazy" />
                      <span><strong>{t}</strong><small>{d}</small></span>
                    </div>
                  ))}
                </div>
                <h3><span>03</span> Finalize your custom design</h3>
                <p>Share your artwork or ask our team for help creating a design that fits your box and brand.</p>
                <a className="text-link" href="#quote">Get free design assistance <Arrow size={16} /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="wide-wrap section" id="details">
          <div className="details-grid">
            <aside className="detail-aside">
              <div>
                <div className="eyebrow">BUILT AROUND YOUR PRODUCT</div>
                <h3>Box details</h3>
                <dl>
                  <dt>Size</dt><dd>{spec(p, /dimension/i) || "Custom dimensions"}</dd>
                  <dt>Inserts</dt><dd>{spec(p, /insert/i) || "Available on request"}</dd>
                  <dt>Production</dt><dd>{spec(p, /production|turnaround/i) || "Confirm with your quote"}</dd>
                  <dt>Minimum order</dt><dd>{moqSpec || (bag ? "Low MOQ" : "None")}</dd>
                </dl>
              </div>
              <div className="help-aside">
                <div className="help-title">Need help choosing?</div>
                <p>Talk to a packaging specialist about your project.</p>
                <a className="text-link" href="tel:+14243216460">+1 (424) 321-6460 <Arrow /></a>
              </div>
              <div>
                <h3>A little guidance</h3>
                <a className="text-link" href="/how-to-order/">How to order</a><br />
                {p.faqs.length > 0 && <a className="text-link" href="#faq">Packaging FAQs</a>}
              </div>
            </aside>
            <article className="prod-copy">
              <div className="eyebrow">GET TO KNOW YOUR PACKAGING</div>
              {renderDescription(p.description)}
              {p.whatYouGet && p.whatYouGet.length > 0 && (
                <div className="prod-get">
                  <h3>What you get</h3>
                  <ul className="prod-ticks">{p.whatYouGet.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              )}
              <a href="#quote" className="text-link">Talk through your project with our team <Arrow /></a>
            </article>
          </div>
        </section>

        <section className="stone section partnership">
          <div className="wrap">
            <p className="eyebrow">A PARTNER IN YOUR PACKAGING</p>
            <div className="section-intro">
              <h2>Good things come from working together.</h2>
            </div>
            <div className="partnership-grid">
              <article><span>01 /</span><h3>{bag ? "Low MOQ.\nRoom to grow." : "No minimums.\nRoom to grow."}</h3><p>Order what your project needs, from a small launch to a larger run.</p></article>
              <article><span>02 /</span><h3>{"Your idea.\nOur design support."}</h3><p>Get free help with your artwork and packaging layout.</p></article>
              <article><span>03 /</span><h3>{"A fit that’s\nuniquely yours."}</h3><p>Choose custom sizes, printed wraps and finishes for your product.</p></article>
              <article><span>04 /</span><h3>{"Clear proof.\nConfident decisions."}</h3><p>Review your artwork proof before production.</p></article>
            </div>
          </div>
        </section>

        <section className="wrap section process">
          <p className="eyebrow">FROM FIRST IDEA TO FINAL BOX</p>
          <h2>A simple path to your packaging.</h2>
          <ol>
            {[
              ["Share your requirements", "Tell us your size, quantity and finish."],
              ["Get a custom quote", "Review pricing and options with the team."],
              ["Review your proof", "Check the artwork and box specifications."],
              ["Approve production", "We make your boxes to the approved spec."],
              ["Shipping & delivery", "Your packaging ships to your door."],
            ].map(([t, d], i) => (
              <li key={t}><span>{pad(i + 1)}</span><h3>{t}</h3><p>{d}</p></li>
            ))}
          </ol>
        </section>

        {p.faqs.length > 0 && (
          <section className="wrap section faq" id="faq">
            <h2>Frequently <em>Asked</em> Questions</h2>
            <p>Common questions about ordering {p.title.toLowerCase()}.</p>
            <FaqCards items={p.faqs.map((f) => ({ q: f.q, html: f.a }))} />
          </section>
        )}

        <section className="wrap section" id="related">
          <p className="eyebrow">FIND YOUR PERFECT FIT</p>
          <div className="related-heading">
            <h2>More ways to package your story.</h2>
            <a className="text-link" href="/custom-boxes/">View all box types <Arrow size={15} /></a>
          </div>
          <div className="related-grid">
            {related.map((r) => (
              <a className="related-card" href={r.href} key={r.href}>
                <img src={r.img} alt={r.name} width={650} height={650} loading="lazy" />
                <div>
                  <h3>{r.name}</h3>
                  <span className="text-link">Explore style <Arrow /></span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
