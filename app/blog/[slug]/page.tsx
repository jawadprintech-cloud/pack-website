import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Crumbs, CtaBand, Icons, InfoShell } from "@/components/info/InfoParts";
import { BLOG_AUTHOR, blogPosts, formatDate } from "@/data/blog-posts";
import { blogOverviews } from "@/data/blog-overviews";
import { articles } from "@/data/blog-articles";
import ArticleBody, { articleToc } from "@/components/info/ArticleBody";
import { ArticleToc, AskAi, QuickQuote, ShareArticle } from "@/components/info/ArticleTools";
import { JsonLd, articleSchema, breadcrumbSchema } from "@/lib/schema";
import { absUrl } from "@/lib/site";
import "@/styles/blog.css";

// Article pages. The article text lives in data/blog-articles/<slug>.ts (listed in data/blog-articles/index.ts);
// the hero "Overview:" text lives in data/blog-overviews.ts.
// Layout: hero (text + Overview | image), then three columns: contents/share/author | article | quote form/AI tools.
// Styles: styles/blog.css (.ba-*), built on styles/info-pages.css.

const AUTHOR_ROLE = "Content Strategist & Writer";
const AUTHOR_PHOTO = "/images/sarah-ashley.webp";
/** Google "Preferred sources" page for this site (lets readers see more Pack Legacy articles in Google). */
const PREFERRED_SOURCES = "https://www.google.com/preferences/source?q=packlegacy.com";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  const path = `/blog/${post.slug}/`;
  return withSeo(path, {
    title: `${post.title} | Pack Legacy`,
    description: post.excerpt,
    alternates: { canonical: path },
    openGraph: { type: "article", url: path, title: post.title, description: post.excerpt, images: [post.image], publishedTime: post.date, authors: [BLOG_AUTHOR] },
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();
  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const article = articles[post.slug];
  const toc = article ? articleToc(article) : [];
  const overview = blogOverviews[post.slug];

  const path = `/blog/${post.slug}/`;
  const url = absUrl(path);
  const schema = [
    articleSchema({ title: post.title, path, description: post.excerpt, image: post.image, date: post.date, author: BLOG_AUTHOR }),
    breadcrumbSchema([{ name: "Blog", path: "/blog/" }, { name: post.title, path }]),
  ];

  return (
    <InfoShell>
      <JsonLd data={schema} />
      <article className="ba">
        {/* Hero: breadcrumb, topic, title and Overview box beside the article image */}
        <header className="ba-hero">
          <div className="ip-wrap ba-hero-grid">
            <div className="ba-hero-copy">
              <Crumbs items={[{ label: "Blog", href: "/blog/" }, { label: post.title }]} schema={false} />
              <p className="ip-eyebrow">{post.category}</p>
              <h1>{post.title}</h1>
              {overview && (
                <div className="ba-overview">
                  <p><strong>Overview:</strong></p>
                  <p>{overview}</p>
                </div>
              )}
            </div>
            <figure className="ba-hero-img">
              <img src={post.image} alt={post.title} width={1200} height={750} fetchPriority="high" />
            </figure>
          </div>
        </header>

        <div className="ip-wrap ba-layout">
          {/* Left: table of contents, share, author */}
          <aside className="ba-left" aria-label="Article tools">
            <div className="ba-sticky">
              {toc.length > 2 && <ArticleToc items={toc} />}
              <ShareArticle url={url} title={post.title} />
              <div className="ba-author">
                <p className="ba-side-label">Written by</p>
                <div className="ba-author-row">
                  <img className="ba-avatar" src={AUTHOR_PHOTO} alt={BLOG_AUTHOR} width={40} height={40} loading="lazy" />
                  <span>
                    <strong>{BLOG_AUTHOR}</strong>
                    <small>{AUTHOR_ROLE}</small>
                  </span>
                </div>
                <time className="ba-date" dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
            </div>
          </aside>

          {/* Center: the article */}
          <div className="ba-main">
            {article ? (
              <div className="ip-prose ip-article ba-article">
                <ArticleBody article={article} />
              </div>
            ) : (
              <div className="ip-prose">
                <p className="ip-note">
                  The full article is on its way. In the meantime, our packaging specialists can answer any question about this
                  topic. Email <a href="mailto:sales@packlegacy.com">sales@packlegacy.com</a> or <a href="/contact-us/">contact our team</a>.
                </p>
              </div>
            )}
          </div>

          {/* Right: short quote form, Google preferred source, Ask AI */}
          <aside className="ba-right" aria-label="Get a quote">
            <div className="ba-sticky" id="quote">
              <QuickQuote />
              <a className="ba-card ba-google" href={PREFERRED_SOURCES} target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                Add to Preferred Sources
              </a>
              <AskAi />
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="ip-section ip-band" aria-labelledby="rel-h">
          <div className="ip-wrap">
            <div className="ip-head">
              <p className="ip-eyebrow">Keep reading</p>
              <h2 id="rel-h">More in {post.category}</h2>
            </div>
            <ul className="ip-grid-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <a className="ip-card ip-post ba-related" href={`/blog/${p.slug}/`} style={{ height: "100%" }}>
                    <span className="ip-post-img"><img src={p.image} alt="" width={600} height={375} loading="lazy" /></span>
                    <span className="ip-post-body">
                      <h3>{p.title}</h3>
                      <span className="ip-post-meta"><span>{formatDate(p.date)}</span><Icons.arrow size={16} /></span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <CtaBand />
    </InfoShell>
  );
}
