import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { Crumbs, CtaBand, FaqList, Icons, InfoShell } from "@/components/info/InfoParts";
import SampleChooser, { type Kit } from "@/components/info/SampleChooser";
import "@/styles/sample-kits.css";

export const metadata: Metadata = withSeo("/sample-kits/", {
  alternates: { canonical: "/sample-kits/" },
  title: "Custom Sample Kits | Pack Legacy",
  description: "Order a plain, random or pre-production sample to check box quality, material, size and print before you place a full order.",
});

// Photos live in public/categories/Sample Kits/<name>/ (Rigid Boxes uses the Magnetic Closure Boxes photo).
const IMG = "/categories/Sample%20Kits/";

// Names, prices, text and checklists from "Sample kits.pdf".
const kits: Kit[] = [
  {
    id: "plain",
    name: "Plain Sample",
    price: 70,
    image: `${IMG}Plain%20Sample/Plan-Sample.webp`,
    text: "A blank sample of your custom boxes and packaging in your desired stock and box and packaging style.",
    checks: ["Material", "Dimension", "Structure"],
    best: "Testing Packaging Quality & Fit Before You Order in Bulk",
  },
  {
    id: "random",
    name: "Random Sample",
    price: 50,
    image: `${IMG}Random%20Sample/Random-Sample.webp`,
    text: "A random sample of a custom box or packaging from our past jobs",
    checks: ["Print Quality", "Structure", "Finishes", "Material", "Dimension"],
    tag: "Lowest price",
  },
  {
    id: "pre-production",
    name: "Pre-Production Sample",
    price: 100,
    image: `${IMG}Pre%20Production%20Sample/Pre-Production.webp`,
    text: "A real sample of your custom boxes and packaging to check its quality before a bulk order.",
    checks: ["Material", "Dimension", "Structure", "Your Artwork", "Colors & Finishes", "Print Quality"],
    tag: "Most accurate",
  },
];
const LOWEST = Math.min(...kits.map((k) => k.price));

const Y = <span className="smp-yes"><Icons.check size={16} /><span className="ip-sr">Yes</span></span>;
const N = <span className="smp-no" aria-label="No">—</span>;
const rows: [string, React.ReactNode, React.ReactNode, React.ReactNode][] = [
  ["Format", "Physical prototype", "Physical prototype", "Physical prototype"],
  ["Accurate color", N, Y, Y],
  ["Colors supported", "None", "CMYK, Pantone", "CMYK, Pantone, White ink"],
  ["Offset printing", N, Y, Y],
  ["Exact production material", Y, Y, Y],
  ["Your own artwork", N, N, Y],
  ["Cost (USD)", ...kits.map((k) => `From $${k.price}`)] as [string, string, string, string],
];

const steps = [
  { icon: <Icons.box />, title: "Choose a sample", text: "Pick the sample type that matches what you want to check." },
  { icon: <Icons.mail />, title: "We confirm by email", text: "A packaging specialist emails you to confirm your sample details." },
  { icon: <Icons.truck />, title: "Ships in 3–5 days", text: "Samples usually ship within 3 to 5 business days." },
  { icon: <Icons.check />, title: "Order with confidence", text: "Happy with it? Place your full order, with no minimum quantity." },
];

