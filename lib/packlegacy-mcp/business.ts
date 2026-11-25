import { z } from "zod";
import type { CatalogClient, CatalogItem } from "./catalog";
import policySource from "./knowledge/business-rules.json";
import { RESOURCE_URIS } from "./resource-uris";

// Validate the maintained policy once; every tool/resource reads this same object.
const policy = z.object({
  business: z.string().min(1),
  policy_revision: z.string().min(1),
  evidence: z.string().min(1),
  purchase_mode: z.literal("quote_required"),
  custom_box_ordering: z.object({
    minimum_quantity: z.number().int().positive(),
    one_box_can_be_supplied_and_shipped: z.boolean(),
    scope: z.literal("custom boxes"),
    source: z.literal("owner_confirmed"),
  }).strict(),
  enquiry: z.object({
    required_contact_fields: z.tuple([z.literal("name"), z.literal("email"), z.literal("phone")]),
    packaging_details_required: z.literal(false),
    artwork_required: z.literal(false),
    design_support_uses_same_form: z.literal(true),
    follow_up_handled_by: z.literal("sales_agent"),
    quantity_required: z.boolean(),
    unknown_quantity: z.null(),
    final_offer_requires_exact_quantity: z.boolean(),
  }).strict(),
  pricing: z.object({
    shared_starting_prices_are_allowed: z.boolean(),
    starting_prices_are_indicative: z.boolean(),
    final_price: z.null(),
    approved_offer_required_before_purchase: z.boolean(),
  }).strict(),
  needs_owner_alignment: z.array(z.string().min(1)),
  note: z.string().min(1),
}).strict().parse(policySource);

export const quoteBriefSchema = z.object({
  product_id: z.string().min(1).max(240).nullable().optional()
    .describe("A product_id returned by search_products, or null if undecided."),
  quantity: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).nullable().optional()
    .describe("Optional during enquiry. Keep undecided quantities null; never assume 1 or 50."),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(["mm", "cm", "in"]).optional(),
    basis: z.enum(["internal", "external", "packed_product", "undecided"]).optional(),
  }).strict().nullable().optional(),
  material_requested: z.string().trim().max(160).nullable().optional(),
  printing_requested: z.string().trim().max(240).nullable().optional(),
  finishes_requested: z.array(z.string().trim().min(1).max(100)).max(10).optional(),
  inserts_requested: z.string().trim().max(240).nullable().optional(),
  delivery_country: z.string().regex(/^[A-Z]{2}$/).nullable().optional()
    .describe("Two-letter country code, for example US or GB."),
  delivery_postcode: z.string().trim().max(32).nullable().optional(),
  requested_delivery_date: z.iso.date().nullable().optional()
    .describe("Requested date only; it is not a confirmed delivery commitment."),
  artwork_state: z.enum(["ready", "not_ready", "design_help_needed", "undecided"]).optional(),
  notes: z.string().trim().max(2000).optional(),
}).strict();

export type QuoteBriefInput = z.infer<typeof quoteBriefSchema>;

export function businessRules(siteUrl: string) {
  const origin = new URL(siteUrl).origin;
  return {
    ...structuredClone(policy),
    quote_url: new URL("/get-a-quote/", origin).href,
    sample_url: new URL("/sample-kits/", origin).href,
  };
}

export function orderingRuleForItem(item: CatalogItem | null) {
  // Conservative identification; dividers, inserts and bags do not inherit a box policy.
  const explicitlyNamedBox = item ? /\bbox(?:es)?$/i.test(item.title) : false;
  return {
    minimum_quantity: explicitlyNamedBox ? policy.custom_box_ordering.minimum_quantity : null,
    scope: explicitlyNamedBox ? "custom_boxes" : "unconfirmed_for_this_item",
    source: explicitlyNamedBox ? policy.custom_box_ordering.source : "needs_review",
    classification_basis: explicitlyNamedBox ? "catalogue_title_explicitly_names_boxes" : "custom_box_scope_not_established",
    enquiry_quantity_required: policy.enquiry.quantity_required,
    final_offer_requires_exact_quantity: policy.enquiry.final_offer_requires_exact_quantity,
    policy_revision: policy.policy_revision,
  };
}

export async function prepareQuoteBrief(
  input: QuoteBriefInput,
  catalog: CatalogClient,
  siteUrl: string,
) {
  const data = quoteBriefSchema.parse(input);
  const selected = data.product_id ? await catalog.getItem(data.product_id) : null;
  const item = selected?.item ?? null;
  const rules = businessRules(siteUrl);
  const missing: string[] = [];
  if (!item) missing.push("packaging product or style");
  if (data.quantity == null) missing.push("exact quantity for a final offer");
  for (const key of ["length", "width", "height", "unit", "basis"] as const) {
    if (data.dimensions?.[key] == null || data.dimensions?.[key] === "undecided") {
      missing.push("dimensions." + key);
    }
  }
  if (!data.delivery_country) missing.push("delivery country");
  if (!data.delivery_postcode) missing.push("delivery postcode");
  return {
    status: "prepared_for_review",
    submitted: false,
    stored: false,
    quote_reference: null,
    purchase_mode: rules.purchase_mode,
    final_price: rules.pricing.final_price,
    brief: {
      product: item,
      quantity: data.quantity ?? rules.enquiry.unknown_quantity,
      dimensions: data.dimensions ?? null,
      material_requested: data.material_requested || null,
      printing_requested: data.printing_requested || null,
      finishes_requested: data.finishes_requested ?? [],
      inserts_requested: data.inserts_requested || null,
      delivery_country: data.delivery_country ?? null,
      delivery_postcode: data.delivery_postcode || null,
      requested_delivery_date: data.requested_delivery_date ?? null,
      artwork_state: data.artwork_state ?? "undecided",
      notes: data.notes ?? "",
    },
    quantity_rule: orderingRuleForItem(item),
    product_source: selected ? {
      source_url: selected.source_url,
      retrieved_at: selected.retrieved_at,
      catalogue_context: selected.catalogue_context ?? null,
    } : null,
    validation: {
      supplied_value_format: "valid",
      enquiry_quantity_optional: !rules.enquiry.quantity_required,
      manufacturing_compatibility: "not_validated",
      delivery_feasibility: "not_confirmed",
      price: "requires_approved_quote",
    },
    enquiry_submission: {
      tool: "submit_quote_request",
      required_contact_fields: rules.enquiry.required_contact_fields,
      packaging_details_optional: true,
      artwork_optional: true,
      prepare_brief_required: false,
      next_step: "When the customer asks to send an enquiry or be contacted, use their name, email and phone to submit it. Include only optional details they already supplied. Sales handles further questions; do not delay submission to collect missing packaging details.",
    },
    missing_information_for_final_offer: missing,
    missing_information_scope: "Optional topics for the sales agent after the initial enquiry; none blocks submission of the three contact fields.",
    specialist_review: [
      "Requested materials, print, finishes and inserts need product-specific validation.",
      "Additional information may be needed for final pricing even if the listed fields are complete.",
    ],
    related_resources: [RESOURCE_URIS.ordering_rules, RESOURCE_URIS.quote_requirements],
    next_action: {
      type: "submit_customer_requested_enquiry",
      tool: "submit_quote_request",
      url: rules.quote_url,
      instruction: "The draft has not been sent. If the customer requests an enquiry and has supplied name, email and phone, submit it with any optional details already known. Sales handles the remaining information. The website form is also available.",
    },
  };
}
