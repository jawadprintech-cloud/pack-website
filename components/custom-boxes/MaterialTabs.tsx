"use client";

import { useRef, useState } from "react";

const IMG = "/custom-boxes/images/";

// Line icons (Lucide shapes) used in the feature row under each material.
const icons: Record<string, React.ReactNode> = {
  leaf: (<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></>),
  printer: (<><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" /><rect x="6" y="14" width="12" height="8" rx="1" /></>),
  coins: (<><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v4c0 1.66 3.58 3 8 3s8-1.34 8-3V5" /><path d="M4 9v4c0 1.66 3.58 3 8 3s8-1.34 8-3V9" /><path d="M4 13v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" /></>),
  shield: (<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />),
  shieldCheck: (<><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>),
  package: (<><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" /><path d="m7.5 4.27 9 5.15" /></>),
  recycle: (<><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" /><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" /><path d="m14 16-3 3 3 3" /><path d="M8.293 13.596 7.196 9.5 3.1 10.598" /><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" /><path d="m13.378 9.633 4.096 1.098 1.097-4.096" /></>),
  gem: (<><path d="M6 3h12l4 6-10 13L2 9Z" /><path d="M11 3 8 9l4 13 4-13-3-6" /><path d="M2 9h20" /></>),
  star: (<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />),
  feather: (<><path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z" /><path d="M16 8 2 22" /><path d="M17.5 15H9" /></>),
  truck: (<><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></>),
  gift: (<><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></>),
  sparkles: (<><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /></>),
  message: (<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />),
  palette: (<><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></>),
  eye: (<><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></>),
  tag: (<><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></>),
  clock: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
  image: (<><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>),
  target: (<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>),
  droplet: (<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />),
  hand: (<><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" /><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></>),
  layers: (<><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" /></>),
};

const Icon = ({ name, size = 22 }: { name: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {icons[name]}
  </svg>
);

type Feature = [icon: string, label: string];
type Card = {
  title: string;
  text: string;
  img: string;
  features?: Feature[];
  badge?: string;
  // Close-up circle: which part of the photo to magnify (CSS background-position).
  swatch?: string;
};
type Tab = { label: string; cards: Card[] };

const tabs: Tab[] = [
  {
    label: "Materials",
    cards: [
      { title: "Cardboard", img: "m-cardboard-grey.webp", swatch: "30% 28%", text: "Lightweight, printable, and cost-effective for custom retail boxes.", features: [["leaf", "Lightweight"], ["printer", "High Print Quality"], ["coins", "Budget Friendly"]] },
      { title: "Corrugated Cardboard", img: "m-corrugated-grey.webp", swatch: "60% 77%", text: "Strong, protective, and ideal for shipping products safely.", features: [["shield", "High Strength"], ["package", "Impact Protection"], ["leaf", "Recyclable"]] },
      { title: "Rigid Stock", img: "m-rigid-grey.webp", swatch: "72% 68%", badge: "Premium Choice", text: "Thick, durable, and luxurious, perfect for high-end packaging.", features: [["gem", "Luxury Look"], ["shieldCheck", "Extra Durability"], ["star", "Long Lasting"]] },
      { title: "Kraft Stock", img: "m-kraft-grey.webp", swatch: "30% 28%", text: "Eco-friendly, natural, and a great choice for sustainable packaging.", features: [["leaf", "Eco-Friendly"], ["recycle", "Recycled Material"], ["layers", "Natural Look"]] },
    ],
  },
  {
    label: "Material Thickness",
    cards: [
      { title: "14 pt Cardboard", img: "t-14pt-grey.webp", swatch: "55% 62%", text: "A light paperboard for small, lightweight retail items.", features: [["feather", "Lightweight"], ["printer", "Smooth Print"], ["coins", "Budget Friendly"]] },
      { title: "16 pt Cardboard", img: "t-16pt-grey.webp", swatch: "55% 58%", badge: "Most Popular", text: "A popular weight for everyday retail and product boxes.", features: [["star", "Most Popular"], ["printer", "Sharp Print"], ["shield", "Everyday Strength"]] },
      { title: "18 pt Cardboard", img: "t-18pt-grey.webp", swatch: "55% 55%", text: "Extra stiffness for heavier retail products.", features: [["shield", "Extra Stiffness"], ["package", "Retail Ready"], ["printer", "Crisp Print"]] },
      { title: "24 pt Cardboard", img: "t-24pt-grey.webp", swatch: "55% 50%", text: "Our thickest paperboard for added strength.", features: [["shieldCheck", "Maximum Strength"], ["layers", "Thick Board"], ["gem", "Premium Feel"]] },
      { title: "E-flute", img: "t-eflute-grey.webp", swatch: "50% 60%", text: "A thin corrugated flute for mailers with crisp print.", features: [["truck", "Mailer Ready"], ["printer", "Fine Print Surface"], ["feather", "Slim Profile"]] },
      { title: "B-flute", img: "t-bflute-grey.webp", swatch: "45% 58%", text: "A thicker flute for heavier shipping boxes.", features: [["shield", "Heavy Duty"], ["package", "Impact Protection"], ["truck", "Shipping Safe"]] },
      { title: "2mm", img: "t-2mm-grey.webp", swatch: "70% 53%", text: "Rigid board for gift, magnetic and premium boxes.", features: [["gem", "Luxury Look"], ["shieldCheck", "Sturdy Build"], ["gift", "Gift Ready"]] },
      { title: "3mm", img: "t-3mm-grey.webp", swatch: "70% 53%", text: "Extra-thick rigid board for heavy luxury items.", features: [["shieldCheck", "Extra Rigid"], ["gem", "High-End Feel"], ["star", "Long Lasting"]] },
    ],
  },
  {
    label: "Printing Sides",
    cards: [
      { title: "Inside", img: "s-inside-grey.webp", swatch: "60% 35%", text: "Print a message, pattern or color inside the box.", features: [["sparkles", "Surprise Reveal"], ["message", "Brand Message"], ["palette", "Inside Pattern"]] },
      { title: "Outside", img: "s-outside-grey.webp", swatch: "22% 65%", text: "Full branding on the outside of the box.", features: [["eye", "Shelf Appeal"], ["tag", "Brand Visibility"], ["palette", "Full Color"]] },
      { title: "Both Sides", img: "s-both-grey.webp", swatch: "62% 35%", badge: "Premium Choice", text: "A branded outside plus a printed inside reveal.", features: [["sparkles", "Full Experience"], ["eye", "Maximum Impact"], ["gem", "Premium Unboxing"]] },
      { title: "No Print", img: "s-none-grey.webp", swatch: "60% 40%", text: "Plain boxes without any printing.", features: [["coins", "Lowest Cost"], ["leaf", "Minimal Look"], ["clock", "Fast Turnaround"]] },
    ],
  },
  {
    label: "Printing Options",
    cards: [
      { title: "CMYK", img: "p-cmyk-grey.webp", swatch: "40% 40%", badge: "Most Popular", text: "Full-color process printing for photos and artwork.", features: [["palette", "Full Color"], ["image", "Photo Quality"], ["coins", "Cost Effective"]] },
      { title: "Pantone (PMS)", img: "p-pantone-grey.webp", swatch: "45% 40%", text: "Exact brand colors matched with spot inks.", features: [["target", "Exact Match"], ["shieldCheck", "Color Consistency"], ["droplet", "Spot Inks"]] },
    ],
  },
  {
    label: "Finishing",
    cards: [
      { title: "Foil Stamping", img: "f-foil-grey.webp", swatch: "45% 40%", badge: "Premium Choice", text: "Metallic gold, silver or colored accents.", features: [["sparkles", "Metallic Shine"], ["gem", "Luxury Look"], ["tag", "Logo Highlight"]] },
      { title: "Embossing/Debossing", img: "f-emboss-grey.webp", swatch: "30% 60%", text: "Raised or pressed designs you can feel.", features: [["hand", "Tactile Feel"], ["layers", "3D Depth"], ["gem", "Premium Touch"]] },
      { title: "Textured Finishes", img: "f-textured-grey.webp", swatch: "40% 40%", text: "Tactile surfaces such as linen or leather-look.", features: [["hand", "Soft Touch"], ["layers", "Unique Texture"], ["eye", "Elegant Look"]] },
      { title: "Raised UV", img: "f-raised-uv-grey.webp", swatch: "35% 45%", text: "A glossy raised coating that highlights details.", features: [["sparkles", "Glossy Accent"], ["hand", "Raised Feel"], ["eye", "Eye Catching"]] },
      { title: "Holographic Foiling", img: "f-holographic-grey.webp", swatch: "45% 40%", text: "Rainbow foil that shifts with the light.", features: [["sparkles", "Rainbow Effect"], ["eye", "Eye Catching"], ["star", "Standout Look"]] },
      { title: "Combination Embossing", img: "f-combo-emboss-grey.webp", swatch: "45% 50%", text: "Embossing paired with foil for extra depth.", features: [["layers", "Layered Depth"], ["sparkles", "Foil Accent"], ["gem", "Luxury Finish"]] },
    ],
  },
];

export default function MaterialTabs() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move between tabs (standard tab pattern).
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <div className="cb-tabs">
      <div className="cb-tablist" role="tablist" aria-label="Box options" onKeyDown={onKey}>
        {tabs.map((t, i) => (
          <button
            key={t.label}
            ref={(el) => { buttons.current[i] = el; }}
            type="button"
            role="tab"
            id={`cb-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`cb-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.label}
          role="tabpanel"
          id={`cb-panel-${i}`}
          aria-labelledby={`cb-tab-${i}`}
          hidden={active !== i}
          className="cb-option-grid"
        >
          {t.cards.map((c) => (
            <article key={c.title} className={`cb-option${c.badge ? " is-featured" : ""}`}>
              <div className="cb-option-media">
                <img src={IMG + c.img} alt="" width={750} height={499} loading="lazy" />
                {c.badge && (
                  <span className="cb-badge">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                      <path d="M5 21h14" />
                    </svg>
                    {c.badge}
                  </span>
                )}
                {c.swatch && (
                  <span
                    className="cb-swatch"
                    aria-hidden="true"
                    style={{ backgroundImage: `url(${IMG + c.img})`, backgroundPosition: c.swatch }}
                  />
                )}
              </div>
              <div className="cb-option-body">
                <div className="cb-option-title">{c.title}</div>
                <p>{c.text}</p>
                {c.features && (
                  <ul className="cb-option-features">
                    {c.features.map(([icon, label]) => (
                      <li key={label}>
                        <Icon name={icon} />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      ))}
    </div>
  );
}
