import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { Crumbs, CtaBand, FaqList, Icons, InfoShell, Stars } from "@/components/info/InfoParts";
import CountUp from "@/components/info/CountUp";
import AboutPillars, { type Pillar } from "@/components/info/AboutPillars";
import InstagramSection from "@/components/home/InstagramSection";
import OrderSection from "@/components/home/OrderSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import AiVisibility from "@/components/info/AiVisibility";
import "@/styles/about.css";

export const metadata: Metadata = withSeo("/about-us/", {
  alternates: { canonical: "/about-us/" },
  title: "About Pack Legacy | Custom Packaging Company",
  description: "Pack Legacy makes premium, affordable custom boxes for 500+ businesses, with no minimums, fast turnaround and free shipping.",
});


const pillars: Pillar[] = [
  { title: "Mission", lead: "Our Mission", text: "Our mission is to make custom packaging better, easier, and more affordable for every brand. We aim to be the driving force behind your business’s success through custom packaging solutions that exceed your expectations.", image: `/frame-3.png` },
  { title: "Vision", lead: "Our Vision", text: "Our vision is to see your products become the representative of your brand. We understand the value of brand identity, which differs for each customer. We make the best effort to ensure your custom packaging meets your specific requirements.", image: `/different-custom-boxes.webp` },
  { title: "Goal", lead: "Our Goal", text: "Our main goal is to be the leader of premium custom packaging–available and affordable–for businesses across various industries. We do not compromise on providing the most exclusive presentation for your customized boxes.", image: `/frame-5.png` },
  { title: "Core Values", lead: "Our Core Values", text: "We are passionate about packaging. Therefore, we value transparency, quality, and integrity in every work effort we provide. With our years of experience and innovative equipment, we deliver only the best results.", image: `/frame-4.png` },
];

// The industries on /industries/, each linked to its own page.
// The industries on /industries/, each linked to its own page.
const industries = [
  { name: "Food Boxes", img: "/custom-food-boxes-pic.webp", href: "/food-boxes/" },
  { name: "Retail Boxes", img: "/retail-boxes-pic.webp", href: "/retail-boxes/" },
  { name: "Bakery Boxes", img: "/custom-bakery-boxes-pic.webp", href: "/bakery-boxes/" },
  { name: "CBD Boxes", img: "/custom-cbd-boxes-pic.webp", href: "/cbd-boxes/" },
  { name: "Gift Boxes", img: "/gift-boxes-pic.webp", href: "/gift-boxes/" },
  { name: "Cosmetic Boxes", img: "/cosmetic-boxes-pic.webp", href: "/cosmetic-boxes/" },
  { name: "Apparel Boxes", img: "/custom-apparel-boxes.webp", href: "/apparel-boxes/" },
  { name: "Jewelry Boxes", img: "/custom-jewelry-boxes-2.webp", href: "/jewelry-boxes/" },
  { name: "Packaging Inserts", img: "/packaging-inserts.webp", href: "/packaging-inserts/" },
];

const faqs = [
  { q: "How do I order custom boxes?", a: <>Fill in our quote form with your box size and quantity, and tell us the material and finishes you want. See <a href="/how-to-order/">how to order</a> for each step.</> },
  { q: "Are mailer boxes safe for shipping?", a: "Yes. Our mailer boxes are made from corrugated cardboard in E-flute (1/16\") or B-flute (1/8\"), both built for shipping." },
  { q: "How do I know if my artwork is printable?", a: "Our design team reviews every file you send, flags anything that needs changing, and advises on file formats and resolution." },
  { q: "Will I receive a proof for my custom boxes?", a: "Yes. You can ask for a 2D proof or a 3D mockup. Production starts only after you approve your digital proof." },
  { q: "Do you have a minimum order quantity policy?", a: "No. We do not have a minimum order quantity policy for custom boxes. You can order as many boxes as you need or as few as one." },
  { q: "What affects my pricing?", a: "Material, size, quantity, color printing, finishing options and add-ons all affect the final price." },
];

