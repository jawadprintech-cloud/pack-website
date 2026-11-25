/* Blog hero visual: an image mosaic of the newest articles (one per topic) plus a looping "writing a post" animation.
   Only posts whose image isn't shared with another post are used, so every picture matches its title. CSS: styles/blog.css */
import { BLOG_CATEGORIES, blogPosts, type BlogCategory } from "@/data/blog-posts";

/** Tag color class per topic (colors in styles/blog.css). */
const topics: Record<BlogCategory, { cls: string }> = {
  "Informative": { cls: "is-informative" },
  "Box Types": { cls: "is-box-types" },
  "Packaging Ideas": { cls: "is-ideas" },
  "Addons": { cls: "is-addons" },
};

export default function BlogHeroStack() {
  const imageUses = new Map<string, number>();
  for (const p of blogPosts) imageUses.set(p.image, (imageUses.get(p.image) || 0) + 1);
  const own = blogPosts.filter((p) => imageUses.get(p.image) === 1);
  const picks = BLOG_CATEGORIES.map((c) => own.find((p) => p.category === c)).filter((p) => p !== undefined).slice(0, 3);

  return (
    <div className="bhs">
      <div className="bhs-mosaic">
        {picks.map((p, i) => (
          <a key={p.slug} className={`bhs-tile${i === 0 ? " bhs-tile-big" : ""}`} href={`/blog/${p.slug}/`}>
            <img src={p.image} alt="" width={600} height={400} loading={i === 0 ? "eager" : "lazy"} />
            <span className="bhs-tile-body">
              <span className={`bhs-tag ${topics[p.category].cls}`}>{p.category}</span>
              <span className="bhs-tile-title">{p.title}</span>
              <span className="bhs-read">Read article <span aria-hidden="true">→</span></span>
            </span>
          </a>
        ))}
      </div>

      {/* Decorative "writing a post" animation: lines type out, the pen follows, then a Published badge pops. */}
      <div className="bhs-writer" aria-hidden="true">
        <div className="bhs-writer-bar">
          <span className="bhs-writer-dots"><i /><i /><i /></span>
          <span className="bhs-writer-file">new-article.md</span>
          <span className="bhs-writer-status"><span className="bhs-writer-live" />Writing</span>
        </div>
        <div className="bhs-writer-body">
          <span className="bhs-line bhs-line-h">How to choose the perfect box</span>
          <span className="bhs-line bhs-line-1" />
          <span className="bhs-line bhs-line-2" />
          <span className="bhs-line bhs-line-3" />
          <span className="bhs-pen">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
          </span>
          <span className="bhs-published">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            Published
          </span>
        </div>
      </div>
    </div>
  );
}
