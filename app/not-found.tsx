import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AnimatedBox, ArrowRight, PopularProducts } from "@/components/status/StatusParts";
import "@/styles/status-pages.css";

export const metadata: Metadata = {
  title: "Page Not Found | Pack Legacy",
  robots: { index: false, follow: true },
};

const shortcuts = [
  { label: "Custom Boxes", href: "/custom-boxes/" },
  { label: "Mailer Boxes", href: "/product/corrugated-mailer-boxes/" },
  { label: "Rigid Boxes", href: "/product/two-piece-rigid-boxes/" },
  { label: "Magnetic Closure Boxes", href: "/product/magnetic-closure-boxes/" },
  { label: "Get a Quote", href: "/get-a-quote/" },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="plst" id="main">
        <section className="st-hero st-hero-404" aria-labelledby="st-title">
          <div className="st-dust" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => <span key={i} style={{ "--i": i } as React.CSSProperties} />)}
          </div>
          <div className="st-wrap st-404">
            <div className="st-404-digits" aria-hidden="true">
              <span className="st-digit">4</span>
              <AnimatedBox variant="empty">
                <span className="st-question">?</span>
              </AnimatedBox>
              <span className="st-digit st-digit-late">4</span>
            </div>
            <p className="st-eyebrow">Error 404</p>
            <h1 id="st-title">
              This box came up <em>empty.</em>
            </h1>
            <p className="st-lead">
              The page you’re looking for may have moved, or the link may be out of date. Let’s get you back to the
              packaging you need.
            </p>
            <div className="st-actions st-actions-center">
              <a className="st-btn st-btn-red" href="/">Back to home <ArrowRight /></a>
              <a className="st-btn st-btn-outline" href="/get-a-quote/">Get a custom quote</a>
            </div>
            <nav className="st-shortcuts" aria-label="Popular pages">
              {shortcuts.map((s) => (
                <a key={s.href} href={s.href}>{s.label}</a>
              ))}
            </nav>
          </div>
        </section>

        <PopularProducts
          title="Popular boxes to start with."
          slugs={["corrugated-mailer-boxes", "two-piece-rigid-boxes", "book-boxes", "cake-boxes"]}
        />
      </main>
      <Footer />
    </>
  );
}
