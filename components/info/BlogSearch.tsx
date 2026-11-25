"use client";

// Search bar in the /blog/ hero. It tells BlogGrid what to show through a window event; /blog/?q=… opens it pre-filled.
import { useEffect, useRef, useState } from "react";
import { BLOG_CATEGORIES, categorySlug, type BlogCategory } from "@/data/blog-posts";

export const BLOG_SEARCH_EVENT = "pl-blog-search";
export const BLOG_CATEGORY_EVENT = "pl-blog-category";
type BlogFilter = BlogCategory | "All";

export default function BlogSearch() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<BlogFilter>("All");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      setQ(params.get("q") || "");
      const slug = params.get("category");
      setCategory(BLOG_CATEGORIES.find((item) => categorySlug(item) === slug) || "All");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  const search = (value: string) => {
    setQ(value);
    window.dispatchEvent(new CustomEvent(BLOG_SEARCH_EVENT, { detail: value }));
  };

  const filterBy = (value: BlogFilter) => {
    setCategory(value);
    const params = new URLSearchParams(window.location.search);
    if (value === "All") params.delete("category");
    else params.set("category", categorySlug(value));
    const query = params.toString();
    window.history.pushState({}, "", `/blog/${query ? `?${query}` : ""}`);
    window.dispatchEvent(new CustomEvent<BlogFilter>(BLOG_CATEGORY_EVENT, { detail: value }));
  };

  return (
    <>
    <form
      className="bsr"
      role="search"
      action="/blog/"
      onSubmit={(e) => {
        e.preventDefault();
        const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById("blog-articles")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
      }}
    >
      <svg className="bsr-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" />
      </svg>
      <input
        ref={input}
        type="text"
        name="q"
        value={q}
        onChange={(e) => search(e.target.value)}
        placeholder="Search articles"
        aria-label="Search blog articles"
        autoComplete="off"
        enterKeyHint="search"
      />
      {q && (
        <button type="button" className="bsr-clear" aria-label="Clear search" onClick={() => { search(""); input.current?.focus(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
      <button type="submit" className="bsr-go">
        Search
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </form>
      <nav className="bsr-categories" aria-label="Filter blogs by category">
        <button type="button" className={category === "All" ? "is-active" : ""} aria-pressed={category === "All"} onClick={() => filterBy("All")}>All Blogs</button>
        {BLOG_CATEGORIES.map((item) => (
          <button key={item} type="button" className={category === item ? "is-active" : ""} aria-pressed={category === item} onClick={() => filterBy(item)}>{item}</button>
        ))}
      </nav>
    </>
  );
}
