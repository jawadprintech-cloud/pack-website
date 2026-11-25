"use client";

// One large client quote at a time, with arrows and dots. Advances on its own; pauses on hover.
// Styles: styles/about.css.
import { useEffect, useState } from "react";

export type SlideQuote = { name: string; text: string; product?: string };

export default function QuoteSlider({ quotes }: { quotes: SlideQuote[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (d: number) => setI((n) => (n + d + quotes.length) % quotes.length);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((n) => (n + 1) % quotes.length), 7000);
    return () => clearTimeout(t);
  }, [i, paused, quotes.length]);

  const q = quotes[i];
  return (
    <div className="abt-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <span className="abt-slider-mark" aria-hidden="true">“</span>
      <figure className="abt-slide" key={i} aria-live="polite">
        <span className="abt-slider-stars" role="img" aria-label="5 out of 5 stars">★★★★★</span>
        <blockquote>{q.text}</blockquote>
        <figcaption>
          <span className="abt-slider-avatar" aria-hidden="true">{q.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
          <span><strong>{q.name}</strong>{q.product || "Verified customer"}</span>
        </figcaption>
      </figure>
      <div className="abt-slider-nav">
        <button type="button" onClick={() => go(-1)} aria-label="Previous review">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
        </button>
        <div className="abt-dots">
          {quotes.map((_, n) => (
            <button key={n} type="button" className={n === i ? "is-on" : ""} onClick={() => setI(n)} aria-label={`Review ${n + 1}`} aria-current={n === i || undefined} />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Next review">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
