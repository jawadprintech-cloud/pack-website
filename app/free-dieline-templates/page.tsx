import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { CtaBand, Icons, InfoShell, PageHero, QUOTE_HREF } from "@/components/info/InfoParts";
import InfoForm from "@/components/info/InfoForm";
import DielineShowcase from "@/components/info/DielineShowcase";
import "@/styles/dielines.css";

export const metadata: Metadata = withSeo("/free-dieline-templates/", {
  alternates: { canonical: "/free-dieline-templates/" },
  title: "Free Dieline Templates For Custom Boxes | Pack Legacy",
  description: "Download free, tested dieline templates for mailer, shipping, pillow, two-piece, tuck end, auto lock, snap lock, cereal and pizza boxes.",
});


const templates = [
  { name: "Mailer Boxes", file: "Mailer-Box-Dieline", img: "/mailer-box-dieline.webp", text: "Mailer boxes are perfect for e-commerce packaging, offering durability and a self-locking design. These customizable boxes protect products during shipping while enhancing your brand unboxing experience.", product: "/product/corrugated-mailer-boxes/" },
  { name: "Shipping Boxes", file: "Shipping-Box-Dieline", img: "/shipping-box-dieline.webp", text: "Shipping boxes are designed for heavy-duty protection during transit. They are sturdy and versatile to ensure safe delivery of bulk items and fragile products.", product: "/product/corrugated-mailer-boxes/" },
  { name: "Pillow Box", file: "Pillow-Box-Dieline", img: "/pillow-box-dieline.webp", text: "Pillow boxes are ideal for gifts, cosmetics, and small accessories as they are sleek and stylish. Their curved shape and customizable design make them an attractive packaging option for retail.", product: "/product/pillow-boxes/" },
  { name: "Two Piece Box", file: "Two-Piece-Box-Dieline", img: "/two-piece-box-dieline.webp", text: "They come with a separate lid and base. Two-piece boxes are perfect for luxury items. They offer a premium unboxing experience and can be customized with various finishes.", product: "/product/two-piece-rigid-boxes/" },
  { name: "Reverse Tuck End Boxes", file: "Reverse-Tuckend-Box-Dieline", img: "/reverse-tuckend-box-dieline.webp", text: "Reverse tuck end boxes have tucked flaps on opposite sides for easy assembly and secure closure. They’re widely used for cosmetics, pharmaceuticals, and small retail products.", product: "/product/reverse-tuck-end-boxes/" },
  { name: "Straight Tuck End Boxes", file: "Straight-Box-Dieline", img: "/straight-box-dieline.webp", text: "Straight tuck end boxes feature tucks on the same side for a neat finish. They are commonly used for electronics, health products, and luxury packaging due to their clean look.", product: "/product/straight-tuck-end-boxes/" },
  { name: "Auto Lock Bottom Box", file: "Auto-Lock-Box-Dieline", img: "/auto-lock-box-dieline.webp", text: "Auto-lock bottom boxes have a pre-glued base that snaps into place. They are ideal for heavier items needing secure packaging.", product: "/product/auto-lock-bottom-boxes/" },
  { name: "Snap Lock Bottom Box", file: "Snap-Lock-Box-Dieline", img: "/snap-lock-box-dieline.webp", text: "These boxes have interlocking flaps for a secure bottom. Snap lock bottom boxes are great for retail products, providing durability without requiring adhesives.", product: "/product/123-bottom-boxes/" },
  { name: "Cereal Box", file: "Cereal-Box-Dieline", img: "/cereal-box-dieline.webp", text: "Cereal boxes are lightweight yet sturdy. They are made from food-grade materials, offering enough space for branding and nutritional information.", product: "/product/cereal-boxes/" },
  { name: "Pizza Box", file: "Pizza-Box-Dieline", img: "/pizza-box-dieline.webp", text: "Corrugated pizza boxes retain heat and prevent sogginess. They offer enough surface space for branding and ensure safe food delivery.", product: "/product/pizza-boxes/" },
];

export default function DielinesPage() {
  return (
    <InfoShell>
      <PageHero
        crumb="Free Dieline Templates"
        eyebrow="Free dieline templates"
        title={<>Get Free Dieline Templates <em>For Custom boxes</em></>}
        lead="Dieline templates play an important role in manufacturing your custom packaging boxes. Download your desired box dieline template and start designing your own box."
        media={<DielineShowcase />}
      >
        <div className="ip-form-card" style={{ marginTop: 28, maxWidth: 680 }}>
          <h2>Get Free Dieline</h2>
          <p>Choose a style and tell us your size. We will email a dieline made for your box.</p>
          <InfoForm
            formName="dieline"
            submitLabel="Get a Dieline"
            fields={[
              { type: "email", name: "email", label: "Email", required: true, autoComplete: "email" },
              { type: "select", name: "dieline", label: "Select dieline", required: true, options: templates.map((t) => t.name) },
              { type: "textarea", name: "message", label: "Message", placeholder: "Box size (L × W × D), unit, and anything else..." },
            ]}
          />
        </div>
      </PageHero>

      <section className="ip-section" aria-labelledby="dl-h">
        <div className="ip-wrap">
          <div className="ip-head">
            <p className="ip-eyebrow">Download</p>
            <h2 id="dl-h">Download Free Dieline Templates</h2>
            <p className="ip-lead">Please note: All of the dieline templates given below are accurate and tested by our design experts.</p>
          </div>
          <ul className="ip-grid-3">
            {templates.map((t) => (
              <li className="ip-card ip-card-hover ip-die" key={t.name}>
                <div className="ip-die-img"><img src={t.img} alt={`${t.name} dieline template`} width={480} height={360} loading="lazy" /></div>
                <div className="ip-die-body">
                  <span className="ip-die-tag">PDF template</span>
                  <h3>{t.name} Template</h3>
                  <p>{t.text}</p>
                  <div className="ip-die-actions">
                    <a className="ip-btn ip-btn-green ip-btn-sm" href={`${t.file}.pdf`} download>
                      <Icons.download size={16} /> Download
                    </a>
                    <a className="ip-btn ip-btn-outline ip-btn-sm" href={t.product}>View box</a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ip-section ip-band" aria-labelledby="tips-h">
        <div className="ip-wrap">
          <div className="ip-head ip-head-center">
            <p className="ip-eyebrow">Artwork tips</p>
            <h2 id="tips-h">Get your file print-ready.</h2>
          </div>
          <div className="ip-grid-4">
            {[
              { t: "Use CMYK", d: "Set your document to CMYK so printed colors match what you expect." },
              { t: "300 DPI or more", d: "Keep images at 300 DPI or higher to avoid blurry print." },
              { t: "Keep the bleed", d: "Extend artwork past the cut line so no white edges show." },
              { t: "Mind the safe zone", d: "Keep text and logos inside the safe line, away from folds." },
            ].map((c) => (
              <div className="ip-card ip-value" key={c.t}>
                <span className="ip-icon-badge"><Icons.check /></span>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Want us to handle the design?" text="Our design support is free. Send your logo and ideas, and we will place them on the dieline for you." primary={{ label: "Get a free quote", href: QUOTE_HREF }} />
    </InfoShell>
  );
}
