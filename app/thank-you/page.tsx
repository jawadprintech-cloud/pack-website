import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AnimatedBox, ArrowRight, Confetti, PopularProducts } from "@/components/status/StatusParts";
import "@/styles/status-pages.css";

export const metadata: Metadata = withSeo("/thank-you/", {
  title: "Thank You | Pack Legacy",
  description: "Your custom packaging quote request has been received.",
  robots: { index: false, follow: false },
});

const steps = [
  { title: "Request received", text: "Your box details are with our team.", done: true },
  { title: "Specialist review", text: "A packaging specialist checks your size, material and finish." },
  { title: "Your custom quote", text: "We send pricing and options, with free design support if you need it." },
  { title: "Proof & production", text: "Approve your digital proof, then we make and ship your boxes for free." },
];

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ ref?: string; name?: string }> }) {
  const { ref, name } = await searchParams;
  // Only show simple values from the URL.
  const reference = ref && /^[\w-]{1,40}$/.test(ref) ? ref : "";
  const firstName = name && /^[\p{L}' .-]{1,40}$/u.test(name) ? name : "";

  return (
    <>
      <Header />
      <main className="plst" id="main">
        <section className="st-hero st-hero-thanks" aria-labelledby="st-title">
          <Confetti />
          <div className="st-wrap st-hero-grid">
            <div className="st-hero-copy">
              <p className="st-eyebrow">Quote request received</p>
              <h1 id="st-title">
                Thank you{firstName ? `, ${firstName}` : ""}!
                <br />
                <em>Your box is on its way</em> to being made.
              </h1>
              <p className="st-lead">
                We’ve got your packaging details. A Pack Legacy specialist will review them and get back to you by email
                with your custom quote.
              </p>
              {reference && (
                <p className="st-ref">
                  Reference <strong>#{reference}</strong>
                </p>
              )}
              <div className="st-actions">
                <a className="st-btn st-btn-red" href="/custom-boxes/">Keep exploring boxes <ArrowRight /></a>
                <a className="st-btn st-btn-outline" href="/">Back to home</a>
              </div>
            </div>
            <AnimatedBox variant="thanks">
              <span className="st-check">
                <svg viewBox="0 0 52 52" width="52" height="52">
                  <circle cx="26" cy="26" r="24" fill="#0b8743" />
                  <path className="st-check-path" d="M15 27 l8 8 l15 -17" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </AnimatedBox>
          </div>
        </section>

        <section className="st-wrap st-next" aria-labelledby="st-next-title">
          <p className="st-eyebrow">What happens next</p>
          <h2 id="st-next-title">From your request to your doorstep.</h2>
          <ol className="st-steps">
            {steps.map((s, i) => (
              <li key={s.title} className={s.done ? "is-done" : ""} style={{ "--i": i } as React.CSSProperties}>
                <span className="st-step-dot" aria-hidden="true">
                  {s.done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="st-wrap st-contact" aria-label="Contact Pack Legacy">
          <a href="mailto:sales@packlegacy.com" className="st-contact-card">
            <span className="st-contact-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
            </span>
            <span><strong>Need to add something?</strong>sales@packlegacy.com</span>
          </a>
          <a href="tel:+14243216460" className="st-contact-card">
            <span className="st-contact-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
            </span>
            <span><strong>Prefer to talk?</strong>+1 (424) 321-6460</span>
          </a>
          <a href="/free-dieline-templates/" className="st-contact-card">
            <span className="st-contact-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></svg>
            </span>
            <span><strong>Get ahead on artwork</strong>Free dieline templates</span>
          </a>
        </section>

        <PopularProducts
          title="While you wait, explore more boxes."
          slugs={["subscription-boxes", "perfume-boxes", "pr-boxes", "rigid-drawer-boxes"]}
        />
      </main>
      <Footer />
    </>
  );
}
