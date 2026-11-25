"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What are custom magnetic closure boxes used for?",
    a: "Custom magnetic boxes are used for gift sets, cosmetics, jewelry, perfume, corporate gifts and PR kits. They protect your products and create a premium unboxing experience your customers remember.",
  },
  {
    q: "Do you offer inside printing for magnetic boxes?",
    a: "Yes. Inside printing is available, so you can add a message, pattern or brand colour to the interior of the lid and tray for a memorable reveal.",
  },
  {
    q: "Can I print my logo on magnetic boxes?",
    a: "Yes, you can print your logo, brand colours, artwork and messaging using CMYK or PMS colours, with finishes like foil stamping, embossing and Spot UV.",
  },
  {
    q: "Are custom magnetic boxes available for shipping?",
    a: "Yes. Magnetic boxes are durable thanks to their rigid board. For shipping we recommend pairing them with an outer mailer or shipping carton to protect the finish in transit.",
  },
  {
    q: "Can I add inserts to my customizable boxes?",
    a: "You can add paperboard or foam inserts, dividers, tissue paper and more. Fitted inserts keep each item in place and make a collection feel complete.",
  },
  {
    q: "How long does it take to manufacture magnetic boxes?",
    a: "Production usually takes 10–12 business days after proof approval, depending on order size, quantity, complexity, finishing options and current production schedule. Rush options are available.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-grid">
      {faqs.map((f, i) => (
        <div key={i} className={`faq-item ${open === i ? "is-open" : ""}`}>
          <button className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span className="faq-num">{i + 1}</span>
            <span>{f.q}</span>
            <span className="faq-toggle">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="faq-a">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
