import { z } from "zod";
import { insertPlanSchema, planMultiItemInsert } from "./planning/insert";
import { consolidateBoxesSchema, consolidateBoxSizes } from "./planning/consolidate";
import { ArtworkInspectionError, MAX_ARTWORK_BYTES, artworkInspectionOptionsSchema } from "./artwork/inspect";
import { runArtworkInspection } from "./artwork/run";
import { businessRules } from "./business";

export { insertPlanSchema, consolidateBoxesSchema };
export const MAX_ARTWORK_BASE64_LENGTH = Math.ceil(MAX_ARTWORK_BYTES / 3) * 4;
export const artworkToolSchema = z.object({
  file_base64: z.string().min(4).max(MAX_ARTWORK_BASE64_LENGTH)
    .describe("Standard base64 for a PDF, PNG or JPEG, maximum 2 MiB decoded. No data-URL prefix, path or download URL."),
  options: artworkInspectionOptionsSchema.optional(),
}).strict();

export const ADDITIONAL_TOOL_NAMES = ["plan_multi_item_insert", "consolidate_box_sizes", "inspect_artwork_file"] as const;
export type AdditionalToolName = (typeof ADDITIONAL_TOOL_NAMES)[number];

export function decodeArtworkBase64(value: string): Uint8Array {
  if (value.length > MAX_ARTWORK_BASE64_LENGTH || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    throw new ArtworkInspectionError("INVALID_BASE64", "Provide canonical standard base64 without a data-URL prefix or whitespace.");
  }
  const bytes = Buffer.from(value, "base64");
  if (bytes.length === 0 || bytes.length > MAX_ARTWORK_BYTES) throw new ArtworkInspectionError("FILE_SIZE_LIMIT", "Upload a non-empty file no larger than 2 MiB.");
  if (bytes.toString("base64") !== value) throw new ArtworkInspectionError("INVALID_BASE64", "The base64 encoding is not canonical.");
  return bytes;
}

/** Same service for MCP and browser requests. Inputs never become server file paths. */
export async function executeAdditionalTool(name: AdditionalToolName, input: unknown, siteUrl: string, signal?: AbortSignal) {
  let output: Record<string, unknown>;
  if (name === "plan_multi_item_insert") output = planMultiItemInsert(insertPlanSchema.parse(input));
  else if (name === "consolidate_box_sizes") output = consolidateBoxSizes(consolidateBoxesSchema.parse(input));
  else if (name === "inspect_artwork_file") {
    const parsed = artworkToolSchema.parse(input);
    output = await runArtworkInspection(decodeArtworkBase64(parsed.file_base64), parsed.options, { signal });
  } else throw new Error("Unknown additional tool.");
  const rules = businessRules(siteUrl);
  return { ...output, ordering_context: {
    custom_boxes: rules.custom_box_ordering,
    enquiry_quantity_required: rules.enquiry.quantity_required,
    final_price: null,
  }, quote_url: rules.quote_url };
}
