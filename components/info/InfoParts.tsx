// Pieces shared by the company, help and policy pages. Styles: styles/info-pages.css (scoped to .plip).
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqCards from "@/components/FaqCards";
import { absUrl } from "@/lib/site";
import { JsonLd } from "@/lib/schema";
import "@/styles/info-pages.css";

export const CONTACT = {
  email: "sales@packlegacy.com",
  phone: "+1 (424) 321-6460",
  tel: "+14243216460",
  address: "520 Vetterlein Ave, Hamilton Township, NJ 08619, USA",
};

export const QUOTE_HREF = "/get-a-quote/";

type IconProps = { size?: number };
const svg = (paths: ReactNode) =>
  function Icon({ size = 20 }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paths}
      </svg>
    );
  };

export const Icons = {
  arrow: svg(<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>),
  check: svg(<path d="M20 6 9 17l-5-5" />),
  mail: svg(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>),
  phone: svg(<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />),
  pin: svg(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>),
  box: svg(<><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></>),
  truck: svg(<><path d="M14 18V6a1 1 0 0 0-1-1H4" /><path d="M14 9h4l4 4v5h-2" /><path d="M2 9h6M3 13h5" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M9 18h6" /></>),
  pen: svg(<><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></>),
  leaf: svg(<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" /><path d="M2 21c0-3 1.9-5.4 5.1-6" /></>),
  target: svg(<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>),
  eye: svg(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>),
  heart: svg(<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />),
  flag: svg(<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22v-7" /></>),
  download: svg(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>),
  search: svg(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>),
  clock: svg(<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
  shield: svg(<><path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" /></>),
  external: svg(<><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>),
};

export const Star = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
);

export const Stars = ({ n = 5, size }: { n?: number; size?: number }) => (
  <span className="ip-stars" role="img" aria-label={`${n} out of 5 stars`}>
    {Array.from({ length: n }, (_, i) => <Star key={i} size={size} />)}
  </span>
);

/** Page frame: site header, scoped main and footer. */
export function InfoShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="plip" id="main">{children}</main>
      <Footer />
    </>
  );
}

export function Crumbs({ items, schema: withSchema = true }: { items: { label: string; href?: string }[]; schema?: boolean }) {
  // BreadcrumbList schema; the current page (no href) is the last item and needs no URL.
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: "Home", href: "/" }, ...items].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absUrl(c.href) } : {}),
    })),
  };
  return (
    <nav className="ip-crumbs" aria-label="Breadcrumb">
      {withSchema && <JsonLd data={schema} />}
      <a href="/">Home</a>
      {items.map((c) => (
        <span key={c.label} style={{ display: "contents" }}>
          <span aria-hidden="true">/</span>
          {c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({
  crumb,
  eyebrow,
  title,
  lead,
  children,
  media,
}: {
  crumb: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  media?: ReactNode;
}) {
  const copy = (
    <div className="ip-hero-copy">
      <Crumbs items={[{ label: crumb }]} />
      <p className="ip-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {lead && <p className="ip-lead">{lead}</p>}
      {children}
    </div>
  );
  return (
    <section className="ip-hero">
      <div className={`ip-wrap ${media ? "ip-hero-grid" : ""}`}>
        {media ? copy : <div className="ip-hero-solo">{copy}</div>}
        {media && <div className="ip-hero-media">{media}</div>}
      </div>
    </section>
  );
}

const defaultPerks = ["No minimum order", "Free design support", "Free US shipping"];
export function Perks({ items = defaultPerks }: { items?: string[] }) {
  return (
    <ul className="ip-perks">
      {items.map((p) => (
        <li key={p}><Icons.check size={16} />{p}</li>
      ))}
    </ul>
  );
}

export function CtaBand({
  eyebrow,
  title = "Ready to design your custom boxes?",
  text = "Tell us your size, quantity and style. A packaging specialist will send you a free quote, with design help if you need it.",
  primary = { label: "Get a free quote", href: QUOTE_HREF },
  secondary = { label: "Talk to our team", href: "/contact-us/" },
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string } | null;
}) {
  return (
    <section className="ip-cta">
      <div className="ip-wrap">
        <div className="ip-cta-box">
          <div>
            {eyebrow && <p className="ip-eyebrow ip-cta-eyebrow">{eyebrow}</p>}
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <div className="ip-actions">
            <a className="ip-btn ip-btn-red" href={primary.href}>{primary.label} <Icons.arrow size={16} /></a>
            {secondary && <a className="ip-btn ip-btn-outline" href={secondary.href}>{secondary.label}</a>}
          </div>
        </div>
      </div>
    </section>
  );
}

export type PolicySection = { id: string; title: string; body: ReactNode };

/** Long-form policy text with a numbered table of contents. */
export function PolicyPage({ crumb, title, lead, updated, sections }: { crumb: string; title: ReactNode; lead: ReactNode; updated?: string; sections: PolicySection[] }) {
  return (
    <InfoShell>
      <PageHero crumb={crumb} eyebrow="Policies" title={title} lead={lead}>
        {updated && (
          <p className="ip-hero-meta">
            <span>Last updated <strong>{updated}</strong></span>
            <span>Questions? <a className="ip-link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></span>
          </p>
        )}
      </PageHero>
      <div className="ip-section">
        <div className="ip-wrap ip-policy">
          <nav className="ip-toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
              {sections.map((s) => (
                <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
              ))}
            </ol>
          </nav>
          <div className="ip-prose">
            {sections.map((s) => (
              <section id={s.id} key={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}>{s.title}</h2>
                {s.body}
              </section>
            ))}
            <div className="ip-policy-contact">
              <h2>Contact us</h2>
              <p>If you have a question about this policy, our team is happy to help.</p>
              <ul>
                <li>Email: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                <li>Phone: <a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a></li>
                <li>Address: {CONTACT.address}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </InfoShell>
  );
}

/** FAQ list: renders the site-wide FAQ cards (components/FaqCards.tsx) so every page uses one FAQ design.
 *  Shows every question passed in. `openFirst` is kept for older callers; cards always start open. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FaqList({ items, openFirst }: { items: { q: string; a: ReactNode }[]; openFirst?: boolean }) {
  return <FaqCards items={items} max={items.length} />;
}

/** FAQPage structured data for search engines. */
export function FaqSchema({ items }: { items: { q: string; text: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.text } })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
