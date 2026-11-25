import { z } from "zod";

const FACTOR = { mm: 1, cm: 10, in: 25.4 } as const;
const MICRONS = { mm: 1000, cm: 10000, in: 25400 } as const;
const LIMIT_MM = 10000;
const LIMIT_UM = LIMIT_MM * 1000;
const dimension = z.number().finite().positive().max(LIMIT_MM);
const allowance = z.number().finite().min(0).max(LIMIT_MM);
const dimensions = z.object({ length: dimension, width: dimension, height: dimension }).strict();

export const insertPlanSchema = z.object({
  unit: z.enum(["mm", "cm", "in"]).default("mm"),
  items: z.array(z.object({
    id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,39}$/),
    name: z.string().trim().min(1).max(100),
    length: dimension,
    width: dimension,
    height: dimension,
    quantity: z.number().int().min(1).max(30).default(1)
      .describe("Number of this item inside one kit, not the quantity of boxes being ordered."),
    allow_rotation: z.boolean().default(true)
      .describe("Allow a 90-degree horizontal turn. Height always remains vertical; this planner does not stack or lay products on their sides."),
  }).strict()).min(1).max(20),
  cavity_clearance: allowance.describe("Requested clearance on EACH horizontal side of each product, in the selected unit."),
  gap: allowance.describe("Minimum gap between cavity envelopes, in the selected unit; not an approved insert-wall thickness."),
  edge_margin: allowance.describe("Margin from cavity envelopes to each internal box edge, in the selected unit."),
  bottom_clearance: allowance.describe("Space below the products, in the selected unit."),
  top_clearance: allowance.describe("Space above the tallest product, in the selected unit."),
  existing_box: dimensions.optional().describe("Optional existing INTERNAL box dimensions in the selected unit."),
  max_layouts: z.number().int().min(1).max(3).default(3),
}).strict().superRefine((data, context) => {
  const ids = new Set<string>();
  let count = 0;
  for (const [index, item] of data.items.entries()) {
    if (ids.has(item.id)) context.addIssue({ code: "custom", path: ["items", index, "id"], message: "Item IDs must be unique." });
    ids.add(item.id);
    count += item.quantity;
    for (const key of ["length", "width", "height"] as const) {
      const mm = item[key] * FACTOR[data.unit];
      if (mm < 0.001 || mm > LIMIT_MM) context.addIssue({ code: "custom", path: ["items", index, key], message: "Product dimensions must be between 0.001 and 10000 mm after unit conversion." });
    }
  }
  if (count > 30) context.addIssue({ code: "custom", path: ["items"], message: "A layout supports at most 30 total item instances per kit." });
  for (const key of ["cavity_clearance", "gap", "edge_margin", "bottom_clearance", "top_clearance"] as const) {
    if (data[key] * FACTOR[data.unit] > 1000) context.addIssue({ code: "custom", path: [key], message: "Each allowance must be at most 1000 mm after unit conversion." });
  }
  if (data.existing_box) for (const key of ["length", "width", "height"] as const) {
    const mm = data.existing_box[key] * FACTOR[data.unit];
    if (mm < 0.001 || mm > LIMIT_MM) context.addIssue({ code: "custom", path: ["existing_box", key], message: "Internal box dimensions must be between 0.001 and 10000 mm after unit conversion." });
  }
});

export type InsertPlanInput = z.input<typeof insertPlanSchema>;
export interface PlanDimensions { length: number; width: number; height: number }
export interface InsertPlacement {
  item_id: string;
  instance_id: string;
  name: string;
  copy_number: number;
  rotation_degrees: 0 | 90;
  cavity: { x: number; y: number; length: number; width: number };
  product: { x: number; y: number; z: number; length: number; width: number; height: number };
}
export interface InsertLayout {
  id: string;
  internal_dimensions: PlanDimensions;
  required_envelope: PlanDimensions;
  placements: InsertPlacement[];
  cavity_coverage_percent: number;
  unused_plan_area_mm2: number;
  svg: string;
}
interface Instance { id: string; instance: string; name: string; copy: number; l: number; w: number; h: number; rotate: boolean }
interface Positioned { item: Instance; x: number; y: number; l: number; w: number; rotated: boolean }
interface Candidate { positions: Positioned[]; length: number; width: number }

