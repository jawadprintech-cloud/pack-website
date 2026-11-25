// Code snippets added in the dashboard (data/snippets.json), output by app/layout.tsx.
import { createElement, type ReactNode } from "react";
import { parseFragment } from "parse5";
import list from "@/data/snippets.json";

export type Snippet = {
  id: string;
  name: string;
  type: "html" | "js" | "css";
  location: "head" | "body_start" | "body_end";
  /** Empty = every page. Otherwise page addresses; a trailing * matches everything below, e.g. /blog/* */
  pages: string[];
  active: boolean;
  code: string;
};
const all = list as unknown as Snippet[];

// In dashboard mode everything goes through the loader, which skips /admin/ so a snippet can never break the dashboard.
const adminMode = process.env.PL_ADMIN === "1";
const direct = (s: Snippet) => s.active && !s.pages.length && !adminMode;
const markup = (s: Snippet) => (s.type === "js" ? `<script>${s.code}</script>` : s.type === "css" ? `<style>${s.code}</style>` : s.code);

type Node5 = { nodeName: string; tagName?: string; value?: string; attrs?: { name: string; value: string }[]; childNodes?: Node5[] };
const PROPS: Record<string, string> = { class: "className", charset: "charSet", crossorigin: "crossOrigin", "http-equiv": "httpEquiv", referrerpolicy: "referrerPolicy", fetchpriority: "fetchPriority", nomodule: "noModule", hreflang: "hrefLang", imagesrcset: "imageSrcSet" };
const BOOL = /^(async|defer|nomodule)$/;

/** Tags for <head>, which React needs as elements. */
function headTags(html: string, key: string): ReactNode[] {
  const root = parseFragment(html) as unknown as Node5;
  return (root.childNodes || [])
    .filter((n) => n.tagName)
    .map((n, i) => {
      const props: Record<string, unknown> = { key: `${key}-${i}`, suppressHydrationWarning: true };
      for (const a of n.attrs || []) if (a.name !== "style") props[PROPS[a.name] || a.name] = BOOL.test(a.name) ? true : a.value;
      const inner = (n.childNodes || []).map((c) => c.value || "").join("");
      if (inner) props.dangerouslySetInnerHTML = { __html: inner };
      return createElement(n.tagName!, props);
    });
}

export function HeadSnippets() {
  return <>{all.filter((s) => direct(s) && s.location === "head").map((s) => headTags(markup(s), s.id))}</>;
}

export function BodySnippets({ at }: { at: "body_start" | "body_end" }) {
  const html = all.filter((s) => direct(s) && s.location === at).map(markup).join("\n");
  return html ? <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} /> : null;
}

const LOADER = `(function(){var p=location.pathname.replace(/\\/?$/,"/");if(p.indexOf("/admin/")===0)return;
document.querySelectorAll("template[data-snippet]").forEach(function(t){
var pages=JSON.parse(t.dataset.pages);
if(pages.length&&!pages.some(function(x){return x.slice(-1)==="*"?p.indexOf(x.slice(0,-1))===0:x===p}))return;
var f=document.importNode(t.content,true);
f.querySelectorAll("script").forEach(function(o){var s=document.createElement("script");for(var i=0;i<o.attributes.length;i++)s.setAttribute(o.attributes[i].name,o.attributes[i].value);if(o.src&&!o.hasAttribute("async"))s.async=false;s.textContent=o.textContent;o.replaceWith(s)});
var w=t.dataset.at;if(w==="head")document.head.appendChild(f);else if(w==="body_start")document.body.insertBefore(f,document.body.firstChild);else document.body.appendChild(f)})})();`;

/** Page-specific snippets: kept inert, then placed by a small script on the pages they are meant for. */
export function TargetedSnippets() {
  const some = all.filter((s) => s.active && !direct(s));
  if (!some.length) return null;
  const attr = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const html = some.map((s) => `<template data-snippet="${attr(s.id)}" data-at="${s.location}" data-pages="${attr(JSON.stringify(s.pages))}">${markup(s)}</template>`).join("");
  // After hydration, so React never sees the added elements as a mismatch.
  const run = `<script>addEventListener("load",function(){setTimeout(function(){${LOADER}},0)})</script>`;
  return <div hidden suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html + run }} />;
}
