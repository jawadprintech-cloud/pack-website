/** Stable MCP identifiers, not public web URLs. Product IDs are encoded as one segment. */
export const RESOURCE_URIS = {
  ordering_rules: "packlegacy://business/ordering-rules",
  quote_requirements: "packlegacy://guides/quote-requirements",
  materials_finishes: "packlegacy://guides/materials-finishes",
  website_coverage: "packlegacy://website/coverage",
  pricing: "packlegacy://documents/pricing",
  llms: "packlegacy://documents/llms",
  commerce_capabilities: "packlegacy://business/commerce-capabilities",
} as const;

export const PRODUCT_RESOURCE_TEMPLATE = "packlegacy://catalog/products/{id}";
export const WEBSITE_RESOURCE_TEMPLATE = "packlegacy://website/pages/{id}";

export function productResourceUri(productId: string): string {
  return "packlegacy://catalog/products/" + encodeURIComponent(productId);
}

export function websiteResourceUri(pageId: string): string {
  return "packlegacy://website/pages/" + encodeURIComponent(pageId);
}
