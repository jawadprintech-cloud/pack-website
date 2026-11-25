"use client";

import { useEffect, useRef, useState } from "react";

const reviews = [
  {
    name: "Clarke Wayne",
    text: "Great experience with PL. The communication was excellent, the service was smooth, and my order was shipped right on time. Highly Recommended!",
  },
  {
    name: "Carrie Suda",
    text: "Really happy with the custom boxes for my beauty brand from Pack Legacy. They look nice and the quality is good.",
  },
  {
    name: "Emily Ron",
    text: "The perfume boxes I ordered had foiling and embossing that made my products feel luxurious. Worth every penny.",
  },
  {
    name: "Olivia",
    text: "Excellent service from PL. Excellent communication and timely shipped.",
  },
];

const INTERVAL = 5000;

export default function ReviewsCarousel() {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(2);
  const paused = useRef(false);
  const maxIndex = Math.max(0, reviews.length - perView);

  // Two cards side by side on wider screens, one on phones (matches the CSS breakpoint).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setPerView(mq.matches ? 1 : 2);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  // Auto-rotate, paused while hovered or focused, and off for people who prefer reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (!paused.current) setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, INTERVAL);
    return () => window.clearInterval(t);
  }, [maxIndex]);

  const pause = () => { paused.current = true; };
  const resume = () => { paused.current = false; };

  return (
    <div
      className="cb-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="cb-carousel-viewport">
        <ul className="cb-carousel-track" style={{ "--i": index, "--per": perView } as React.CSSProperties} aria-live="polite">
          {reviews.map((r, i) => {
            const visible = i >= index && i < index + perView;
            return (
              <li key={r.name} className="cb-carousel-slide" aria-hidden={!visible}>
                <figure className="cb-review">
                  <div className="cb-review-top">
                    <span className="cb-quote-mark" aria-hidden="true">“</span>
                    <span className="cb-stars" aria-label="5 out of 5 stars">★★★★★</span>
                  </div>
                  <blockquote>“{r.text}”</blockquote>
                  <figcaption>
                    <span className="cb-avatar" aria-hidden="true">{r.name.charAt(0)}</span>
                    {r.name}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
