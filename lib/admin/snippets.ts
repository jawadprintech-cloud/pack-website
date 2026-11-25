// Saving code snippets from the dashboard.
import { parseFragment } from "parse5";
import ts from "typescript";
import type { Snippet } from "@/lib/snippets";
import { AdminError, DATA_FILES, hashOf, readText, writeFile } from "./store";

const HEAD_TAGS = /^(script|style|meta|link|noscript)$/;

export async function getSnippets() {
  const text = await readText(DATA_FILES.snippets);
  return { list: JSON.parse(text) as Snippet[], hash: hashOf(text) };
}

function check(s: Snippet): Snippet {
  const name = String(s.name || "").trim();
  const code = String(s.code || "").trim();
  if (!/^[a-z0-9-]{1,40}$/.test(s.id || "")) throw new AdminError("Bad snippet id");
  if (!name) throw new AdminError("Give the snippet a name");
  if (!code) throw new AdminError(`“${name}” has no code`);
  if (code.length > 100_000) throw new AdminError(`“${name}” is too long`);
  if (!["html", "js", "css"].includes(s.type) || !["head", "body_start", "body_end"].includes(s.location)) throw new AdminError("Bad snippet settings");
  if (/<\/?(template|html|head|body)[\s>]/i.test(code)) throw new AdminError(`“${name}”: leave out <html>, <head>, <body> and <template> tags`);
  if (s.type === "js") {
    if (/<\/?script/i.test(code)) throw new AdminError(`“${name}”: leave out the <script> tags, or choose HTML`);
    const bad = ts.transpileModule(code, { fileName: "snippet.js", reportDiagnostics: true, compilerOptions: { allowJs: true, target: ts.ScriptTarget.ESNext } }).diagnostics?.[0];
    if (bad) throw new AdminError(`“${name}” has a JavaScript error: ${ts.flattenDiagnosticMessageText(bad.messageText, " ")}`);
  }
  if (s.type === "css" && /<\/?style/i.test(code)) throw new AdminError(`“${name}”: leave out the <style> tags, or choose HTML`);
  if (s.type === "html" && s.location === "head") {
    type N = { nodeName: string; tagName?: string; value?: string; attrs?: { name: string }[] };
    for (const n of (parseFragment(code) as unknown as { childNodes: N[] }).childNodes) {
      if (n.nodeName === "#comment" || (n.nodeName === "#text" && !n.value!.trim())) continue;
      if (!n.tagName || !HEAD_TAGS.test(n.tagName)) throw new AdminError(`“${name}”: the head can only hold script, style, meta, link and noscript tags. Use a body location instead.`);
      if (n.tagName === "noscript") throw new AdminError(`“${name}”: put the noscript part in a second snippet at the start of the body`);
      if (n.attrs?.some((a) => /^on/.test(a.name))) throw new AdminError(`“${name}”: attributes such as onload do not work in the head. Use a body location instead.`);
    }
  }
  if (s.active && /X{6,}|YOUR_CODE/.test(code)) throw new AdminError(`“${name}”: replace the placeholder ID before turning it on`);
  const pages = (Array.isArray(s.pages) ? s.pages : []).map((p) => String(p).trim()).filter(Boolean).map((p) => {
    if (!/^\/[\w\-./%]*\*?$/.test(p)) throw new AdminError(`“${p}” is not a page address (example: /faqs/ or /blog/*)`);
    return p.endsWith("*") || p.endsWith("/") ? p : p + "/";
  });
  return { id: s.id, name, type: s.type, location: s.location, pages, active: !!s.active, code };
}

export async function saveSnippets(list: Snippet[], hash: string) {
  if (!Array.isArray(list)) throw new AdminError("Bad list");
  const cur = await getSnippets();
  if (cur.hash !== hash) throw new AdminError("The snippets were changed somewhere else. Reload and try again.", 409);
  const clean = list.map(check);
  if (new Set(clean.map((s) => s.id)).size !== clean.length) throw new AdminError("Two snippets share an id");
  await writeFile(DATA_FILES.snippets, JSON.stringify(clean, null, 2) + "\n");
}
