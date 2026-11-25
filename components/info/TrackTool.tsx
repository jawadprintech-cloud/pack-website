"use client";

// Paste a tracking number and open it on the carrier's own tracking page.
// The carrier is guessed from the number's format; the visitor can also pick one from the chips.
import { useState, type FormEvent } from "react";

const carriers = {
  ups: { name: "UPS", url: (n: string) => `https://www.ups.com/track?loc=en_US&tracknum=${n}` },
  fedex: { name: "FedEx", url: (n: string) => `https://www.fedex.com/fedextrack/?trknbr=${n}` },
  dhl: { name: "DHL", url: (n: string) => `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${n}` },
} as const;
type CarrierId = keyof typeof carriers;
const ids = Object.keys(carriers) as CarrierId[];

/** Best guess from the number's format: UPS starts with 1Z, DHL Express is 10 digits, FedEx is 12, 15 or 20–22 digits. */
function guessCarrier(n: string): CarrierId | "" {
  if (/^1Z[0-9A-Z]{16}$/i.test(n)) return "ups";
  if (/^\d{10}$/.test(n)) return "dhl";
  if (/^\d{12}$|^\d{15}$|^\d{20,22}$/.test(n)) return "fedex";
  return "";
}

export default function TrackTool() {
  const [number, setNumber] = useState("");
  const [picked, setPicked] = useState<CarrierId | "">("");
  const [error, setError] = useState("");
  const clean = number.replace(/\s+/g, "");
  const guess = guessCarrier(clean);
  const chosen = picked || guess;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clean) return setError("Enter your tracking number.");
    if (!chosen) return setError("Choose your carrier below so we know where to look.");
    setError("");
    window.open(carriers[chosen].url(encodeURIComponent(clean)), "_blank", "noopener");
  }

  return (
    <form className="trk-tool" onSubmit={onSubmit}>
      <div className="trk-field">
        <svg className="trk-field-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" />
        </svg>
        <label className="ip-sr" htmlFor="track-number">Tracking number</label>
        <input
          id="track-number"
          value={number}
          onChange={(e) => { setNumber(e.target.value); setError(""); }}
          placeholder="Paste your tracking number"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="track-hint"
        />
        <button className="ip-btn ip-btn-red" type="submit">
          Track
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </button>
      </div>

      <div className="trk-chips" role="radiogroup" aria-label="Carrier">
        <span className="trk-chips-label">{guess && !picked ? "Detected:" : "Carrier:"}</span>
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={chosen === id}
            className={`trk-chip trk-chip-${id} ${chosen === id ? "is-on" : ""}`}
            onClick={() => setPicked(picked === id ? "" : id)}
          >
            {carriers[id].name}
          </button>
        ))}
      </div>

      <p id="track-hint" className={`trk-hint ${error ? "is-error" : ""}`} role={error ? "alert" : undefined}>
        {error || "Your tracking number is in the shipping email we send when your order leaves our facility."}
      </p>
    </form>
  );
}
