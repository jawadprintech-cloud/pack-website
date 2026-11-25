// Pages created in the dashboard (data/custom-pages.json).
import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/info/ArticleBody";
import { CtaBand, InfoShell, PageHero } from "@/components/info/InfoParts";
import { customPages } from "@/lib/customPages";
import "@/styles/blog.css";


export function generateStaticParams() {
  return customPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = customPages.find((x) => x.slug === slug);
  if (!p) return {};
  const path = `/${p.slug}/`;
  return withSeo(path, {
    title: `${p.title} | Pack Legacy`,
    description: p.description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title: p.title, description: p.description, images: p.image ? [p.image] : [] },
  });
}

export default async function CustomPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = customPages.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <InfoShell>
      <PageHero crumb={p.title} eyebrow="Pack Legacy" title={<>{p.title}</>} lead={p.lead} />
      <section className="ip-section">
        <div className="ip-wrap ip-prose ip-article">
          {p.image && <img src={p.image} alt={p.title} style={{ maxWidth: "100%", height: "auto", borderRadius: 12 }} />}
          <ArticleBody article={p.blocks} />
        </div>
      </section>
      <CtaBand />
    </InfoShell>
  );
}
