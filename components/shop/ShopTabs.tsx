"use client";

// Category pills, search, sort and product grid on /shop/, with the quote form (children) beside the grid.
// Every category is in the HTML (inactive ones are hidden), so all products stay crawlable; the active tab is
// reflected in the URL hash (/shop/#food). The search looks through every category.
import { useEffect, useState, type ReactNode } from "react";

type Card = { name: string; href: string; img: string };
export type ShopTab = { id: string; tab: string; title: string; page?: string; cards: Card[] };
type Sort = "featured" | "az" | "za";

const LayersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 2 10 5-10 5L2 7l10-5z" />
    <path d="m2 12 10 5 10-5" />
    <path d="m2 17 10 5 10-5" />
  </svg>
);

const styles = (n: number) => `${n} ${n === 1 ? "style" : "styles"}`;

function Grid({ cards, sort }: { cards: Card[]; sort: Sort }) {
  const list = sort === "featured" ? cards : [...cards].sort((a, b) => a.name.localeCompare(b.name) * (sort === "az" ? 1 : -1));
  return (
    <ul className="cb-cat-grid">
      {list.map((c) => (
        <li key={c.href + c.name}>
          <a className="cb-card" href={c.href}>
            <span className="cb-cat-img">
              <img src={c.img} alt={c.name} width={600} height={600} loading="lazy" />
            </span>
            <span className="cb-card-body">
              <span className="cb-card-top">
                <span className="cb-cat-name">{c.name}</span>
                <span className="cb-badge">Instock</span>
              </span>
              <span className="cb-chips">
                <span className="cb-chip"><span className="cb-chip-icon"><LayersIcon /></span>No MOQ</span>
                <span className="cb-chip"><span className="cb-chip-icon"><LayersIcon /></span>Free Shipping</span>
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ShopTabs({ tabs, children }: { tabs: ShopTab[]; children?: ReactNode }) {
  const [active, setActive] = useState(tabs[0].id);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");

  // Open the tab named in the URL hash, and follow back/forward changes.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (tabs.some((t) => t.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  const choose = (id: string) => {
    setActive(id);
    setQuery("");
    history.replaceState(null, "", `#${id}`);
  };

  // Arrow keys move between pills (tablist pattern).
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = tabs[(i + d + tabs.length) % tabs.length];
    choose(next.id);
    document.getElementById(`shop-tab-${next.id}`)?.focus();
  };

  // Every typed word must appear in the product or category name; a product listed in two categories shows once.
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const found: Card[] = [];
  if (words.length) {
    for (const t of tabs) for (const c of t.cards) {
      const text = `${c.name} ${t.title}`.toLowerCase();
      if (words.every((w) => text.includes(w)) && !found.some((f) => f.href === c.href)) found.push(c);
    }
  }
  const current = tabs.find((t) => t.id === active)!;

  return (
    <div className="shop-tabs">
      {/* JavaScript off: the pills, search and sort can't work, so hide them and list every category one after another. */}
      <noscript dangerouslySetInnerHTML={{ __html: "<style>.shop-pills,.shop-bar{display:none!important}.shop-panel[hidden]{display:block!important;margin-top:32px}</style>" }} />
      <div className="shop-pills" role="tablist" aria-label="Product categories">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            id={`shop-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            aria-controls={`shop-panel-${t.id}`}
            tabIndex={t.id === active ? 0 : -1}
            className={t.id === active && !words.length ? "is-on" : undefined}
            onClick={() => choose(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.tab}
          </button>
        ))}
      </div>

      <div className="shop-layout">
        <div className="shop-main">
          <div className="shop-bar">
            <p className="shop-count" role="status">
              <strong>{words.length ? "Search results" : current.title}</strong> {styles(words.length ? found.length : current.cards.length)}
            </p>
            <div className="shop-tools">
              <label className="shop-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a box style..." aria-label="Find a box style" autoComplete="off" />
              </label>
              <select className="shop-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort products">
                <option value="featured">Featured</option>
                <option value="az">Name: A to Z</option>
                <option value="za">Name: Z to A</option>
              </select>
            </div>
          </div>

          {words.length > 0 && (
            <div className="shop-results">
              {found.length
                ? <Grid cards={found} sort={sort} />
                : <p className="shop-empty">No box styles match your search. Try another word, or <a href="#quote">tell us what you need</a>.</p>}
            </div>
          )}

          {tabs.map((t) => (
            <section
              key={t.id}
              id={`shop-panel-${t.id}`}
              role="tabpanel"
              aria-labelledby={`shop-tab-${t.id}`}
              className="shop-panel"
              hidden={t.id !== active || words.length > 0}
            >
              <h3 className="shop-panel-title">{t.title}</h3>
              <Grid cards={t.cards} sort={sort} />
              {t.page && (
                <p className="shop-more">
                  <a href={t.page}>View all {t.title.toLowerCase()} →</a>
                </p>
              )}
            </section>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
