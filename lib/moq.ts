// Bags have a minimum order, so they say "Low MOQ" where everything else says "No MOQ".
// A bag page is any category or product whose address ends in "-bags/":
// /custom-mylar-bags/, /custom-paper-bags/, /product/die-cut-mylar-bags/, /product/coffee-packaging-bags/ …
// Kept tiny (no data imports) because client components use it too.

export const isBagHref = (href: string) => /-bags\/?(?:[?#].*)?$/.test(href);

export const moqLabel = (href: string) => (isBagHref(href) ? "Low MOQ" : "No MOQ");
