import type { CatalogClient } from "./catalog";
import { businessRules, orderingRuleForItem } from "./business";
import { getProductKnowledge } from "./knowledge";
import { RESOURCE_URIS, productResourceUri } from "./resource-uris";
import { WebsiteContentError, type WebsiteContentClient } from "./website-content";

/** One product response implementation shared by tools and MCP resources. */
export async function getProductDetails(productId: string, catalog: CatalogClient, siteUrl: string, website?: WebsiteContentClient, contentOptions: { offset?: number; max_chars?: number; expected_source_sha256?: string } = {}) {
  // These reads are independent. Their upstream deadlines must not add together
  // and exceed the Next.js route's execution budget during an outage.
  const readContent = async () => {
    let websiteContent: Awaited<ReturnType<WebsiteContentClient["read"]>> | null = null;
    let contentError: { code: string; message: string } | null = null;
    if (website) {
      try { websiteContent = await website.read({ page_id: productId, offset: contentOptions.offset, max_chars: contentOptions.max_chars, expected_source_sha256: contentOptions.expected_source_sha256 }); }
      catch (error) {
        if (error instanceof WebsiteContentError && ["INVALID_INPUT", "INVALID_OFFSET", "WEBSITE_PAGE_CHANGED"].includes(error.code)) throw error;
        contentError = error instanceof WebsiteContentError
          ? { code: error.code, message: error.message }
          : { code: "WEBSITE_CONTENT_UNAVAILABLE", message: "The page details are unavailable. Use the website coverage tool for recovery." };
      }
    }
    return { websiteContent, contentError };
  };
  const [record, { websiteContent, contentError }] = await Promise.all([catalog.getItem(productId), readContent()]);
  const knowledge = getProductKnowledge(record.item);
  const rules = businessRules(siteUrl);
  const resourceUri = productResourceUri(record.item.product_id);
  return {
    ...record,
    detail_level: websiteContent ? "catalogue_with_website_content" : knowledge.status === "reviewed_public_description"
      ? "catalogue_with_reviewed_description"
      : "public_search_index",
    knowledge,
    website_content: websiteContent,
    content_access: {
      status: websiteContent ? "indexed_public_page" : contentError?.code === "WEBSITE_PAGE_NOT_FOUND" ? "not_in_website_snapshot" : "unavailable",
      read_tool: "read_website_page",
      page_id: productId,
      error: contentError,
      available_views: ["content", "sections", "tables", "faqs", "images", "links", "structured_data"],
      note: "Published page details describe the product. They do not approve a requested configuration, price or delivery commitment.",
    },
    ordering: orderingRuleForItem(record.item),
    enquiry: rules.enquiry,
    pricing: {
      purchase_mode: rules.purchase_mode,
      starting_price: null,
      final_price: rules.pricing.final_price,
      source: "not_provided_by_search_index",
      starting_prices_are_indicative: rules.pricing.starting_prices_are_indicative,
      approved_offer_required_before_purchase: rules.pricing.approved_offer_required_before_purchase,
    },
    configuration_rules: null,
    configuration_rules_status: "requires_authoritative_product_data",
    resource_uri: resourceUri,
    related_resources: [resourceUri, RESOURCE_URIS.ordering_rules, RESOURCE_URIS.quote_requirements, RESOURCE_URIS.materials_finishes],
    next_action: {
      type: "prepare_quote_brief",
      quote_url: rules.quote_url,
      instruction: "Use the known requirements to prepare a brief. Descriptive features are not approved configuration options; ask for specialist validation.",
    },
  };
}
