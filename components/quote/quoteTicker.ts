// Messages that scroll right to left under the "Submit" button on every quote form.
// The list is rendered twice (second copy hidden from screen readers) so the loop is seamless.
// Styles: .quote-ticker in app/globals.css (shared by the product/category panel and the home form).
const messages = ["Friendly Customer Support", "Easy Online Payment", "No Minimum Order Quantity"];

const set = (hidden: boolean) =>
  `<ul class="quote-ticker-set"${hidden ? ' aria-hidden="true"' : ""}>` +
  messages.map((m) => `<li><span class="quote-ticker-dot" aria-hidden="true"></span>${m}</li>`).join("") +
  `</ul>`;

const quoteTickerMarkup =
  `<div class="quote-ticker" role="region" aria-label="Why order with Pack Legacy"><div class="quote-ticker-track">${set(false)}${set(true)}</div></div>`;

export default quoteTickerMarkup;
