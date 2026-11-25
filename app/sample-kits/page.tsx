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

const kits: Kit[] = [
  {
    id: "plain",
    name: "Plain Sample",
    price: 50,
    image: `${IMG}Plain%20Sample/Plan-Sample.webp`,
    text: "A blank, unprinted sample of your box style.",
    checks: ["Material", "Size and fit", "Structure"],
    best: "Testing the fit and feel before you design.",
  },
  {
    id: "random",
    name: "Random Sample",
    price: 20,
    image: `${IMG}Random%20Sample/Random-Sample.webp`,
    text: "A printed box from one of our past jobs.",
    checks: ["CMYK and Pantone print", "Materials", "Finish quality"],
    best: "Seeing our print quality at the lowest cost.",
    tag: "Lowest price",
  },
  {
    id: "pre-production",
    name: "Pre Production Sample",
    price: 100,
    image: `${IMG}Pre%20Production%20Sample/Pre-Production.webp`,
    text: "A real sample of the exact packaging you plan to order.",
    checks: ["Your artwork", "Your colors and finishes", "Exact production material"],
    best: "Approving everything before a full run.",
    tag: "Most accurate",
  },
];

const Y = <span className="smp-yes"><Icons.check size={16} /><span className="ip-sr">Yes</span></span>;
const N = <span className="smp-no" aria-label="No">—</span>;
const rows: [string, React.ReactNode, React.ReactNode, React.ReactNode][] = [
  ["Format", "Physical prototype", "Physical prototype", "Physical prototype"],
  ["Accurate color", N, Y, Y],
  ["Colors supported", "None", "CMYK, Pantone", "CMYK, Pantone, White ink"],
  ["Offset printing", N, Y, Y],
  ["Exact production material", Y, Y, Y],
  ["Your own artwork", N, N, Y],
  ["Cost (USD)", "From $50", "From $20", "From $100"],
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
  { q: "Can I order more than one sample?", a: "Yes. You can order several samples. Send a separate request for each one." },
  { q: "Can I get a quote before placing an order?", a: <>Yes. Request a free quote any time through our <a href="/get-a-quote/">quote form</a>.</> },
  { q: "How long does it take to receive a sample?", a: "Samples usually ship within 3 to 5 business days." },
  { q: "Do you also offer samples for mylar bags?", a: "Yes. Samples are available for Mylar bags as well as boxes." },
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
            <h1>Hold your box <em>before you order it.</em></h1>
            <p className="ip-lead">
              Check the material, print and fit in your hands before a full run of <a className="ip-link" href="/custom-boxes/">custom boxes</a>. Three sample types, starting from $20.
            </p>
            <div className="ip-actions">
              <a className="ip-btn ip-btn-red" href="#choose">Choose a sample <Icons.arrow size={16} /></a>
              <a className="ip-btn ip-btn-outline" href="#compare">Compare samples</a>
            </div>
            <ul className="smp-facts">
              <li><Icons.box size={18} /><span><strong>From $20</strong> per sample</span></li>
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
            <h2 id="smp-choose-h">Choose your sample.</h2>
            <p className="ip-lead">Select a sample type, then tell us where to send it.</p>
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
            <h2 id="smp-faq-h">Sample questions, answered.</h2>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>

      <CtaBand title="Skip the sample?" text="Go straight to a free quote with a digital proof. You approve every detail before production starts." />
    </InfoShell>
  );
}
