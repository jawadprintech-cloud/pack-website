"use client";

// Header search: animated "typing" placeholder plus autocomplete over products, categories and pages.
// The index comes from /api/search/ (app/api/search/route.ts) and is fetched the first time the box is focused.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchItem } from "@/app/api/search/route";

const PHRASES = ["mailer boxes", "rigid boxes", "candle boxes", "cake boxes", "display boxes", "cosmetic boxes", "magnetic closure boxes"];
const MAX = 8;
const KIND_ORDER = { Category: 0, Product: 1, Page: 2 } as const;

let indexPromise: Promise<SearchItem[]> | null = null; // shared by the desktop and mobile boxes
const loadIndex = () =>
  (indexPromise ??= fetch("/api/search/")
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => {
      indexPromise = null; // let the next focus retry
      return [];
    }));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function search(items: SearchItem[], query: string) {
  const q = norm(query);
  if (!q) return [];
  const words = q.split(" ").map((w) => w.replace(/s$/, "")); // "boxes" also matches "box"
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const title = norm(item.t);
    const hay = `${title} ${norm(item.x || "")}`;
    if (!words.every((w) => hay.includes(w))) continue;
    const score = title.startsWith(q) ? 0 : title.split(" ").some((w) => w.startsWith(words[0])) ? 1 : 2;
    scored.push({ item, score });
  }
  scored.sort((a, b) => a.score - b.score || KIND_ORDER[a.item.k] - KIND_ORDER[b.item.k] || a.item.t.length - b.item.t.length);
  return scored.slice(0, MAX).map((s) => s.item);
}

/** Bold the part of the title that matches the query. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark>{text.slice(at, at + q.length)}</mark>{text.slice(at + q.length)}</>;
}

/** Placeholder that types and deletes phrases while the box is empty and not focused. */
function useTypingPlaceholder(active: boolean) {
  const [text, setText] = useState("Search products...");
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText("Search products...");
      return;
    }
    let phrase = 0, chars = 0, deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = PHRASES[phrase];
      chars += deleting ? -1 : 1;
      setText(`Search ${word.slice(0, chars)}`);
      let delay = deleting ? 35 : 75;
      if (!deleting && chars === word.length) { deleting = true; delay = 1500; }
      else if (deleting && chars === 0) { deleting = false; phrase = (phrase + 1) % PHRASES.length; delay = 300; }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [active]);
  return text;
}

export default function SearchBox() {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const placeholder = useTypingPlaceholder(!focused && !query);
  const results = useMemo(() => (items ? search(items, query) : []), [items, query]);
  const showList = open && query.trim().length > 0;

  const prepare = () => {
    setFocused(true);
    setOpen(true);
    if (!items) loadIndex().then(setItems);
  };
  const go = (item?: SearchItem) => {
    if (!item) return;
    setOpen(false);
    window.location.assign(item.u);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (results.length ? (a + 1) % results.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (results.length ? (a <= 0 ? results.length - 1 : a - 1) : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active] ?? results[0]);
    } else if (e.key === "Escape") {
      if (open) setOpen(false);
      else setQuery("");
    }
  };

  return (
    <div className="sds-search-container">
      <form role="search" onSubmit={(e) => { e.preventDefault(); go(results[active] ?? results[0]); }}>
        <svg className="sds-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          className="sds-productSearch"
          placeholder={placeholder}
          aria-label="Search products"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(-1); setOpen(true); }}
          onFocus={prepare}
          onBlur={() => { setFocused(false); setOpen(false); }}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button type="button" className="sds-search-clear" aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
            ×
          </button>
        )}
      </form>

      {showList && (
        <ul className="sds-suggestions" id={listId} role="listbox" aria-label="Search suggestions">
          {!items && <li className="sds-empty">Loading…</li>}
          {items && results.length === 0 && (
            <li className="sds-empty">
              No matches for “{query.trim()}”. <a href="/custom-boxes/" onMouseDown={(e) => e.preventDefault()}>Browse all boxes</a>
            </li>
          )}
          {results.map((r, i) => (
            <li
              key={r.u}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? "is-active" : undefined}
              onMouseDown={(e) => e.preventDefault()} // keep focus so the click lands
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r)}
            >
              {r.i ? <img src={r.i} alt="" width={40} height={40} loading="lazy" /> : <span className="sds-thumb" aria-hidden="true">↗</span>}
              <span className="sds-text">
                <span className="sds-title"><Highlight text={r.t} query={query} /></span>
                <span className="sds-kind">{r.k === "Product" && r.x ? r.x : r.k}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
