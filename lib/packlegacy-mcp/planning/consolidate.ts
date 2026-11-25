import { z } from "zod";

const UNIT_FACTORS = { mm: 1, cm: 10, in: 25.4 } as const;
const MICROMETRES = { mm: 1_000, cm: 10_000, in: 25_400 } as const;
const MAX_DIMENSION_MM = 10_000;
const text = z.string().trim().min(1).max(120).refine(value => !/[\u0000-\u001f\u007f]/.test(value), "Control characters are not supported.");
const dimension = z.number().finite().min(0.001).max(10_000);
const unit = z.enum(["mm", "cm", "in"]);
const dimensionsShape = { length: dimension, width: dimension, height: dimension, unit };
const productSchema = z.object({
  id: text,
  name: text,
  ...dimensionsShape,
  orientation: z.enum(["upright", "fixed", "any"]).default("upright")
    .describe("upright allows length/width rotation only; fixed preserves all axes; any allows all six orthogonal orientations."),
  order_weight: z.number().finite().min(0.000001).max(1_000_000).optional()
    .describe("Optional relative order frequency. Supply for every SKU to use weighted comparisons; partial weights are explicitly ignored."),
}).strict();
const existingBoxSchema = z.object({ id: text, name: text.optional(), ...dimensionsShape }).strict();

export const consolidateBoxesSchema = z.object({
  products: z.array(productSchema).min(1).max(50),
  max_box_sizes: z.number().int().min(1).max(8),
  clearance_per_side_mm: z.number().finite().min(0).max(1_000).default(0)
    .describe("Geometric clearance on EACH of the six sides. Zero means no extra clearance; no protective allowance is inferred."),
  existing_boxes: z.array(existingBoxSchema).min(1).max(50).optional()
    .describe("Optional existing boxes measured by INTERNAL dimensions. If omitted, propose custom internal box envelopes."),
}).strict().superRefine((input, context) => {
  for (const field of ["products", "existing_boxes"] as const) {
    const seen = new Set<string>();
    for (const [index, item] of (input[field] ?? []).entries()) {
      if (seen.has(item.id)) context.addIssue({ code: "custom", path: [field, index, "id"], message: "IDs must be unique within this list." });
      seen.add(item.id);
      for (const key of ["length", "width", "height"] as const) {
        if (item[key] * UNIT_FACTORS[item.unit] > MAX_DIMENSION_MM) {
          context.addIssue({ code: "custom", path: [field, index, key], message: "The software supports dimensions up to 10000 mm after conversion." });
        }
      }
    }
  }
});

export type ConsolidateBoxesInput = z.input<typeof consolidateBoxesSchema>;
export type ConsolidateBoxesParsedInput = z.output<typeof consolidateBoxesSchema>;
export type BoxDimensions = { length: number; width: number; height: number };
export type ProductOrientation = "upright" | "fixed" | "any";
type Axis = keyof BoxDimensions;
type Orientation = {
  dimensions: BoxDimensions;
  required: BoxDimensions;
  axes: { length: Axis; width: Axis; height: Axis };
};
type Product = {
  id: string;
  name: string;
  original: BoxDimensions;
  orientation: ProductOrientation;
  options: Orientation[];
  orderWeight: number | null;
  evaluationWeight: number;
};
type Box = { id: string; name: string; dimensions: BoxDimensions; source: "proposed_internal_envelope" | "entered_existing_box" };
type Cluster = { key: string; products: Product[]; dimensions: BoxDimensions; weight: number };

