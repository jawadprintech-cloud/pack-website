import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { CONTACT, Crumbs, CtaBand, FaqList, Icons, InfoShell } from "@/components/info/InfoParts";
import TrackTool from "@/components/info/TrackTool";
import "@/styles/track-order.css";

export const metadata: Metadata = withSeo("/track-your-order/", {
  alternates: { canonical: "/track-your-order/" },
  title: "Track Your Order | Live DHL, FedEx & UPS Tracking | Pack Legacy",
  description: "Track your Pack Legacy custom packaging order with DHL, FedEx or UPS. Paste your tracking number to see live delivery updates.",
});


// From proof to doorstep. "mail: true" marks the step where the tracking email is sent.
const journey = [
  { title: "Proof approved", text: "Your design is final and payment has cleared.", icon: <Icons.check /> },
  { title: "In production", text: "8–10 business days to print and build your boxes.", icon: <Icons.box /> },
  { title: "Quality check", text: "Every order is inspected before it is packed.", icon: <Icons.shield /> },
  { title: "Shipped", text: "We email your tracking number and carrier link.", icon: <Icons.mail />, mail: true },
  { title: "In transit", text: "Usually 2–3 business days with free shipping.", icon: <Icons.truck /> },
  { title: "Delivered", text: "Your boxes arrive, ready to fill.", icon: <Icons.flag /> },
];

const carriers = [
  { id: "ups", name: "UPS", image: "/image-1.jpg", format: "1Z + 16 letters and numbers", example: "1Z999AA10123456784", href: "https://www.ups.com/track?loc=en_US&requester=ST/" },
  { id: "fedex", name: "FedEx", image: "/image.jpg", format: "12 or 15 digits", example: "123456789012", href: "https://www.fedex.com/en-us/tracking.html" },
  { id: "dhl", name: "DHL", image: "/image-1-1.png", format: "10 digits (DHL Express)", example: "1234567890", href: "https://www.dhl.com/us-en/home/tracking.html" },
];

const tips = [
  { title: "Give it a few hours", text: "Carriers can take up to 24 hours to show the first scan after pickup." },
  { title: "Check the carrier", text: "A UPS number won't work on the FedEx site. Your shipping email names the carrier." },
  { title: "Look in spam", text: "Search your inbox and spam folder for “Pack Legacy” or “tracking”." },
  { title: "Copy it exactly", text: "Paste the number without spaces or dashes. Our tracker removes spaces for you." },
];

const faqs = [
  { q: "When will I get my tracking number?", a: "Once your order passes final quality control and is labeled for pickup, we email your tracking number with a link to the carrier’s tracking page." },
  { q: "Which carriers do you use?", a: "We ship with UPS, FedEx and DHL. The carrier depends on your location and order size." },
  { q: "My delivery needs a liftgate or loading dock. What should I do?", a: <>Please tell us before your order ships, by email at <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>, so we can arrange the right delivery.</> },
  { q: "Why is my international order delayed?", a: <>International shipments can be held for customs clearance, which is outside our control. See our <a href="/shipping-policy/">shipping policy</a> for details.</> },
];

