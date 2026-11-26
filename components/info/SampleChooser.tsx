"use client";

// Sample kit picker + request form on /sample-kits/. Picking a kit card updates the form's summary and sample type.
// Sends through the same endpoint as the quote forms (lib/quote.ts), then opens /thank-you/. Styles: styles/sample-kits.css.
import { useState, type FormEvent } from "react";
import { QUOTE_ENDPOINT, submitQuote, thankYouUrl } from "@/lib/quote";

export type Kit = { id: string; name: string; price: number; image: string; text: string; checks: string[]; best?: string; tag?: string };

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);

export default function SampleChooser({ kits, initial = 1 }: { kits: Kit[]; initial?: number }) {
  const [sel, setSel] = useState(initial);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const kit = kits[sel];

  function pick(i: number) {
    setSel(i);
    // On narrow screens the form sits below the cards, so bring it into view.
    if (window.matchMedia("(max-width: 960px)").matches) {
      document.getElementById("sample-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    const data = new FormData(e.currentTarget);
    data.set("form", "sample-kit");
    data.set("sample_type", kit.name);
    data.set("page", window.location.pathname);
    const result = await submitQuote(data);
    if (result.ok) {
      window.location.assign(thankYouUrl(result.reference, String(data.get("name") || "")));
      return;
    }
    setError(result.message);
    setSending(false);
  }

  return (
    <div className="smp-chooser">
      <div className="smp-kits" role="radiogroup" aria-label="Sample type">
        {kits.map((k, i) => (
          <button
            key={k.id}
            type="button"
            role="radio"
            aria-checked={sel === i}
            className={`smp-kit ${sel === i ? "is-on" : ""}`}
            onClick={() => pick(i)}
          >
            <span className="smp-kit-img">
              <img src={k.image} alt="" width={500} height={400} loading="lazy" />
              {k.tag && <span className="smp-kit-tag">{k.tag}</span>}
            </span>
            <span className="smp-kit-body">
              <span className="smp-kit-top">
                <span className="smp-kit-name">{k.name}</span>
                <span className="smp-kit-price"><small>from</small> ${k.price}</span>
              </span>
              <span className="smp-kit-text">{k.text}</span>
              <span className="smp-kit-checks">
                {k.checks.map((c) => <span key={c}><Check />{c}</span>)}
              </span>
              {k.best && <span className="smp-kit-best"><strong>Best For:</strong> {k.best}</span>}
            </span>
            <span className="smp-radio" aria-hidden="true" />
          </button>
        ))}
      </div>

      <form className="smp-form" id="sample-form" action={QUOTE_ENDPOINT} method="post" encType="multipart/form-data" onSubmit={onSubmit}>
        <input type="hidden" name="form" value="sample-kit" />
        <input type="hidden" name="sample_type" value={kit.name} />
        <div className="smp-summary">
          <img src={kit.image} alt="" width={120} height={96} />
          <div>
            <span className="smp-summary-label">Your sample</span>
            <strong>{kit.name}</strong>
            <span className="smp-summary-price">Starting from ${kit.price}</span>
          </div>
        </div>
        <div className="smp-fields">
          <label><span>Name</span><input name="name" required autoComplete="name" /></label>
          <label><span>Email</span><input name="email" type="email" required autoComplete="email" /></label>
          <label className="smp-full"><span>Phone number</span><input name="phone" type="tel" required autoComplete="tel" /></label>
          <label className="smp-full"><span>Shipping address</span><input name="address" required autoComplete="street-address" /></label>
          <label className="smp-full"><span>Message <em>(optional)</em></span><textarea name="message" rows={3} placeholder="Box style, size, material or anything else we should know..." /></label>
        </div>
        <button className="ip-btn ip-btn-red smp-submit" type="submit" disabled={sending}>
          {sending ? "Sending…" : `Request ${kit.name.toLowerCase()}`}
        </button>
        {error && <p className="ip-form-error" role="alert">{error}</p>}
        <p className="smp-note">A packaging specialist will email you to confirm your sample request.</p>
      </form>
    </div>
  );
}
