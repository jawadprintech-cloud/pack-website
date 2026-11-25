// Pieces shared by the Thank You and 404 pages.
import { allProducts } from "@/components/product/ProductPage";

export const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

/** An open kraft box. Lid flaps swing open, and `children` (a check mark, a question mark…) rises out of it. */
export function AnimatedBox({ children, variant }: { children?: React.ReactNode; variant: "thanks" | "empty" }) {
  return (
    <div className={`st-box st-box-${variant}`} aria-hidden="true">
      <div className="st-box-glow" />
      <div className="st-box-float">{children}</div>
      <svg className="st-box-svg" viewBox="0 0 240 200" width="240" height="200">
        {/* back flap */}
        <path className="st-flap st-flap-back" d="M60 92 L120 66 L180 92 L120 118 Z" fill="#c99a63" />
        {/* box body */}
        <path d="M60 92 L120 118 L120 190 L60 164 Z" fill="#d9ab73" />
        <path d="M180 92 L120 118 L120 190 L180 164 Z" fill="#c4935c" />
        <path d="M120 118 L120 190" stroke="#b07f4a" strokeWidth="1.5" />
        {/* tape stripe + logo cube */}
        <path d="M150 105 L150 177" stroke="#0b8743" strokeWidth="6" opacity="0.85" />
        <g transform="translate(78 130)">
          <path d="M10 0 20 5 10 10 0 5z" fill="#3aa23f" />
          <path d="M0 5 10 10v12L0 17z" fill="#2c8a32" />
          <path d="M20 5 10 10v12l10-5z" fill="#5fc064" />
        </g>
        {/* front flaps, hinged on the box rim */}
        <path className="st-flap st-flap-left" d="M60 92 L120 118 L96 146 L36 120 Z" fill="#e3b880" />
        <path className="st-flap st-flap-right" d="M180 92 L120 118 L144 146 L204 120 Z" fill="#d6a66d" />
      </svg>
      <div className="st-box-shadow" />
    </div>
  );
}

/** Confetti pieces in brand colours; positions are fixed so server and browser render the same thing. */
export function Confetti() {
  const colors = ["#0b8743", "#ff4343", "#f5b301", "#5fc064", "#d9ab73"];
  return (
    <div className="st-confetti" aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${((i * 13) % 20) / 10}s`,
            animationDuration: `${3.2 + ((i * 7) % 10) / 5}s`,
            transform: `rotate(${(i * 47) % 360}deg)`,
            width: i % 3 ? 8 : 6,
            height: i % 3 ? 14 : 6,
            borderRadius: i % 3 ? 2 : "50%",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/** A row of product cards to keep visitors browsing. */
export function PopularProducts({ title, slugs }: { title: string; slugs: string[] }) {
  const list = slugs
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => !!p && !!p.gallery[0]);
  if (!list.length) return null;
  return (
    <section className="st-wrap st-popular" aria-labelledby="st-popular-title">
      <div className="st-popular-head">
        <h2 id="st-popular-title">{title}</h2>
        <a className="st-link" href="/custom-boxes/">View all custom boxes <ArrowRight /></a>
      </div>
      <ul className="st-popular-grid">
        {list.map((p, i) => (
          <li key={p.slug} style={{ "--i": i } as React.CSSProperties}>
            <a href={`/product/${p.slug}/`}>
              <span className="st-popular-img"><img src={p.gallery[0]} alt="" width={400} height={400} loading="lazy" /></span>
              <span className="st-popular-name">{p.title.replace(/^Custom\s+/, "")}<ArrowRight /></span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
