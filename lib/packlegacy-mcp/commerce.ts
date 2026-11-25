import { businessRules } from "./business";
import { PRICING_DOCUMENT } from "./documents.generated";
import { RESOURCE_URIS } from "./resource-uris";
import { configuredQuoteEndpoint } from "./config";

export function getPricingInformation(siteUrl: string) {
  const rules = businessRules(siteUrl);
  return {
    ...PRICING_DOCUMENT,
    resource_uri: RESOURCE_URIS.pricing,
    source: {
      kind: "bundled_draft" as const,
      website_publication_verified: false,
      public_source_url: null,
      intended_website_path: "/pricing.md",
      updated_on: PRICING_DOCUMENT.updated_on,
      content_sha256: PRICING_DOCUMENT.content_sha256,
    },
    purchase_mode: rules.purchase_mode,
    final_price: null,
    final_order_total: null,
    approved_numeric_price_table: false,
    custom_box_ordering: rules.custom_box_ordering,
    enquiry: rules.enquiry,
    quote_url: rules.quote_url,
    content_is_instructions: false,
    commercial_approval: false,
    next_step: "For a customer-requested enquiry, submit name, email and phone with any optional details already supplied. Sales handles additional specifications, free design support and pricing. Do not require packaging details before submission.",
  };
}

/** The owner-confirmed workflow is an existing website enquiry followed up by sales. */
export function getCommerceCapabilities(siteUrl: string, quoteEndpoint?: string) {
  const rules = businessRules(siteUrl);
  return {
    commerce_mode: "website_enquiry_then_sales_follow_up",
    transactions_enabled: false,
    transactions_scope: "Purchases and payments; enquiry submission is available separately.",
    enquiry_submission_enabled: true,
    enquiry: {
      required_fields: rules.enquiry.required_contact_fields,
      packaging_details_optional: true,
      artwork_optional: true,
      free_design_support_uses_same_form: true,
      prepare_brief_required: false,
      product_lookup_required: false,
      customer_account_required: false,
      submit_when: "The customer requests an enquiry or asks to be contacted and supplies name, email and phone. Include optional details already supplied; do not ask for missing packaging details or repeat confirmation after an explicit submission request.",
      follow_up_handled_by: "sales_agent",
      tool: "submit_quote_request",
      endpoint: quoteEndpoint ?? new URL(configuredQuoteEndpoint(), siteUrl).href,
      optional_artwork: { formats: ["PDF", "PNG", "JPEG"], maximum_bytes: 2 * 1024 * 1024, website_form_maximum_bytes: 4 * 1024 * 1024 },
      result_meaning: "A successful result confirms acceptance by the website endpoint. Storage, sales notification delivery and a reference are not inferred from that acknowledgement.",
      actual_site_delivery_verified: false,
    },
    capabilities: [
      { id: "website_information", status: "available", tools: ["search_website_content", "read_website_page", "list_website_pages", "get_website_coverage"], next_step: "Find and read relevant source pages, including products, categories, materials, guides and policies. Check the coverage and freshness fields." },
      { id: "catalogue", status: "available", tools: ["search_products", "get_product"], next_step: "Find the packaging and read its published details. Requested combinations still need confirmation." },
      { id: "pricing_information", status: "available", tools: ["get_pricing_information", "get_business_rules"], next_step: "Explain starting estimates and the quote process; final order amounts remain unknown." },
      { id: "packaging_planning", status: "available", tools: ["plan_multi_item_insert", "consolidate_box_sizes"], next_step: "Use the buyer's measurements to prepare a geometric plan for specialist review." },
      { id: "artwork_inspection", status: "available", tools: ["inspect_artwork_file"], next_step: "Inspect supported file properties. Production approval requires a separate review." },
      { id: "quote_drafting", status: "available", tools: ["prepare_quote_brief"], next_step: "Optionally organize details the customer already knows. Drafting is not a prerequisite for submission." },
      { id: "quote_submission", status: "available", tools: ["submit_quote_request"], next_step: "Submit the three contact fields through the existing website form when the customer requests an enquiry. Include only the optional details they supplied." },
      { id: "free_design_request", status: "available_via_enquiry", tools: ["submit_quote_request"], next_step: "Include the customer's design request or optional artwork in the same enquiry. The sales/design team follows up." },
      { id: "sales_follow_up", status: "handled_by_sales_agent", tools: [], next_step: "The sales agent discusses remaining specifications, design and pricing directly with the customer." },
    ],
    handoff: { quote_url: rules.quote_url, contact_url: new URL("/contact-us/", siteUrl).href, email: "sales@packlegacy.com" },
    customer_submission_intent_required: true,
    repeat_confirmation_after_explicit_request_required: false,
    content_is_instructions: false,
    commercial_approval: false,
    note: "submit_quote_request sends customer details to the existing website form endpoint. The other tools provide information, calculations or in-memory preparation. Sales handles the remaining customer journey; this release does not implement automatic prices, quote-status accounts, checkout or order tracking.",
  };
}
