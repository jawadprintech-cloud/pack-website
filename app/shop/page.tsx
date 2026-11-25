// "All Products" (/shop/): hero, perks, category tabs with every product beside the shared quote form, the box builder,
// Instagram strip and a closing call to action. Data: data/shop.ts (from https://packlegacy.com/shop/).
import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd, breadcrumbSchema } from "@/lib/schema";
import quotePanelMarkup from "@/components/quote/quotePanelMarkup";
import MagneticBoxesScript from "@/components/magnetic/MagneticBoxesScript";
import ShopTabs, { type ShopTab } from "@/components/shop/ShopTabs";
import InstagramSection from "@/components/home/InstagramSection";
import { Builder } from "@/components/home/HomeClient";
import { allProducts } from "@/components/product/ProductPage";
import { shopCategories } from "@/data/shop";
import "@/styles/magnetic-boxes.css";
import "@/styles/custom-boxes.css";
import "@/styles/home.css";
import "@/styles/shop.css";

export const metadata: Metadata = withSeo("/shop/", {
  alternates: { canonical: "/shop/" },
  title: "Packaging Boxes by Industry & Style | Pack Legacy Shop",
  description:
    "Browse every custom packaging box we make: folding cartons, food, rigid, CBD, cosmetic, bakery, gift, retail, display and mailer boxes. No minimum order and free shipping.",
});

// Tab order from the design; categories it doesn't show come last.
const ORDER = ["folding-cartons", "rigid", "mailer", "mylar", "paper-bags", "food", "cosmetic", "bakery", "gift", "retail", "display", "cbd"];
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);

// Resolve each card to a link and image from the product catalog; drop any product that isn't in it.
const tabs: ShopTab[] = [...shopCategories].sort((a, b) => rank(a.id) - rank(b.id)).map((c) => ({
  id: c.id,
  tab: c.tab,
  title: c.title,
  page: c.page,
  cards: c.cards.flatMap((card) => {
    if (card.length === 3) return [{ name: card[0], href: card[1], img: card[2] }];
    const p = allProducts.find((x) => x.slug === card[1]);
    return p?.gallery[0] ? [{ name: card[0], href: `/product/${p.slug}/`, img: p.gallery[0] }] : [];
  }),
}));

const photo = (slug: string) => allProducts.find((p) => p.slug === slug)?.gallery[0] ?? tabs[0].cards[0].img;

const icon = (paths: React.ReactNode, size = 28) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);
const PENCIL = <><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.500 2 22l1.500-5.500Z" /><path d="m15 5 4 4" /></>;
const perks = [
  { title: "Every shape. Every size.", text: "Packaging that fits your product", icon: icon(<><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></>) },
  { title: "A little creative support", text: "Free help bringing your ideas to life", icon: icon(PENCIL) },
  { title: "All the finishing touches", text: "Materials, printing & finishes", icon: icon(<><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 12 10 5 10-5" /><path d="m2 17 10 5 10-5" /></>) },
  { title: "From our hands to yours", text: "Free shipping on your order", icon: icon(<><path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2" /><path d="M14 9h4l4 4v5h-2" /><path d="M9 18h6" /><circle cx="7" cy="18" r="2" /><circle cx="17.500" cy="18" r="2" /></>) },
];

export default function ShopPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Shop", path: "/shop/" }])} />
      <Header />
      <main className="plcb shop" id="main">
        <div className="cb-wrap">
          <nav className="cb-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">All products</span>
          </nav>
        </div>

        <section className="shop-hero" aria-labelledby="shop-h1">
          <div className="cb-wrap shop-hero-grid">
            <div className="shop-hero-copy">
              <p className="shop-eyebrow">Made to fit your brand</p>
              <h1 id="shop-h1">Explore Range of Products We Offer</h1>
              <p>
                We offer a wide variety of <a className="shop-link" href="/custom-boxes/">custom packaging boxes</a> tailored to suit
                different products, industries, and styles. If you don’t see the exact box you need, just share your
                requirements—we’ll make it for you.
              </p>
              <a className="cb-btn cb-btn-red" href="#categories">Find your perfect box</a>
            </div>
            <div className="shop-collage">
              <span className="shop-arc" aria-hidden="true" />
              <img className="shop-photo shop-photo-a" src={photo("roll-end-tuck-top-boxes")} alt="Roll end tuck top box" width={708} height={616} fetchPriority="high" />
              <img className="shop-photo shop-photo-b" src={photo("straight-tuck-end-boxes")} alt="Straight tuck end boxes" width={708} height={616} />
              <p className="shop-note shop-note-a">
                {icon(<path d="M12 2c.8 6.200 3.800 9.200 10 10-6.200.8-9.200 3.800-10 10-.8-6.200-3.800-9.200-10-10 6.200-.8 9.200-3.800 10-10z" />, 24)}
                <span>Small details.<strong>Big impressions.</strong></span>
              </p>
              <p className="shop-note shop-note-b">
                <i>{icon(PENCIL, 17)}</i>
                <span>Made for your product.<strong>Designed for your brand.</strong></span>
              </p>
            </div>
          </div>
        </section>

        <div className="cb-wrap">
          <ul className="shop-perks">
            {perks.map((p) => (
              <li key={p.title}>{p.icon}<span><strong>{p.title}</strong>{p.text}</span></li>
            ))}
          </ul>
        </div>

        <section className="cb-wrap shop-collection" id="categories" aria-labelledby="shop-collection-title">
          <p className="shop-kicker">The packaging collection</p>
          <h2 id="shop-collection-title">Find your kind of box.</h2>
          <ShopTabs tabs={tabs}>
            <div className="plmb cb-quote" id="quote" tabIndex={-1} dangerouslySetInnerHTML={{ __html: quotePanelMarkup }} suppressHydrationWarning />
          </ShopTabs>
        </section>

        {/* Builder banner and Instagram strip shared with the home page (styles from home.css, scoped to .plh). */}
        <div className="plh shop-builder">
          <Builder />
        </div>
        <div className="plh">
          <InstagramSection />
        </div>

        <section className="cb-wrap cb-cta-wrap" aria-labelledby="shop-cta-title">
          <div className="cb-cta shop-cta">
            <div>
              <h2 id="shop-cta-title">Can’t Find the Right Custom Box?</h2>
              <p>
                Need something specific? Fill out the form and our team will create a custom box solution that’s made to fit your
                product — perfectly.
              </p>
            </div>
            <div className="cb-cta-actions">
              <a className="cb-btn cb-btn-red" href="#quote">Get A Quote</a>
              <a className="cb-btn cb-btn-outline" href="/blog/">View All Blogs</a>
            </div>
          </div>
        </section>
      </main>
      <MagneticBoxesScript />
      <Footer />
    </>
  );
}
