import bundledSnapshot from "./knowledge/website-content.json";
import type { CatalogItem, CatalogSearchResult } from "./catalog";
import { fetchWebsitePage, WebsiteSourceError } from "./website-source";
import { WEBSITE_KINDS, type WebsiteKind, type WebsitePage, type WebsiteSnapshot } from "./website-types";
import { websiteResourceUri } from "./resource-uris";

export const WEBSITE_READ_VIEWS = ["content", "sections", "tables", "faqs", "images", "links", "structured_data"] as const;
export type WebsiteReadView = typeof WEBSITE_READ_VIEWS[number];
export type WebsiteRefreshStatus = "fresh" | "cache" | "snapshot_fallback" | "snapshot_only";

export class WebsiteContentError extends Error {
  constructor(readonly code: string, message: string, readonly details?: Record<string, unknown>) { super(message); this.name = "WebsiteContentError"; }
}

export interface WebsiteContentClientOptions {
  siteUrl: string;
  snapshot?: WebsiteSnapshot;
  fetchImpl?: typeof fetch;
  live?: boolean;
  cacheTtlMs?: number;
  now?: () => number;
}

export interface WebsiteReadInput {
  page_id: string;
  offset?: number;
  max_chars?: number;
  section_id?: string;
  view?: WebsiteReadView;
  expected_source_sha256?: string;
}

interface LoadedPage {
  page: WebsitePage;
  checkedAt: number | null;
  refreshStatus: WebsiteRefreshStatus;
  fallbackSource: "bundled_snapshot" | "runtime_cache" | null;
  refreshError: { code: string; message: string } | null;
}

const DEFAULT_CACHE_MS = 5 * 60_000;
const MAX_PAGES = 5_000;
const MAX_TEXT_CHARS = 2 * 1024 * 1024;
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "can", "do", "does", "for", "from", "get", "give", "have", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "our", "please", "show", "tell", "the", "their", "them", "there", "these", "this", "to", "us", "we", "what", "when", "where", "which", "with", "would", "you", "your", "find", "need", "want", "looking",
]);
const GENERIC_TERMS = new Set(["box", "packaging", "custom", "print", "printed", "product", "page", "detail"]);

function siteOrigin(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new WebsiteContentError("INVALID_SITE_URL", "Use an absolute HTTPS website origin."); }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(url.protocol === "http:" && local)) || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new WebsiteContentError("INVALID_SITE_URL", "Use an HTTPS origin without credentials, a path, query or fragment. HTTP is allowed only for localhost tests.");
  }
  return url.origin;
}

function safePath(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 1 || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || /[\u0000-\u0020\u007f\\?#]/.test(value)) return false;
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return false; }
  if (/[\u0000-\u0020\u007f\\?#]/.test(decoded) || decoded.startsWith("//") || /%[0-9a-f]{2}/i.test(decoded) || decoded.split("/").some(part => part === "." || part === "..")) return false;
  return new URL(value, "https://example.invalid").pathname === value;
}

function validDate(value: unknown): value is string { return typeof value === "string" && Number.isFinite(Date.parse(value)); }
function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }

function assertPage(value: unknown, origin: string): asserts value is WebsitePage {
  if (!record(value) || !safePath(value.id) || value.url !== new URL(value.id, origin).href || typeof value.title !== "string" || !value.title.trim() || value.title.length > 2000 || !WEBSITE_KINDS.includes(value.kind as WebsiteKind) || typeof value.content_markdown !== "string" || value.content_markdown.length > MAX_TEXT_CHARS || !validDate(value.fetched_at) || typeof value.content_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.content_sha256) || typeof value.source_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.source_sha256)) {
    throw new WebsiteContentError("INVALID_WEBSITE_SNAPSHOT", "A website page has invalid identity, source, content or provenance. Regenerate the website snapshot.");
  }
  for (const key of ["sections", "tables", "faqs", "images", "links", "structured_data", "discovered_by"]) {
    if (!Array.isArray(value[key])) throw new WebsiteContentError("INVALID_WEBSITE_SNAPSHOT", "A website page is missing structured content. Regenerate the website snapshot.");
  }
  if (!record(value.extraction) || typeof value.extraction.truncated !== "boolean" || !Array.isArray(value.extraction.warnings)) {
    throw new WebsiteContentError("INVALID_WEBSITE_SNAPSHOT", "Website extraction metadata is missing. Regenerate the website snapshot.");
  }
  const sectionIds = new Set<string>();
  for (const section of value.sections as unknown[]) {
    if (!record(section) || typeof section.id !== "string" || !section.id || sectionIds.has(section.id) || typeof section.title !== "string" || typeof section.content !== "string" || !Number.isInteger(section.level)) {
      throw new WebsiteContentError("INVALID_WEBSITE_SNAPSHOT", "A website page has invalid or duplicate section metadata.");
    }
    sectionIds.add(section.id);
  }
}

