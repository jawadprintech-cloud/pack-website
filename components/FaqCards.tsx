// FAQ cards used on the homepage, product pages, Custom Boxes and Magnetic Closure Boxes.
// Each card is a native <details> element: click the question to open the answer, click again to close it.
// The box badge opens and closes with the card. Styles: styles/faq-cards.css (loaded in app/layout.tsx).
import type { ReactNode } from "react";

// Badge with a small 3D cardboard-style box in brand greens, built from CSS 3D faces.
// Its two top flaps fold open while the card is open and fold shut when it closes.
// Kept as an HTML string so the hand-built Magnetic Closure Boxes markup can use the same icon.
export const faqBoxIcon =
  '<span class="faqc-icon" aria-hidden="true"><span class="faqc-cube">' +
  '<i class="faqc-f faqc-back"></i><i class="faqc-f faqc-left"></i><i class="faqc-f faqc-bottom"></i>' +
  '<i class="faqc-f faqc-right"></i><i class="faqc-f faqc-front"></i>' +
  '<i class="faqc-f faqc-flap faqc-flap-b"></i><i class="faqc-f faqc-flap faqc-flap-f"></i>' +
  "</span></span>";

export type FaqItem = { q: string; a?: ReactNode; html?: string };

/** Default most FAQs shown in one section. Extra questions are left out unless a page passes a higher `max`
 *  (category pages pass their full count, since their FAQs are written for the page). */
export const MAX_FAQS = 8;

// All answers start open (as in the design); clicking a question closes or reopens it.
export default function FaqCards({ items, max = MAX_FAQS }: { items: FaqItem[]; max?: number }) {
  return (
    <div className="faqc-grid">
      {items.slice(0, max).map((f) => (
        <details className="faqc-card" key={f.q} open>
          <summary className="faqc-head">
            <h3>{f.q}</h3>
            <span className="faqc-icon-wrap" dangerouslySetInnerHTML={{ __html: faqBoxIcon }} />
          </summary>
          {f.html !== undefined ? <p className="faqc-answer" dangerouslySetInnerHTML={{ __html: f.html }} /> : <p className="faqc-answer">{f.a}</p>}
        </details>
      ))}
    </div>
  );
}

/** Turns `<div class="faq-grid"><details><summary>Q</summary><p>A</p></details>…</div>` HTML into FAQ cards. */
export function faqDetailsToCards(html: string) {
  return html.replace(/<div class="faq-grid">([\s\S]*?)<\/div><\/section>/, (_, inner: string) => {
    let n = 0;
    const cards = inner.replace(
      /<details[^>]*><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g,
      (_m: string, q: string, a: string) =>
        ++n > MAX_FAQS ? "" : `<details class="faqc-card" open><summary class="faqc-head"><h3>${q}</h3>${faqBoxIcon}</summary>${a.replace(/^<p>/, '<p class="faqc-answer">')}</details>`
    );
    return `<div class="faqc-grid">${cards}</div></section>`;
  });
}
