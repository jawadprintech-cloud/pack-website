import { createHash } from "node:crypto";
import { parse, parseFragment } from "parse5";
import type { WebsiteKind, WebsitePage, WebsiteSection } from "./website-types";

interface Node { nodeName: string; tagName?: string; attrs?: Array<{ name: string; value: string }>; childNodes?: Node[]; value?: string }
const SKIP = new Set(["script", "style", "svg", "template", "noscript", "nav", "footer", "input", "textarea"]);
const BLOCK = new Set(["div", "section", "article", "main", "p", "header", "aside", "figure", "figcaption", "details", "summary", "blockquote", "form", "label", "fieldset", "legend", "dl", "dt", "dd"]);
const DOCS = new Set(["/llms.txt", "/llms-full.txt", "/pricing.md"]);
const PRIVATE = /(?:^|\/)(?:api|admin|administrator|wp-admin|wp-json|wp-login\.php|auth|login|signin|sign-in|account|my-account|checkout|cart|dashboard|cgi-bin|vendor|db|\.git|\.env|_next)(?:\/|$)/i;
const CANONICAL_ORIGINS = new Set(["https://packlegacy.com", "https://www.packlegacy.com"]);
export const WEBSITE_MAX_BODY_BYTES = 2 * 1024 * 1024;

