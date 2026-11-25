// "Good packaging. Happy customers." reviews on product pages, as a slow right-to-left carousel.
// The list is rendered twice (second copy aria-hidden) so the CSS loop is seamless. Styles: styles/magnetic-boxes.css.
const reviews: [string, string][] = [
  ["Clarke Wayne", "…my order was shipped right on time."],
  ["Emily Ron", "The perfume boxes I ordered had foiling and embossing that made my products feel luxurious. Worth every penny."],
  ["Carrie Suda", "They look nice and the quality is good."],
  ["Olivia", "Excellent service from PL. Excellent communication and timely shipped."],
];

const card = ([who, text]: [string, string]) =>
  `<div class="quote-card"><div class="review-top"><span class="quote-mark">“</span><span>★★★★★</span></div><blockquote>${text}</blockquote><span class="review-name">${who}</span></div>`;

const set = reviews.map(card).join("");

const reviewMarqueeMarkup =
  `<div class="review-marquee" role="region" aria-label="Customer reviews"><div class="review-track">` +
  `<div class="review-set">${set}</div><div class="review-set" aria-hidden="true">${set}</div>` +
  `</div></div>`;

export default reviewMarqueeMarkup;