export default function AboutPage() {
  return (
    <InfoShell>
      {/* 1. Hero */}
      <section className="abt-hero">
        <div className="ip-wrap abt-hero-grid">
          <div className="abt-hero-copy">
            <Crumbs items={[{ label: "About Us" }]} />
            <p className="ip-eyebrow">About Pack Legacy</p>
            <h1>Unboxing excellence, <em>redefined.</em></h1>
            <p className="ip-lead">We started Pack Legacy to make premium custom boxes flexible, high-quality and affordable, for brands of every size.</p>
            <div className="ip-actions">
              <a className="ip-btn ip-btn-red" href="#quote">Get instant quote <Icons.arrow size={16} /></a>
              <a className="ip-btn ip-btn-outline" href="#story">Our story</a>
            </div>
            <ul className="abt-hero-stats">
              <li><b><CountUp to={500} suffix="+" /></b><span>businesses served</span></li>
              <li><b><CountUp to={3} suffix="+" /></b><span>years</span></li>
              <li><b><CountUp to={5} decimals={1} /></b><span>average rating</span></li>
            </ul>
          </div>

          <div className="abt-collage">
            <div className="abt-collage-main"><img src={`/background-23-1.webp`} alt="" width={575} height={400} /></div>
            <a className="abt-badge" href="/about-us/#reviews" aria-label="5.0 verified reviews: see what clients say">
              <Stars size={13} />
              <strong>5.0</strong>
              <span>Verified reviews</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Story */}
      <section className="ip-section" id="story" aria-labelledby="abt-story-h">
        <div className="ip-wrap abt-story">
          <div className="abt-story-media">
            <img className="abt-story-img" src={`/pl-about-us.webp`} alt="Custom printed boxes made by Pack Legacy" width={650} height={650} loading="lazy" />
            <div className="abt-story-card">
              <span className="abt-story-card-icon"><Icons.box size={20} /></span>
              <p><strong>500+ businesses</strong> of all sizes trust us with their custom boxes.</p>
            </div>
          </div>
          <div>
            <p className="ip-eyebrow">Our story</p>
            <h2 id="abt-story-h">Packaging that represents your brand.</h2>
            <p className="abt-text">
              Pack Legacy partners with more than 500 businesses, from first-time sellers to established teams. We bring premium materials, finishing options and add-ons to every order, with the expertise to make packaging to modern industry standards.
            </p>
            <ul className="abt-ticks">
              <li><Icons.check size={18} /> Premium materials, from kraft to rigid board</li>
              <li><Icons.check size={18} /> Foil, embossing, Spot UV and soft-touch finishes</li>
              <li><Icons.check size={18} /> Custom inserts, ribbons and accessories</li>
            </ul>
            <a className="ip-link" href="/materials/">Explore our materials <Icons.arrow size={16} /></a>
          </div>
        </div>
      </section>

      {/* 4. Pillars (tabs) */}
      <section className="ip-section ip-band" aria-labelledby="abt-pillars-h">
        <div className="ip-wrap">
          <div className="ip-head ip-head-center">
            <p className="ip-eyebrow">What drives us</p>
            <h2 id="abt-pillars-h">Built around your brand.</h2>
          </div>
          <AboutPillars pillars={pillars} />
        </div>
      </section>

      {/* 5. Bento: why us */}
      <section className="ip-section" aria-labelledby="abt-why-h">
        <div className="ip-wrap">
          <div className="ip-head">
            <p className="ip-eyebrow">Why brands choose us</p>
            <h2 id="abt-why-h">Your best packaging partner.</h2>
          </div>
          <div className="abt-bento">
            <div className="abt-b abt-b-hero">
              <span className="abt-b-kicker">No minimum order</span>
              <strong className="abt-b-big">Start with<br />any quantity.</strong>
              <p>Order exactly what you need, then scale up as your brand grows.</p>
              <a className="ip-btn abt-btn-cream ip-btn-sm" href="#quote">Get a free quote <Icons.arrow size={14} /></a>
            </div>
            <div className="abt-b abt-b-photo">
              <img src={`/cat-rigid.webp`} alt="Custom rigid boxes" width={400} height={400} loading="lazy" />
              <span>Premium rigid boxes</span>
            </div>
            <div className="abt-b abt-b-dark">
              <Stars size={18} />
              <strong className="abt-b-big">5.0</strong>
              <p>Average rating from our verified customer reviews.</p>
            </div>
            <div className="abt-b">
              <span className="ip-icon-badge"><Icons.pen /></span>
              <h3>Free design support</h3>
              <p>Help with artwork, sizing and dielines.</p>
            </div>
            <div className="abt-b">
              <span className="ip-icon-badge"><Icons.eye /></span>
              <h3>2D &amp; 3D proofs</h3>
              <p>See your box before production starts.</p>
            </div>
            <div className="abt-b">
              <span className="ip-icon-badge"><Icons.check /></span>
              <h3>No die or plate fees</h3>
              <p>No hidden costs on your quote.</p>
            </div>
            <div className="abt-b abt-b-wide">
              <div>
                <span className="ip-icon-badge"><Icons.truck /></span>
                <h3>Fast turnaround, free US shipping</h3>
                <p>10–12 business days from proof approval to your door, with tracking.</p>
              </div>
              <ol className="abt-mini-timeline" aria-label="Order timeline">
                <li><b>Proof</b><span>approved</span></li>
                <li><b>8–10 days</b><span>production</span></li>
                <li><b>2–3 days</b><span>shipping</span></li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Industries */}
      <section className="ip-section ip-band" aria-labelledby="abt-ind-h">
        <div className="ip-wrap">
          <div className="abt-row-head">
            <div>
              <p className="ip-eyebrow">Industries we serve</p>
              <h2 id="abt-ind-h">Packaging for every shelf.</h2>
            </div>
            <a className="ip-link" href="/custom-boxes/">View all custom boxes <Icons.arrow size={16} /></a>
          </div>
        </div>
        {/* Scrolls right to left on a loop and pauses on hover. Drawn twice for a seamless loop; the copy is hidden from screen readers. */}
        <div className="abt-ind-marquee">
          <div className="abt-ind-track">
            {[0, 1].map((copy) => (
              <ul className="abt-industries" key={copy} aria-hidden={copy === 1 || undefined}>
                {industries.map((d) => (
                  <li key={d.name}>
                    <a href={d.href} tabIndex={copy === 1 ? -1 : undefined}>
                      <img src={d.img} alt="" width={400} height={400} loading="lazy" />
                      <span className="abt-ind-name">{d.name}<Icons.arrow size={16} /></span>
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Sustainability */}
      <section className="ip-section" aria-labelledby="abt-eco-h">
        <div className="ip-wrap">
          <div className="abt-eco">
            <div>
              <p className="ip-eyebrow abt-eyebrow-light">Sustainability</p>
              <h2 id="abt-eco-h">Premium packaging can be responsible too.</h2>
              <p>Recyclable kraft, recycled board, water-based coatings and plastic-free options let you choose packaging that looks premium and is kinder to the planet.</p>
              <ul className="abt-eco-chips">
                {["Recyclable", "Compostable", "Biodegradable", "Plastic free"].map((e) => <li key={e}><Icons.leaf size={16} />{e}</li>)}
              </ul>
              <a className="ip-btn abt-btn-cream" href="/materials/#sustainability">Explore eco materials <Icons.arrow size={16} /></a>
            </div>
            <img src={`/frame-4.png`} alt="Pack Legacy commitment to sustainability" width={467} height={422} loading="lazy" />
          </div>
        </div>
      </section>

      {/* 8. Reviews, shared with the homepage */}
      <div className="plh">
        <ReviewsSection />
      </div>

      {/* 9. AI */}
      <section className="ip-section" aria-labelledby="abt-ai-h">
        <div className="ip-wrap">
          <AiVisibility robot={`/friendly-green-chatbot-mascot.webp`} />
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="ip-section ip-band" aria-labelledby="abt-faq-h">
        <div className="ip-wrap-narrow">
          <div className="ip-head ip-head-center">
            <h2 id="abt-faq-h">Frequently Asked Questions</h2>
            <p className="ip-lead">We’ve answered all the common questions you may have before ordering a custom box.</p>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>

      {/* 11. Quote form and Instagram, shared with the homepage */}
      <div className="plh">
        <OrderSection />
        <InstagramSection />
      </div>
      <CtaBand primary={{ label: "Get a free quote", href: "#quote" }} />
    </InfoShell>
  );
}
