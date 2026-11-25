// Sends a quote request. Used by every quote form on the site, which then opens /thank-you.
// By default it posts to the site's own /api/quote/ route, which emails quotes@packlegacy.com
// over SMTP (see app/api/quote/route.ts). NEXT_PUBLIC_QUOTE_ENDPOINT can point somewhere else.
export const QUOTE_ENDPOINT = process.env.NEXT_PUBLIC_QUOTE_ENDPOINT || "/api/quote/";

export type QuoteResult = { ok: true; reference: string } | { ok: false; message: string };

export async function submitQuote(fields: FormData): Promise<QuoteResult> {
  if (!QUOTE_ENDPOINT) {
    console.warn("NEXT_PUBLIC_QUOTE_ENDPOINT is not set, so this quote request was not sent.");
    return { ok: true, reference: "" };
  }
  try {
    const response = await fetch(QUOTE_ENDPOINT, { method: "POST", body: fields });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, message: result.message || "The quote could not be saved. Please try again." };
    return { ok: true, reference: String(result.reference || "") };
  } catch {
    return { ok: false, message: "We couldn’t send your request. Please try again or email sales@packlegacy.com." };
  }
}

/** Where to send the visitor after a successful request. */
export function thankYouUrl(reference: string, name?: string) {
  const q = new URLSearchParams();
  if (reference) q.set("ref", reference);
  const first = (name || "").trim().split(/\s+/)[0];
  if (first) q.set("name", first.slice(0, 40));
  const s = q.toString();
  return "/thank-you/" + (s ? "?" + s : "");
}
