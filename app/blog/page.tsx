import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { CtaBand, InfoShell, PageHero } from "@/components/info/InfoParts";
import BlogGrid from "@/components/info/BlogGrid";
import BlogSearch from "@/components/info/BlogSearch";
import BlogHeroStack from "@/components/info/BlogHeroStack";
import "@/styles/blog.css";
import { blogPosts } from "@/data/blog-posts";

export const metadata: Metadata = withSeo("/blog/", {
  alternates: { canonical: "/blog/" },
  title: "Packaging Blog: Ideas, Guides & Insights | Pack Legacy",
  description: "Explore packaging ideas, box guides, finishing tips and industry insights from the Pack Legacy team.",
});

export default function BlogPage() {
  return (
    <InfoShell>
      <PageHero
        crumb="Blog"
        eyebrow="Pack Legacy Blog"
        title={<>Explore packaging <em>ideas, news</em> and insights.</>}
        lead="Guides on box styles, materials and finishes, plus packaging ideas and trends to help your brand stand out on the shelf and at the doorstep."
        media={<BlogHeroStack />}
      >
        <p className="ip-hero-meta">
          <span><strong>{blogPosts.length}</strong> articles</span>
          <span><strong>4</strong> topics</span>
          <span>New guides every month</span>
        </p>
        <BlogSearch />
      </PageHero>
      <section className="ip-section" id="blog-articles" aria-label="Articles">
        <div className="ip-wrap">
          <BlogGrid />
        </div>
      </section>
      <CtaBand title="Turn an idea into your next box." text="Found something you like? Send us your idea and we will help you choose the style, material and finish." />
    </InfoShell>
  );
}