/** Exact decimal conversion to integer micrometres; capacities round down, required space rounds up. */
function quantize(value: number, factor: number, down = false): number {
  const [mantissa, exponent = "0"] = value.toString().toLowerCase().split("e");
  const [whole, fraction = ""] = mantissa.split(".");
  const power = Number(exponent) - fraction.length;
  let numerator = BigInt(whole + fraction) * BigInt(factor);
  let denominator = 1n;
  if (power >= 0) numerator *= 10n ** BigInt(power);
  else denominator = 10n ** BigInt(-power);
  return Number(down ? numerator / denominator : (numerator + denominator - 1n) / denominator);
}
const mm = (value: number) => value / 1000;
const round = (value: number, places = 4) => Number(value.toFixed(places));

function orientation(item: Instance, clearance: number) {
  const original = { l: item.l + 2 * clearance, w: item.w + 2 * clearance, rotated: false };
  return item.rotate && item.l !== item.w
    ? [original, { l: original.w, w: original.l, rotated: true }]
    : [original];
}

/** Fixed-height best-fit shelves. Multiple orders, widths and rotation preferences are explored. */
function shelves(items: Instance[], width: number, depth: number, clearance: number, gap: number, preference: "height" | "width"): Candidate | null {
  const rows: Array<{ y: number; height: number; used: number }> = [];
  const positions: Positioned[] = [];
  for (const item of items) {
    const choices = orientation(item, clearance);
    let selected: { row: number; choice: (typeof choices)[number]; remaining: number } | undefined;
    for (const [index, row] of rows.entries()) for (const choice of choices) {
      const remaining = width - row.used - gap - choice.l;
      if (choice.w <= row.height && remaining >= 0 && (!selected || remaining < selected.remaining)) {
        selected = { row: index, choice, remaining };
      }
    }
    if (selected) {
      const row = rows[selected.row];
      const x = row.used + gap;
      positions.push({ item, x, y: row.y, ...selected.choice });
      row.used = x + selected.choice.l;
      continue;
    }
    const y = rows.length ? rows[rows.length - 1].y + rows[rows.length - 1].height + gap : 0;
    const possible = choices.filter(choice => choice.l <= width && y + choice.w <= depth);
    possible.sort((a, b) => preference === "height" ? a.w - b.w || a.l - b.l : a.l - b.l || a.w - b.w);
    const choice = possible[0];
    if (!choice) return null;
    rows.push({ y, height: choice.w, used: choice.l });
    positions.push({ item, x: 0, y, ...choice });
  }
  return { positions, length: Math.max(...rows.map(row => row.used)), width: Math.max(...rows.map(row => row.y + row.height)) };
}

function xml(value: string) {
  return Array.from(value).map(character => {
    const code = character.codePointAt(0)!;
    if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || (code >= 0xd800 && code <= 0xdfff) || code === 0xfffe || code === 0xffff) return "�";
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" } as Record<string, string>)[character] ?? character;
  }).join("");
}