function validateSnapshot(value: unknown): WebsiteSnapshot {
  if (!record(value) || value.schema_version !== "1.0" || typeof value.source_origin !== "string" || !validDate(value.generated_at) || !Array.isArray(value.pages) || value.pages.length > MAX_PAGES || !Array.isArray(value.failures) || !record(value.discovery) || !Array.isArray(value.discovery.discovered_paths) || !Array.isArray(value.discovery.excluded) || !Array.isArray(value.discovery.errors) || !Array.isArray(value.discovery.sources) || !Array.isArray(value.discovery.sitemap_urls) || typeof value.discovery.complete !== "boolean" || !Number.isInteger(value.discovery.catalog_records)) {
    throw new WebsiteContentError("INVALID_WEBSITE_SNAPSHOT", "The website snapshot is invalid. Run the website sync command and restart the server.");
  }
  const origin = siteOrigin(value.source_origin);
  const knownPaths = new Set<string>();
  for (const path of value.discovery.discovered_paths) {
    if (!safePath(path)) throw new WebsiteContentError("INVALID_WEBSITE_SNAPSHOT", "The website manifest contains an unsafe path.");
    knownPaths.add(path);
  }
  const pageIds = new Set<string>();
  for (const page of value.pages) {
    assertPage(page, origin);
    if (pageIds.has(page.id) || !knownPaths.has(page.id)) throw new WebsiteContentError("INVALID_WEBSITE_SNAPSHOT", "The website snapshot contains duplicate or undiscovered pages.");
    pageIds.add(page.id);
  }
  for (const failure of value.failures) {
    if (!record(failure) || !safePath(failure.path) || !knownPaths.has(failure.path) || typeof failure.reason !== "string") {
      throw new WebsiteContentError("INVALID_WEBSITE_SNAPSHOT", "The website snapshot contains invalid failure metadata.");
    }
  }
  return structuredClone(value) as unknown as WebsiteSnapshot;
}

function boundedInteger(value: number | undefined, fallback: number, minimum: number, maximum: number, field: string): number {
  const result = value ?? fallback;
  if (!Number.isSafeInteger(result) || result < minimum || result > maximum) throw new WebsiteContentError("INVALID_INPUT", `${field} must be an integer from ${minimum} to ${maximum}.`);
  return result;
}