export default function TrackPage() {
  return (
    <InfoShell>
      {/* Hero with the tracking search */}
      <section className="trk-hero">
        <div className="ip-wrap trk-hero-grid">
          <div className="trk-hero-copy">
            <Crumbs items={[{ label: "Track Your Order" }]} />
            <p className="ip-eyebrow">Order tracking</p>
            <h1>Where’s my <em>box?</em></h1>
            <p className="ip-lead">Paste the tracking number from your shipping email. We’ll spot the carrier and open live updates from UPS, FedEx or DHL.</p>
            <TrackTool />
          </div>
          <div className="trk-hero-art" aria-hidden="true">
            <img src={`/frame-4-1.png`} alt="" width={693} height={308} />
            <span className="trk-pill trk-pill-a"><i className="trk-live" /> Out for delivery</span>
            <span className="trk-pill trk-pill-b"><Icons.check size={16} /> Shipped with tracking</span>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="ip-section" aria-labelledby="trk-journey-h">
        <div className="ip-wrap">
          <div className="ip-head ip-head-center">
            <p className="ip-eyebrow">Your order’s journey</p>
            <h2 id="trk-journey-h">From proof to your doorstep.</h2>
            <p className="ip-lead">Tracking starts when your boxes leave our facility. Here is where your order is before that.</p>
          </div>
          <div className="trk-journey">
            <div className="trk-road" aria-hidden="true">
              <span className="trk-truck"><Icons.truck size={22} /></span>
            </div>
            <ol>
              {journey.map((j, i) => (
                <li key={j.title} className={j.mail ? "is-mail" : ""}>
                  <span className="trk-stop">{j.icon}</span>
                  <span className="trk-step-n">0{i + 1}</span>
                  <h3>{j.title}</h3>
                  <p>{j.text}</p>
                  {j.mail && <span className="trk-mail-tag">Tracking email sent</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Carriers */}
      <section className="ip-section ip-band" aria-labelledby="trk-carriers-h">
        <div className="ip-wrap">
          <div className="ip-head">
            <p className="ip-eyebrow">Our carriers</p>
            <h2 id="trk-carriers-h">Track directly with your carrier.</h2>
            <p className="ip-lead">Not sure which one? Match your number to the format below.</p>
          </div>
          <div className="trk-carriers">
            {carriers.map((c) => (
              <article className={`trk-carrier trk-carrier-${c.id}`} key={c.id}>
                <img src={`${c.image}`} alt={`${c.name} tracking`} width={277} height={276} loading="lazy" />
                <div className="trk-carrier-body">
                  <h3>{c.name} tracking</h3>
                  <dl>
                    <dt>Number looks like</dt>
                    <dd>{c.format}</dd>
                    <dt>Example</dt>
                    <dd><code>{c.example}</code></dd>
                  </dl>
                  <a className="ip-btn ip-btn-outline ip-btn-sm" href={c.href} target="_blank" rel="noopener nofollow">
                    Open {c.name} tracking <Icons.external size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Troubleshooting + help */}
      <section className="ip-section" aria-labelledby="trk-help-h">
        <div className="ip-wrap trk-help">
          <div>
            <p className="ip-eyebrow">Tracking not working?</p>
            <h2 id="trk-help-h">Try these first.</h2>
            <ul className="trk-tips">
              {tips.map((t, i) => (
                <li key={t.title}>
                  <span className="trk-tip-n">{i + 1}</span>
                  <span><strong>{t.title}</strong>{t.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="trk-contact" aria-labelledby="trk-contact-h">
            <span className="trk-contact-badge"><Icons.phone size={22} /></span>
            <h3 id="trk-contact-h">Still can’t find your order?</h3>
            <p>Send us your name and order reference and we’ll check its status for you.</p>
            <a className="trk-contact-row" href={`mailto:${CONTACT.email}`}><Icons.mail size={18} /> {CONTACT.email}</a>
            <a className="trk-contact-row" href={`tel:${CONTACT.tel}`}><Icons.phone size={18} /> {CONTACT.phone}</a>
            <a className="ip-btn ip-btn-red" href="/contact-us/">Contact our team <Icons.arrow size={16} /></a>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="ip-section ip-band" aria-labelledby="trk-faq-h">
        <div className="ip-wrap-narrow">
          <div className="ip-head ip-head-center">
            <p className="ip-eyebrow">Shipping questions</p>
            <h2 id="trk-faq-h">Good to know.</h2>
          </div>
          <FaqList items={faqs} />
          <p className="trk-more"><a href="/shipping-policy/">Read our full shipping policy</a></p>
        </div>
      </section>

      <CtaBand title="Need more boxes?" text="Reorders are quick. Send us your previous order details and we will get them moving." />
    </InfoShell>
  );
}