function svgFor(layout: Omit<InsertLayout, "svg">): string {
  const { length, width, height } = layout.internal_dimensions;
  const plotHeight = Math.min(540, Math.max(180, 860 * width / length));
  const scale = Math.min(860 / length, plotHeight / width);
  const startX = 70 + (860 - length * scale) / 2;
  const startY = 90 + (plotHeight - width * scale) / 2;
  const legendStart = 120 + plotHeight;
  const totalHeight = legendStart + Math.ceil(layout.placements.length / 3) * 28 + 62;
  const colors = ["#cbe9e0", "#dce5fb", "#f5dfc9", "#e7ddf2", "#d8e9c8", "#f4dbe2"];
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${totalHeight}" viewBox="0 0 1000 ${totalHeight}" role="img" aria-labelledby="title description">`,
    `<title id="title">Preliminary single-layer insert layout</title><desc id="description">${xml(`${length} by ${width} mm internal footprint, ${height} mm height. Numbered rectangles are product bounding envelopes; dashed rectangles are requested cavity envelopes. Specialist review is required.`)}</desc>`,
    `<rect width="1000" height="${totalHeight}" fill="#ffffff"/>`,
    `<text x="42" y="34" font-family="sans-serif" font-size="22" font-weight="bold" fill="#153c34">Preliminary insert layout</text>`,
    `<text x="42" y="60" font-family="sans-serif" font-size="15" fill="#405b55">Internal box: ${length} × ${width} × ${height} mm · top view</text>`,
    `<rect x="${startX}" y="${startY}" width="${length * scale}" height="${width * scale}" fill="#f5f8f7" stroke="#244b42" stroke-width="2"/>`,
  ];
  for (const [index, placement] of layout.placements.entries()) {
    const c = placement.cavity, p = placement.product;
    parts.push(`<g><title>${xml(`${index + 1}. ${placement.name}, copy ${placement.copy_number}; product ${p.length} × ${p.width} × ${p.height} mm; horizontal rotation ${placement.rotation_degrees} degrees`)}</title>`,
      `<rect x="${startX + c.x * scale}" y="${startY + c.y * scale}" width="${c.length * scale}" height="${c.width * scale}" fill="none" stroke="#57786e" stroke-dasharray="4 3" stroke-width="1"/>`,
      `<rect x="${startX + p.x * scale}" y="${startY + p.y * scale}" width="${p.length * scale}" height="${p.width * scale}" fill="${colors[index % colors.length]}" stroke="#244b42" stroke-width="1"/>`);
    if (p.length * scale >= 18 && p.width * scale >= 18) parts.push(`<text x="${startX + (p.x + p.length / 2) * scale}" y="${startY + (p.y + p.width / 2) * scale + 5}" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#193e35">${index + 1}</text>`);
    parts.push("</g>");
    const nameCharacters = Array.from(placement.name);
    const shortName = nameCharacters.slice(0, 22).join("") + (nameCharacters.length > 22 ? "…" : "");
    parts.push(`<text x="${42 + (index % 3) * 320}" y="${legendStart + Math.floor(index / 3) * 28}" font-family="sans-serif" font-size="12" fill="#244b42">${index + 1}. ${xml(shortName)} (#${placement.copy_number})</text>`);
  }
  parts.push(`<text x="42" y="${totalHeight - 30}" font-family="sans-serif" font-size="13" fill="#405b55">Calculated bounding geometry only. Not a dieline, protection rating, or manufacturing approval.</text></svg>`);
  return parts.join("");
}

