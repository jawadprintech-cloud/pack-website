"use client";

// "What drives us" tabs on /about-us/. Rotates through the tabs on its own; pauses while hovered or focused.
// Styles: styles/about.css.
import { useEffect, useState } from "react";

export type Pillar = { title: string; lead: string; text: string; image: string };
const DURATION = 6000;

export default function AboutPillars({ pillars }: { pillars: Pillar[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % pillars.length), DURATION);
    return () => clearTimeout(t);
  }, [active, paused, pillars.length]);

  return (
    <div
      className={`abt-tabs ${paused ? "is-paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="abt-tablist" role="tablist" aria-label="What drives us">
        {pillars.map((p, i) => (
          <button
            key={p.title}
            type="button"
            role="tab"
            id={`abt-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`abt-panel-${i}`}
            className={active === i ? "is-on" : ""}
            onClick={() => setActive(i)}
          >
            <span className="abt-tab-n">0{i + 1}</span>
            <span className="abt-tab-title">{p.title}</span>
            {/* Progress line for the auto-rotation */}
            <span className="abt-tab-bar" style={{ animationDuration: `${DURATION}ms` }} aria-hidden="true" />
          </button>
        ))}
      </div>
      {pillars.map((p, i) => (
        <div
          key={p.title}
          role="tabpanel"
          id={`abt-panel-${i}`}
          aria-labelledby={`abt-tab-${i}`}
          hidden={active !== i}
          className="abt-panel"
        >
          <div className="abt-panel-copy">
            <span className="abt-panel-n" aria-hidden="true">0{i + 1}</span>
            <h3>{p.lead}</h3>
            <p>{p.text}</p>
          </div>
          <img src={p.image} alt="" width={520} height={460} loading="lazy" />
        </div>
      ))}
    </div>
  );
}
