import type { Metadata } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/schema";
import { BodySnippets, HeadSnippets, TargetedSnippets } from "@/lib/snippets";
import "./globals.css";
import "../styles/pl-header.css";
import "../styles/pl-topbar.css";
import "../styles/pl-footer.css";
import "../styles/faq-cards.css";
import "../styles/insta-marquee.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Custom Magnetic Closure Boxes | Pack Legacy",
  description:
    "Custom magnetic closure boxes with rigid board, printed wraps, fitted inserts and premium finishes. No minimums, free design support and free US shipping.",
  // Search engines may index the site only when ALLOW_INDEXING=true (see lib/site.ts).
  robots: INDEXABLE
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
    : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { types: { "text/plain": "/llms.txt" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500&family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Libre+Franklin:wght@400;500;600;700&family=Montserrat:wght@500&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Font Awesome icons used by the footer (same as packlegacy.com) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
        <HeadSnippets />
      </head>
      <body>
        <BodySnippets at="body_start" />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        {children}
        <BodySnippets at="body_end" />
        <TargetedSnippets />
      </body>
    </html>
  );
}
