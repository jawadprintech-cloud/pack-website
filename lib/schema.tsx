// schema.org structured data (JSON-LD) builders and the <JsonLd> tag that prints them.
import { BUSINESS, SITE_URL, absUrl } from "@/lib/site";

type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  // Escape "<" so text inside the JSON can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export const ORG_ID = `${SITE_URL}/#organization`;

export function organizationSchema(): Json {
  const a = BUSINESS.address;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: BUSINESS.name,
    url: absUrl("/"),
    logo: absUrl(BUSINESS.logo),
    description: BUSINESS.description,
    email: BUSINESS.email,
    telephone: BUSINESS.phone,
    address: { "@type": "PostalAddress", streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postalCode, addressCountry: a.country },
    contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: BUSINESS.email, telephone: BUSINESS.phone, areaServed: ["US", "CA", "GB", "AU"], availableLanguage: "English" }],
    sameAs: BUSINESS.sameAs,
  };
}

export function websiteSchema(): Json {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: absUrl("/"), name: BUSINESS.name, publisher: { "@id": ORG_ID } };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absUrl(it.path) })),
  };
}

/** FAQPage data. Capped at `max` (default 8, MAX_FAQS in components/FaqCards.tsx) so it matches the FAQ cards the page shows. */
export function faqSchema(items: { q: string; a: string }[], max = 8): Json | null {
  const list = items.filter((f) => f.q && f.a).slice(0, max);
  if (!list.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({ "@type": "Question", name: stripHtml(f.q), acceptedAnswer: { "@type": "Answer", text: stripHtml(f.a) } })),
  };
}

/** Product with the "starting from" estimate shown in the quote panel. */
export function productSchema(p: { name: string; path: string; description: string; images: string[]; category?: string }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url: absUrl(p.path),
    description: stripHtml(p.description),
    image: p.images.slice(0, 4).map((i) => absUrl(i)),
    brand: { "@type": "Brand", name: BUSINESS.name },
    manufacturer: { "@id": ORG_ID },
    ...(p.category ? { category: p.category } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "0.42", // keep in step with the quote form's "Starting From" price (components/quote/quotePanelMarkup.ts)
      availability: "https://schema.org/InStock",
      seller: { "@id": ORG_ID },
      url: absUrl(p.path),
    },
  };
}

export function articleSchema(a: { title: string; path: string; description: string; image: string; date: string; author: string }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.description,
    url: absUrl(a.path),
    mainEntityOfPage: absUrl(a.path),
    image: absUrl(a.image),
    datePublished: a.date,
    dateModified: a.date,
    author: { "@type": "Person", name: a.author },
    publisher: { "@id": ORG_ID },
  };
}
