"use client";

// One form component for the Contact, Sample Kits, Dieline and Reviews pages.
// Sends through the same endpoint as the quote forms (lib/quote.ts), then opens /thank-you.
import { Fragment, useState, type FormEvent } from "react";
import { QUOTE_ENDPOINT, submitQuote, thankYouUrl } from "@/lib/quote";

export type Field =
  | { type: "text" | "email" | "tel"; name: string; label: string; required?: boolean; full?: boolean; autoComplete?: string; placeholder?: string }
  | { type: "textarea"; name: string; label: string; required?: boolean; placeholder?: string }
  | { type: "select"; name: string; label: string; options: string[]; required?: boolean; full?: boolean; defaultValue?: string }
  | { type: "radio"; name: string; label: string; options: string[]; defaultValue?: string }
  | { type: "rating"; name: string; label: string };

export default function InfoForm({ formName, fields, submitLabel }: { formName: string; fields: Field[]; submitLabel: string }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    const data = new FormData(e.currentTarget);
    data.set("form", formName);
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
    <form className="ip-form" action={QUOTE_ENDPOINT} method="post" encType="multipart/form-data" onSubmit={onSubmit}>
      <input type="hidden" name="form" value={formName} />
      {fields.map((f) => {
        const id = `${formName}-${f.name}`;
        if (f.type === "textarea")
          return (
            <div className="ip-field ip-field-full" key={f.name}>
              <label htmlFor={id}>{f.label}</label>
              <textarea id={id} name={f.name} required={f.required} placeholder={f.placeholder} />
            </div>
          );
        if (f.type === "select")
          return (
            <div className={`ip-field ${f.full ? "ip-field-full" : ""}`} key={f.name}>
              <label htmlFor={id}>{f.label}</label>
              <select id={id} name={f.name} required={f.required} defaultValue={f.defaultValue ?? ""}>
                <option value="" disabled>Choose one</option>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          );
        if (f.type === "radio")
          return (
            <fieldset className="ip-field ip-field-full" key={f.name}>
              <legend>{f.label}</legend>
              <div className="ip-radios">
                {f.options.map((o, i) => (
                  <label key={o}>
                    <input type="radio" name={f.name} value={o} defaultChecked={f.defaultValue ? f.defaultValue === o : i === 0} />
                    {o}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        if (f.type === "rating")
          return (
            <fieldset className="ip-field ip-field-full" key={f.name}>
              <legend>{f.label}</legend>
              {/* Reversed order (shown left-to-right by row-reverse) so CSS `~` can colour every star up to the
                  chosen or hovered one. Inputs and labels must be direct siblings in this div for that to work. */}
              <div className="ip-rating-pick">
                {[5, 4, 3, 2, 1].map((n) => (
                  <Fragment key={n}>
                    <input type="radio" id={`${id}-${n}`} name={f.name} value={n} defaultChecked={n === 5} />
                    <label htmlFor={`${id}-${n}`} title={`${n} star${n > 1 ? "s" : ""}`}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
                      </svg>
                      <span className="ip-sr">{n} star{n > 1 ? "s" : ""}</span>
                    </label>
                  </Fragment>
                ))}
              </div>
            </fieldset>
          );
        return (
          <div className={`ip-field ${f.full ? "ip-field-full" : ""}`} key={f.name}>
            <label htmlFor={id}>{f.label}</label>
            <input id={id} type={f.type} name={f.name} required={f.required} autoComplete={f.autoComplete} placeholder={f.placeholder} />
          </div>
        );
      })}
      <div className="ip-form-foot">
        <button className="ip-btn ip-btn-red" type="submit" disabled={sending}>
          {sending ? "Sending…" : submitLabel}
        </button>
        {error && <p className="ip-form-error" role="alert">{error}</p>}
      </div>
    </form>
  );
}
