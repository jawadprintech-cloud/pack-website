import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { Crumbs, CtaBand, FaqList, Icons, InfoShell, QUOTE_HREF } from "@/components/info/InfoParts";
import HowToSteps, { type OrderStep } from "@/components/info/HowToSteps";
import "@/styles/how-to-order.css";

export const metadata: Metadata = withSeo("/how-to-order/", {
  alternates: { canonical: "/how-to-order/" },
  title: "How To Order Custom Boxes & Packaging | Pack Legacy",
  description: "Order custom boxes in five easy steps: pick your product, add your box size, share your details and artwork, and get a free quote.",
});


const steps: OrderStep[] = [
  {
    id: "step-1",
    title: "Select The Desired Product",
    image: `/images/1.-select-the-desired-product.webp`,
    text: "There are two options to fill out the quote form: either click on the “Get a Quote” icon to place your order or select the desired product you want to order from us! You will see a quote form for your product. Fill it out with accurate information.",
    tags: ["Any box style", "Quote from any page"],
    link: { label: "Browse custom boxes", href: "/custom-boxes/" },
  },
  {
    id: "step-2",
    title: "Measure Your Box Dimension",
    image: `/images/2.-measure-your-box-dimension.webp`,
    text: "The order placing starts with the exact dimensions you need for your box. You have to provide the following dimensions of your custom box: length, height/depth, and width. Plus, also select the measurement unit in which you have taken your measurements. You can check out our guide on box dimensions if you’re unsure how to measure your box size.",
    tags: ["Length × Width × Depth", "Inches, cm or mm"],
    tip: "Measure the inside of the box, and add a little room for inserts or tissue.",
    link: { label: "Read the box measuring guide", href: "/blog/measure-your-box-dimensions/" },
  },
  {
    id: "step-3",
    title: "Provide Your Details",
    image: `/images/3.-provide-your-details.webp`,
    text: "Please provide the following information accurately: your name, your email address, your phone number, and quantity for the boxes. Once you provide this information, our chat support agent will get in touch with you with a custom quote for your order.",
    tags: ["No minimum order", "Quick reply"],
  },
  {
    id: "step-4",
    title: "Provide Additional Information",
    image: `/images/4.-provide-additional-information.webp`,
    text: "If you have any questions or additional details to share, please write them in the space provided below the measurement selection. You can share which box style, material, and coating options you need for your boxes. Providing this information will also help us with providing near-to-accurate pricing for your boxes.",
    tags: ["Material", "Coating", "Finishes", "Inserts"],
    link: { label: "Explore materials and finishes", href: "/materials/" },
  },
  {
    id: "step-5",
    title: "Upload Your Artwork",
    image: `/images/5.-upload-your-artwork.webp`,
    text: "Now, the only thing left to do is to upload your artwork file, if you have any. Submit your artwork in the following file formats: TIFF, PDF, PSD, and AI (for vector files), and to print images, you can send them in PNG or JPEG formats. Once you have successfully filled out the quote form, you can submit it to get an instant cost-free quote for your order!",
    tags: ["AI", "PDF", "PSD", "TIFF", "PNG / JPEG"],
    tip: "Use CMYK color at 300 DPI or higher for the sharpest print.",
    link: { label: "Get a free dieline template", href: "/free-dieline-templates/" },
  },
];

const facts = [
  { icon: <Icons.clock />, value: "2 min", label: "to request a quote" },
  { icon: <Icons.box />, value: "No MOQ", label: "order any quantity" },
  { icon: <Icons.pen />, value: "Free", label: "design help and proofs" },
  { icon: <Icons.truck />, value: "10–12 days", label: "from proof to your door" },
];

const checklist = [
  { t: "Contact details", d: "Your name, email and phone number." },
  { t: "Size", d: "Length × width × depth, and the unit you used." },
  { t: "Quantity", d: "Any amount. There is no minimum order." },
  { t: "Box style", d: "Mailer, folding carton, rigid, display… or ask us." },
  { t: "Material and finish", d: "Optional. We can recommend one." },
  { t: "Artwork", d: "Optional. Upload now or send it later." },
];

const timeline = [
  { when: "After you submit", title: "Custom quote", text: "A specialist emails pricing for your exact size, material and quantity." },
  { when: "Before printing", title: "Digital proof", text: "Review a free 2D proof or 3D mockup and request changes." },
  { when: "8–10 business days", title: "Production", text: "Printing starts once your proof is approved and paid." },
  { when: "2–3 business days", title: "Free shipping", text: "Delivered with tracking via UPS, FedEx or DHL." },
];

const faqs = [
  { q: "How do I receive my quote?", a: "A packaging specialist reviews your details and sends your custom quote by email. Questions? Call +1 (424) 321-6460 or email sales@packlegacy.com." },
  { q: "Can I order without artwork?", a: "Yes. Request your quote first and send artwork later, or let our design team create it with you for free." },
  { q: "Will I see my box before it is printed?", a: "Yes. You always get a digital proof to approve. Production starts only after you approve it." },
  { q: "Can I get a sample first?", a: <>Yes. See our <a href="/sample-kits/">sample kits</a> for plain, random and pre-production samples.</> },
];