export class WebsiteSourceError extends Error {
  constructor(readonly code: string, message: string, readonly status: number | null = null, readonly retryable = false) { super(message); this.name = "WebsiteSourceError"; }
}
function originValue(value: string): string {
  const url = new URL(value);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash || !["http:", "https:"].includes(url.protocol)) throw new WebsiteSourceError("INVALID_ORIGIN", "Use a configured HTTP(S) origin without a path or credentials.");
  return url.origin;
}
/** Canonical site links are remapped to the configured deployment; arbitrary hosts never become fetch targets. */
export function normalizeWebsitePath(value: string, siteOrigin: string, basePath = "/"): string | null {
  if (typeof value !== "string" || value.length > 2048 || /[\\\u0000-\u0020\u007f]/.test(value) || /%(?:2f|5c|2e|00|0a|0d|25)/i.test(value)) return null;
  try {
    const origin = originValue(siteOrigin);
    const base = new URL(basePath, origin);
    if (base.origin !== origin) return null;
    const url = new URL(value, base);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search) return null;
    if (url.origin !== origin && !CANONICAL_ORIGINS.has(url.origin)) return null;
    const path = decodeURIComponent(url.pathname);
    if (path.length > 500 || PRIVATE.test(path) || path.includes("//") || /[\\\u0000-\u0020\u007f]/.test(path) || /(?:^|\/)\.{1,2}(?:\/|$)/.test(path)) return null;
    if (DOCS.has(path)) return path;
    if (/\.[a-z\d]{1,12}$/i.test(path) || !/^\/[a-z\d/_-]*$/i.test(path)) return null;
    return path === "/" ? "/" : path.replace(/\/+$/, "") + "/";
  } catch { return null; }
}
const children = (node: Node): Node[] => node.childNodes ?? [];
const attr = (node: Node, name: string): string | undefined => node.attrs?.find(item => item.name === name)?.value;
function all(node: Node, predicate: (node: Node) => boolean): Node[] { const found: Node[] = []; const walk = (current: Node) => { if (predicate(current)) found.push(current); for (const child of children(current)) walk(child); }; walk(node); return found; }
function plain(node: Node): string { if (SKIP.has(node.tagName ?? "")) return ""; if (node.nodeName === "#text") return node.value ?? ""; if (node.tagName === "br") return "\n"; const value = children(node).map(plain).join(""); return BLOCK.has(node.tagName ?? "") || node.tagName === "li" ? value + "\n" : value; }
const clean = (value: string): string => value.replace(/[\t \u00a0]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
const inline = (value: string): string => value.replace(/\s+/g, " ").trim();
const hash = (value: string): string => createHash("sha256").update(value).digest("hex");
function safeLink(value: string | undefined, base: string): string | null {
  if (!value || /[\u0000-\u001f\u007f\\]/.test(value)) return null;
  try { const url = new URL(value, base); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
function tableData(node: Node): { headers: string[]; rows: string[][] } {
  const rows = all(node, n => n.tagName === "tr").map(row => children(row).filter(cell => cell.tagName === "th" || cell.tagName === "td").map(cell => inline(plain(cell))));
  const first = all(node, n => n.tagName === "tr")[0];
  const hasHeaders = first && children(first).some(n => n.tagName === "th");
  const width = Math.max(0, ...rows.map(row => row.length));
  return { headers: hasHeaders ? rows.shift() ?? [] : Array.from({ length: width }, (_, i) => "Column " + (i + 1)), rows };
}
function render(node: Node, base: string, bodyFallback = false): string {
  const tag = node.tagName ?? "";
  if (SKIP.has(tag) || (bodyFallback && tag === "header")) return "";
  if (node.nodeName === "#text") return (node.value ?? "").replace(/\s+/g, " ");
  if (tag === "br") return "\n";
  if (tag === "hr") return "\n\n---\n\n";
  if (tag === "img") { const url = safeLink(attr(node, "src"), base); const alt = inline(attr(node, "alt") ?? ""); return url ? `\n\n![${alt.replace(/[\[\]]/g, "")}](${url})\n\n` : alt; }
  if (tag === "a") { const text = inline(children(node).map(child => render(child, base, bodyFallback)).join("")); const url = safeLink(attr(node, "href"), base); return text && url ? `[${text.replace(/[\[\]]/g, "")}](${url})` : text; }
  if (/^h[1-6]$/.test(tag)) return `\n\n${"#".repeat(Number(tag[1]))} ${inline(plain(node))}\n\n`;
  if (tag === "table") { const table = tableData(node); const escape = (v: string) => v.replace(/\|/g, "\\|"); return "\n\n| " + table.headers.map(escape).join(" | ") + " |\n| " + table.headers.map(() => "---").join(" | ") + " |\n" + table.rows.map(row => "| " + row.map(escape).join(" | ") + " |").join("\n") + "\n\n"; }
  if (tag === "ul" || tag === "ol") return "\n\n" + children(node).filter(child => child.tagName === "li").map((child, i) => (tag === "ol" ? `${i + 1}. ` : "- ") + clean(children(child).map(item => render(item, base, bodyFallback)).join(""))).join("\n") + "\n\n";
  if (tag === "pre") return "\n\n```\n" + plain(node).trim() + "\n```\n\n";
  const content = children(node).map(child => render(child, base, bodyFallback)).join("");
  return BLOCK.has(tag) ? `\n\n${content}\n\n` : tag === "option" ? ` ${inline(plain(node))}; ` : content;
}
export function inferWebsiteKind(path: string): WebsiteKind {
  if (DOCS.has(path)) return "document";
  if (path.startsWith("/product/")) return "product";
  if (/(?:^|\/)(?:materials?|coatings?|finishes?)(?:\/|$)/.test(path)) return "material";
  if (/(?:privacy|terms-and-conditions|refund|return-policy|shipping-policy)/.test(path)) return "policy";
  if (path.startsWith("/blog/") && path !== "/blog/" && !/^\/blog\/page\//.test(path)) return "blog";
  if (/(?:how-to|artwork|dieline|guide|faqs)/.test(path)) return "guide";
  return "page";
}
export function extractWebsitePage(input: { html: string; url: string; kind?: WebsiteKind; catalogTitle?: string | null; fetchedAt?: string; sourceLastModified?: string | null; discoveredBy?: string[] }): WebsitePage {
  const url = new URL(input.url); const path = normalizeWebsitePath(url.href, url.origin);
  if (!path) throw new WebsiteSourceError("INVALID_PAGE_PATH", "The page path is not a permitted public content path.");
  const document = parse(input.html) as unknown as Node;
  const body = all(document, node => node.tagName === "body")[0] ?? document;
  const mains = all(body, node => node.tagName === "main" || attr(node, "role") === "main");
  const roots = mains.length ? mains : [body];
  const headings = roots.flatMap(root => all(root, node => /^h[1-6]$/.test(node.tagName ?? "")));
  const titleNode = all(document, node => node.tagName === "title")[0];
  const title = inline(plain(headings.find(node => node.tagName === "h1") ?? titleNode ?? body)).slice(0, 700) || input.catalogTitle || path;
  const documentTitle = titleNode ? inline(plain(titleNode)) : "";
  if (/^(?:404(?:\b.*)?|page not found|not found|this page could not be found\.?|authentication required|vercel authentication)$/i.test(title) || /^(?:404|authentication required)(?:\b|\s)/i.test(documentTitle)) throw new WebsiteSourceError("SOFT_ERROR_PAGE", "The server returned a missing-page or sign-in screen with a successful HTTP status.");
  const content = clean(roots.map(root => render(root, url.href, !mains.length)).join("\n\n"));
  if (content.replace(/!\[[^\]]*\]\([^)]*\)/g, "").trim().length < 30) throw new WebsiteSourceError("EMPTY_PAGE", "The public HTML did not contain enough readable content; client-rendered content may require another data source.");
  const description = all(document, node => node.tagName === "meta" && attr(node, "name")?.toLowerCase() === "description").map(node => attr(node, "content"))[0] ?? null;
  const canonical = all(document, node => node.tagName === "link" && Boolean(attr(node, "rel")?.split(/\s/).includes("canonical"))).map(node => safeLink(attr(node, "href"), url.href))[0] ?? null;
  const structured: unknown[] = []; const warnings: string[] = [];
  for (const script of all(document, node => node.tagName === "script" && attr(node, "type")?.toLowerCase() === "application/ld+json")) {
    try { const value = JSON.parse(children(script).map(child => child.value ?? "").join("")); structured.push(...(Array.isArray(value) ? value : [value])); } catch { warnings.push("An invalid JSON-LD block was omitted; readable HTML content is retained."); }
  }
  const faqs: Array<{ question: string; answer: string }> = [];
  const addFaq = (question: string, answer: string) => { question = inline(question); answer = inline(answer); if (question && answer && !faqs.some(faq => faq.question === question && faq.answer === answer)) faqs.push({ question, answer }); };
  for (const detail of roots.flatMap(root => all(root, node => node.tagName === "details"))) {
    const summary = children(detail).find(node => node.tagName === "summary"); if (!summary) continue;
    const question = inline(plain(summary)); if (!question.endsWith("?")) continue;
    addFaq(question, children(detail).filter(node => node !== summary).map(plain).join(" "));
  }
  const visitStructured = (value: unknown, depth = 0) => {
    if (!value || typeof value !== "object" || depth > 30) return;
    if (Array.isArray(value)) { for (const child of value) visitStructured(child, depth + 1); return; }
    const record = value as Record<string, unknown>;
    if (record["@type"] === "Question" && typeof record.name === "string") { const answer = record.acceptedAnswer as Record<string, unknown> | undefined; if (typeof answer?.text === "string") addFaq(record.name, plain(parseFragment(answer.text) as unknown as Node)); }
    for (const child of Object.values(record)) visitStructured(child, depth + 1);
  };
  structured.forEach(value => visitStructured(value));
  const sections: WebsiteSection[] = [];
  const seen = new Map<string, number>();
  const matches = [...content.matchAll(/^(#{1,6}) (.+)$/gm)];
  if (!matches.length || (matches[0].index ?? 0) > 0) sections.push({ id: "introduction", title: "Introduction", level: 0, content: content.slice(0, matches[0]?.index ?? content.length).trim() });
  for (let index = 0; index < matches.length; index++) {
    const match = matches[index]; const heading = headings[index]; const baseId = attr(heading ?? { nodeName: "" }, "id") ?? match[2].toLowerCase().replace(/[^a-z\d]+/g, "-").replace(/^-|-$/g, ""); const count = (seen.get(baseId) ?? 0) + 1; seen.set(baseId, count);
    sections.push({ id: baseId + (count === 1 ? "" : `-${count}`), title: match[2], level: match[1].length, content: content.slice(match.index! + match[0].length, matches[index + 1]?.index ?? content.length).trim() });
  }
  const images = roots.flatMap(root => all(root, node => node.tagName === "img")).map(node => ({ url: safeLink(attr(node, "src"), url.href), alt: inline(attr(node, "alt") ?? "") })).filter((image): image is { url: string; alt: string } => image.url !== null);
  const linkMap = new Map<string, { url: string; text: string }>();
  for (const node of all(body, node => node.tagName === "a")) { const href = safeLink(attr(node, "href"), url.href); if (href) { const text = inline(plain(node)); const prior = linkMap.get(href); if (!prior || (!prior.text && text)) linkMap.set(href, { url: href, text }); } }
  return { id: path, url: new URL(path, url.origin).href, canonical_url: canonical, title, description, kind: input.kind ?? inferWebsiteKind(path), catalog_title: input.catalogTitle ?? null, content_markdown: content, sections, tables: roots.flatMap(root => all(root, node => node.tagName === "table")).map(tableData), faqs, images: [...new Map(images.map(image => [image.url + "|" + image.alt, image])).values()], links: [...linkMap.values()], structured_data: structured, fetched_at: input.fetchedAt ?? new Date().toISOString(), source_last_modified: input.sourceLastModified ?? null, content_sha256: hash(content), source_sha256: hash(input.html), extraction: { method: mains.length ? "html_main" : "html_body", truncated: false, body_bytes: Buffer.byteLength(input.html), warnings }, discovered_by: input.discoveredBy ?? [] };
}
function untilAbort<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(new Error("Request aborted."));
  return new Promise<T>((resolve, reject) => {
    const abort = () => { signal.removeEventListener("abort", abort); reject(new Error("Request aborted.")); };
    signal.addEventListener("abort", abort, { once: true });
    operation.then(value => { signal.removeEventListener("abort", abort); resolve(value); }, error => { signal.removeEventListener("abort", abort); reject(error); });
  });
}
export async function fetchBoundedWebsiteText(url: string, options: { fetchImpl?: typeof fetch; timeoutMs?: number; acceptedTypes?: string[]; validateRedirect?: (url: URL) => boolean } = {}): Promise<{ text: string; url: string; lastModified: string | null; contentType: string }> {
  const start = new URL(url);
  if (!["http:", "https:"].includes(start.protocol) || start.username || start.password || start.hash) throw new WebsiteSourceError("INVALID_SOURCE_URL", "Use a credential-free HTTP(S) content URL.");
  const controller = new AbortController(); const timeoutMs = options.timeoutMs ?? 25_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) throw new WebsiteSourceError("INVALID_TIMEOUT", "Content request timeout must be between 1 and 60000 milliseconds.");
  let timedOut = false; const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const fetchImpl = options.fetchImpl ?? fetch; let current = start; let response: Response | undefined;
    for (let redirects = 0; redirects <= 3; redirects++) {
      response = await untilAbort(fetchImpl(current.href, { redirect: "manual", credentials: "omit", signal: controller.signal, headers: { Accept: "text/html, text/plain, text/markdown, application/xml, application/json", "User-Agent": "PackLegacyContentSync/0.4 (+owner-authorized preview content reader)" } }), controller.signal);
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location"); await response.body?.cancel();
        if (!location || redirects === 3) throw new WebsiteSourceError("REDIRECT_LIMIT", "The content endpoint redirects too many times.", response.status);
        const next = new URL(location, current); if (next.origin !== start.origin || next.username || next.password || next.search || /[\\]/.test(location) || (options.validateRedirect && !options.validateRedirect(next))) throw new WebsiteSourceError("UNSAFE_REDIRECT", "A content redirect leaves the configured origin or adds unsafe URL components.", response.status);
        current = next; continue;
      }
      break;
    }
    if (!response || response.status !== 200) { await response?.body?.cancel(); throw new WebsiteSourceError("HTTP_STATUS", `The public page returned HTTP ${response?.status ?? "unknown"}.`, response?.status ?? null, response?.status === 429 || (response?.status ?? 0) >= 500); }
    const contentType = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    const accepted = options.acceptedTypes ?? ["text/html", "application/xhtml+xml", "text/plain", "text/markdown"];
    if (!accepted.includes(contentType)) { await response.body?.cancel(); throw new WebsiteSourceError("UNSUPPORTED_CONTENT_TYPE", "The response is not a supported public content type.", 200); }
    if (Number(response.headers.get("content-length") ?? 0) > WEBSITE_MAX_BODY_BYTES) { await response.body?.cancel(); throw new WebsiteSourceError("PAGE_TOO_LARGE", "The page exceeds the content byte limit; no truncated page was stored.", 200); }
    const chunks: Uint8Array[] = []; let size = 0; const reader = response.body?.getReader();
    if (!reader) throw new WebsiteSourceError("EMPTY_BODY", "The page response has no readable body.", 200);
    try { while (true) { const result = await untilAbort(reader.read(), controller.signal); if (result.done) break; size += result.value.byteLength; if (size > WEBSITE_MAX_BODY_BYTES) { await reader.cancel(); throw new WebsiteSourceError("PAGE_TOO_LARGE", "The page exceeds the content byte limit; no truncated page was stored.", 200); } chunks.push(result.value); } } finally { if (controller.signal.aborted) void reader.cancel().catch(() => undefined); reader.releaseLock(); }
    const bytes = Buffer.concat(chunks); let text: string;
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { throw new WebsiteSourceError("INVALID_TEXT_ENCODING", "The response is not valid UTF-8 text.", 200); }
    return { text, url: current.href, lastModified: response.headers.get("last-modified"), contentType };
  } catch (error) { if (error instanceof WebsiteSourceError) throw error; if (timedOut) throw new WebsiteSourceError("FETCH_TIMEOUT", "The public content request timed out.", null, true); throw new WebsiteSourceError("FETCH_FAILED", "The public content request could not be completed.", null, true); }
  finally { clearTimeout(timer); }
}
export async function fetchWebsitePage(path: string, siteOrigin: string, options: { fetchImpl?: typeof fetch; kind?: WebsiteKind; catalogTitle?: string | null } = {}): Promise<WebsitePage> {
  const origin = originValue(siteOrigin); const normalized = normalizeWebsitePath(path, origin);
  if (!normalized || path !== normalized) throw new WebsiteSourceError("INVALID_PAGE_PATH", "Use a canonical permitted path discovered in the website manifest.");
  const response = await fetchBoundedWebsiteText(new URL(path, origin).href, { fetchImpl: options.fetchImpl, validateRedirect: next => normalizeWebsitePath(next.href, origin) === normalized });
  if (response.contentType === "text/html" || response.contentType === "application/xhtml+xml") return extractWebsitePage({ html: response.text, url: new URL(path, origin).href, kind: options.kind, catalogTitle: options.catalogTitle, sourceLastModified: response.lastModified });
  if (!DOCS.has(path)) throw new WebsiteSourceError("UNSUPPORTED_TEXT_DOCUMENT", "Plain text is supported only for the known website document paths.", 200);
  const content = response.text.replace(/\r\n/g, "\n").trim();
  if (content.length < 30 || /<html\b/i.test(content)) throw new WebsiteSourceError("INVALID_TEXT_DOCUMENT", "The text document has no usable content or contains an HTML error page.", 200);
  const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path.slice(1);
  return { id: path, url: new URL(path, origin).href, canonical_url: null, title, description: null, kind: "document", catalog_title: null, content_markdown: content, sections: [{ id: "document", title, level: 1, content }], tables: [], faqs: [], images: [], links: [...content.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g)].map(match => ({ text: match[1], url: match[2] })), structured_data: [], fetched_at: new Date().toISOString(), source_last_modified: response.lastModified, content_sha256: hash(content), source_sha256: hash(response.text), extraction: { method: "text", truncated: false, body_bytes: Buffer.byteLength(response.text), warnings: [] }, discovered_by: [] };
}
