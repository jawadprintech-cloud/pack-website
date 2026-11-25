"use client";

// The 5 ordering steps on /how-to-order/.
// Desktop: the illustration stays pinned on the left and switches to the step being read on the right.
// Phones: each step shows its own illustration. Styles: styles/how-to-order.css.
import { useEffect, useRef, useState } from "react";

export type OrderStep = { id: string; title: string; text: string; image: string; tags: string[]; tip?: string; link?: { label: string; href: string } };

export default function HowToSteps({ steps }: { steps: OrderStep[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // The step crossing the middle of the screen becomes the active one.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="hto-steps">
      <div className="hto-stage" aria-hidden="true">
        <div className="hto-stage-card">
          <div className="hto-stage-imgs">
            {steps.map((s, i) => (
              <img key={s.id} src={s.image} alt="" width={505} height={374} className={i === active ? "is-active" : ""} />
            ))}
          </div>
          <div className="hto-stage-foot">
            <span className="hto-stage-count">Step {active + 1} of {steps.length}</span>
            <span className="hto-stage-bar"><span style={{ width: `${((active + 1) / steps.length) * 100}%` }} /></span>
          </div>
        </div>
      </div>

      <ol className="hto-list">
        {steps.map((s, i) => (
          <li
            key={s.id}
            id={s.id}
            data-index={i}
            ref={(el) => { refs.current[i] = el; }}
            className={`hto-step ${i === active ? "is-active" : ""} ${i < active ? "is-done" : ""}`}
          >
            <span className="hto-node" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <div className="hto-step-body">
              <img className="hto-step-img" src={s.image} alt={s.title} width={505} height={374} loading="lazy" />
              <p className="hto-step-kicker">Step {i + 1}</p>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <ul className="hto-tags">{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              {s.tip && <p className="hto-tip"><strong>Tip:</strong> {s.tip}</p>}
              {s.link && (
                <a className="hto-link" href={s.link.href}>
                  {s.link.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