export function planMultiItemInsert(input: InsertPlanInput) {
  const data = insertPlanSchema.parse(input);
  const q = (value: number) => quantize(value, MICRONS[data.unit]);
  const clearance = q(data.cavity_clearance), gap = q(data.gap), margin = q(data.edge_margin);
  const bottom = q(data.bottom_clearance), top = q(data.top_clearance);
  const items: Instance[] = data.items.flatMap(item => Array.from({ length: item.quantity }, (_, index) => ({
    id: item.id, instance: `${item.id}#${index + 1}`, name: item.name, copy: index + 1,
    l: q(item.length), w: q(item.width), h: q(item.height), rotate: item.allow_rotation,
  })));
  const existing = data.existing_box ? {
    length: quantize(data.existing_box.length, MICRONS[data.unit], true),
    width: quantize(data.existing_box.width, MICRONS[data.unit], true),
    height: quantize(data.existing_box.height, MICRONS[data.unit], true),
  } : null;
  const requiredHeight = Math.max(...items.map(item => item.h)) + bottom + top;
  const area = items.reduce((sum, item) => sum + (item.l + 2 * clearance) * (item.w + 2 * clearance), 0);
  const maxWidth = (existing?.length ?? LIMIT_UM) - 2 * margin;
  const maxDepth = (existing?.width ?? LIMIT_UM) - 2 * margin;
  const common = {
    unit: "mm" as const,
    input_unit: data.unit,
    items_per_kit: items.length,
    order_quantity: null,
    model: "single_layer_rectangular_bounding_envelopes",
    method: "bounded_multi_order_shelf_heuristic",
    optimality: "not_guaranteed",
    manufacturing_validation: "not_validated",
    clearances_mm: { cavity_per_side: mm(clearance), between_cavities: mm(gap), edge_margin: mm(margin), bottom: mm(bottom), top: mm(top) },
    assumptions: [
      "Every item is represented by a rectangular bounding envelope in one layer. Item height always stays vertical; no stacking or side-laying is attempted.",
      "Cavity clearance applies on each horizontal product side. Gap applies between cavity envelopes. Edge margin applies between cavities and the internal box edges.",
      "Clearances are buyer inputs, not approved tolerances or insert-wall recommendations. Curved items must be represented by their bounding dimensions.",
      "Geometry uses a 0.001 mm grid: required dimensions and clearances round upward; existing-box capacity rounds downward.",
      "Multiple deterministic shelf arrangements are searched. A missing layout does not prove that no other arrangement can fit.",
      "No outer box dimensions, material thickness, cavity depth, retention, cushioning performance, shipping protection or manufacturing approval is established.",
      "Items per kit is distinct from the quantity of boxes ordered. Order quantity remains undecided.",
    ],
  };
  const none = (code: string, message: string, attempts = 0) => ({
    ...common, status: "no_layout_found" as const, reason: { code, message },
    search_attempts: attempts, layouts: [] as InsertLayout[], selected_layout_id: null,
    comparison: [] as Array<{ layout_id: string; required_footprint_area_mm2: number; required_envelope: PlanDimensions }>,
    quote_brief_fields: null,
  });
  if (requiredHeight > (existing?.height ?? LIMIT_UM)) return none(existing ? "INSUFFICIENT_INTERNAL_HEIGHT" : "PLANNING_LIMIT_EXCEEDED", existing ? "The tallest upright item plus the entered top and bottom allowances exceeds the internal box height." : "The requested height exceeds this planner's 10000 mm envelope limit.");
  if (maxWidth <= 0 || maxDepth <= 0) return none("NO_USABLE_PLAN_AREA", "The edge margins leave no positive internal footprint.");
  if (items.some(item => !orientation(item, clearance).some(choice => choice.l <= maxWidth && choice.w <= maxDepth))) return none("ITEM_EXCEEDS_AVAILABLE_SPACE", "At least one item cavity cannot fit the available footprint in an allowed orientation.");
  if (area > maxWidth * maxDepth) return none("INSUFFICIENT_PLAN_AREA", "The combined rectangular cavity area exceeds the available footprint, even before gaps are added.");

  const tie = (a: Instance, b: Instance) => a.instance < b.instance ? -1 : a.instance > b.instance ? 1 : 0;
  const orders = [
    [...items].sort((a, b) => b.l * b.w - a.l * a.w || tie(a, b)),
    [...items].sort((a, b) => Math.max(b.l, b.w) - Math.max(a.l, a.w) || tie(a, b)),
    [...items].sort((a, b) => b.w - a.w || b.l - a.l || tie(a, b)),
    [...items].sort((a, b) => b.l - a.l || b.w - a.w || tie(a, b)),
    [...items].sort((a, b) => a.l * a.w - b.l * b.w || tie(a, b)),
    [...items],
  ];
  const widths = new Set<number>();
  const addWidth = (width: number) => { if (width > 0 && width <= maxWidth) widths.add(Math.ceil(width)); };
  if (existing) addWidth(maxWidth);
  for (const multiplier of [0.5, 0.75, 1, 1.25, 1.5, 2, 3]) addWidth(Math.sqrt(area) * multiplier);
  for (const order of orders.slice(0, 4)) {
    let running = 0;
    for (const item of order) {
      const choices = orientation(item, clearance);
      for (const choice of choices) addWidth(choice.l);
      running += (running ? gap : 0) + Math.max(...choices.map(choice => choice.l));
      addWidth(running);
    }
  }
  addWidth(maxWidth);
  const candidates: Candidate[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  for (const width of [...widths].sort((a, b) => a - b)) for (const order of orders) for (const preference of ["height", "width"] as const) {
    attempts++;
    const candidate = shelves(order, width, maxDepth, clearance, gap, preference);
    if (!candidate) continue;
    candidate.positions.sort((a, b) => tie(a.item, b.item));
    const signature = candidate.positions.map(p => `${p.item.instance}:${p.x}:${p.y}:${p.l}:${p.w}`).join("|");
    if (seen.has(signature)) continue;
    seen.add(signature);
    candidates.push(candidate);
  }
  candidates.sort((a, b) => (a.length + 2 * margin) * (a.width + 2 * margin) - (b.length + 2 * margin) * (b.width + 2 * margin)
    || Math.max(a.length, a.width) - Math.max(b.length, b.width) || a.length - b.length || a.width - b.width);
  if (!candidates.length) return none("NO_LAYOUT_FOUND_WITH_HEURISTIC", "The bounded shelf search did not find a layout. Another arrangement or revised inputs may work; no general impossibility claim is made.", attempts);

  const layouts: InsertLayout[] = candidates.slice(0, data.max_layouts).map((candidate, index) => {
    const length = existing?.length ?? candidate.length + 2 * margin;
    const width = existing?.width ?? candidate.width + 2 * margin;
    const height = existing?.height ?? requiredHeight;
    const layout: Omit<InsertLayout, "svg"> = {
      id: `layout-${index + 1}`,
      internal_dimensions: { length: mm(length), width: mm(width), height: mm(height) },
      required_envelope: { length: mm(candidate.length + 2 * margin), width: mm(candidate.width + 2 * margin), height: mm(requiredHeight) },
      placements: candidate.positions.map(p => ({
        item_id: p.item.id, instance_id: p.item.instance, name: p.item.name, copy_number: p.item.copy,
        rotation_degrees: p.rotated ? 90 : 0,
        cavity: { x: mm(p.x + margin), y: mm(p.y + margin), length: mm(p.l), width: mm(p.w) },
        product: { x: mm(p.x + margin + clearance), y: mm(p.y + margin + clearance), z: mm(bottom),
          length: mm(p.rotated ? p.item.w : p.item.l), width: mm(p.rotated ? p.item.l : p.item.w), height: mm(p.item.h) },
      })),
      cavity_coverage_percent: round(100 * area / (length * width)),
      unused_plan_area_mm2: (length * width - area) / 1_000_000,
    };
    return { ...layout, svg: svgFor(layout) };
  });
  return {
    ...common, status: "layouts_found" as const, reason: null, search_attempts: attempts,
    layouts, selected_layout_id: layouts[0].id,
    comparison: layouts.map(layout => ({ layout_id: layout.id,
      required_footprint_area_mm2: round(layout.required_envelope.length * layout.required_envelope.width, 6), required_envelope: layout.required_envelope })),
    quote_brief_fields: {
      quantity: null,
      dimensions: { ...layouts[0].internal_dimensions, unit: "mm" as const, basis: "internal" as const },
      inserts_requested: `Single-layer insert for ${items.length} item instances per kit; requested geometry needs specialist fit and manufacturing review.`,
      notes: `Preliminary ${layouts[0].id}. Item format id:count@LxWxH mm/orientation; XY90 allows horizontal rotation only. ${data.items.map(item => `${item.id}:${item.quantity}@${mm(q(item.length))}x${mm(q(item.width))}x${mm(q(item.height))}mm/${item.allow_rotation ? "XY90" : "fixed"}`).join("; ")}. Cavity clearance/side ${mm(clearance)} mm; cavity gap ${mm(gap)} mm; edge margin ${mm(margin)} mm; bottom/top ${mm(bottom)}/${mm(top)} mm. Box dimensions are internal. Order quantity undecided; manufacturing and protection unvalidated.`,
    },
  };
}
