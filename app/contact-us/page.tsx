import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { CONTACT, Crumbs, Icons, InfoShell, Stars } from "@/components/info/InfoParts";
import InfoForm from "@/components/info/InfoForm";
import "@/styles/contact.css";

export const metadata: Metadata = withSeo("/contact-us/", {
  alternates: { canonical: "/contact-us/" },
  title: "Contact Us | Pack Legacy",
  description: "Questions about custom packaging? Email sales@packlegacy.com, call +1 (424) 321-6460, or send our expert team a message.",
});

// Cards without an `href` (the address) are shown as plain, non-clickable cards.
const channels: { icon: React.ReactNode; label: string; value: string; note: string; href?: string }[] = [
  { icon: <Icons.mail size={22} />, label: "Email us", value: CONTACT.email, note: "Best for quotes and artwork files", href: `mailto:${CONTACT.email}` },
  { icon: <Icons.phone size={22} />, label: "Call us", value: CONTACT.phone, note: "Talk to a packaging specialist", href: `tel:${CONTACT.tel}` },
  { icon: <Icons.pin size={22} />, label: "Visit us", value: "Hamilton Township, NJ", note: "520 Vetterlein Ave, 08619, USA" },
];

const help = [
  { icon: <Icons.box />, t: "How to order", d: "Five easy steps to your quote.", href: "/how-to-order/" },
  { icon: <Icons.truck />, t: "Track your order", d: "Live UPS, FedEx and DHL tracking.", href: "/track-your-order/" },
  { icon: <Icons.check />, t: "Sample kits", d: "Hold your box before you order.", href: "/sample-kits/" },
  { icon: <Icons.pen />, t: "Dieline templates", d: "Free templates for your artwork.", href: "/free-dieline-templates/" },
  { icon: <Icons.leaf />, t: "Materials", d: "Compare boards, coatings and finishes.", href: "/materials/" },
  { icon: <Icons.flag />, t: "FAQs", d: "Answers to common questions.", href: "/faqs/" },
];

export default function ContactPage() {
  return (
    <InfoShell>
      {/* Hero: channels + form */}
      <section className="ctc-hero">
        <div className="ip-wrap ctc-hero-grid">
          <div className="ctc-hero-copy">
            <Crumbs items={[{ label: "Contact Us" }]} />
            <p className="ip-eyebrow">Contact us</p>
            <h1>Contact <em>Us</em></h1>
            <p className="ip-lead">
              We’d love to hear from you. Write to us and let us address your inquiries.
            </p>
            <h2 className="ctc-sub">Have any questions or need instant support? Talk to our expert team!</h2>
            <p>We’re here to answer any questions. Our team is always ready to give you the professional packaging support you need.</p>
            <ul className="ctc-channels">
              {channels.map((c) => (
                <li key={c.label}>
                  {c.href ? (
                    <a href={c.href}>
                      <span className="ctc-ch-icon">{c.icon}</span>
                      <span className="ctc-ch-text">
                        <small>{c.label}</small>
                        <strong>{c.value}</strong>
                        <span>{c.note}</span>
                      </span>
                      <span className="ctc-ch-go" aria-hidden="true"><Icons.arrow size={18} /></span>
                    </a>
                  ) : (
                    <div className="ctc-ch-static">
                      <span className="ctc-ch-icon">{c.icon}</span>
                      <span className="ctc-ch-text">
                        <small>{c.label}</small>
                        <strong>{c.value}</strong>
                        <span>{c.note}</span>
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="ctc-form">
            <div className="ctc-form-head">
              <span className="ctc-form-badge"><Icons.mail size={20} /></span>
              <div>
                <h2>Get in Touch With Our Team</h2>
                <p>A packaging specialist will reply by email.</p>
              </div>
            </div>
            <InfoForm
              formName="contact"
              submitLabel="Send Message"
              fields={[
                { type: "radio", name: "topic", label: "What can we help with?", options: ["Get a quote", "Order status", "Samples", "Artwork help", "Other"] },
                { type: "text", name: "name", label: "Name", required: true, autoComplete: "name" },
                { type: "email", name: "email", label: "Email", required: true, autoComplete: "email" },
                { type: "tel", name: "phone", label: "Phone number", autoComplete: "tel" },
                { type: "text", name: "company", label: "Company (optional)", autoComplete: "organization" },
                { type: "textarea", name: "message", label: "Message", required: true, placeholder: "Tell us about your product, box size and quantity..." },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="ctc-trust" aria-label="Why customers choose Pack Legacy">
        <ul className="ip-wrap">
          <li><Stars size={16} /><span><strong>5.0</strong> customer rating</span></li>
          <li><Icons.box size={18} /><span><strong>500+</strong> businesses served</span></li>
          <li><Icons.check size={18} /><span><strong>No</strong> minimum order</span></li>
          <li><Icons.truck size={18} /><span><strong>Free</strong> US shipping</span></li>
        </ul>
      </section>


      {/* Quick help */}
      <section className="ip-section ip-band" aria-labelledby="ctc-help-h">
        <div className="ip-wrap">
          <div className="ctc-help-head">
            <div>
              <p className="ip-eyebrow">Quick help</p>
              <h2 id="ctc-help-h">Find an answer faster.</h2>
            </div>
          </div>
          <ul className="ctc-help">
            {help.map((h) => (
              <li key={h.t}>
                <a href={h.href}>
                  <span className="ip-icon-badge">{h.icon}</span>
                  <span><strong>{h.t}</strong>{h.d}</span>
                  <Icons.arrow size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </InfoShell>
  );
}
