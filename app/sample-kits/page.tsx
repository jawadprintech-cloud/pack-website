import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { Crumbs, FaqList, InfoShell } from "@/components/info/InfoParts";
import SampleChooser, { type Kit } from "@/components/info/SampleChooser";
import "@/styles/sample-kits.css";

export const metadata: Metadata = withSeo("/sample-kits/", {
  alternates: { canonical: "/sample-kits/" },
  title: "Custom Sample Kits | Pack Legacy",
  description: "Order a plain, random or pre-production sample to check box quality, material, size and print before you place a full order.",
});

// Page text is exactly the content of "Sample kits.pdf": heading, intro, the three samples, and the FAQs.
// Photos live in public/categories/Sample Kits/<name>/.
const IMG = "/categories/Sample%20Kits/";

const kits: Kit[] = [
  {
    id: "plain",
    name: "Plain Sample",
    price: 70,
    image: `${IMG}Plain%20Sample/Plain-Sample.webp`,
    text: "A blank sample of your custom boxes and packaging in your desired stock and box and packaging style.",
    checks: ["Material", "Dimension", "Structure"],
    best: "Testing Packaging Quality & Fit Before You Order in Bulk",
  },
  {
    id: "random",
    name: "Random Sample",
    price: 50,
    image: `${IMG}Random%20Sample/Random-Sample-Boxes.webp`,
    text: "A random sample of a custom box or packaging from our past jobs",
    checks: ["Print Quality", "Structure", "Finishes", "Material", "Dimension"],
  },
  {
    id: "pre-production",
    name: "Pre-Production Sample",
    price: 100,
    image: `${IMG}Pre%20Production%20Sample/Pre-Production-Sample.webp`,
    text: "A real sample of your custom boxes and packaging to check its quality before a bulk order.",
    checks: ["Material", "Dimension", "Structure", "Your Artwork", "Colors & Finishes", "Print Quality"],
  },
];
const LOWEST = Math.min(...kits.map((k) => k.price));

const faqs = [
  { q: "Can I order more than one sample?", a: "Absolutely! You can order more than one sample for your box. Simply fill out a sample quote form and submit it, and our agent will reach out to you soon with your quotation!" },
  { q: "Can I get a quote before placing an order?", a: <>Yes. Simply fill out the <a href="/get-a-quote/">quote form</a>, and we will send you a custom quote for your order before you place an order with us!</> },
  { q: "When will I receive the sample of my order?", a: "Generally, we take 3-5 business days to ship the sample of your packaging boxes." },
  { q: "Do you also offer samples for mylar bags?", a: <>Yes. We deal in custom packaging and boxes. Whether you need a sample for <a href="/custom-mylar-bags/">mylar bags</a> or <a href="/product/corrugated-mailer-boxes/">mailer boxes</a>, we can provide you with both.</> },
];

export default function SampleKitsPage() {
  return (
    <InfoShell>
      {/* Hero */}
      <section className="smp-hero">
        <div className="ip-wrap smp-hero-grid">
          <div className="smp-hero-copy">
            <Crumbs items={[{ label: "Sample Kits" }]} />
            <h1>Be Confident <em>Before You Order in Bulk</em></h1>
            <p className="ip-lead">
              Order with confidence before committing to bulk production. Get a <a className="ip-link" href="/custom-boxes/">custom packaging</a> sample to experience the material, print quality, and product fit firsthand. <strong>Samples start at just ${LOWEST}.</strong>
            </p>
          </div>
          {/* Photos of the three samples: Random Sample large, the other two stacked beside it. Each links to the picker below. */}
          <div className="smp-bento">
            {[kits[1], kits[0], kits[2]].map((k, i) => (
              <a key={k.id} href="#choose" className={`smp-tile ${i === 0 ? "smp-tile-big" : ""}`}>
                <img src={k.image} alt={k.name} width={500} height={400} />
                <span className="smp-tile-label">
                  <span>{k.name}</span>
                  <strong>From ${k.price}</strong>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Samples + request form */}
      <section className="ip-section" id="choose" aria-labelledby="smp-choose-h">
        <div className="ip-wrap">
          <div className="ip-head">
            <h2 id="smp-choose-h">Choose Your Packaging Sample</h2>
            <p className="ip-lead">Select a packaging sample that suits your needs best:</p>
          </div>
          <SampleChooser kits={kits} />
        </div>
      </section>

      {/* FAQ */}
      <section className="ip-section" aria-labelledby="smp-faq-h">
        <div className="ip-wrap-narrow">
          <div className="ip-head ip-head-center">
            <h2 id="smp-faq-h">Frequently Asked Questions</h2>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>
    </InfoShell>
  );
}
