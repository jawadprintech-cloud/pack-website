import { CatalogClient, CatalogError, type CatalogItemResult, type CatalogSearchResult } from "./catalog";
import type { WebsiteContentClient } from "./website-content";

/** Uses the indexed public website as a labelled fallback, without inventing catalogue entries. */
export class WebsiteAwareCatalog extends CatalogClient {
  constructor(private readonly original: CatalogClient, private readonly website: WebsiteContentClient, siteUrl: string) {
    super({ siteUrl });
  }

  override async search(input: { query: string; limit?: number }): Promise<CatalogSearchResult> {
    let original: CatalogSearchResult | null = null;
    let unavailable: string | null = null;
    try {
      original = await this.original.search(input);
      if (original.items.length) return original;
    } catch (error) {
      if (!(error instanceof CatalogError) || ["INVALID_QUERY", "INVALID_LIMIT"].includes(error.code)) throw error;
      unavailable = error.code;
    }
    const fallback = this.website.searchProducts(input);
    if (fallback.items.length || !original) {
      return {
        ...fallback,
        catalogue_context: {
          source_kind: "website_content_index",
          live_catalogue_error: unavailable,
          reason: original ? "No title/keyword matches; searched indexed page content." : "The live catalogue is unavailable; returning dated public website records.",
          content_search_tool: "search_website_content",
        },
      };
    }
    return original;
  }

  override async getItem(productId: string): Promise<CatalogItemResult> {
    try { return await this.original.getItem(productId); }
    catch (error) {
      if (!(error instanceof CatalogError) || error.code === "INVALID_PRODUCT_ID") throw error;
      const page = this.website.peek(productId);
      if (!page || !["product", "category"].includes(page.kind)) throw error;
      return {
        source_url: page.url,
        retrieved_at: page.fetched_at,
        item: {
          product_id: page.id,
          title: page.catalog_title ?? page.title,
          result_type: page.kind as "product" | "category",
          url: page.url,
          image_url: page.images[0]?.url ?? null,
          search_keywords: [],
        },
        catalogue_context: {
          source_kind: "website_content_index",
          live_catalogue_error: error.code,
          reason: error.code === "NOT_FOUND" ? "This public page is indexed, but its identity was not found in the current catalogue response." : "The live catalogue is unavailable; this identity comes from a dated public page.",
          content_search_tool: "search_website_content",
        },
      };
    }
  }
}
