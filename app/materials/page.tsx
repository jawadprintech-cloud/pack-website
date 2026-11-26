import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { CtaBand, Icons, InfoShell, PageHero, QUOTE_HREF } from "@/components/info/InfoParts";
import { materialGroups } from "@/data/materials";

export const metadata: Metadata = withSeo("/materials/", {
  alternates: { canonical: "/materials/" },
  title: "Packaging Materials Guide | Compare & Select with Expert Help | Pack Legacy",
  description: "Browse paperboard, corrugated, rigid, insert, bag and Mylar materials, plus coatings, finishes and printing options for custom packaging.",
});

const total = materialGroups.reduce((n, g) => n + g.items.length, 0);

export default function MaterialsPage() {
  return (
    <InfoShell>
      <PageHero
        crumb="Materials"
        eyebrow="Get Our Professional Support"
        title={<>Materials & <em>Options Library</em></>}
        lead="Pack Legacy only provides top-notch quality packaging materials. Browse our gallery for material options and select the one that best suits your packaging needs."
        media={<img src="/material-boards.webp" alt="Grey chipboard, white board, kraft and holographic material samples" width={640} height={430} style={{ aspectRatio: "640 / 430", objectFit: "cover", objectPosition: "97% 50%" }} />}
      >
        <div className="ip-actions">
          <a className="ip-btn ip-btn-red" href={QUOTE_HREF}>Get Instant Quote <Icons.arrow size={16} /></a>
          <a className="ip-btn ip-btn-outline" href="/sample-kits/">Order a sample kit</a>
        </div>
        <p className="ip-hero-meta">
          <span><strong>{total}</strong> materials and options</span>
          <span><strong>{materialGroups.length}</strong> categories</span>
        </p>
      </PageHero>

      <section className="ip-section" aria-labelledby="mat-intro-h">
        <div className="ip-wrap">
          <div className="ip-head ip-head-center">
            <h2 id="mat-intro-h">The Ultimate Solutions to Create Perfect Custom Packaging</h2>
            <p className="ip-lead">We are dedicated to providing the best solutions for creating perfect custom packaging. With years of experience in the packaging industry, we have listed the materials and options for our customers in this gallery. Each material and option has a brief explanation to help customers make the right decisions when ordering and customizing their packaging boxes.</p>
          </div>
        </div>
      </section>

      <nav className="ip-chipnav" aria-label="Material categories">
        <ul className="ip-wrap">
          {materialGroups.map((g) => (
            <li key={g.id}><a href={`#${g.id}`}>{g.title.replace(/ Materials$/, "")}</a></li>
          ))}
        </ul>
      </nav>

      <div className="ip-wrap">
        {materialGroups.map((g) => (
          <section className="ip-mat-group" id={g.id} key={g.id} aria-labelledby={`${g.id}-h`}>
            <header>
              <div>
                <p className="ip-mat-count">{g.items.length} options</p>
                <h2 id={`${g.id}-h`}>{g.title}</h2>
              </div>
            </header>
            <ul className="ip-grid-4">
              {g.items.map((it) => (
                <li className="ip-card ip-card-hover ip-mat" key={it.name}>
                  <div className="ip-mat-img"><img src={it.image} alt={it.name} width={480} height={320} loading="lazy" /></div>
                  <div className="ip-mat-body">
                    <h3>{it.name}</h3>
                    <p>{it.text}</p>
                    {it.tag && <span className="ip-mat-tag">{it.tag}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <CtaBand
        title="Need more guidance?"
        text="We’re always ready to assist you! Get in touch with us now!"
        primary={{ label: "Contact Us", href: "/contact-us/" }}
        secondary={{ label: "Get a quote", href: QUOTE_HREF }}
      />
    </InfoShell>
  );
}
