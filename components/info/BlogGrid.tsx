"use client";

// Blog list. The category pills and /blog/?category=… URLs filter it by topic.
import { useEffect, useState } from "react";
import { BLOG_CATEGORY_EVENT, BLOG_SEARCH_EVENT } from "@/components/info/BlogSearch";
import { BLOG_AUTHOR, BLOG_CATEGORIES, blogPosts, categorySlug, formatDate, type BlogCategory } from "@/data/blog-posts";

const PAGE = 12;

export default function BlogGrid() {
  const [cat, setCat] = useState<BlogCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);

  // Links like /blog/?category=box-types open the list filtered to that topic.
  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("category");
      setQuery(params.get("q") || "");
      setCat(BLOG_CATEGORIES.find((c) => categorySlug(c) === slug) || "All");
      setShown(PAGE);
    };
    // Typing in the hero search bar (BlogSearch).
    const onSearch = (e: Event) => {
      setQuery((e as CustomEvent<string>).detail);
      setShown(PAGE);
    };
    const onCategory = (e: Event) => {
      setCat((e as CustomEvent<BlogCategory | "All">).detail);
      setShown(PAGE);
    };
    read();
    window.addEventListener("popstate", read);
    window.addEventListener(BLOG_SEARCH_EVENT, onSearch);
    window.addEventListener(BLOG_CATEGORY_EVENT, onCategory);
    return () => {
      window.removeEventListener("popstate", read);
      window.removeEventListener(BLOG_SEARCH_EVENT, onSearch);
      window.removeEventListener(BLOG_CATEGORY_EVENT, onCategory);
    };
  }, []);

  // Every typed word must appear in the title, excerpt or topic. A search looks through all topics.
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const list = blogPosts.filter((p) => {
    if (cat !== "All" && p.category !== cat) return false;
    if (!words.length) return true;
    const text = `${p.title} ${p.excerpt} ${p.category}`.toLowerCase();
    return words.every((w) => text.includes(w));
  });
  // The newest post gets a large card when nothing is filtered.
  const featured = cat === "All" && !words.length ? list[0] : undefined;
  const rest = (featured ? list.slice(1) : list).slice(0, shown);
  const total = featured ? list.length - 1 : list.length;

  return (
    <>
      <p className={words.length ? "bsr-count" : "ip-sr"} role="status">
        {words.length > 0 && <><strong>{list.length}</strong> {list.length === 1 ? "article" : "articles"} for “{query.trim()}”</>}
      </p>

      {featured && (
        <a className="ip-card ip-post ip-post-feature" href={`/blog/${featured.slug}/`}>
          <span className="ip-post-img"><img src={featured.image} alt="" width={800} height={500} /></span>
          <span className="ip-post-body">
            <span className="ip-post-cat">Latest · {featured.category}</span>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <span className="ip-post-meta"><span>{BLOG_AUTHOR}</span><time dateTime={featured.date}>{formatDate(featured.date)}</time></span>
          </span>
        </a>
      )}

      {rest.length ? (
        <ul className="ip-grid-3" aria-live="polite">
          {rest.map((p) => (
            <li key={p.slug}>
              <a className="ip-card ip-post" href={`/blog/${p.slug}/`} style={{ height: "100%" }}>
                <span className="ip-post-img"><img src={p.image} alt="" width={600} height={375} loading="lazy" /></span>
                <span className="ip-post-body">
                  <span className="ip-post-cat">{p.category}</span>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <span className="ip-post-meta"><span>{BLOG_AUTHOR}</span><time dateTime={p.date}>{formatDate(p.date)}</time></span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        !featured && <p className="ip-empty">{words.length ? "No articles match your search. Try another word." : "No articles in this topic yet."} <a href="/blog/">See all articles</a>.</p>
      )}

      {total > shown && (
        <div className="ip-actions" style={{ justifyContent: "center", marginTop: 36 }}>
          <button type="button" className="ip-btn ip-btn-outline" onClick={() => setShown((n) => n + PAGE)}>
            Load more articles ({total - shown} more)
          </button>
        </div>
      )}
    </>
  );
}
