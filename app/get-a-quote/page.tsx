import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqCards from "@/components/FaqCards";
import { QuoteBox, ArrowRight } from "@/components/home/HomeClient";
import { CONTACT, FaqSchema } from "@/components/info/InfoParts";
import "@/styles/home.css";

// Dedicated quote page (https://packlegacy.com/get-a-quote/). Uses the homepage quote form (QuoteBox),
// which posts to /api/quote/ and then opens /thank-you/. Copy is based on the live page, rewritten.
export const metadata: Metadata = withSeo("/get-a-quote/", {
  alternates: { canonical: "/get-a-quote/" },
  title: "Get a Quote | Pack Legacy",
  description:
    "Request a free, no-obligation quote for custom printed boxes. Share your box size, quantity, material and finishes, and our packaging team will price it for you.",
});

const steps = [
  ["Share your specs.", "Tell us the box size, quantity, material and any finishes. Add your artwork or ask for design help."],
  ["Get your custom quote.", "A packaging specialist reviews your request and sends pricing for your exact box. There is no obligation to order."],
  ["Approve and produce.", "Check your digital proof. Once approved, production takes 8–12 business days, with free shipping."],
];

const perks = ["No minimum order", "Free design support", "No die or plate charges", "Free shipping"];

const faqs = [
  { q: "How much does a custom box cost?", a: "The price depends on the material, box size, quantity and the printing and finishing you choose. Our pricing is affordable and competitive, and every quote is built for your exact box." },
  { q: "What is the minimum number of boxes I can order?", a: "We have no minimum order quantity requirement; you can order as many boxes as you need." },
  { q: "In which file format should I send my artwork for the box?", a: "You can send your artwork to us in AI, PSD, or PDF format." },
  { q: "Can my box be printed on the inside and outside?", a: "Yes, we can print your box on the inside, outside, and both (inside & outside)." },
  { q: "Can I order a sample before placing a bulk order for my custom box?", a: "Yes, you can contact our customer representative to order a box sample." },
  { q: "Are there hidden fees, or die and plate costs?", a: "No. There are no hidden fees, and you never pay for dies or printing plates." },
  { q: "When will I receive my custom box order?", a: "Most orders are completed in 8 to 12 business days. Need them sooner? Ask us about a rush order." },
  { q: "Do I pay for shipping, and do you ship outside the US?", a: "Yes, we ship to countries other than the US, including the United Kingdom, Australia, and Canada." },
];

export default function GetAQuotePage() {
  return (
    <>
      <Header />
      <main className="plh gq" id="main">
        <FaqSchema items={faqs.map((f) => ({ q: f.q, text: f.a }))} />

        <section className="h-wrap h-section h-split h-process" aria-labelledby="gq-title">
          <div>
            <nav className="gq-crumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Get a Quote</span>
            </nav>
            <p className="h-eyebrow">Free, No-Obligation Quote</p>
            <h1 className="h-display" id="gq-title">
              Get a quote for your <em className="h-accent">custom boxes.</em>
            </h1>
            <p className="h-lead">
              Share your product’s requirements with us and get a custom quote from our expert designers.
            </p>
            <ul className="gq-perks" aria-label="Included with every order">
              {perks.map((p) => (
                <li key={p}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
            <h2 className="gq-steps-title">What happens next</h2>
            <ol className="h-steps">
              {steps.map(([t, d], i) => (
                <li key={t}>
                  <span className="h-step-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <QuoteBox />
        </section>

        <section className="h-wrap h-section h-ruled" aria-labelledby="gq-help-title">
          <div className="gq-help">
            <div>
              <p className="h-eyebrow h-eyebrow-green">Here To Help</p>
              <h2 className="h-display" id="gq-help-title">We’re with you through your packaging journey.</h2>
            </div>
            <div className="gq-help-copy">
              <p>
                Every product is different, so its packaging should be too. Our team designs each box around your product’s
                specifications, including custom sizes and dimensions. Request your quote to get started.
              </p>
              <p>
                Prefer to talk it through? Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call{" "}
                <a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a>.
              </p>
              <div className="gq-links">
                <a className="h-link h-link-green" href="/how-to-order/">How to order <ArrowRight /></a>
                <a className="h-link h-link-green" href="/artwork/">Artwork guidelines <ArrowRight /></a>
                <a className="h-link h-link-green" href="/free-dieline-templates/">Free dieline templates <ArrowRight /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="h-wrap h-section h-ruled" aria-labelledby="gq-faq-title">
          <div className="gq-faq-head">
            <h2 className="h-display" id="gq-faq-title">Frequently asked questions</h2>
            <p className="h-sub">Quick answers to the questions customers ask most before ordering custom boxes.</p>
          </div>
          <FaqCards items={faqs} />
        </section>
      </main>
      <Footer />
    </>
  );
}