/** Exact decimal conversion: requirements round up, available capacity rounds down. */
function quantizedMm(value: number, factor: number, down = false): number {
  const [mantissa, exponent = "0"] = value.toString().toLowerCase().split("e");
  const [whole, fraction = ""] = mantissa.split(".");
  const power = Number(exponent) - fraction.length;
  let numerator = BigInt(whole + fraction) * BigInt(factor);
  let denominator = 1n;
  if (power >= 0) numerator *= 10n ** BigInt(power);
  else denominator = 10n ** BigInt(-power);
  return Number(down ? numerator / denominator : (numerator + denominator - 1n) / denominator) / 1_000;
}
// Values being added here are already on the integer-micrometre grid.
function addClearance(value: number, clearance: number): number {
  return (Math.round(value * 1_000) + 2 * Math.round(clearance * 1_000)) / 1_000;
}
function volume(d: BoxDimensions): number { return d.length * d.width * d.height; }
function compareText(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function envelope(a: BoxDimensions, b: BoxDimensions): BoxDimensions {
  return { length: Math.max(a.length, b.length), width: Math.max(a.width, b.width), height: Math.max(a.height, b.height) };
}
function compareDimensions(a: BoxDimensions, b: BoxDimensions): number {
  return volume(a) - volume(b)
    || Math.max(a.length, a.width, a.height) - Math.max(b.length, b.width, b.height)
    || a.length - b.length || a.width - b.width || a.height - b.height;
}
function normalizedDimensions(item: { length: number; width: number; height: number; unit: keyof typeof UNIT_FACTORS }, capacity = false): BoxDimensions {
  const factor = MICROMETRES[item.unit];
  return { length: quantizedMm(item.length, factor, capacity), width: quantizedMm(item.width, factor, capacity), height: quantizedMm(item.height, factor, capacity) };
}
function orientationOptions(d: BoxDimensions, mode: ProductOrientation, clearance: number): Orientation[] {
  const permutations: [Axis, Axis, Axis][] = mode === "fixed"
    ? [["length", "width", "height"]]
    : mode === "upright"
      ? [["length", "width", "height"], ["width", "length", "height"]]
      : [["length", "width", "height"], ["width", "length", "height"], ["length", "height", "width"],
        ["height", "length", "width"], ["width", "height", "length"], ["height", "width", "length"]];
  const unique = new Set<string>();
  const output: Orientation[] = [];
  for (const [l, w, h] of permutations) {
    const dimensions = { length: d[l], width: d[w], height: d[h] };
    const key = [dimensions.length, dimensions.width, dimensions.height].join(",");
    if (unique.has(key)) continue;
    unique.add(key);
    output.push({
      dimensions,
      required: { length: addClearance(d[l], clearance), width: addClearance(d[w], clearance), height: addClearance(d[h], clearance) },
      axes: { length: l, width: w, height: h },
    });
  }
  return output;
}
function fittingOrientation(product: Product, dimensions: BoxDimensions): Orientation | null {
  return product.options.find(option => option.required.length <= dimensions.length
    && option.required.width <= dimensions.width && option.required.height <= dimensions.height) ?? null;
}

/**
 * Multi-start greedy envelope construction. Every step contains the previous
 * envelope and one permitted orientation of the next SKU. No optimum is claimed.
 */
function groupEnvelope(products: Product[]): BoxDimensions {
  const byId = (a: Product, b: Product) => compareText(a.id, b.id);
  const orders = [
    [...products].sort((a, b) => volume(b.original) - volume(a.original) || byId(a, b)),
    [...products].sort((a, b) => a.options.length - b.options.length || volume(b.original) - volume(a.original) || byId(a, b)),
    [...products].sort((a, b) => Math.max(b.original.length, b.original.width, b.original.height)
      - Math.max(a.original.length, a.original.width, a.original.height) || byId(a, b)),
  ];
  let best: BoxDimensions | null = null;
  for (const order of orders) {
    for (const first of order[0].options) {
      let dimensions = { ...first.required };
      for (let index = 1; index < order.length; index++) {
        let expanded: BoxDimensions | null = null;
        for (const option of order[index].options) {
          const candidate = envelope(dimensions, option.required);
          if (!expanded || compareDimensions(candidate, expanded) < 0) expanded = candidate;
        }
        dimensions = expanded!;
      }
      if (!best || compareDimensions(dimensions, best) < 0) best = dimensions;
    }
  }
  return best!;
}

function proposedBoxes(products: Product[], limit: number): Box[] {
  let clusters: Cluster[] = products.map(product => ({
    key: JSON.stringify([product.id]), products: [product], dimensions: groupEnvelope([product]), weight: product.evaluationWeight,
  }));
  const merges = new Map<string, { cluster: Cluster; delta: number }>();
  while (clusters.length > limit) {
    let chosen: { left: number; right: number; cluster: Cluster; delta: number } | null = null;
    for (let left = 0; left < clusters.length; left++) {
      for (let right = left + 1; right < clusters.length; right++) {
        const a = clusters[left], b = clusters[right];
        const key = JSON.stringify([a.key, b.key].sort(compareText));
        let proposal = merges.get(key);
        if (!proposal) {
          const members = [...a.products, ...b.products].sort((x, y) => compareText(x.id, y.id));
          const dimensions = groupEnvelope(members);
          const cluster = { key: JSON.stringify(members.map(item => item.id)), products: members, dimensions, weight: a.weight + b.weight };
          proposal = { cluster, delta: volume(dimensions) * cluster.weight - volume(a.dimensions) * a.weight - volume(b.dimensions) * b.weight };
          merges.set(key, proposal);
        }
        if (!chosen || proposal.delta < chosen.delta || (proposal.delta === chosen.delta && compareText(proposal.cluster.key, chosen.cluster.key) < 0)) {
          chosen = { left, right, ...proposal };
        }
      }
    }
    const merged = chosen!;
    clusters = clusters.filter((_cluster, index) => index !== merged.left && index !== merged.right);
    clusters.push(merged.cluster);
    clusters.sort((a, b) => compareText(a.key, b.key));
  }
  // Different clusters may have identical envelopes; offer each size only once.
  const sizes = new Map<string, BoxDimensions>();
  for (const cluster of clusters) sizes.set(JSON.stringify(cluster.dimensions), cluster.dimensions);
  return [...sizes.values()].sort(compareDimensions).map((dimensions, index) => ({
    id: "proposed-" + (index + 1), name: "Proposed box " + (index + 1), dimensions, source: "proposed_internal_envelope",
  }));
}

function bestBox(product: Product, boxes: Box[]): Box | null {
  return boxes.filter(box => fittingOrientation(product, box.dimensions))
    .sort((a, b) => compareDimensions(a.dimensions, b.dimensions) || compareText(a.id, b.id))[0] ?? null;
}

/** Greedy set coverage, followed by smaller-box improvements within the size limit. */
function selectExistingBoxes(products: Product[], candidates: Box[], limit: number): Box[] {
  let selected: Box[] = [];
  const considered = new Set<string>();
  for (let pass = 0; pass < candidates.length && selected.length < limit; pass++) {
    let winner: { box: Box; newlyCovered: number; costChange: number } | null = null;
    const previous = products.map(product => bestBox(product, selected));
    for (const box of candidates) {
      if (considered.has(box.id) || selected.some(item => item.id === box.id)) continue;
      let newlyCovered = 0, costChange = 0;
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        if (!fittingOrientation(product, box.dimensions)) continue;
        const before = previous[index];
        if (!before) { newlyCovered++; costChange += volume(box.dimensions) * product.evaluationWeight; }
        else costChange += Math.min(0, volume(box.dimensions) - volume(before.dimensions)) * product.evaluationWeight;
      }
      if (newlyCovered === 0 && costChange >= 0) continue;
      if (!winner || newlyCovered > winner.newlyCovered
        || (newlyCovered === winner.newlyCovered && costChange < winner.costChange)
        || (newlyCovered === winner.newlyCovered && costChange === winner.costChange && compareText(box.id, winner.box.id) < 0)) {
        winner = { box, newlyCovered, costChange };
      }
    }
    if (!winner) break;
    considered.add(winner.box.id);
    selected.push(winner.box);
    const used = new Set(products.map(product => bestBox(product, selected)?.id).filter(Boolean));
    selected = selected.filter(box => used.has(box.id));
  }
  return selected.sort((a, b) => compareDimensions(a.dimensions, b.dimensions) || compareText(a.id, b.id));
}

