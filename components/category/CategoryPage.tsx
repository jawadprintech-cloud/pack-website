// Shared layout for /custom-boxes/ and the industry pages (/food-boxes/, /cosmetic-boxes/ …).
// Same markup and styles as the original Custom Boxes page: styles/custom-boxes.css + styles/magnetic-boxes.css (quote panel).
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import quotePanelMarkup from "@/components/quote/quotePanelMarkup";
import MagneticBoxesScript from "@/components/magnetic/MagneticBoxesScript";
import MaterialTabs from "@/components/custom-boxes/MaterialTabs";
import ReviewsSection from "@/components/home/ReviewsSection";
import FaqCards, { type FaqItem } from "@/components/FaqCards";
import InstaMarquee from "@/components/InstaMarquee";
import "@/styles/magnetic-boxes.css";
import "@/styles/custom-boxes.css";


export type GridCard = { name: string; href: string; img: string; note?: string };
/** Without `after`, paragraphs[0] sits above the list(s) and the rest below; with `after`, all paragraphs sit above. */
export type ContentBlock = {
  title: string;
  paragraphs?: ReactNode[];
  bullets?: [string, string][];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
  after?: ReactNode[];
  img?: { src: string; alt: string };
};

export type CategoryPageProps = {
  crumb: string;
  h1: string;
  intro: ReactNode[];
  strong: ReactNode;
  /** Optional "Key Takeaways" box under the rating. */
  takeaway?: ReactNode;
  grid: { title: string; intro: string; cards: GridCard[]; startingPrice?: string };
  /** `reorder` adds the "Easy Reordering" benefit; `headings` marks the benefits up as h3. */
  why: { title: string; intro: string; bullets?: [string, string][]; reorder?: boolean; headings?: boolean };
  /** `blockHeading`: heading level of the block titles (default h3). */
  content: { title: string; intro: string | string[]; img?: { src: string; alt: string }; blocks: ContentBlock[]; blockHeading?: "h2" | "h3" };
  specs?: [string, string][];
  faqs: FaqItem[];
  /** How many FAQs to show (default 8). Industry pages pass their full count. */
  maxFaqs?: number;
  /** FAQ heading; without it the standard heading and subtitle are shown. */
  faqTitle?: ReactNode;
  /** Replaces "No Minimums"/"No MOQ" where a category has a minimum order. */
  moqLabel?: string;
};

const reasons = [
  { label: "No Minimums", icon: "/images/w-no-moq.svg" },
  { label: "Sustainable Options", icon: "/images/w-sustainable.svg" },
  { label: "Fully Customizable", icon: "/images/w-customizable.svg" },
  { label: "Fast Turnaround", icon: "/images/w-turnaround.svg" },
  { label: "Free Design Support", icon: "/images/w-design.svg" },
  { label: "Responsive Chat Support", icon: "/images/w-chat.svg" },
];

const instagram = ["/images/cat-cbd.webp", "/images/cat-magnetic.webp", "/images/ig-cake.webp", "/images/ig-cookie.webp", "/images/ig-pastry.webp", "/images/cat-cosmetic.webp"];

const LayersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 2 10 5-10 5L2 7l10-5z" />
    <path d="m2 12 10 5 10-5" />
    <path d="m2 17 10 5 10-5" />
  </svg>
);

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

/** Turns [text](/path/) inside description copy into links. */
const withLinks = (node: ReactNode): ReactNode =>
  typeof node !== "string"
    ? node
    : node.split(/(\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
        const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        return m ? <a key={i} href={m[2]} className="cb-inline-link">{m[1]}</a> : part;
      });

