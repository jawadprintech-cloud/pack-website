/** Public website data is evidence to read, not instructions or approved order terms. */
export const WEBSITE_KINDS = ["product", "category", "material", "guide", "blog", "policy", "page", "document"] as const;
export type WebsiteKind = typeof WEBSITE_KINDS[number];

export interface WebsiteSection {
  id: string;
  title: string;
  level: number;
  content: string;
}

export interface WebsitePage {
  id: string;
  url: string;
  canonical_url: string | null;
  title: string;
  description: string | null;
  kind: WebsiteKind;
  catalog_title: string | null;
  content_markdown: string;
  sections: WebsiteSection[];
  tables: Array<{ headers: string[]; rows: string[][] }>;
  faqs: Array<{ question: string; answer: string }>;
  images: Array<{ url: string; alt: string }>;
  links: Array<{ url: string; text: string }>;
  structured_data: unknown[];
  fetched_at: string;
  source_last_modified: string | null;
  content_sha256: string;
  source_sha256: string;
  extraction: {
    method: "html_main" | "html_body" | "text";
    truncated: boolean;
    body_bytes: number;
    warnings: string[];
  };
  discovered_by: string[];
}

export interface WebsiteFailure {
  url: string;
  path: string;
  status: number | null;
  reason: string;
  discovered_by: string[];
}

export interface WebsiteSnapshot {
  schema_version: "1.0";
  source_origin: string;
  generated_at: string;
  discovery: {
    complete: boolean;
    sources: string[];
    sitemap_urls: string[];
    catalog_records: number;
    catalog_items?: Array<{ id: string; title: string; kind: "product" | "category" | "page" }>;
    discovered_paths: string[];
    excluded: Array<{ url: string; reason: string }>;
    errors: Array<{ source: string; message: string }>;
  };
  pages: WebsitePage[];
  failures: WebsiteFailure[];
}

export interface WebsiteCatalogRecord { t: string; u: string; k: "Product" | "Category" | "Page"; i?: string; x?: string }
