/** Public catalogue adapter. It deliberately does not calculate prices or validate manufacturing options. */

export class CatalogError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'CatalogError';
    this.code = code;
  }
}

export interface CatalogItem {
  product_id: string;
  title: string;
  result_type: 'product' | 'category';
  url: string;
  image_url: string | null;
  /** Search labels from the existing index; these are not supported materials or options. */
  search_keywords: string[];
}

export interface CatalogSearchResult {
  catalogue_context?: { source_kind: string; live_catalogue_error: string | null; reason: string; content_search_tool: string };
  source_url: string;
  retrieved_at: string;
  query: string;
  total_matches: number;
  items: CatalogItem[];
}

export interface CatalogItemResult {
  catalogue_context?: { source_kind: string; live_catalogue_error: string | null; reason: string; content_search_tool: string };
  source_url: string;
  retrieved_at: string;
  item: CatalogItem;
}

export interface CatalogClientOptions {
  siteUrl: string;
  ttlMs?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

interface Snapshot {
  retrievedAt: string;
  items: CatalogItem[];
}

const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_RECORDS = 5_000;
const MAX_QUERY_LENGTH = 500;
const MAX_SEARCH_LIMIT = 20;

const STOP_WORDS = new Set([
  'i', 'we', 'me', 'my', 'our', 'you', 'your', 'need', 'needs', 'want', 'would',
  'like', 'looking', 'look', 'find', 'show', 'please', 'some', 'a', 'an', 'the',
  'with', 'without', 'and', 'or', 'for', 'of', 'in', 'to', 'on', 'at', 'is',
  'are', 'can', 'have', 'order', 'buy', 'quantity', 'qty', 'unit', 'units',
  'piece', 'pieces', 'logo',
]);
const GENERIC_WORDS = new Set(['box', 'packaging', 'custom', 'printed', 'print']);

function tokenise(value: string): string[] {
  const words = value.toLocaleLowerCase('en-US').match(/[\p{L}\p{N}]+/gu) ?? [];
  const normalise = (word: string): string => {
    if (word === 'boxes') return 'box';
    if (word.length > 4 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    return word;
  };
  return [...new Set(words.filter(word => !/^\d+$/.test(word) && !STOP_WORDS.has(word)).map(normalise))];
}

function matchWeight(term: string, candidates: string[]): number {
  if (candidates.includes(term)) return 1;
  if (term.length >= 4 && candidates.some(candidate => candidate.startsWith(term))) return 0.5;
  return 0;
}

function relevance(item: CatalogItem, queryTerms: string[]): number {
  const title = tokenise(item.title);
  const keywords = tokenise(item.search_keywords.join(' '));
  const path = tokenise(item.product_id);
  const distinctive = queryTerms.filter(term => !GENERIC_WORDS.has(term));
  const active = distinctive.length ? distinctive : queryTerms;
  let matchedDistinctive = 0;
  let score = 0;

  for (const [index, term] of active.entries()) {
    const titleMatch = matchWeight(term, title);
    const keywordMatch = matchWeight(term, keywords);
    const pathMatch = matchWeight(term, path);
    const best = Math.max(titleMatch * 12, keywordMatch * 4, pathMatch * 2);
    if (best > 0) {
      matchedDistinctive += 1;
      score += best;
      // The first distinctive term usually names the requested packaging family.
      if (index === 0) score += titleMatch * 4;
    }
  }

  if (!matchedDistinctive) return 0;
  if (distinctive.length) {
    for (const term of queryTerms.filter(term => GENERIC_WORDS.has(term))) {
      score += matchWeight(term, title) * 0.5;
    }
  }
  score += Math.max(0, matchedDistinctive - 1) * 4;
  return score;
}

function makeOrigin(siteUrl: string): string {
  let url: URL;
  try {
    url = new URL(siteUrl);
  } catch {
    throw new CatalogError('INVALID_SITE_URL', 'siteUrl must be an absolute HTTPS origin.');
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (
    !(url.protocol === 'https:' || (url.protocol === 'http:' && local)) ||
    url.username || url.password || url.search || url.hash || url.pathname !== '/'
  ) {
    throw new CatalogError('INVALID_SITE_URL', 'Use an HTTPS origin without credentials, path, query or fragment. HTTP is allowed only for localhost tests.');
  }
  return url.origin;
}

function relativePath(value: unknown, origin: string): string {
  if (typeof value !== 'string' || value.length > 2048 || !value.startsWith('/') || value.startsWith('//')) {
    throw new Error('Expected a relative same-origin path.');
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new Error('Malformed path encoding.');
  }
  if (
    /[\u0000-\u0020\u007f\\?#]/.test(value) ||
    /[\u0000-\u0020\u007f\\?#]/.test(decoded) ||
    decoded.startsWith('//') || /%[0-9a-f]{2}/i.test(decoded) ||
    decoded.split('/').some(segment => segment === '.' || segment === '..')
  ) {
    throw new Error('Unsafe catalogue path.');
  }
  const parsed = new URL(value, origin);
  if (parsed.origin !== origin || parsed.search || parsed.hash) throw new Error('Catalogue path left the configured origin.');
  return value;
}

function parseCatalogue(value: unknown, origin: string): CatalogItem[] {
  if (!Array.isArray(value) || value.length > MAX_RECORDS) {
    throw new CatalogError('MALFORMED_CATALOG', 'The catalogue must be an array within the supported record limit.');
  }
  const items: CatalogItem[] = [];
  const seen = new Set<string>();
  try {
    for (const raw of value) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid record.');
      const record = raw as Record<string, unknown>;
      if (typeof record.t !== 'string' || !record.t.trim() || record.t.length > 512) throw new Error('Invalid title.');
      if (typeof record.k !== 'string' || !['Product', 'Category', 'Page'].includes(record.k)) throw new Error('Invalid record kind.');
      if (record.i !== undefined && typeof record.i !== 'string') throw new Error('Invalid image.');
      if (record.x !== undefined && (typeof record.x !== 'string' || record.x.length > 4096)) throw new Error('Invalid keywords.');
      const path = relativePath(record.u, origin);
      const imagePath = record.i === undefined ? null : relativePath(record.i, origin);
      if (record.k !== 'Product' && record.k !== 'Category') continue;
      if (seen.has(path)) throw new Error('Duplicate catalogue identifier.');
      seen.add(path);
      items.push({
        product_id: path,
        title: record.t.trim(),
        result_type: record.k === 'Product' ? 'product' : 'category',
        url: new URL(path, origin).href,
        image_url: imagePath === null ? null : new URL(imagePath, origin).href,
        search_keywords: typeof record.x === 'string'
          ? record.x.split(/[,;|]/).map(keyword => keyword.trim()).filter(Boolean)
          : [],
      });
    }
  } catch (error) {
    throw new CatalogError('MALFORMED_CATALOG', 'The catalogue contains an invalid record or unsafe path.');
  }
  return items;
}

async function readBoundedJson(response: Response): Promise<unknown> {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
    void response.body?.cancel().catch(() => undefined);
    throw new CatalogError('RESPONSE_TOO_LARGE', 'The catalogue response exceeds the supported size.');
  }
  if (!response.body) throw new CatalogError('MALFORMED_CATALOG', 'The catalogue response is empty.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        void reader.cancel().catch(() => undefined);
        throw new CatalogError('RESPONSE_TOO_LARGE', 'The catalogue response exceeds the supported size.');
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new CatalogError('MALFORMED_CATALOG', 'The catalogue response is not valid UTF-8 JSON.');
  }
}

function cloneItem(item: CatalogItem): CatalogItem {
  return { ...item, search_keywords: [...item.search_keywords] };
}

export class CatalogClient {
  readonly sourceUrl: string;
  private readonly origin: string;
  private readonly ttlMs: number;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private cached?: { snapshot: Snapshot; expiresAt: number };
  private inFlight?: Promise<Snapshot>;

  constructor(options: CatalogClientOptions) {
    this.origin = makeOrigin(options.siteUrl);
    this.sourceUrl = this.origin + '/api/search/';
    this.ttlMs = options.ttlMs ?? 60_000;
    this.timeoutMs = options.timeoutMs ?? 15_000;
    if (!Number.isFinite(this.ttlMs) || this.ttlMs < 0 || this.ttlMs > 3_600_000) {
      throw new CatalogError('INVALID_OPTIONS', 'ttlMs must be between 0 and 3600000.');
    }
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs < 1 || this.timeoutMs > 30_000) {
      throw new CatalogError('INVALID_OPTIONS', 'timeoutMs must be between 1 and 30000.');
    }
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async search(input: { query: string; limit?: number }): Promise<CatalogSearchResult> {
    if (typeof input.query !== 'string' || !input.query.trim() || input.query.length > MAX_QUERY_LENGTH) {
      throw new CatalogError('INVALID_QUERY', 'Provide a nonempty search query of at most 500 characters.');
    }
    const limit = input.limit ?? 8;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_SEARCH_LIMIT) {
      throw new CatalogError('INVALID_LIMIT', 'limit must be an integer between 1 and 20.');
    }
    const snapshot = await this.load();
    const terms = tokenise(input.query);
    const ranked = snapshot.items
      .map(item => ({ item, score: relevance(item, terms) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'en'));
    return {
      source_url: this.sourceUrl,
      retrieved_at: snapshot.retrievedAt,
      query: input.query.trim(),
      total_matches: ranked.length,
      items: ranked.slice(0, limit).map(result => cloneItem(result.item)),
    };
  }

  async getItem(productId: string): Promise<CatalogItemResult> {
    try {
      relativePath(productId, this.origin);
    } catch {
      throw new CatalogError('INVALID_PRODUCT_ID', 'Use a relative product_id returned by catalogue search.');
    }
    const snapshot = await this.load();
    const item = snapshot.items.find(candidate => candidate.product_id === productId);
    if (!item) throw new CatalogError('NOT_FOUND', 'No product or category with that product_id exists in the current catalogue.');
    return { source_url: this.sourceUrl, retrieved_at: snapshot.retrievedAt, item: cloneItem(item) };
  }

  private async load(): Promise<Snapshot> {
    if (this.cached && this.cached.expiresAt > Date.now()) return this.cached.snapshot;
    if (this.inFlight) return this.inFlight;
    // An expired snapshot is never used as a fallback after an upstream failure.
    this.cached = undefined;
    const pending = this.loadRemote().then(snapshot => {
      this.cached = { snapshot, expiresAt: Date.now() + this.ttlMs };
      return snapshot;
    }).finally(() => {
      if (this.inFlight === pending) this.inFlight = undefined;
    });
    this.inFlight = pending;
    return pending;
  }

  private async loadRemote(): Promise<Snapshot> {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new CatalogError('UPSTREAM_TIMEOUT', 'The catalogue request timed out. Please retry.'));
      }, this.timeoutMs);
    });
    const request = (async (): Promise<Snapshot> => {
      const response = await this.fetchImpl(this.sourceUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        redirect: 'error',
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) {
        void response.body?.cancel().catch(() => undefined);
        throw new CatalogError('UPSTREAM_ERROR', 'The catalogue service returned HTTP ' + response.status + '.');
      }
      const type = response.headers.get('content-type') ?? '';
      if (!/(?:application\/json|application\/[a-z0-9.+-]+\+json)(?:\s*;|$)/i.test(type)) {
        void response.body?.cancel().catch(() => undefined);
        throw new CatalogError('MALFORMED_CATALOG', 'The catalogue response must have a JSON content type.');
      }
      const body = await readBoundedJson(response);
      return { retrievedAt: new Date().toISOString(), items: parseCatalogue(body, this.origin) };
    })();
    try {
      return await Promise.race([request, timeout]);
    } catch (error) {
      if (controller.signal.aborted) throw new CatalogError('UPSTREAM_TIMEOUT', 'The catalogue request timed out. Please retry.');
      if (error instanceof CatalogError) throw error;
      throw new CatalogError('UPSTREAM_ERROR', 'The catalogue service could not be reached or its response could not be read.');
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
