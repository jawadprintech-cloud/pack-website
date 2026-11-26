"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import FaqCards from "@/components/FaqCards";
import { moqLabel } from "@/lib/moq";
import { QUOTE_ENDPOINT, submitQuote, thankYouUrl } from "@/lib/quote";
import quoteTickerMarkup from "@/components/quote/quoteTicker";


export const ArrowUpRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);
export const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
const Layers = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 2 10 5-10 5L2 7l10-5z" />
    <path d="m2 12 10 5 10-5" />
    <path d="m2 17 10 5 10-5" />
  </svg>
);

/* Shared pill tab list. Arrow keys move between tabs, like a native tab control. */
function Pills<T extends string>({
  items,
  value,
  onChange,
  label,
  variant = "round",
}: {
  items: { id: T; label: ReactNode }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  variant?: "round" | "square";
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + items.length) % items.length;
    onChange(items[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div className={`h-pills h-pills-${variant}`} role="tablist" aria-label={label}>
      {items.map((it, i) => (
        <button
          key={it.id}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="tab"
          aria-selected={value === it.id}
          tabIndex={value === it.id ? 0 : -1}
          onClick={() => onChange(it.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Hero image slider ---------- */
// Cards are square so the square photos show whole (logo top-left, code bottom-right).
// `pos` shifts the crop of the wider 708×616 cosmetic photo left so its logo stays whole.
const heroSlides: { img: string; name: string; href: string; pos?: string }[] = [
  { img: "/cat-mailer.webp", name: "Mailer Boxes", href: "/mailer-boxes/" },
  { img: "/cat-magnetic.webp", name: "Magnetic Closure Boxes", href: "/product/magnetic-closure-boxes/" },
  { img: "/cat-rigid.webp", name: "Rigid Boxes", href: "/rigid-boxes/" },
  { img: "/cat-cosmetic.webp", name: "Cosmetic Boxes", href: "/cosmetic-boxes/", pos: "0% 50%" },
  { img: "/cat-gift.webp", name: "Gift Boxes", href: "/gift-boxes/" },
  { img: "/cat-food.webp", name: "Food Boxes", href: "/food-boxes/" },
];

/* Hero photo strip: drifts slowly on its own (no controls) and pauses while hovered.
   The list is rendered twice so the loop is seamless; the copy is hidden from screen readers. */
export function HeroSlider() {
  const slides = (copy: boolean) =>
    heroSlides.map((s, i) => (
      <li key={(copy ? "b" : "a") + s.img} className="h-hero-slide" style={{ "--i": i } as React.CSSProperties} aria-hidden={copy || undefined}>
        <a href={s.href} tabIndex={copy ? -1 : undefined}>
          <img src={s.img} alt="" width={600} height={600} loading={i < 2 && !copy ? "eager" : "lazy"} style={s.pos ? { objectPosition: s.pos } : undefined} />
          <span className="h-hero-shine" aria-hidden="true" />
          <span className="h-hero-cap">
            {s.name}
            <ArrowUpRight />
          </span>
        </a>
      </li>
    ));
  return (
    <div className="h-hero-media">
      <ul className="h-hero-track" aria-label="Packaging examples">
        {slides(false)}
        {slides(true)}
      </ul>
    </div>
  );
}

/* ---------- Find your format ---------- */
type Use = "custom" | "ecommerce" | "folding" | "mylar" | "rigid";
const useTabs: { id: Use; label: string; tag: string }[] = [
  { id: "custom", label: "Custom Packaging & Boxes", tag: "Custom" },
  { id: "ecommerce", label: "E-commerce Boxes", tag: "Shipping" },
  { id: "folding", label: "Folding Cartons", tag: "Retail" },
  { id: "mylar", label: "Mylar Bags", tag: "Mylar" },
  { id: "rigid", label: "Rigid Boxes", tag: "Premium" },
];
// `href` is a category page or a product page.
const formats: { name: string; use: Use; desc: string; img: string; href: string }[] = [
  { use: "ecommerce", name: "Mailer Boxes", href: "/mailer-boxes/", img: "/printed-corrugated-mailer-box-mailer.webp", desc: "Strong, self-locking boxes with protective flaps, ideal for secure product shipping." },
  { use: "custom", name: "Display Boxes", href: "/display-boxes/", img: "/printed-front-cut-out-display-boxes-display.webp", desc: "Open-front boxes designed to showcase products on retail shelves and counters." },
  { use: "custom", name: "Mylar Bags", href: "/custom-mylar-bags/", img: "/custom-printed-mylar-bags.webp", desc: "Flexible, lightweight pouches that help protect products from moisture, air, and light." },
  { use: "custom", name: "Paper Bags", href: "/custom-paper-bags/", img: "/kraft-paper-bags-with-handle.webp", desc: "Lightweight, customizable paper bags with handles for easy carrying." },
  { use: "custom", name: "Candle Boxes", href: "/candle-boxes/", img: "/luxury-candle-boxes-candle.webp", desc: "Custom candle packaging designed to protect jars and showcase your brand." },
  { use: "ecommerce", name: "Subscription Boxes", href: "/product/subscription-boxes/", img: "/subscription-boxes-1-mailer.webp", desc: "Custom-printed boxes designed to pack multiple products for recurring deliveries." },
  { use: "ecommerce", name: "PR Boxes", href: "/product/pr-boxes/", img: "/mailer-pr-box-gift.webp", desc: "Premium branded boxes with custom inserts for influencer kits and promotional campaigns." },
  { use: "ecommerce", name: "Corrugated Boxes", href: "/corrugated-boxes/", img: "/corrugated-box.webp", desc: "Strong boxes made from fluted cardboard that provide cushioning and protection during shipping." },
  { use: "folding", name: "Reverse Tuck End (RTE)", href: "/product/reverse-tuck-end-boxes/", img: "/reverse-tuck-end-box-2.webp", desc: "Features top and bottom tuck flaps that close in opposite directions." },
  { use: "folding", name: "Straight Tuck End (STE)", href: "/product/straight-tuck-end-boxes/", img: "/straight-tuck-end-box-folding-cartons.webp", desc: "Features top and bottom tuck flaps that close in the same direction." },
  { use: "folding", name: "Auto Bottom Boxes", href: "/product/auto-lock-bottom-boxes/", img: "/auto-lock-bottom-box-folding-cartons.webp", desc: "Pre-glued bottom flaps that automatically lock into place during assembly." },
  { use: "folding", name: "1-2-3 Bottom Boxes", href: "/product/123-bottom-boxes/", img: "/123-bottom-boxes-folding-cartons.webp", desc: "Three-step interlocking bottom flaps designed to provide extra support for products." },
  { use: "mylar", name: "Die Cut Mylar Bags", href: "/product/die-cut-mylar-bags/", img: "/printed-die-cut-mylar-bag-mylar.webp", desc: "Custom-shaped flexible pouches designed for unique product packaging and branding." },
  { use: "mylar", name: "Coffee Packaging Bags", href: "/product/coffee-packaging-bags/", img: "/printed-coffee-packaging-bags-mylar.webp", desc: "High-barrier bags with optional resealable zippers and degassing valves to preserve coffee freshness." },
  { use: "rigid", name: "Magnetic Closure Boxes", href: "/product/magnetic-closure-boxes/", img: "/magnetic-closure-boxes-2.webp", desc: "Rigid boxes with built-in magnets that provide secure and convenient opening and closing." },
  { use: "rigid", name: "Two-Piece Rigid Boxes", href: "/product/two-piece-rigid-boxes/", img: "/custom-two-piece-rigid-box-rigid.webp", desc: "Feature a separate lid and base for secure packaging and a premium unboxing experience." },
  { use: "rigid", name: "Drawer Boxes", href: "/product/rigid-drawer-boxes/", img: "/rigid-drawer-box1z-rigid.webp", desc: "Feature a sliding inner tray and outer sleeve for convenient product access." },
  { use: "rigid", name: "Folding Carton Boxes", href: "/folding-cartons/", img: "/eco-tuck-top-boxes-folding-cartons.webp", desc: "Cost-effective paperboard boxes with foldable panels and customizable printing options." },
];

export function FormatGrid() {
  const [use, setUse] = useState<Use>("custom");
  const list = formats.filter((f) => f.use === use);
  const tag = useTabs.find((t) => t.id === use)!.tag;
  return (
    <>
      <Pills<Use>
        label="Filter packaging by type"
        value={use}
        onChange={setUse}
        items={useTabs.map(({ id, label }) => ({ id, label }))}
      />
      <ul className="h-format-grid" role="tabpanel">
        {list.map((f) => (
          <li key={f.href}>
            <a className="h-format-card" href={f.href}>
              <span className="h-format-img">
                <img src={f.img} alt="" width={600} height={600} loading="lazy" />
                <span className="h-format-tag">{tag}</span>
              </span>
              <span className="h-format-body">
                <span className="h-format-title">
                  {f.name}
                  <ArrowUpRight />
                </span>
                <span className="h-format-desc">{f.desc}</span>
                <span className="h-format-chips">
                  <span className="h-chip"><span className="h-chip-icon"><Layers /></span>{moqLabel(f.href)}</span>
                  <span className="h-chip"><span className="h-chip-icon"><Layers /></span>Free Shipping</span>
                  <span className="h-badge">Instock</span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------- Custom packaging builder ---------- */
// Images cut from the homepage design (public/home/builder).
const builderSteps = [
  { title: "Box Style", desc: "Mailer, rigid, folding & more", img: "/box-style.jpg" },
  { title: "Material", desc: "Kraft, rigid, corrugated & more", img: "/material.jpg" },
  { title: "Printing", desc: "Logo, patterns, full color & more", img: "" },
  { title: "Finishing", desc: "Matte, gloss, soft-touch & more", img: "/finishing.jpg" },
];

export function Builder() {
  return (
    <section className="h-wrap h-builder" id="design" aria-labelledby="h-builder-title">
      <div className="h-builder-copy">
        <h2 id="h-builder-title">Design Your Custom Packaging &amp; Boxes Online</h2>
        <p>
          Create custom packaging that matches your brand with our easy-to-use online packaging design tool. Choose your
          box style, add your logo, adjust colors, and upload your artwork. Preview your design in 3D to see how your
          packaging will look before placing an order.
        </p>
        <ul className="h-builder-steps">
          {builderSteps.map((s) => (
            <li key={s.title}>
              <div className="h-builder-card">
                <span className="h-builder-thumb">
                  {s.img ? <img src={s.img} alt="" width={120} height={90} loading="lazy" /> : <span className="h-builder-aa" aria-hidden="true">Aa</span>}
                </span>
                <strong>{s.title}</strong>
                <span>{s.desc}</span>
              </div>
            </li>
          ))}
        </ul>
        <a className="h-builder-cta" href="https://editor.packlegacy.com/" target="_blank" rel="noopener">
          Start Customizing
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
        </a>
      </div>
      <EditorPreview />
    </section>
  );
}

/** Mock design editor beside the builder.
 *  - The active tool cycles on its own (pauses while the pointer is over the window); click a tool to pick it.
 *  - The 3D tool, or hovering "3D preview", folds the flat dieline into a 3D box.
 *  - Swatches recolor the box with a ripple; dieline panels light up on hover; the window tilts toward the pointer.
 *  Styles: .h-editor* in styles/home.css. */
const swatches = [
  { name: "Green", color: "#0f8a3c" },
  { name: "Black", color: "#1d1d1b" },
  { name: "Kraft", color: "#c9a77a" },
  { name: "Olive", color: "#5b8a3a" },
  { name: "White", color: "#ffffff" },
];
const tools: { label: string; icon: ReactNode }[] = [
  { label: "Select", icon: <path d="m4 4 7 16 2.5-6.5L20 11z" /> },
  { label: "Draw", icon: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></> },
  { label: "Layers", icon: <><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></> },
  { label: "3D", icon: <><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></> },
];
// Dieline panels: [x, y, w, h]
const panels: [number, number, number, number][] = [
  [55, 3, 45, 42], [10, 45, 45, 45], [55, 45, 45, 45], [100, 45, 45, 45], [145, 45, 45, 45], [55, 90, 45, 45],
];

function EditorPreview() {
  const [pick, setPick] = useState(0);
  const [tool, setTool] = useState(1);
  const [hover3d, setHover3d] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ripple, setRipple] = useState(0); // bumps on every swatch click to replay the ripple
  const winRef = useRef<HTMLElement>(null);

  // Cycle the active tool every few seconds unless the visitor is interacting.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setTool((n) => (n + 1) % tools.length), 2600);
    return () => clearInterval(t);
  }, [paused]);

  const color = swatches[pick].color;
  const stroke = color === "#ffffff" ? "#9aa59d" : color;
  const show3d = hover3d || tool === 3;

  // Gentle tilt toward the pointer.
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = winRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
  };
  const onLeave = () => {
    setPaused(false);
    winRef.current?.style.setProperty("--rx", "0deg");
    winRef.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="h-builder-media">
      <span className="h-live"><span className="h-live-dot" aria-hidden="true" />Live Preview</span>
      <figure
        ref={winRef}
        className={`h-editor${show3d ? " is-3d" : ""} tool-${tools[tool].label.toLowerCase()}`}
        aria-label="Packaging editor preview"
        style={{ "--box": stroke } as React.CSSProperties}
        onMouseEnter={() => setPaused(true)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div className="h-editor-bar" aria-hidden="true">
          <i style={{ background: "#0f8a3c" }} /><i style={{ background: "#c9a77a" }} /><i style={{ background: "#dfe5e0" }} />
          <span className="h-editor-url">editor.packlegacy.com</span>
          <span className="h-editor-progress" />
        </div>
        <div className="h-editor-body">
          <div className="h-editor-tools" role="toolbar" aria-label="Editor tools">
            {tools.map((t, i) => (
              <button
                key={t.label}
                type="button"
                className={`h-editor-tool${i === tool ? " is-on" : ""}`}
                aria-label={t.label}
                aria-pressed={i === tool}
                data-tip={t.label}
                onClick={() => setTool(i)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{t.icon}</svg>
              </button>
            ))}
          </div>
          <div className="h-editor-canvas">
            <span key={ripple} className={ripple ? "h-editor-ripple" : undefined} aria-hidden="true" />

            {/* Flat dieline */}
            <svg className="h-dieline" viewBox="0 0 200 140" role="img" aria-label="Box dieline">
              <ellipse className="h-dieline-glow" cx="96" cy="68" rx="18" ry="14" />
              <g className="h-dieline-lines">
                {panels.map(([x, y, w, h], i) => (
                  <rect key={i} className="h-panel" x={x} y={y} width={w} height={h} style={{ "--i": i } as React.CSSProperties} />
                ))}
                <path d="M10 45l6-10h33l6 10M145 45l6-10h33l6 10" />
              </g>
              <rect className="h-select" x="68" y="60" width="20" height="15" rx="1.5" />
              <text className="h-logo" x="77.5" y="71" textAnchor="middle">PL</text>
            </svg>

            {/* Folded 3D box */}
            <svg className="h-box3d" viewBox="0 0 200 140" aria-hidden="true">
              <g className="h-box3d-spin">
                <path className="h-face-top" d="M100 22 148 44 100 66 52 44z" />
                <path className="h-face-left" d="M52 44 100 66v52L52 96z" />
                <path className="h-face-right" d="M148 44 100 66v52l48-22z" />
                <text x="76" y="88" textAnchor="middle" transform="skewY(25) translate(0 -36)" className="h-logo">PL</text>
              </g>
            </svg>

            <svg className="h-editor-cursor" width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="#1d1d1b" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="m4 4 7 16 2.5-6.5L20 11z" /></svg>
            <span className="h-editor-mode" aria-live="polite">{show3d ? "3D view" : `${tools[tool].label} tool`}</span>
          </div>
        </div>
        <div className="h-editor-foot">
          <div className="h-editor-swatches" role="radiogroup" aria-label="Box color">
            {swatches.map((s, i) => (
              <button
                key={s.name}
                type="button"
                role="radio"
                aria-checked={i === pick}
                aria-label={s.name}
                className={i === pick ? "is-on" : undefined}
                style={{ background: s.color }}
                onClick={() => { setPick(i); setRipple((n) => n + 1); }}
              />
            ))}
          </div>
          <a
            className="h-editor-3d"
            href="#quote"
            onMouseEnter={() => setHover3d(true)}
            onMouseLeave={() => setHover3d(false)}
            onFocus={() => setHover3d(true)}
            onBlur={() => setHover3d(false)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></svg>
            3D preview
          </a>
        </div>
      </figure>
    </div>
  );
}

/* ---------- Materials lab ---------- */
type Mat = "kraft" | "white" | "folding" | "rigid";
const materials: Record<Mat, { label: string; text: string; img: string }> = {
  kraft: {
    label: "Kraft Corrugated",
    text: "A strong, natural-looking material suitable for shipping boxes, mailers, and retail packaging.",
    img: "/m-kraft.webp",
  },
  white: {
    label: "White Corrugated",
    text: "A sturdy board with a clean white surface that works well for custom printing and shipping.",
    img: "/m-corrugated.webp",
  },
  folding: {
    label: "Paperboard",
    text: "A lightweight and flexible material suitable for cosmetics, food, and other retail products.",
    img: "/m-cardboard.webp",
  },
  rigid: {
    label: "Rigid Board",
    text: "A thick, sturdy material used for gift boxes, luxury packaging, and premium product presentation.",
    img: "/m-rigid.webp",
  },
};

export function MaterialsLab() {
  const [mat, setMat] = useState<Mat>("kraft");
  const keys = Object.keys(materials) as Mat[];
  const m = materials[mat];
  const n = keys.indexOf(mat) + 1;
  return (
    <div className="h-split h-materials">
      <div>
        <p className="h-eyebrow">Find the Right Material</p>
        <h2 className="h-display">Choose the Right Material for Your Custom Packaging</h2>
        <p className="h-lead">
          The right material keeps your products safe and gives your custom packaging the look you want. We offer kraft,
          corrugated, folding paperboard, and rigid board for different packaging needs. Each material has its own
          strength, thickness, and uses.
        </p>
        <p className="h-options-label">Material Options:</p>
        <Pills<Mat> label="Material options" variant="square" value={mat} onChange={setMat} items={keys.map((k) => ({ id: k, label: materials[k].label }))} />
        <div className="h-note" role="tabpanel" aria-live="polite">
          <strong>{m.label}</strong>
          <p>{m.text}</p>
        </div>
      </div>
      <figure className="h-panel-img h-panel-green">
        <img key={m.img} src={m.img} alt={m.label} width={800} height={800} loading="lazy" />
        <figcaption>{String(n).padStart(2, "0")} / {m.label}</figcaption>
      </figure>
    </div>
  );
}

/* ---------- Finishing studio ---------- */
type Fin = "foil" | "emboss" | "soft";
const finishes: Record<Fin, { label: string; text: string; img: string; dot: string }> = {
  foil: { label: "Foil Stamping", text: "Add metallic details to your logo, text, or artwork for a shiny, eye-catching finish.", img: "/foil-stamping.webp", dot: "#c9a14a" },
  emboss: { label: "Embossing", text: "Create raised designs or lettering that add texture and make your packaging more noticeable.", img: "/embossing.webp", dot: "#c97a62" },
  soft: { label: "Soft-Touch", text: "Give your packaging boxes a smooth, velvety surface with a soft matte feel.", img: "/soft-touch.webp", dot: "#6f9a74" },
};

export function FinishingStudio() {
  const [fin, setFin] = useState<Fin>("foil");
  const keys = Object.keys(finishes) as Fin[];
  const f = finishes[fin];
  return (
    <div className="h-split h-finishing">
      <figure className="h-panel-img">
        <img key={f.img} src={f.img} alt={f.label} width={800} height={600} loading="lazy" />
        <figcaption>{String(keys.indexOf(fin) + 1).padStart(2, "0")} / {f.label}</figcaption>
      </figure>
      <div>
        <p className="h-eyebrow">Details That Make a Difference</p>
        <h2 className="h-display">Give Your Custom Boxes the Perfect Finish</h2>
        <p className="h-lead">
          Make your packaging look and feel the way you want with our custom finishing options. From shiny foil details to
          raised designs and smooth coatings, each finish adds a unique touch to your boxes. Choose the one that best
          suits your brand and product.
        </p>
        <p className="h-options-label">Finishing Options:</p>
        <Pills<Fin>
          label="Finishing options"
          value={fin}
          onChange={setFin}
          items={keys.map((k) => ({
            id: k,
            label: (
              <>
                <span className="h-pill-dot" style={{ background: finishes[k].dot }} aria-hidden="true" />
                {finishes[k].label}
              </>
            ),
          }))}
        />
        <p className="h-finish-text" role="tabpanel" aria-live="polite">{f.text}</p>
      </div>
    </div>
  );
}

/* ---------- Quote form ---------- */
/** `anchorId` is the form's id (default "quote"); pass null when a wrapper already carries the #quote anchor. */
export function QuoteBox({ anchorId = "quote" }: { anchorId?: string | null } = {}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="h-quote"
      id={anchorId ?? undefined}
      action={QUOTE_ENDPOINT}
      method="post"
      encType="multipart/form-data"
      onSubmit={async (e) => {
        e.preventDefault();
        if (sending) return;
        setError("");
        setSending(true);
        const fields = new FormData(e.currentTarget);
        fields.set("page", window.location.pathname);
        const result = await submitQuote(fields);
        if (result.ok) {
          window.location.assign(thankYouUrl(result.reference, String(fields.get("name") || "")));
          return;
        }
        setError(result.message);
        setSending(false);
      }}
    >
      <h3>Fill Out The Quote</h3>
      <div className="h-grid h-grid-2">
        <label>Full Name *<input required name="name" autoComplete="name" /></label>
        <label>Email Address *<input required type="email" name="email" autoComplete="email" /></label>
        <label>Phone Number *<input required type="tel" name="phone" autoComplete="tel" /></label>
        <label>
          Material Options
          <select name="material" defaultValue="">
            <option value="" disabled hidden></option>
            <option>Kraft Corrugated</option>
            <option>White Corrugated</option>
            <option>Folding Paperboard</option>
            <option>Rigid Board</option>
          </select>
        </label>
      </div>
      <div className="h-grid h-grid-2">
        <label>
          Quantity
          <input type="number" name="quantity" min={1} step={1} placeholder="Quantity" inputMode="numeric" />
        </label>
        <label>
          Special Finishes
          <select name="finish" defaultValue="">
            <option value="" disabled>Choose an option</option>
            <option>Foil Stamping</option>
            <option>Embossing</option>
            <option>Soft-Touch</option>
            <option>Spot UV</option>
            <option>Matte</option>
            <option>Gloss</option>
          </select>
        </label>
      </div>
      <div className="h-grid h-grid-4">
        <label>Length<input inputMode="decimal" name="length" /></label>
        <label>Width<input inputMode="decimal" name="width" /></label>
        <label>Height<input inputMode="decimal" name="height" /></label>
        <label>
          Unit
          <select name="unit" defaultValue="inches">
            <option>inches</option>
            <option>cm</option>
            <option>mm</option>
          </select>
        </label>
      </div>
      <label>
        Project Details / Special Instructions
        <textarea rows={3} name="details" placeholder="Tell us about your product, finish, and ideal delivery date..." />
      </label>
      {error && <p className="h-quote-error" role="alert">{error}</p>}
      <button className="h-btn h-btn-red h-btn-block" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Submit"}
      </button>
      <div dangerouslySetInnerHTML={{ __html: quoteTickerMarkup }} />
    </form>
  );
}

/* ---------- Help desk (FAQ) ---------- */
const faqs: { q: string; a: ReactNode }[] = [
  { q: "How do I choose the right box size for my product?", a: "To choose the right box size, measure your product's length, width, and height. For cardboard boxes, we suggest leaving less extra space, adding up to 0.125 inches to each dimension. For boxes made from corrugated material, we suggest adding 0.25 inches to each dimension." },
  { q: "How do I select the size of my box for multiple products?", a: "If you want to store multiple products, place them on a flat surface in the same arrangement you want inside the box. Then, measure the overall length, width, and height of the products to determine the appropriate box dimensions." },
  { q: "Can I order a sample of my packaging order?", a: "Absolutely. You can order a sample to assess the quality of your box materials, finishes, and printing options. Once you are satisfied with the results, we can start producing the rest of your order." },
  { q: "Do you offer wholesale packaging solutions?", a: "Yes. We do offer wholesale custom packaging solutions. When you order in bulk, we will treat your packaging order as wholesale, which results in a lower rate with the same quality." },
  { q: "Are all your packaging solutions made from eco-friendly materials?", a: "Yes. All of our custom boxes and packaging solutions are made from eco-friendly materials. We provide custom packaging made from responsibly sourced cardboard, paperboard, corrugated cardboard, and rigid stock." },
  { q: "Can you provide me with a dieline template?", a: <>Yes. If you need a dieline template, we can provide your custom dieline. Or you can visit our <a href="/free-dieline-templates/">free dieline template page</a> to download the template you want.</> },
  { q: "What if I don't have artwork for my boxes?", a: "If you don't have artwork for your boxes, you can contact our design support. They can help you design artwork that aligns with your brand values. Also, we offer free design support." },
  { q: "Will I receive a proof before you print my order?", a: "Yes. We do provide a digital proof before printing your order. Once you have confirmed the design proof, we will send your packaging order into the manufacturing process." },
  { q: "How quickly can I receive my order?", a: "Our standard manufacturing time for a custom packaging order is 8–12 business days. Once we manufacture and test your order, we will ship it to your doorstep in 2–3 business days. You can also place a rush order if you're on a tight timeline." },
  { q: "What factors affect my pricing?", a: "Pricing generally depends on five factors: box dimensions, box style, ink coverage, material, and order quantity. If you want to see which factor affects your price most, our chat support will be happy to help." },
  { q: "How can I reach your customer service team?", a: <>You can reach our customer support team in four convenient ways: call us at <a href="tel:+14243216460">+1 (424) 321-6460</a>, email <a href="mailto:sales@packlegacy.com">sales@packlegacy.com</a>, click the chat button in the bottom-right corner of any page, or fill out the <a href="#quote">quote form</a>. Our team will respond promptly to your questions.</> },
  { q: "Can you print inside custom boxes?", a: "Absolutely. We offer outside, inside, and both-side printing options. If you have artwork you want printed inside your custom boxes, send it to us, and our team of experts will handle the rest." },
  { q: "Is there a minimum order quantity?", a: "No. There is no minimum order quantity for any of our boxes. You can order as many boxes as you require, or as low as one. However, ordering in bulk can result in a lower price." },
  { q: "Will you provide me with a proof if I have low MOQs?", a: "Yes. we provide a digital proof for every order, regardless of your MOQ, ensuring your design looks perfect before production." },
];

/* Same layout as the product pages' FAQ: centered heading and FAQ cards. Shows all 14 questions. */
export function HelpDesk() {
  return (
    <div className="h-help h-help-center">
      <h2>
        Frequently <em>Asked</em> Questions
      </h2>
      <FaqCards items={faqs} max={faqs.length} />
    </div>
  );
}