function tokens(value: string): string[] {
  return [...new Set((value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(term => !STOP_WORDS.has(term)).map(term => {
    if (term === "boxes") return "box";
    if (term === "printing" || term === "printed") return "print";
    if (term === "finishing") return "finish";
    if (term.length > 5 && /(?:ches|shes|xes|sses)$/.test(term)) return term.slice(0, -2);
    if (term.length > 4 && term.endsWith("s") && !term.endsWith("ss")) return term.slice(0, -1);
    return term;
  }))];
}

function readableText(markdown: string): string {
  return markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[`#>*_|]/g, " ").replace(/\s+/g, " ").trim();
}

function normalQuery(query: string): { query: string; terms: string[] } {
  if (typeof query !== "string" || query.trim().length < 1 || query.trim().length > 500) throw new WebsiteContentError("INVALID_INPUT", "Supply a search query from 1 to 500 characters.");
  return { query: query.trim(), terms: tokens(query) };
}

function metadata(page: WebsitePage) {
  return {
    id: page.id, title: page.title, catalog_title: page.catalog_title, kind: page.kind,
    url: page.url, canonical_url: page.canonical_url, description: page.description,
    resource_uri: websiteResourceUri(page.id),
    fetched_at: page.fetched_at, source_last_modified: page.source_last_modified,
    content_sha256: page.content_sha256, source_sha256: page.source_sha256,
    content_characters: page.content_markdown.length,
    section_count: page.sections.length, table_count: page.tables.length, faq_count: page.faqs.length,
    image_count: page.images.length, link_count: page.links.length, structured_data_count: page.structured_data.length,
    extraction: structuredClone(page.extraction),
  };
}

/** Searches the full captured text. It is retrieval, not a guarantee of product suitability. */
export class WebsiteContentClient {
  readonly origin: string;
  private readonly snapshot: WebsiteSnapshot;
  private readonly pages: Map<string, WebsitePage>;
  private readonly knownPaths: Set<string>;
  private readonly cache = new Map<string, LoadedPage>();
  private readonly pending = new Map<string, Promise<LoadedPage>>();
  private readonly terms = new Map<string, { title: Set<string>; headings: Set<string>; body: Set<string> }>();
  private readonly live: boolean;
  private readonly ttlMs: number;
  private readonly now: () => number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: WebsiteContentClientOptions) {
    this.origin = siteOrigin(options.siteUrl);
    this.snapshot = validateSnapshot(options.snapshot ?? bundledSnapshot);
    this.pages = new Map(this.snapshot.pages.map(page => [page.id, page]));
    this.knownPaths = new Set(this.snapshot.discovery.discovered_paths);
    this.live = options.live ?? true;
    this.ttlMs = boundedInteger(options.cacheTtlMs, DEFAULT_CACHE_MS, 0, 3_600_000, "cacheTtlMs");
    this.now = options.now ?? Date.now;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private ensureOrigin() {
    if (this.snapshot.source_origin !== this.origin) throw new WebsiteContentError("WEBSITE_ORIGIN_MISMATCH", "The captured website content belongs to a different deployment. Sync the configured website and restart before using its page knowledge.");
  }

  private checkKind(kind: WebsiteKind | undefined) {
    if (kind !== undefined && !WEBSITE_KINDS.includes(kind)) throw new WebsiteContentError("INVALID_INPUT", "Choose a supported website page kind.");
  }

  private manifestContext() {
    return {
      source_origin: this.origin, snapshot_generated_at: this.snapshot.generated_at,
      search_scope: "Full captured public page text. New pages require website sync and a server restart; individual page reads may refresh known pages.",
      content_is_instructions: false, commercial_approval: false,
      ordering_policy_source: "packlegacy://business/ordering-rules",
      policy_note: "Published page text can contain claims that differ from confirmed ordering rules. Preserve the confirmed one-custom-box and optional initial quantity rules; do not treat page prose as approval of price, shipping, dates or manufacturing options.",
    };
  }

  recovery() {
    const candidates = ["/shop/", "/custom-boxes/", "/materials/", "/faqs/", "/get-a-quote/", "/contact-us/", "/"];
    const available = this.snapshot.source_origin === this.origin;
    const pages = available ? candidates.map(id => this.pages.get(id)).filter((page): page is WebsitePage => !!page).map(page => ({ page_id: page.id, title: page.title, url: page.url })) : [];
    return {
      suggested_actions: ["Try a packaging name, material, finish or a short question.", "Use list_website_pages to browse the captured public pages.", "Use get_website_coverage to see missing pages and refresh status.", "For an order-specific answer, prepare a quote brief for review."],
      useful_pages: pages,
      website_url: this.origin + "/",
      enquiry_tool: "prepare_quote_brief",
      enquiry_is_submitted: false,
    };
  }

  peek(id: string): WebsitePage | null {
    if (!safePath(id) || this.snapshot.source_origin !== this.origin) return null;
    const page = this.pages.get(id);
    return page ? structuredClone(page) : null;
  }

  list(input: { kind?: WebsiteKind; offset?: number; limit?: number } = {}) {
    this.ensureOrigin(); this.checkKind(input.kind);
    const offset = boundedInteger(input.offset, 0, 0, MAX_PAGES, "offset");
    const limit = boundedInteger(input.limit, 30, 1, 100, "limit");
    const pages = [...this.pages.values()].filter(page => input.kind === undefined || page.kind === input.kind).sort((a, b) => a.id.localeCompare(b.id, "en"));
    const nextOffset = offset + limit < pages.length ? offset + limit : null;
    return {
      ...this.manifestContext(), kind: input.kind ?? null,
      pages: pages.slice(offset, offset + limit).map(metadata),
      total_pages: pages.length, offset, limit, next_offset: nextOffset,
      next_list: nextOffset === null ? null : { ...(input.kind ? { kind: input.kind } : {}), offset: nextOffset, limit },
      recovery: pages.length ? null : this.recovery(),
    };
  }

  private ranked(query: string, kinds?: Set<WebsiteKind>) {
    const normal = normalQuery(query);
    const distinctive = normal.terms.filter(term => !GENERIC_TERMS.has(term));
    const active = distinctive.length ? distinctive : normal.terms;
    if (!active.length) return [];
    const ranked: Array<{ page: WebsitePage; score: number; terms: string[] }> = [];
    for (const page of this.pages.values()) {
      if (kinds && !kinds.has(page.kind)) continue;
      let index = this.terms.get(page.id);
      if (!index) {
        index = { title: new Set(tokens(page.title + " " + (page.catalog_title ?? "") + " " + page.id)), headings: new Set(tokens(page.sections.map(section => section.title).join(" "))), body: new Set(tokens(readableText(page.content_markdown) + " " + (page.description ?? ""))) };
        this.terms.set(page.id, index);
      }
      const matched = active.filter(term => index!.title.has(term) || index!.headings.has(term) || index!.body.has(term));
      if (!matched.length) continue;
      // Multiword searches need at least half the distinctive words. A lone generic word must not conceal an unrelated question.
      if (distinctive.length > 1 && matched.length < Math.ceil(distinctive.length / 2)) continue;
      let score = matched.reduce((sum, term) => sum + (index!.title.has(term) ? 14 : index!.headings.has(term) ? 8 : 2), 0);
      score += matched.length / active.length * 10;
      if (page.kind === "material" && active.some(term => ["material", "coating", "finish", "stock", "print"].includes(term))) score += 12;
      if (page.title.toLowerCase().includes(normal.query.toLowerCase())) score += 30;
      if (page.content_markdown.toLowerCase().includes(normal.query.toLowerCase())) score += 8;
      ranked.push({ page, score, terms: matched });
    }
    return ranked.sort((a, b) => b.score - a.score || a.page.id.localeCompare(b.page.id, "en"));
  }

  private snippet(page: WebsitePage, terms: string[]): string {
    const plain = readableText(page.content_markdown);
    const lower = plain.toLowerCase();
    const positions = terms.map(term => lower.indexOf(term)).filter(position => position >= 0);
    const start = Math.max(0, (positions.length ? Math.min(...positions) : 0) - 100);
    const end = Math.min(plain.length, start + 480);
    return (start > 0 ? "…" : "") + plain.slice(start, end) + (end < plain.length ? "…" : "");
  }

  search(input: { query: string; kind?: WebsiteKind; limit?: number }) {
    this.ensureOrigin(); this.checkKind(input.kind);
    const limit = boundedInteger(input.limit, 10, 1, 30, "limit");
    const { query } = normalQuery(input.query);
    const matches = this.ranked(query, input.kind ? new Set([input.kind]) : undefined);
    return {
      ...this.manifestContext(), query, kind: input.kind ?? null, total_matches: matches.length,
      results: matches.slice(0, limit).map(({ page, score, terms }) => ({ ...metadata(page), score, snippet: this.snippet(page, terms), read_arguments: { page_id: page.id } })),
      retrieval_note: "Matches identify relevant published text. They do not validate a manufacturing configuration, a quote or a delivery promise.",
      recovery: matches.length ? null : this.recovery(),
    };
  }

  searchProducts(input: { query: string; limit?: number }): CatalogSearchResult & { snapshot_generated_at: string; source_kind: string } {
    this.ensureOrigin();
    const limit = boundedInteger(input.limit, 8, 1, 20, "limit");
    const { query } = normalQuery(input.query);
    const matches = this.ranked(query, new Set(["product", "category"]));
    const items: CatalogItem[] = matches.slice(0, limit).map(({ page }) => ({
      product_id: page.id, title: page.catalog_title ?? page.title,
      result_type: page.kind === "product" ? "product" : "category",
      url: page.url, image_url: page.images[0]?.url ?? null,
      search_keywords: [],
    }));
    return {
      source_url: this.origin + "/sitemap_index.xml", retrieved_at: this.snapshot.generated_at,
      query, total_matches: matches.length, items,
      snapshot_generated_at: this.snapshot.generated_at, source_kind: "website_content_snapshot",
    };
  }

  private async load(id: string): Promise<LoadedPage> {
    const page = this.pages.get(id);
    if (!this.live) {
      if (!page) throw new WebsiteContentError("WEBSITE_PAGE_UNAVAILABLE", "This page was discovered but its content could not be captured. Check coverage or open the source website.");
      return { page, checkedAt: null, refreshStatus: "snapshot_only", fallbackSource: null, refreshError: null };
    }
    const cached = this.cache.get(id);
    const now = this.now();
    if (cached?.checkedAt !== null && cached?.checkedAt !== undefined && now - cached.checkedAt < this.ttlMs) {
      return { ...cached, refreshStatus: cached.refreshStatus === "snapshot_fallback" ? "snapshot_fallback" : "cache" };
    }
    const pending = this.pending.get(id);
    if (pending) return pending;
    const request = (async (): Promise<LoadedPage> => {
      try {
        const fresh = await fetchWebsitePage(id, this.origin, { fetchImpl: this.fetchImpl, kind: page?.kind, catalogTitle: page?.catalog_title });
        assertPage(fresh, this.origin);
        if (fresh.id !== id) throw new WebsiteContentError("WEBSITE_IDENTITY_CHANGED", "The source resolved to a different page. Refresh the website manifest before using it.");
        if (page) {
          fresh.kind = page.kind;
          fresh.catalog_title = page.catalog_title;
          fresh.discovered_by = [...page.discovered_by];
        }
        this.pages.set(id, fresh); this.terms.delete(id);
        const loaded: LoadedPage = { page: fresh, checkedAt: this.now(), refreshStatus: "fresh", fallbackSource: null, refreshError: null };
        this.cache.set(id, loaded);
        return loaded;
      } catch (error) {
        const fallback = this.pages.get(id);
        if (!fallback) throw new WebsiteContentError("WEBSITE_PAGE_UNAVAILABLE", "The discovered page could not be fetched. Check coverage or use a related page and prepare an enquiry for the missing details.");
        const safeError = error instanceof WebsiteSourceError || error instanceof WebsiteContentError
          ? { code: error.code, message: error.message }
          : { code: "WEBSITE_FETCH_FAILED", message: "A current copy of the page could not be retrieved." };
        const loaded: LoadedPage = { page: fallback, checkedAt: this.now(), refreshStatus: "snapshot_fallback", fallbackSource: cached?.fallbackSource === "runtime_cache" || (cached && cached.refreshStatus !== "snapshot_fallback") ? "runtime_cache" : "bundled_snapshot", refreshError: safeError };
        this.cache.set(id, loaded);
        return loaded;
      }
    })();
    this.pending.set(id, request);
    try { return await request; } finally { this.pending.delete(id); }
  }

  async read(input: WebsiteReadInput) {
    this.ensureOrigin();
    if (!safePath(input.page_id)) throw new WebsiteContentError("INVALID_PAGE_ID", "Use an exact relative page_id returned by search_website_content or list_website_pages.");
    if (!this.knownPaths.has(input.page_id)) throw new WebsiteContentError("WEBSITE_PAGE_NOT_FOUND", "This page is not in the captured website manifest. Search or list known pages; a website sync is required to discover new pages.");
    const view = input.view ?? "content";
    if (!WEBSITE_READ_VIEWS.includes(view)) throw new WebsiteContentError("INVALID_INPUT", "Choose a supported page view.");
    const maxChars = boundedInteger(input.max_chars, 8000, 500, 20_000, "max_chars");
    const offset = boundedInteger(input.offset, 0, 0, MAX_TEXT_CHARS * 8, "offset");
    if (input.section_id !== undefined && (view !== "content" || typeof input.section_id !== "string" || !input.section_id || input.section_id.length > 500)) {
      throw new WebsiteContentError("INVALID_INPUT", "section_id selects a known section only in the content view.");
    }
    if (input.expected_source_sha256 !== undefined && !/^[a-f0-9]{64}$/.test(input.expected_source_sha256)) {
      throw new WebsiteContentError("INVALID_INPUT", "expected_source_sha256 must be the source hash returned with the preceding page chunk.");
    }
    const loaded = await this.load(input.page_id);
    const page = loaded.page;
    if (input.expected_source_sha256 !== undefined && input.expected_source_sha256 !== page.source_sha256) {
      throw new WebsiteContentError("WEBSITE_PAGE_CHANGED", "The page changed between reads. Restart this view at offset zero to avoid combining different revisions.", {
        current_source_sha256: page.source_sha256,
        restart_read: { page_id: page.id, view, ...(input.section_id ? { section_id: input.section_id } : {}), offset: 0, max_chars: maxChars },
      });
    }
    const section = input.section_id === undefined ? null : page.sections.find(item => item.id === input.section_id);
    if (input.section_id !== undefined && !section) throw new WebsiteContentError("WEBSITE_SECTION_NOT_FOUND", "This section does not exist in the current page. Read the sections view to find available section IDs.");
    const data = view === "content" ? null : page[view];
    const full = view === "content" ? (section ? section.content : page.content_markdown) : JSON.stringify(data, null, 2);
    if (offset > full.length) throw new WebsiteContentError("INVALID_OFFSET", "The offset is beyond this page view. Restart at offset zero using the current content hash.");
    const content = full.slice(offset, offset + maxChars);
    const nextOffset = offset + content.length < full.length ? offset + content.length : null;
    const age = Math.max(0, this.now() - Date.parse(page.fetched_at));
    const stale = loaded.refreshStatus === "snapshot_fallback" || age > this.ttlMs;
    return {
      ...this.manifestContext(), page: metadata(page), view,
      section_id: input.section_id ?? null,
      content, format: view === "content" ? "markdown" : (offset === 0 && nextOffset === null ? "json" : "json_fragment"),
      ...(view !== "content" && offset === 0 && nextOffset === null ? { data: structuredClone(data) } : {}),
      offset, max_chars: maxChars, returned_characters: content.length, total_characters: full.length,
      next_offset: nextOffset, has_more: nextOffset !== null,
      next_read: nextOffset === null ? null : { page_id: page.id, view, ...(input.section_id ? { section_id: input.section_id } : {}), offset: nextOffset, max_chars: maxChars, expected_source_sha256: page.source_sha256 },
      pagination_note: "Offsets count JavaScript UTF-16 characters. Follow next_read, including its expected source hash, and concatenate content slices in order. JSON fragments become valid JSON when concatenated. A changed source revision returns WEBSITE_PAGE_CHANGED and restart instructions.",
      available_views: [...WEBSITE_READ_VIEWS],
      sections: page.sections.slice(0, 30).map(item => ({ id: item.id, title: item.title, level: item.level, content_characters: item.content.length })),
      section_index_has_more: page.sections.length > 30,
      source: {
        url: page.url, canonical_url: page.canonical_url, fetched_at: page.fetched_at,
        source_last_modified: page.source_last_modified,
        content_sha256: page.content_sha256, source_sha256: page.source_sha256,
        snapshot_generated_at: this.snapshot.generated_at,
        refresh_status: loaded.refreshStatus, refresh_checked_at: loaded.checkedAt === null ? null : new Date(loaded.checkedAt).toISOString(),
        stale, age_seconds: Math.floor(age / 1000), live_read_enabled: this.live,
        fallback_source: loaded.fallbackSource, refresh_error: loaded.refreshError,
        evidence: "site_published_unreviewed", discovered_by: [...page.discovered_by],
      },
    };
  }

  coverage() {
    const compatible = this.origin === this.snapshot.source_origin;
    const counts: Record<WebsiteKind, number> = Object.fromEntries(WEBSITE_KINDS.map(kind => [kind, 0])) as Record<WebsiteKind, number>;
    for (const page of this.pages.values()) counts[page.kind]++;
    const missing = [...this.knownPaths].filter(id => !this.pages.has(id)).sort();
    const failures = this.snapshot.failures.filter(failure => missing.includes(failure.path));
    const truncated = [...this.pages.values()].filter(page => page.extraction.truncated).map(page => page.id);
    const indexed = compatible ? this.pages.size : 0;
    const age = Math.max(0, this.now() - Date.parse(this.snapshot.generated_at));
    const complete = compatible && this.snapshot.discovery.complete && this.snapshot.discovery.errors.length === 0 && missing.length === 0 && truncated.length === 0;
    return {
      ...this.manifestContext(),
      status: !compatible ? "origin_mismatch" : complete ? "all_discovered_pages_indexed" : "partial",
      configured_origin: this.origin, snapshot_source_origin: this.snapshot.source_origin,
      content_available_for_configured_origin: compatible,
      discovery_complete: this.snapshot.discovery.complete,
      all_discovered_pages_indexed: complete,
      discovered_page_count: this.knownPaths.size, indexed_page_count: indexed,
      snapshot_indexed_page_count: this.snapshot.pages.length,
      missing_page_count: missing.length, missing_page_ids: missing.slice(0, 100), missing_ids_omitted: Math.max(0, missing.length - 100),
      counts_by_kind: compatible ? counts : null,
      failures: structuredClone(failures.slice(0, 100)), failures_omitted: Math.max(0, failures.length - 100),
      truncated_page_ids: truncated,
      discovery_errors: structuredClone(this.snapshot.discovery.errors),
      discovery_sources: [...this.snapshot.discovery.sources], sitemap_urls: [...this.snapshot.discovery.sitemap_urls],
      catalog_record_count: this.snapshot.discovery.catalog_records,
      excluded_url_count: this.snapshot.discovery.excluded.length,
      exclusion_examples: structuredClone(this.snapshot.discovery.excluded.slice(0, 20)),
      snapshot_age_seconds: Math.floor(age / 1000), snapshot_is_live_verification: false,
      refresh: { known_page_reads_refresh: this.live, cache_ttl_seconds: this.ttlMs / 1000, discovery_refresh_command: "npm run sync:website", restart_after_sync: true },
      completeness_scope: "Coverage is measured against the public URLs discovered through the configured sitemaps, search catalogue, llms document and followed internal links. Private, unlinked, authentication-only or client-only application data is not established by this report.",
      recovery: complete ? null : this.recovery(),
    };
  }
}