export default function CategoryPage({ crumb, h1, intro, strong, takeaway, grid, why, content, specs, faqs, maxFaqs, faqTitle, moqLabel }: CategoryPageProps) {
  const isHub = crumb === "Custom boxes";
  const hasGrid = grid.cards.length > 0;
  const allReasons = why.reorder ? [...reasons, { label: "Easy Reordering", icon: "/images/w-reorder.svg" }] : reasons;
  const whyReasons = moqLabel ? allReasons.map((r) => (r.icon === "/images/w-no-moq.svg" ? { ...r, label: moqLabel } : r)) : allReasons;
  const BlockHeading = content.blockHeading ?? "h3";
  return (
    <>
      <Header />
      <main className="plcb" id="main">
        <div className="cb-wrap">
          <nav className="cb-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{crumb}</span>
          </nav>

          {/* Hero and product grid on the left, quote form following the reader on the right. */}
          <div className="cb-top">
            <section className="cb-hero" aria-labelledby="cb-title">
              <h1 id="cb-title">{h1}</h1>
              {intro.map((p, i) => <p key={i}>{p}</p>)}
              {strong && <p className="cb-hero-strong">{strong}</p>}
              <div className="cb-actions">
                <a className="cb-btn cb-btn-red" href="#quote">
                  Get Started <Arrow />
                </a>
                {hasGrid && (
                  <a className="cb-btn cb-btn-outline" href="#categories">
                    Explore box types
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14" />
                      <path d="m19 12-7 7-7-7" />
                    </svg>
                  </a>
                )}
              </div>
              <a className="cb-rating" href="#reviews">
                <strong>5.0</strong> customer rating <span className="cb-stars" aria-label="5 out of 5 stars">★★★★★</span>
                <span className="cb-rating-note">Verified Customer Reviews</span>
              </a>
              {takeaway && (
                <aside className="cb-takeaway" aria-labelledby="cb-takeaway-title">
                  <div id="cb-takeaway-title" className="cb-takeaway-title">Key Takeaways</div>
                  <p>{takeaway}</p>
                </aside>
              )}
            </section>

            <div className="plmb cb-quote" id="quote" tabIndex={-1} dangerouslySetInnerHTML={{ __html: quotePanelMarkup }} suppressHydrationWarning />

            {hasGrid && <section className="cb-categories" id="categories" aria-labelledby="cb-cat-title">
              <div className="cb-section-head">
                <div>
                  <h2 id="cb-cat-title">{grid.title}</h2>
                  <p>{grid.intro}</p>
                </div>
              </div>
              <ul className="cb-cat-grid">
                {grid.cards.map((c) => (
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
                        {c.note && <span className="cb-card-note">{c.note}</span>}
                        <span className="cb-chips">
                          <span className="cb-chip">
                            <span className="cb-chip-icon"><LayersIcon /></span>{moqLabel ?? "No MOQ"}
                          </span>
                          <span className="cb-chip">
                            <span className="cb-chip-icon"><LayersIcon /></span>Free Shipping
                          </span>
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>}

            {/* The long-form copy stays in the left column, beside the quote form. */}
            <section className="cb-content" aria-labelledby="cb-content-title">
              {/* Specifications sit at the top, above the long-form copy. */}
              {specs && (
                <div className="cb-content-block cb-content-specs">
                  <h3>Specifications</h3>
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
                </div>
              )}
              {content.img && <img className="cb-content-img" src={content.img.src} alt={content.img.alt} width={708} height={616} loading="lazy" />}
              <h2 id="cb-content-title">{content.title}</h2>
              {(Array.isArray(content.intro) ? content.intro : [content.intro]).map((t, i) => <p key={i}>{withLinks(t)}</p>)}
              {content.blocks.map((b, i) => {
                const above = b.after ? b.paragraphs ?? [] : b.paragraphs?.slice(0, 1) ?? [];
                const below = b.after ?? b.paragraphs?.slice(1) ?? [];
                return (
                  <div className="cb-content-block" key={i}>
                    {b.img && <img className="cb-content-img" src={b.img.src} alt={b.img.alt} width={708} height={616} loading="lazy" />}
                    {b.title && <BlockHeading>{b.title}</BlockHeading>}
                    {above.map((p, j) => <p key={`a${j}`}>{withLinks(p)}</p>)}
                    {b.bullets && (
                      <ul className="cb-tips">
                        {b.bullets.map(([lead, text]) => (
                          <li key={lead}>
                            <strong>{withLinks(lead)}</strong> {withLinks(text)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {b.list && (
                      <ul className="cb-tips cb-list">
                        {b.list.map((item) => <li key={item}>{withLinks(item)}</li>)}
                      </ul>
                    )}
                    {b.table && (
                      <table className={b.table.head.length > 2 ? "cb-specs cb-table cb-table-3" : "cb-specs cb-table"}>
                        <thead>
                          <tr>{b.table.head.map((h) => <th scope="col" key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {b.table.rows.map((row) => <tr key={row[0]}>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>)}
                        </tbody>
                      </table>
                    )}
                    {below.map((p, j) => <p key={`b${j}`}>{withLinks(p)}</p>)}
                  </div>
                );
              })}
            </section>
          </div>
        </div>

        <section className="cb-section cb-options" aria-label="Materials, printing and finishing options">
          <div className="cb-wrap">
            <MaterialTabs />
          </div>
        </section>

        <section className="cb-wrap cb-why" aria-labelledby="cb-why-title">
          <h2 id="cb-why-title">{why.title}</h2>
          {why.intro && <p>{why.intro}</p>}
          {why.bullets && (
            <ul className="cb-tips cb-why-bullets">
              {why.bullets.map(([lead, text]) => <li key={lead}><strong>{lead}</strong> {text}</li>)}
            </ul>
          )}
          <ul className="cb-why-grid">
            {whyReasons.map((r) => (
              <li key={r.icon}>
                <img src={r.icon} alt="" width={56} height={56} loading="lazy" />
                {why.headings ? <h3>{r.label}</h3> : <span>{r.label}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="cb-wrap cb-section cb-faq" id="faq" aria-labelledby="cb-faq-title">
          <h2 id="cb-faq-title">
            {faqTitle ?? <>Frequently <em>Asked</em> Questions</>}
          </h2>
          {!faqTitle && <p className="cb-center-sub">We’ve answered all the common questions you may have before ordering {isHub ? "custom boxes" : crumb.toLowerCase()}.</p>}
          <FaqCards items={faqs.map((f) => ({ ...f, a: withLinks(f.a) }))} max={maxFaqs} />
        </section>

        <div className="plh">
          <ReviewsSection />
        </div>

        <section className="cb-wrap cb-section cb-insta" aria-labelledby="cb-insta-title">
          <div className="cb-insta-head">
            <h2 id="cb-insta-title">
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

        <section className="cb-wrap cb-cta-wrap" aria-labelledby="cb-cta-title">
          <div className="cb-cta">
            <div>
              <h2 id="cb-cta-title">Can’t Find the Right {isHub ? "Custom Box" : crumb.replace(/es$/, "").replace(/s$/, "")}?</h2>
              <p>
                Need something specific? Fill out the form and our team will create a custom box solution that’s made
                to fit your product perfectly.
              </p>
            </div>
            <div className="cb-cta-actions">
              <a className="cb-btn cb-btn-red" href="#quote">
                Get a Quote
              </a>
              <a className="cb-btn cb-btn-outline" href="/shop/">
                Explore All Packaging
              </a>
            </div>
          </div>
        </section>
      </main>
      <MagneticBoxesScript />
      <Footer />
    </>
  );
}