const products = [
  { name: "Mailer Boxes", image: `${IMG}Mailer%20Boxes/Custom-Mailer-Box.webp`, href: "/product/corrugated-mailer-boxes/" },
  { name: "Display Boxes", image: `${IMG}Display%20Boxes/Display-Mailer-Boxes.webp`, href: "/product/display-mailer-boxes/" },
  { name: "Rigid Boxes", image: "/categories/Rigid%20Boxes/Magnetic%20Closure%20Boxes/Custom-Magnetic-Closure-Rigid.webp", href: "/product/magnetic-closure-boxes/" },
  { name: "Folding Cartons", image: `${IMG}Folding%20Cartons/Printed-Folding-Cartons.webp`, href: "/product/straight-tuck-end-boxes/" },
];

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
            <p className="ip-eyebrow">Sample kits</p>
            <h1>Be Confident <em>Before You Order in Bulk</em></h1>
            <p className="ip-lead">
              Order with confidence before committing to bulk production. Get a <a className="ip-link" href="/custom-boxes/">custom packaging</a> sample to experience the material, print quality, and product fit firsthand. <strong>Samples start at just ${LOWEST}.</strong>
            </p>
            <div className="ip-actions">
              <a className="ip-btn ip-btn-red" href="#choose">Choose a sample <Icons.arrow size={16} /></a>
              <a className="ip-btn ip-btn-outline" href="#compare">Compare samples</a>
            </div>
            <ul className="smp-facts">
              <li><Icons.box size={18} /><span><strong>From ${LOWEST}</strong> per sample</span></li>
              <li><Icons.truck size={18} /><span><strong>3–5 days</strong> to ship</span></li>
              <li><Icons.check size={18} /><span><strong>Mylar bags</strong> too</span></li>
            </ul>
          </div>
          {/* Kit photos: Random Sample large, the other two stacked beside it. Each links to the picker below. */}
          <div className="smp-bento">
            {[kits[1], kits[0], kits[2]].map((k, i) => (
              <a key={k.id} href="#choose" className={`smp-tile ${i === 0 ? "smp-tile-big" : ""}`}>
                <img src={k.image} alt={k.name} width={500} height={400} />
                <span className="smp-tile-label">
                  <span>{k.name}</span>
                  <strong>from ${k.price}</strong>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Chooser + form */}
      <section className="ip-section" id="choose" aria-labelledby="smp-choose-h">
        <div className="ip-wrap">
          <div className="ip-head">
            <p className="ip-eyebrow">Step 1 · Pick one</p>
            <h2 id="smp-choose-h">Choose Your Packaging Sample</h2>
            <p className="ip-lead">Select a packaging sample that suits your needs best:</p>
          </div>
          <SampleChooser kits={kits} />
        </div>
      </section>

      {/* How it works */}
      <section className="ip-section ip-band" aria-labelledby="smp-how-h">
        <div className="ip-wrap">
          <div className="ip-head ip-head-center">
            <p className="ip-eyebrow">How it works</p>
            <h2 id="smp-how-h">From request to your hands.</h2>
          </div>
          <ol className="smp-how">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="smp-how-icon">{s.icon}<b>{i + 1}</b></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Comparison */}
      <section className="ip-section" id="compare" aria-labelledby="smp-compare-h">
        <div className="ip-wrap">
          <div className="ip-head">
            <p className="ip-eyebrow">Compare</p>
            <h2 id="smp-compare-h">Which sample is right for you?</h2>
          </div>
          <div className="smp-table-wrap">
            <table className="smp-table">
              <thead>
                <tr>
                  <th scope="col"><span className="ip-sr">Specification</span></th>
                  {kits.map((k) => (
                    <th scope="col" key={k.id}>
                      <img src={k.image} alt="" width={120} height={96} loading="lazy" />
                      {k.name}
                      <span>from ${k.price}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, ...cells]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {cells.map((c, i) => <td key={i}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="ip-section ip-band" aria-labelledby="smp-prod-h">
        <div className="ip-wrap">
          <div className="smp-prod-head">
            <div>
              <p className="ip-eyebrow">Explore our products</p>
              <h2 id="smp-prod-h">Popular boxes to sample.</h2>
            </div>
            <a className="ip-link" href="/custom-boxes/">More products <Icons.arrow size={16} /></a>
          </div>
          <ul className="smp-prods">
            {products.map((p) => (
              <li key={p.name}>
                <a href={p.href}>
                  <span className="smp-prod-img"><img src={p.image} alt={p.name} width={400} height={400} loading="lazy" /></span>
                  <span className="smp-prod-name">{p.name}<Icons.arrow size={16} /></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="ip-section" aria-labelledby="smp-faq-h">
        <div className="ip-wrap-narrow">
          <div className="ip-head ip-head-center">
            <p className="ip-eyebrow">FAQs</p>
            <h2 id="smp-faq-h">Frequently Asked Questions</h2>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>

      <CtaBand title="Skip the sample?" text="Go straight to a free quote with a digital proof. You approve every detail before production starts." />
    </InfoShell>
  );
}
