"use client";

// Interactive parts of /for-ai-agents/ (app/for-ai-agents/page.tsx). Styles: styles/ai-agents.css (.plai).
//  - AiHeroVisual: mascot with the AI assistant badges floating around it
//  - ToolTable: the 15 MCP tools with a live filter
//  - PromptList: sample prompts with copy buttons (copy only, nothing is sent anywhere)
import { useEffect, useMemo, useRef, useState } from "react";
import { aiLinks } from "@/components/Footer";
import { AI_QUESTION } from "@/lib/aiQuestion";

const pathOf = (name: string) => aiLinks.find((a) => a.name === name)?.path || "";

// Each badge opens that assistant with the site's shared question.

const badges: { name: string; color: string; href: string; icon: React.ReactNode }[] = [
  { name: "ChatGPT", color: "#10a37f", href: `https://chatgpt.com/?q=${AI_QUESTION}`, icon: <path d={pathOf("ChatGPT")} /> },
  { name: "Perplexity", color: "#20808d", href: `https://www.perplexity.ai/search?q=${AI_QUESTION}`, icon: <path d={pathOf("Perplexity")} /> },
  {
    name: "Claude",
    color: "#d97757",
    href: `https://claude.ai/new?q=${AI_QUESTION}`,
    icon: <path d="M12 2.5 13.6 9l6.1-3.2-4.2 5.3 6.6 1-6.6 1.1 4.2 5.3-6.1-3.3L12 21.5l-1.6-6.3-6.1 3.3 4.2-5.3-6.6-1.1 6.6-1-4.2-5.3L10.4 9z" />,
  },
  { name: "Copilot", color: "#7b61ff", href: `https://copilot.microsoft.com/?q=${AI_QUESTION}`, icon: <path d={pathOf("Microsoft Copilot")} /> },
  // Gemini has no public "ask" link, so (as in the footer) this opens Google's AI Mode, powered by Gemini.
  { name: "Gemini", color: "#4285f4", href: `https://www.google.com/search?udm=50&q=${AI_QUESTION}`, icon: <path d={pathOf("Google Gemini")} /> },
  {
    name: "AI Search",
    color: "#0b8743",
    href: `https://search.brave.com/search?summary=1&q=${AI_QUESTION}`,
    icon: <path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.8 4.8-1.4 1.4-4.8-4.8A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z" />,
  },
];

export function AiHeroVisual({ robot }: { robot: string }) {
  return (
    <nav className="afa-visual" aria-label="Ask an AI assistant about this page">
      <span className="afa-visual-ring" aria-hidden="true" />
      <span className="afa-visual-ring afa-visual-ring-2" aria-hidden="true" />
      <img className="afa-visual-bot" src={robot} alt="" width={260} height={260} fetchPriority="high" />
      {badges.map((b, i) => (
        <a
          key={b.name}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ask ${b.name} about this page (opens in a new tab)`}
          className={`afa-badge afa-badge-${i + 1}`}
          style={{ "--c": b.color } as React.CSSProperties}
        >
          <span className="afa-badge-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" fillRule="evenodd">{b.icon}</svg>
          </span>
          {b.name}
          <svg className="afa-badge-arrow" aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
        </a>
      ))}
    </nav>
  );
}

export type McpTool = { name: string; what: string };

export function ToolTable({ tools }: { tools: McpTool[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? tools.filter((t) => `${t.name} ${t.what}`.toLowerCase().includes(s)) : tools;
  }, [q, tools]);

  return (
    <div className="afa-tools">
      <div className="afa-filter">
        <label className="afa-filter-field">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <span className="ip-sr">Filter tools</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter tools by name or purpose…" />
        </label>
        <span className="afa-filter-count" aria-live="polite">{shown.length} {shown.length === 1 ? "tool" : "tools"}</span>
      </div>
      <div className="afa-table-wrap">
        <table className="afa-table">
          <thead>
            <tr><th scope="col">Tool</th><th scope="col">What it does</th></tr>
          </thead>
          <tbody>
            {shown.map((t) => (
              <tr key={t.name}>
                <td><code>{t.name}</code></td>
                <td>{t.what}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={2} className="afa-empty">No tools match “{q}”.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
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
  return (
    <button type="button" className={`afa-copy${copied ? " is-copied" : ""}`} onClick={copy} aria-label={copied ? "Copied" : `Copy: ${text}`}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function PromptList({ prompts }: { prompts: string[] }) {
  return (
    <ul className="afa-prompts">
      {prompts.map((p) => (
        <li key={p}>
          <span>“{p}”</span>
          <CopyButton text={p} />
        </li>
      ))}
    </ul>
  );
}
