"use client";

// Interactive parts of the blog article layout (app/blog/[slug]/page.tsx). Styles: styles/blog.css (.ba-*).
//  - ArticleToc: table of contents that highlights the section being read
//  - ShareArticle: Facebook / LinkedIn / X share links + copy link
//  - AskAi: opens ChatGPT, Perplexity or Google AI Mode with the site's shared question, or copies the prompt
//  - QuickQuote: short quote form (name, email, phone) posting to the same /api/quote/ as every other form
import { useEffect, useRef, useState } from "react";
import { aiLinks } from "@/components/Footer";
import { AI_QUESTION, AI_QUESTION_TEXT } from "@/lib/aiQuestion";
import { QUOTE_ENDPOINT, submitQuote, thankYouUrl } from "@/lib/quote";

const ico = (d: React.ReactNode, size = 16) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const LinkIcon = () => ico(<><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>);
const CheckIcon = () => ico(<path d="M20 6 9 17l-5-5" />);

/** Copies text and shows "Copied" for a moment. */
function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers / blocked clipboard: fall back to a temporary text field.
      const t = document.createElement("textarea");
      t.value = text;
      document.body.append(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

export function ArticleToc({ items, label = "Table of contents" }: { items: { id: string; title: string }[]; label?: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const listRef = useRef<HTMLOListElement>(null);

  // The list has its own scroll area (max ~half the screen): keep the highlighted link inside it.
  // Only the list scrolls — never the page.
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`a[href="#${CSS.escape(active || "")}"]`);
    if (!list || !link) return;
    const top = link.offsetTop; // the list is position: relative, so this is measured from the top of the list
    const pad = 24;
    if (top < list.scrollTop + pad) list.scrollTo({ top: Math.max(0, top - pad), behavior: "smooth" });
    else if (top + link.offsetHeight > list.scrollTop + list.clientHeight - pad)
      list.scrollTo({ top: top + link.offsetHeight - list.clientHeight + pad, behavior: "smooth" });
  }, [active]);
  useEffect(() => {
    const heads = items.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    if (!heads.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // The last heading that has scrolled above 30% of the screen is the section being read.
      const line = window.innerHeight * 0.3;
      let current = heads[0].id;
      for (const h of heads) if (h.getBoundingClientRect().top <= line) current = h.id;
      setActive(current);
    };
    update();
    const onScroll = () => { frame ||= requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [items]);

  return (
    <nav className="ba-toc" aria-label={label}>
      <p className="ba-side-label">{label}</p>
      <ol ref={listRef}>
        {items.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`} aria-current={active === t.id ? "true" : undefined}>{t.title.replace(/\*\*/g, "")}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ShareArticle({ url, title }: { url: string; title: string }) {
  const { copied, copy } = useCopy();
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13H10v8h3.5z" /></svg> },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.6 8.9h3.1V20H4.6zM6.15 3.4a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM10.1 8.9H13v1.6a3.3 3.3 0 0 1 2.95-1.7c3.05 0 3.75 1.9 3.75 4.55V20h-3.05v-5.05c0-1.3-.3-2.3-1.7-2.3s-1.9.9-1.9 2.25V20h-2.95z" /></svg> },
    { label: "Share on X", href: `https://x.com/intent/post?url=${u}&text=${t}`, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" /></svg> },
  ];
  return (
    <div className="ba-share">
      <p className="ba-side-label">Share article</p>
      <div className="ba-share-row">
        {links.map((l) => (
          <a key={l.label} className="ba-share-btn" href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label}>{l.icon}</a>
        ))}
        <button type="button" className="ba-share-btn" onClick={() => copy(url)} aria-label={copied ? "Link copied" : "Copy link"} title={copied ? "Link copied" : "Copy link"}>
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      </div>
      <span className="ba-sr" aria-live="polite">{copied ? "Link copied" : ""}</span>
    </div>
  );
}

// Logos are shared with the footer; Google AI Mode uses the Gemini mark.
const aiLogo = (name: string) => aiLinks.find((a) => a.name === name)?.path || "";

export function AskAi() {
  const { copied, copy } = useCopy();
  const prompt = AI_QUESTION_TEXT;
  const q = AI_QUESTION;
  const tools = [
    { name: "ChatGPT", logo: aiLogo("ChatGPT"), href: `https://chatgpt.com/?q=${q}`, cls: "is-chatgpt" },
    { name: "Perplexity", logo: aiLogo("Perplexity"), href: `https://www.perplexity.ai/search?q=${q}`, cls: "is-perplexity" },
    { name: "Google AI", logo: aiLogo("Google Gemini"), href: `https://www.google.com/search?udm=50&q=${q}`, cls: "is-google" },
  ];
  return (
    <div className="ba-card ba-ai">
      <p className="ba-ai-title">
        {ico(<><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></>, 18)}
        Ask AI about Pack Legacy
      </p>
      <p className="ba-ai-text">Learn about our products, MOQ and shipping in your favorite AI assistant.</p>
      <div className="ba-ai-row">
        {tools.map((t) => (
          <a key={t.name} className={`ba-ai-btn ${t.cls}`} href={t.href} target="_blank" rel="noopener noreferrer">
            <svg className="ba-ai-logo" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true"><path d={t.logo} /></svg>
            {t.name}
          </a>
        ))}
      </div>
      <button type="button" className="ba-ai-copy" onClick={() => copy(prompt)}>
        {copied ? <CheckIcon /> : ico(<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>)}
        {copied ? "Prompt copied" : "Copy prompt"}
      </button>
    </div>
  );
}

export function QuickQuote() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const id = useRef("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    setError("");
    setSending(true);
    const fields = new FormData(e.currentTarget);
    id.current ||= crypto.randomUUID();
    fields.set("id", id.current);
    fields.set("page", window.location.pathname);
    const result = await submitQuote(fields);
    if (result.ok) {
      window.location.assign(thankYouUrl(result.reference, String(fields.get("name") || "")));
      return; // keep "Sending…" while the thank-you page loads
    }
    setError(result.message);
    setSending(false);
  };

  return (
    <form className="ba-card ba-quote" action={QUOTE_ENDPOINT} method="post" encType="multipart/form-data" onSubmit={onSubmit}>
      <div className="ba-quote-title">Fill Out The Quote Form</div>
      <label>
        Full Name *
        <input name="name" required autoComplete="name" placeholder="Full Name" maxLength={120} />
      </label>
      <label>
        Email Address *
        <input name="email" type="email" required autoComplete="email" placeholder="Email Address" maxLength={160} />
      </label>
      <label>
        Phone Number *
        <input name="phone" type="tel" required autoComplete="tel" placeholder="Phone Number" minLength={7} maxLength={40} />
      </label>
      {/* Hidden from people; bots that fill it are ignored by /api/quote/. */}
      <input className="ba-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p className="ba-quote-error" role="alert">{error}</p>}
      <button type="submit" className="ba-quote-btn" disabled={sending}>{sending ? "Sending…" : "Submit"}</button>
    </form>
  );
}