export default function HowToOrderPage() {
  return (
    <InfoShell>
      <div className="hto">
        {/* Hero */}
        <section className="hto-hero">
          <div className="ip-wrap hto-hero-grid">
            <div className="hto-hero-copy">
              <Crumbs items={[{ label: "How To Order" }]} />
              <p className="ip-eyebrow">Ordering guide</p>
              <h1>
                How To Order <em>Custom Boxes & Packaging?</em>
              </h1>
              <p className="ip-lead">
                To place an order for your customized packaging and boxes, you have to fill out the quotation form with the exact quantity you need and measurements. Here is a step-by-step guide for placing an order with us:
              </p>
              <div className="ip-actions">
                <a className="ip-btn ip-btn-red" href={QUOTE_HREF}>Get Instant Quote <Icons.arrow size={16} /></a>
                <a className="ip-btn ip-btn-outline" href="#step-1">See the steps</a>
              </div>
            </div>
            <nav className="hto-jump" aria-label="Ordering steps">
              <p>The 5 steps</p>
              <ol>
                {steps.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                      <Icons.arrow size={16} />
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>

        {/* Quick facts */}
        <section className="hto-facts" aria-label="Ordering at a glance">
          <ul className="ip-wrap">
            {facts.map((f) => (
              <li key={f.label}>
                <span className="ip-icon-badge">{f.icon}</span>
                <span><strong>{f.value}</strong>{f.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section className="ip-section" aria-labelledby="hto-steps-h">
          <div className="ip-wrap">
            <div className="ip-head">
              <p className="ip-eyebrow">Step by step</p>
              <h2 id="hto-steps-h">From first click to free quote.</h2>
            </div>
            <HowToSteps steps={steps} />
          </div>
        </section>

        {/* Checklist + files */}
        <section className="ip-section ip-band" aria-labelledby="hto-ready-h">
          <div className="ip-wrap hto-ready">
            <div>
              <p className="ip-eyebrow">Before you start</p>
              <h2 id="hto-ready-h">Have these ready.</h2>
              <p className="ip-lead">Only your name, email and phone number are required. Size and quantity help us price faster, and we can help with everything else.</p>
              <ul className="hto-check">
                {checklist.map((c, i) => (
                  <li key={c.t}>
                    <span className={`hto-check-dot ${i < 1 ? "is-req" : ""}`} aria-hidden="true"><Icons.check size={14} /></span>
                    <span><strong>{c.t}{i < 1 && <em> Required</em>}</strong>{c.d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hto-files">
              <h3>Accepted artwork files</h3>
              <p>Vector files keep your logo sharp at any size.</p>
              <div className="hto-file-group">
                <span className="hto-file-label">Vector (best)</span>
                <ul>{["AI", "PDF", "PSD", "TIFF"].map((f) => <li key={f} className="is-vector">.{f.toLowerCase()}</li>)}</ul>
              </div>
              <div className="hto-file-group">
                <span className="hto-file-label">Images</span>
                <ul>{["PNG", "JPEG"].map((f) => <li key={f}>.{f.toLowerCase()}</li>)}</ul>
              </div>
              <ul className="hto-specs">
                <li><Icons.check size={16} /> CMYK color mode</li>
                <li><Icons.check size={16} /> 300 DPI or higher</li>
                <li><Icons.check size={16} /> Fonts outlined</li>
              </ul>
              <a className="ip-btn ip-btn-green ip-btn-sm" href="/free-dieline-templates/"><Icons.download size={16} /> Free dieline templates</a>
            </div>
          </div>
        </section>

        {/* After you order */}
        <section className="ip-section" aria-labelledby="hto-after-h">
          <div className="ip-wrap">
            <div className="ip-head ip-head-center">
              <p className="ip-eyebrow">After you order</p>
              <h2 id="hto-after-h">What happens next, and when.</h2>
            </div>
            <ol className="hto-timeline">
              {timeline.map((t, i) => (
                <li key={t.title}>
                  <span className="hto-tl-dot" aria-hidden="true">{i + 1}</span>
                  <span className="hto-tl-when">{t.when}</span>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </li>
              ))}
            </ol>
            <p className="hto-tl-note">Need it sooner? Rush production takes 6 to 8 business days. See our <a href="/shipping-policy/">shipping policy</a>.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="ip-section ip-band" aria-labelledby="hto-faq-h">
          <div className="ip-wrap-narrow">
            <div className="ip-head ip-head-center">
              <p className="ip-eyebrow">Ordering questions</p>
              <h2 id="hto-faq-h">Quick answers.</h2>
            </div>
            <FaqList items={faqs} />
            <p className="hto-tl-note"><a href="/faqs/">See all FAQs</a></p>
          </div>
        </section>
      </div>

      <CtaBand title="Ready when you are." text="Start your quote now. It takes about two minutes, and there is no obligation to order." primary={{ label: "Start my free quote", href: QUOTE_HREF }} />
    </InfoShell>
  );
}