/**
 * Propose a bounded family of internal box sizes for ONE SKU unit per parcel.
 * This is a geometry planner; it never prices packaging or approves a configuration.
 */
export function consolidateBoxSizes(input: ConsolidateBoxesInput) {
  const parsed = consolidateBoxesSchema.parse(input);
  const clearance = quantizedMm(parsed.clearance_per_side_mm, 1_000);
  const suppliedWeights = parsed.products.filter(product => product.order_weight !== undefined).length;
  const allWeighted = suppliedWeights === parsed.products.length;
  const products: Product[] = parsed.products.map(product => {
    const original = normalizedDimensions(product);
    return {
      id: product.id, name: product.name, original, orientation: product.orientation,
      options: orientationOptions(original, product.orientation, clearance),
      orderWeight: product.order_weight ?? null,
      evaluationWeight: allWeighted ? product.order_weight! : 1,
    };
  }).sort((a, b) => compareText(a.id, b.id));
  const existing: Box[] | undefined = parsed.existing_boxes?.map(box => ({
    id: box.id, name: box.name ?? box.id, dimensions: normalizedDimensions(box, true), source: "entered_existing_box" as const,
  })).sort((a, b) => compareText(a.id, b.id));
  const proposed = existing ? selectExistingBoxes(products, existing, parsed.max_box_sizes) : proposedBoxes(products, parsed.max_box_sizes);
  const used = new Set(products.map(product => bestBox(product, proposed)?.id).filter(Boolean));
  const boxes = proposed.filter(box => used.has(box.id));
  const assignments = products.flatMap(product => {
    const box = bestBox(product, boxes);
    if (!box) return [];
    const orientation = fittingOrientation(product, box.dimensions)!;
    const productVolume = volume(product.original);
    const requiredVolume = volume(orientation.required);
    const boxVolume = volume(box.dimensions);
    return [{
      product_id: product.id,
      product_name: product.name,
      box_id: box.id,
      order_weight: product.orderWeight,
      orientation_axes: orientation.axes,
      oriented_product_mm: orientation.dimensions,
      required_internal_mm: orientation.required,
      box_internal_mm: { ...box.dimensions },
      product_bounding_volume_mm3: productVolume,
      required_envelope_volume_mm3: requiredVolume,
      box_internal_volume_mm3: boxVolume,
      free_volume_outside_required_envelope_mm3: Math.max(0, boxVolume - requiredVolume),
      unoccupied_volume_around_product_mm3: Math.max(0, boxVolume - productVolume),
      required_envelope_utilization_percent: 100 * requiredVolume / boxVolume,
    }];
  });
  const assignedIds = new Set(assignments.map(item => item.product_id));
  const unassigned = products.filter(product => !assignedIds.has(product.id)).map(product => {
    const fittingCandidates = existing?.filter(box => fittingOrientation(product, box.dimensions)).map(box => box.id) ?? [];
    return {
      product_id: product.id,
      product_name: product.name,
      reason: fittingCandidates.length ? "not_covered_by_selected_boxes_within_size_limit" : "no_entered_box_fits_allowed_orientations_and_clearance",
      other_fitting_candidate_box_ids: fittingCandidates,
    };
  });
  const baselineVolume = assignments.reduce((sum, item) => sum + item.required_envelope_volume_mm3, 0);
  const assignedVolume = assignments.reduce((sum, item) => sum + item.box_internal_volume_mm3, 0);
  const productVolume = assignments.reduce((sum, item) => sum + item.product_bounding_volume_mm3, 0);
  const weighted = allWeighted ? {
    basis: "Supplied relative order weights for assigned SKUs only; not shipping charges or purchased quantities.",
    total_assigned_order_weight: assignments.reduce((sum, item) => sum + item.order_weight!, 0),
    dedicated_envelopes_volume_mm3_times_weight: assignments.reduce((sum, item) => sum + item.required_envelope_volume_mm3 * item.order_weight!, 0),
    selected_boxes_volume_mm3_times_weight: assignments.reduce((sum, item) => sum + item.box_internal_volume_mm3 * item.order_weight!, 0),
  } : null;
  return {
    status: unassigned.length === 0 ? "planned" : assignments.length ? "partial_fit" : "no_fitting_boxes",
    scope: "One unit of one SKU per parcel. Mixed-product kits require a separate insert/layout plan.",
    mode: existing ? "select_existing_internal_boxes" : "propose_custom_internal_envelopes",
    units: { dimensions: "mm", volumes: "mm3" },
    requested_max_box_sizes: parsed.max_box_sizes,
    clearance_per_side_mm: clearance,
    weighting: {
      mode: allWeighted ? "supplied_order_weights" : "equal_sku_weights",
      supplied_for_sku_count: suppliedWeights,
      partial_weights_ignored: suppliedWeights > 0 && !allWeighted,
      note: allWeighted ? "All supplied order weights are used in geometric comparisons."
        : suppliedWeights > 0 ? "Only some SKUs have order weights. All SKUs were evaluated equally; supplied partial weights are not mixed with defaults."
          : "No order mix was supplied. Each SKU is evaluated equally; no demand forecast is inferred.",
    },
    box_families: boxes.map(box => ({
      box_id: box.id, name: box.name, source: box.source,
      internal_dimensions_mm: { ...box.dimensions },
      internal_volume_mm3: volume(box.dimensions),
      assigned_product_ids: assignments.filter(item => item.box_id === box.id).map(item => item.product_id),
    })),
    assignments,
    fit_matrix: products.map(product => ({ product_id: product.id,
      fitting_selected_box_ids: boxes.filter(box => fittingOrientation(product, box.dimensions)).map(box => box.id) })),
    unassigned_product_ids: unassigned.map(product => product.product_id),
    unassigned_products: unassigned,
    summary: {
      input_sku_count: products.length,
      assigned_sku_count: assignments.length,
      unassigned_sku_count: unassigned.length,
      actual_box_size_count: boxes.length,
      comparison_scope: "One parcel for each assigned SKU; unassigned SKUs are excluded from all volume totals.",
      product_bounding_volume_for_one_of_each_assigned_sku_mm3: productVolume,
      dedicated_required_envelopes_volume_mm3: baselineVolume,
      selected_boxes_volume_for_one_of_each_assigned_sku_mm3: assignedVolume,
      additional_volume_over_dedicated_envelopes_mm3: Math.max(0, assignedVolume - baselineVolume),
      unused_volume_outside_required_envelopes_mm3: Math.max(0, assignedVolume - baselineVolume),
      unoccupied_volume_around_products_mm3: Math.max(0, assignedVolume - productVolume),
      order_weighted_comparison: weighted,
    },
    method: existing
      ? "Deterministic greedy SKU coverage followed by smaller-box improvements within the requested size count."
      : "Deterministic agglomerative grouping by added weighted envelope volume, using multi-start greedy orientation envelopes.",
    optimality: "heuristic_not_guaranteed_optimal",
    assumptions: [
      "Input product dimensions are rectangular bounding dimensions, not measured product displacement volume.",
      "All entered existing box dimensions are internal dimensions; external dimensions and board thickness are not inferred.",
      "Clearance is added on both sides of each axis. Zero clearance means a geometric bounding fit only.",
      "upright permits length/width exchange only; fixed preserves axes; any permits all six orthogonal orientations.",
      "Geometry uses a 0.001 mm grid: required product dimensions and clearance round upward; existing internal box capacity rounds downward. This is not manufacturing precision or tolerance.",
      "The dedicated-envelope baseline is a mathematical comparison, not an available product, quote or manufacturing recommendation.",
    ],
    validation: {
      geometric_fit: "checked_for_reported_assignments",
      manufacturing_compatibility: "not_validated",
      shipping_protection: "not_validated",
      shipping_price_savings: "not_calculated",
    },
    next_action: "Review each proposed internal size, clearance and product fit with a packaging specialist before requesting a production quote.",
  };
}

export type ConsolidateBoxesResult = ReturnType<typeof consolidateBoxSizes>;
