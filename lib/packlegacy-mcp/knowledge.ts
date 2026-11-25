import { z } from "zod";
import type { CatalogItem } from "./catalog";
import knowledgeFile from "./knowledge/product-knowledge.json";

const catalogPath = z.string().min(1).max(240).regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)+$/);
const shortText = z.string().trim().min(1).max(500);
const originSchema = z.string().url().refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && value === url.origin;
}, "Use an HTTPS origin without credentials, path, query or fragment.");

export const productKnowledgeSchema = z.object({
  schema_version: z.literal("1.0"),
  reviewed_at: z.iso.date(),
  source_origin: originSchema,
  evidence_status: z.literal("reviewed_public_description"),
  scope_note: shortText,
  records: z.array(z.object({
    product_id: catalogPath,
    title: z.string().trim().min(1).max(512),
    result_type: z.enum(["product", "category"]),
    description: shortText,
    descriptive_features: z.array(shortText).max(8),
    use_cases: z.array(shortText).max(8),
    category: z.string().trim().min(1).max(160).nullable(),
    reviewed_at: z.iso.date(),
    source_url: z.string().url(),
    source_sections: z.array(shortText).min(1).max(6),
  }).strict()).min(1).max(5000),
}).strict().superRefine((data, context) => {
  const seen = new Set<string>();
  for (const [index, record] of data.records.entries()) {
    if (seen.has(record.product_id)) {
      context.addIssue({ code: "custom", path: ["records", index, "product_id"], message: "Duplicate product_id in reviewed knowledge." });
    }
    seen.add(record.product_id);
    if (record.source_url !== new URL(record.product_id, data.source_origin).href) {
      context.addIssue({ code: "custom", path: ["records", index, "source_url"], message: "Source URL must match the reviewed origin and product_id exactly." });
    }
    if (record.reviewed_at > data.reviewed_at) {
      context.addIssue({ code: "custom", path: ["records", index, "reviewed_at"], message: "Record review cannot be newer than the snapshot review date." });
    }
  }
});

export type ProductKnowledgeFile = z.infer<typeof productKnowledgeSchema>;
export type ProductKnowledgeStatus =
  | "reviewed_public_description"
  | "not_reviewed"
  | "catalog_identity_changed"
  | "catalog_origin_changed";

export interface ProductKnowledgeResult {
  status: ProductKnowledgeStatus;
  description: string | null;
  descriptive_features: string[];
  use_cases: string[];
  category: string | null;
  reviewed_at: string | null;
  sources: Array<{ url: string; sections: string[] }>;
  scope_note: string;
  reason: string | null;
}

/** Fail at startup on an invalid checked-in snapshot, rather than serving ambiguous facts. */
export function parseProductKnowledge(value: unknown): ProductKnowledgeFile {
  const parsed = productKnowledgeSchema.safeParse(value);
  if (!parsed.success) throw new Error("Invalid product-knowledge.json: " + parsed.error.message);
  return parsed.data;
}

const knowledge = parseProductKnowledge(knowledgeFile);
const records = new Map(knowledge.records.map(record => [record.product_id, record]));

function unavailable(status: Exclude<ProductKnowledgeStatus, "reviewed_public_description">, reason: string): ProductKnowledgeResult {
  return {
    status,
    description: null,
    descriptive_features: [],
    use_cases: [],
    category: null,
    reviewed_at: null,
    sources: [],
    scope_note: knowledge.scope_note,
    reason,
  };
}

/**
 * Join reviewed narrative to a current, known catalogue identity. This does not
 * fetch pages, validate a configuration, or turn the snapshot date into a live
 * verification timestamp. A different deployment must have its knowledge reviewed.
 */
export function getProductKnowledge(item: CatalogItem): ProductKnowledgeResult {
  const record = records.get(item.product_id);
  if (!record) return unavailable("not_reviewed", "This catalogue item has no reviewed descriptive record yet.");

  let itemUrl: URL;
  try { itemUrl = new URL(item.url); }
  catch { return unavailable("catalog_identity_changed", "The catalogue item URL is invalid; reviewed facts were withheld."); }

  if (itemUrl.origin !== knowledge.source_origin) {
    return unavailable("catalog_origin_changed", "The configured catalogue origin differs from the reviewed source; review the knowledge for this deployment.");
  }
  if (
    item.url !== new URL(record.product_id, knowledge.source_origin).href ||
    item.title.trim() !== record.title || item.result_type !== record.result_type
  ) {
    return unavailable("catalog_identity_changed", "The catalogue title, type or URL differs from the reviewed identity; refresh this record before using it.");
  }

  return {
    status: "reviewed_public_description",
    description: record.description,
    descriptive_features: [...record.descriptive_features],
    use_cases: [...record.use_cases],
    category: record.category,
    reviewed_at: record.reviewed_at,
    sources: [{ url: record.source_url, sections: [...record.source_sections] }],
    scope_note: knowledge.scope_note,
    reason: null,
  };
}

export function knowledgeCoverage() {
  return {
    schema_version: knowledge.schema_version,
    source_origin: knowledge.source_origin,
    snapshot_reviewed_at: knowledge.reviewed_at,
    reviewed_records: knowledge.records.length,
    reviewed_products: knowledge.records.filter(record => record.result_type === "product").length,
    reviewed_categories: knowledge.records.filter(record => record.result_type === "category").length,
    product_ids: knowledge.records.map(record => record.product_id),
    scope_note: knowledge.scope_note,
  };
}
