import type { InsertPlanInput, planMultiItemInsert } from "../planning/insert";
import type { ConsolidateBoxesInput, ConsolidateBoxesResult } from "../planning/consolidate";
import type { ArtworkInspectionOptions, ArtworkInspectionResult } from "../artwork/inspect";
import type { QuoteBriefInput, prepareQuoteBrief } from "../business";

type InsertResult = ReturnType<typeof planMultiItemInsert>;
type QuoteResult = Awaited<ReturnType<typeof prepareQuoteBrief>>;
type ToolName = "plan_multi_item_insert" | "consolidate_box_sizes" | "inspect_artwork_file" | "prepare_quote_brief";
type Unit = "mm" | "cm" | "in";
type Control = HTMLInputElement | HTMLSelectElement;
type Cell = string | number | null | undefined;

const query = <T extends Element>(selector: string, root: ParentNode = document): T => {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error("A required page element is missing: " + selector);
  return node;
};
const element = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const fmt = (value: number) => new Intl.NumberFormat("en", { maximumFractionDigits: 4 }).format(value);
const dimensionText = (d: { length: number; width: number; height: number }) => `${fmt(d.length)} × ${fmt(d.width)} × ${fmt(d.height)} mm`;
const human = (value: string) => value.replace(/_/g, " ").replace(/^./, value => value.toUpperCase());
const form = document.querySelector<HTMLFormElement>("#tool-form");

if (form) start(form);

function start(form: HTMLFormElement) {
  const kind = document.body.dataset.page;
  const status = query<HTMLElement>("#tool-status");
  const error = query<HTMLElement>("#tool-error");
  const results = query<HTMLElement>("#tool-results");
  const quoteSection = query<HTMLElement>("#quote-section");
  const quoteForm = query<HTMLFormElement>("#quote-form");
  const quoteStatus = query<HTMLElement>("#quote-status");
  const quoteError = query<HTMLElement>("#quote-error");
  const quoteResult = query<HTMLElement>("#quote-result");
  let quoteBase: QuoteBriefInput | null = null;
  let hasReport = false;
  let busy = false;
  let quoteGeneration = 0;
  let sequence = 1;
  let diagramUrl: string | null = null;
  const reportUrls: string[] = [];
  const quoteUrls: string[] = [];

  function revoke(urls: string[]) { for (const url of urls.splice(0)) URL.revokeObjectURL(url); }
  function clearQuoteResult() {
    quoteGeneration++;
    revoke(quoteUrls);
    quoteResult.replaceChildren(); quoteResult.hidden = true;
    quoteStatus.textContent = ""; quoteError.hidden = true; quoteError.textContent = "";
  }
  function resetResults() {
    hasReport = false; quoteBase = null;
    results.hidden = true; results.replaceChildren(); quoteSection.hidden = true;
    clearQuoteResult(); revoke(reportUrls);
    if (diagramUrl) { URL.revokeObjectURL(diagramUrl); diagramUrl = null; }
  }
  function invalidate() {
    if (hasReport) { resetResults(); status.textContent = "Inputs changed. Run the tool again to update your results."; }
    error.hidden = true; error.textContent = "";
  }
  function download(text: string, filename: string, mime: string, label: string, urls = reportUrls) {
    const link = element("a", label, "button secondary");
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    urls.push(url); link.href = url; link.download = filename;
    return link;
  }
  function notice(parent: HTMLElement, text: string, attention = false) {
    parent.append(element("p", text, "notice" + (attention ? " attention" : "")));
  }
  function stats(parent: HTMLElement, values: Array<[string, string]>) {
    const grid = element("div", undefined, "stats");
    for (const [value, label] of values) {
      const box = element("div", undefined, "stat");
      box.append(element("strong", value), element("span", label)); grid.append(box);
    }
    parent.append(grid);
  }
  function table(parent: HTMLElement, caption: string, headers: string[], rows: Cell[][]) {
    const wrap = element("div", undefined, "table-wrap");
    const table = element("table", undefined, "result-table");
    table.append(element("caption", caption));
    const head = element("thead"), header = element("tr"), body = element("tbody");
    for (const name of headers) { const th = element("th", name); th.scope = "col"; header.append(th); }
    head.append(header);
    for (const row of rows) {
      const tr = element("tr");
      for (const value of row) tr.append(element("td", value == null ? "Not reported" : String(value)));
      body.append(tr);
    }
    table.append(head, body); wrap.append(table); parent.append(wrap);
  }
  function details(parent: HTMLElement, title: string, items: string[]) {
    const box = element("details"), list = element("ul", undefined, "details-list");
    box.append(element("summary", title));
    for (const text of items) list.append(element("li", text));
    box.append(list); parent.append(box); return box;
  }
  function selectControl(parent: HTMLElement, label: string, id: string, choices: Array<[string, string]>, onChange: (value: string) => void) {
    const field = element("label", undefined, "field compact-fields");
    const select = element("select"); select.id = id;
    for (const [value, text] of choices) { const option = element("option", text); option.value = value; select.append(option); }
    field.append(element("span", label), select); parent.append(field);
    select.addEventListener("change", () => onChange(select.value));
    return select;
  }
  function showQuote(base: QuoteBriefInput, source: string) {
    quoteBase = base; quoteSection.hidden = false; clearQuoteResult();
    query<HTMLElement>("#quote-source").textContent = source;
  }
  function mount(title: string, report: unknown, filename: string) {
    results.hidden = false; hasReport = true;
    const heading = element("div", undefined, "result-heading");
    const h2 = element("h2", title); h2.id = "results-heading";
    heading.append(h2, download(JSON.stringify(report, null, 2), filename, "application/json", "Download JSON report"));
    results.append(heading);
  }

  function renderInsert(report: InsertResult) {
    mount(report.status === "layouts_found" ? "Your preliminary layouts" : "No layout found", report, "packlegacy-insert-plan.json");
    if (report.status !== "layouts_found" || !report.layouts.length) {
      notice(results, report.reason?.message ?? "The bounded search found no usable layout.", true);
      results.append(element("p", "Review the measurements, permitted turns and clearances. An unsuccessful heuristic search does not prove that every possible arrangement would fail.", "hint"));
      details(results, "Method and assumptions", report.assumptions);
      showQuote({ quantity: null, notes: "Insert planning review requested. No layout was found. " + (report.reason?.message ?? "") }, "No internal dimensions are being carried forward because no layout was found.");
      return;
    }
    notice(results, "One layer, with every product upright. These layouts use your entered clearances and need a packaging specialist’s review before production.");
    const layoutArea = element("div");
    const choose = (id: string) => {
      const layout = report.layouts.find(item => item.id === id)!;
      layoutArea.replaceChildren();
      if (diagramUrl) URL.revokeObjectURL(diagramUrl);
      stats(layoutArea, [
        [dimensionText(layout.internal_dimensions), "Internal box size · L × W × H"],
        [dimensionText(layout.required_envelope), "Envelope needed by this arrangement"],
        [String(report.items_per_kit), "Product items in one kit"],
        [fmt(layout.cavity_coverage_percent) + "%", "Internal footprint occupied by cavity envelopes"],
      ]);
      diagramUrl = URL.createObjectURL(new Blob([layout.svg], { type: "image/svg+xml" }));
      const image = element("img", undefined, "layout-image");
      image.src = diagramUrl; image.alt = "Labelled top-down insert arrangement; the placement table below gives all dimensions and coordinates.";
      layoutArea.append(image);
      const svgDownload = element("a", "Download layout SVG", "button secondary");
      svgDownload.href = diagramUrl; svgDownload.download = "packlegacy-" + layout.id + ".svg";
      layoutArea.append(svgDownload);
      table(layoutArea, "Product and cavity placements · all dimensions in mm", ["Item", "Product L × W × H", "Cavity L × W", "Cavity x, y", "Turn"],
        layout.placements.map(p => [`${p.name} (${p.instance_id})`, dimensionText(p.product), `${fmt(p.cavity.length)} × ${fmt(p.cavity.width)}`, `${fmt(p.cavity.x)}, ${fmt(p.cavity.y)}`, p.rotation_degrees + "°"]));
      layoutArea.append(element("p", "Coordinates start at the internal box origin and include the edge margin. Dashed envelopes include cavity clearance; gaps are measured between those envelopes. The SVG is a planning sketch, not a production dieline.", "hint"));
      const base = report.quote_brief_fields!;
      showQuote({ ...base, quantity: null, dimensions: { ...layout.internal_dimensions, unit: "mm", basis: "internal" }, notes: base.notes.replace(/^Preliminary layout-\d+\./, `Preliminary ${layout.id}.`) }, `${human(layout.id)} selected: ${dimensionText(layout.internal_dimensions)} internal. The brief includes component dimensions and entered clearances; order quantity stays undecided unless you enter it below.`);
    };
    selectControl(results, "Compare an arrangement", "layout-choice", report.layouts.map((item, index) => [item.id, `Arrangement ${index + 1} · ${dimensionText(item.internal_dimensions)}`]), choose);
    results.append(layoutArea); choose(report.selected_layout_id);
    details(results, "Method and assumptions", report.assumptions);
  }

  function boundedNotes(prefix: string, entries: string[]) {
    let notes = prefix;
    for (let i = 0; i < entries.length; i++) {
      const addition = "\n" + entries[i];
      if (notes.length + addition.length > 1880) {
        notes += `\n${entries.length - i} further entries are in the downloaded report; attach it for review.`; break;
      }
      notes += addition;
    }
    return notes;
  }
  function renderConsolidation(report: ConsolidateBoxesResult) {
    mount(report.status === "planned" ? "Your box-size comparison" : "Your fit comparison", report, "packlegacy-box-sizes.json");
    notice(results, "Each parcel contains one unit of one SKU. Reported fits use the entered clearance and permitted orientation; manufacturing compatibility and protection still need review.");
    stats(results, [
      [String(report.summary.actual_box_size_count), "Selected internal box sizes"],
      [`${report.summary.assigned_sku_count} / ${report.summary.input_sku_count}`, "SKUs with a reported box assignment"],
      [fmt(report.summary.selected_boxes_volume_for_one_of_each_assigned_sku_mm3 / 1000) + " cm³", "Selected internal volume · one parcel for each assigned SKU"],
      [fmt(report.summary.additional_volume_over_dedicated_envelopes_mm3 / 1000) + " cm³", "Extra volume above separate required envelopes"],
    ]);
    results.append(element("p", report.summary.comparison_scope + " These volume figures do not calculate shipping charges, production cost or environmental savings.", "hint"));
    if (report.box_families.length) table(results, "Selected internal box sizes", ["Box", "Internal L × W × H", "Assigned SKU IDs"], report.box_families.map(b => [`${b.name} (${b.box_id})`, dimensionText(b.internal_dimensions_mm), b.assigned_product_ids.join(", ")]));
    if (report.assignments.length) table(results, "Checked geometric assignments", ["SKU", "Box", "Product after permitted turn", "Required envelope", "Envelope use"], report.assignments.map(a => [`${a.product_name} (${a.product_id})`, a.box_id, dimensionText(a.oriented_product_mm), dimensionText(a.required_internal_mm), fmt(a.required_envelope_utilization_percent) + "%"]));
    if (report.unassigned_products.length) {
      notice(results, `${report.unassigned_products.length} SKU(s) have no assignment within this selected family. They are excluded from all volume totals.`, true);
      table(results, "Products needing another solution", ["SKU", "Reason", "Other entered boxes that fit"], report.unassigned_products.map(p => [p.product_name + " (" + p.product_id + ")", p.reason === "not_covered_by_selected_boxes_within_size_limit" ? "Not covered by the selected boxes within the size limit" : "No entered box fits the permitted orientations and clearance", p.other_fitting_candidate_box_ids.join(", ") || "None"]));
    }
    results.append(element("p", report.weighting.note, "hint"));
    const weighted = report.summary.order_weighted_comparison;
    if (weighted) table(results, "Comparison using your supplied relative order weights", ["Measure", "Value"], [
      ["Total assigned order weight", fmt(weighted.total_assigned_order_weight)],
      ["Separate required envelopes · mm³ × weight", fmt(weighted.dedicated_envelopes_volume_mm3_times_weight)],
      ["Selected internal boxes · mm³ × weight", fmt(weighted.selected_boxes_volume_mm3_times_weight)],
    ]);
    const fitDetails = element("details"); fitDetails.append(element("summary", "All checked fits among selected boxes"));
    table(fitDetails, "Selected-box fit matrix", ["SKU ID", "Fitting selected box IDs"], report.fit_matrix.map(row => [row.product_id, row.fitting_selected_box_ids.join(", ") || "None"])); results.append(fitDetails);
    details(results, "Method and assumptions", [report.method, "This is a heuristic comparison; a globally optimal box family is not guaranteed.", ...report.assumptions]);
    if (report.box_families.length) {
      const choose = (id: string) => {
        const box = report.box_families.find(b => b.box_id === id)!;
        const entries = report.assignments.filter(a => a.box_id === id).map(a => `${a.product_id}: product ${dimensionText(a.oriented_product_mm)}; required ${dimensionText(a.required_internal_mm)}.`);
        const notes = boundedNotes(`Preliminary box-size plan for ${id}. One unit of one SKU per parcel. Clearance on every side: ${fmt(report.clearance_per_side_mm)} mm. Selected internal box: ${dimensionText(box.internal_dimensions_mm)}. Geometric fit only; manufacturing and protection unvalidated.`, entries);
        showQuote({ quantity: null, dimensions: { ...box.internal_dimensions_mm, unit: "mm", basis: "internal" }, notes }, `${box.name}: ${dimensionText(box.internal_dimensions_mm)} internal. This brief concerns the selected size; download the full report to review every size and assignment.`);
      };
      selectControl(results, "Box size for this enquiry", "quote-box-choice", report.box_families.map(b => [b.box_id, b.name + " · " + dimensionText(b.internal_dimensions_mm)]), choose);
      choose(report.box_families[0].box_id);
    } else showQuote({ quantity: null, notes: "Box-size planning review requested. None of the entered existing boxes fits the reported products with the requested clearance and orientations. Attach the downloaded report for review." }, "No internal dimensions are carried forward because no box was assigned.");
  }

  const checkText = (value: string) => ({
    meets_entered_threshold: "Meets your entered threshold",
    below_entered_threshold: "Below your entered threshold",
    not_checked_no_threshold: "No threshold entered",
    not_checked_no_print_size: "Print size needed",
    not_checked_missing_explicit_boxes: "Explicit trim and bleed boxes needed",
    invalid_box_geometry: "Page boxes need review",
    matches_entered_print_ratio: "Matches the entered print ratio",
    different_from_entered_print_ratio: "Different from the entered print ratio",
    embedded_program_present: "Embedded font program present",
    not_embedded: "No embedded font program found",
    type3_glyph_programs_not_validated: "Type 3 glyph programs; not validated",
  } as Record<string, string>)[value] ?? human(value);

  function renderArtwork(report: ArtworkInspectionResult) {
    mount("Your artwork inspection", report, "packlegacy-artwork-inspection.json");
    notice(results, "This is an inspection report, not production approval. Any threshold comparisons use the values you entered for this project.");
    stats(results, [[report.format.toUpperCase(), "Detected file format"], [fmt(report.file.size_bytes / 1024) + " KiB", "File size"], [`${report.coverage.inspected_pages} / ${report.coverage.page_count}`, "Pages inspected / total pages"]]);
    results.append(element("p", report.file.filename ?? "Uploaded artwork", "hint"));
    if (report.coverage.truncated) notice(results, "This is a partial report: a page or declared-resource inspection limit was reached. Review the coverage and limitations in the downloaded report.", true);
    if ("raster" in report) {
      const r = report.raster;
      table(results, "Raster measurements and metadata", ["Measure", "Reported value"], [
        ["Oriented pixel dimensions", `${r.oriented_width_px} × ${r.oriented_height_px} px`],
        ["Colour-space metadata", r.colour_space],
        ["Embedded ICC profile", r.embedded_icc_profile_present ? "Present" : "Not present"],
        ["Alpha channel", r.has_alpha_channel ? "Present" : "Not present"],
        ["Density metadata", r.metadata_density_dpi == null ? "Not reported" : fmt(r.metadata_density_dpi) + " DPI; not effective print resolution"],
        ["Effective DPI at entered print size", r.effective_dpi ? `${fmt(r.effective_dpi.x)} × ${fmt(r.effective_dpi.y)} DPI` : "Enter both print dimensions to calculate"],
        ["DPI threshold comparison", checkText(report.checks.effective_dpi.status)],
        ["Print aspect ratio", checkText(report.checks.aspect_ratio.status)],
      ]);
      if (report.checks.effective_dpi.status === "below_entered_threshold") notice(results, "The raster image’s effective DPI is below the threshold you entered at this print size.", true);
      if (report.checks.aspect_ratio.status === "different_from_entered_print_ratio") notice(results, report.checks.aspect_ratio.note, true);
      results.append(element("p", "A raster file cannot establish PDF bleed-box geometry or font embedding. The report does not choose cropping, borders or distortion.", "hint"));
    } else {
      table(results, "PDF page dimensions and explicit bleed metadata", ["Page", "Oriented trim size", "Trim / bleed box source", "Bleed L / R / T / B", "Threshold comparison"], report.pages.map(p => [p.page_number, `${fmt(p.oriented_trim_width_mm)} × ${fmt(p.oriented_trim_height_mm)} mm`, `${human(p.trim_box.source)} / ${human(p.bleed_box.source)}`, p.bleed_margins_mm ? [p.bleed_margins_mm.left, p.bleed_margins_mm.right, p.bleed_margins_mm.top, p.bleed_margins_mm.bottom].map(v => fmt(v!)).join(" / ") + " mm" : "Unknown; explicit boxes needed", checkText(p.bleed_check.status)]));
      results.append(element("p", "PDF embedded-image effective DPI remains unknown. Page-box margins do not prove that artwork extends through the bleed area.", "hint"));
      if (report.findings.length) {
        const list = element("ul", undefined, "details-list");
        results.append(element("h3", "Items for review"));
        for (const finding of report.findings) list.append(element("li", (finding.page ? `Page ${finding.page}: ` : "") + finding.message));
        results.append(list);
      }
      const resources = element("details"); resources.append(element("summary", "Declared fonts, images and colour spaces"));
      resources.append(element("p", "These are declared resources. Presence does not establish actual use, rendered appearance or the validity of an embedded font program.", "hint"));
      if (report.fonts.length) table(resources, "Declared font resources", ["Page", "Font", "Resource", "Embedding"], report.fonts.map(font => [font.page, font.base_font, font.resource_name, checkText(font.embedding)]));
      else resources.append(element("p", "No declared font resources were reported.", "hint"));
      if (report.images.length) table(resources, "Declared image resources", ["Page", "Resource", "Pixel dimensions", "Declared colour space"], report.images.map(image => [image.page, image.resource_name, `${image.width_px ?? "?"} × ${image.height_px ?? "?"}`, image.declared_colour_space]));
      resources.append(element("p", "Declared colour spaces: " + (report.declared_colour_spaces.join(", ") || "None reported"), "hint")); results.append(resources);
    }
    details(results, "Inspection scope and limitations", report.limitations);
    const profile = report.profile;
    const notes = boundedNotes(`Artwork inspection for ${report.file.filename ?? "uploaded file"} (${report.format.toUpperCase()}). SHA-256: ${report.file.sha256}. Inspected ${report.coverage.inspected_pages} of ${report.coverage.page_count} page(s). Production approval not established.`, [
      profile.print_width_mm !== null ? `Entered artwork print size: ${profile.print_width_mm} × ${profile.print_height_mm} mm; these are not box dimensions.` : "Artwork print size undecided.",
      `Entered minimum DPI: ${profile.min_effective_dpi ?? "none"}; entered minimum bleed: ${profile.min_bleed_mm ?? "none"} mm. Thresholds are caller supplied.`,
      "Attach the downloaded inspection report and source artwork for specialist review. No uploaded file is included in this brief.",
    ]);
    showQuote({ quantity: null, artwork_state: "undecided", notes }, "The brief will reference this inspection. It will not attach or submit your file, and it will not mark the artwork as approved.");
  }

  function readNumber(root: ParentNode, name: string, optional = false): number | undefined {
    const input = query<HTMLInputElement>(`[name="${name}"]`, root);
    if (!input.value.trim()) { if (optional) return undefined; throw new Error("Enter " + name.replace(/_/g, " ") + "."); }
    const value = Number(input.value);
    if (!Number.isFinite(value)) throw new Error("Enter a finite number for " + name.replace(/_/g, " ") + ".");
    return value;
  }
  function rowValue(row: Element, key: string) { return query<Control>(`[data-field="${key}"]`, row).value.trim(); }
  function rowNumber(row: Element, key: string) { const raw = rowValue(row, key); if (!raw) throw new Error("Complete every required product dimension."); const value = Number(raw); if (!Number.isFinite(value)) throw new Error("Enter finite dimensions."); return value; }
  function insertInput(): InsertPlanInput {
    const input: InsertPlanInput = {
      unit: query<HTMLSelectElement>('[name="unit"]', form).value as Unit,
      items: [...form.querySelectorAll('[data-row="insert"]')].map(row => ({ id: rowValue(row, "id"), name: rowValue(row, "name"), length: rowNumber(row, "length"), width: rowNumber(row, "width"), height: rowNumber(row, "height"), quantity: rowNumber(row, "quantity"), allow_rotation: rowValue(row, "allow_rotation") === "true" })),
      cavity_clearance: readNumber(form, "cavity_clearance")!, gap: readNumber(form, "gap")!, edge_margin: readNumber(form, "edge_margin")!, bottom_clearance: readNumber(form, "bottom_clearance")!, top_clearance: readNumber(form, "top_clearance")!, max_layouts: 3,
    };
    if (query<HTMLInputElement>("#use-existing-box").checked) input.existing_box = { length: readNumber(form, "box_length")!, width: readNumber(form, "box_width")!, height: readNumber(form, "box_height")! };
    return input;
  }
  function consolidationInput(): ConsolidateBoxesInput {
    const input: ConsolidateBoxesInput = {
      products: [...form.querySelectorAll('[data-row="product"]')].map(row => ({ id: rowValue(row, "id"), name: rowValue(row, "name"), length: rowNumber(row, "length"), width: rowNumber(row, "width"), height: rowNumber(row, "height"), unit: rowValue(row, "unit") as Unit, orientation: rowValue(row, "orientation") as "upright" | "fixed" | "any", ...(rowValue(row, "order_weight") ? { order_weight: rowNumber(row, "order_weight") } : {}) })),
      max_box_sizes: readNumber(form, "max_box_sizes")!, clearance_per_side_mm: readNumber(form, "clearance_per_side_mm")!,
    };
    if (query<HTMLInputElement>("#use-existing-boxes").checked) input.existing_boxes = [...form.querySelectorAll('[data-row="box"]')].map(row => ({ id: rowValue(row, "id"), ...(rowValue(row, "name") ? { name: rowValue(row, "name") } : {}), length: rowNumber(row, "length"), width: rowNumber(row, "width"), height: rowNumber(row, "height"), unit: rowValue(row, "unit") as Unit }));
    return input;
  }
  async function artworkInput() {
    const file = query<HTMLInputElement>("#artwork-file").files?.[0];
    if (!file) throw new Error("Choose a PDF, PNG or JPEG file.");
    if (file.size < 1 || file.size > 2 * 1024 * 1024) throw new Error("Choose a non-empty file no larger than 2 MiB.");
    if (!/\.(pdf|png|jpe?g)$/i.test(file.name)) throw new Error("Choose a file with a PDF, PNG, JPG or JPEG extension.");
    if (file.name.length > 160 || /[\\/\u0000-\u001f\u007f]/.test(file.name)) throw new Error("Use a filename of at most 160 characters, without path separators or control characters.");
    const options: ArtworkInspectionOptions = { filename: file.name };
    for (const name of ["print_width_mm", "print_height_mm", "min_effective_dpi", "min_bleed_mm"] as const) { const value = readNumber(form, name, true); if (value !== undefined) options[name] = value; }
    if ((options.print_width_mm === undefined) !== (options.print_height_mm === undefined)) throw new Error("Enter both print width and print height, or leave both blank.");
    const file_base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("The selected file could not be read. Please choose it again."));
      reader.onload = () => { const value = String(reader.result); const comma = value.indexOf(","); if (comma < 0) reject(new Error("The selected file could not be encoded.")); else resolve(value.slice(comma + 1)); };
      reader.readAsDataURL(file);
    });
    return { file_base64, options };
  }

  async function callApi<T>(tool: ToolName, args: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch("/api/packaging-tools/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool, arguments: args }), signal: controller.signal, credentials: "same-origin" });
      const data = await response.json().catch(() => null) as { ok?: boolean; result?: T; error?: { code?: string; message?: string; issues?: Array<{ path?: string | Array<string | number>; message?: string }> } } | null;
      if (!response.ok || data?.ok !== true || data.result === undefined) {
        const issues = data?.error?.issues?.slice(0, 10).map(issue => {
          const path = Array.isArray(issue.path) ? issue.path.join(" → ") : typeof issue.path === "string" ? issue.path : "";
          return (path ? path + ": " : "") + (issue.message ?? "Check this value.");
        }).join("\n");
        throw new Error((data?.error?.message ?? "The tool could not complete this request. Please try again.") + (issues ? "\n" + issues : ""));
      }
      return data.result;
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") throw new Error("The request took too long. Please try again; no enquiry was submitted.");
      if (cause instanceof TypeError) throw new Error("The service could not be reached. Check your connection and try again.");
      throw cause;
    } finally { window.clearTimeout(timer); }
  }
  function disableControls(target: HTMLFormElement) {
    const controls = [...target.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>("input,select,button")];
    const before = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });
    target.setAttribute("aria-busy", "true");
    return () => { controls.forEach((control, index) => { control.disabled = before[index]; }); target.removeAttribute("aria-busy"); };
  }
  form.addEventListener("submit", async event => {
    event.preventDefault(); if (busy || !form.reportValidity()) return;
    busy = true; error.hidden = true; error.textContent = ""; resetResults();
    status.textContent = kind === "artwork" ? "Reading and inspecting your artwork…" : "Calculating your preliminary plan…";
    let restore = () => {};
    try {
      // Capture a stable form even while FileReader is working asynchronously.
      restore = disableControls(form);
      const input = kind === "insert" ? insertInput() : kind === "consolidate" ? consolidationInput() : await artworkInput();
      const tool = form.dataset.tool as ToolName;
      const output = await callApi<unknown>(tool, input);
      if (kind === "insert") renderInsert(output as InsertResult);
      else if (kind === "consolidate") renderConsolidation(output as ConsolidateBoxesResult);
      else renderArtwork(output as ArtworkInspectionResult);
      status.textContent = "Results are ready below. Nothing has been submitted as an enquiry.";
      results.focus({ preventScroll: true }); results.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (cause) {
      resetResults(); error.textContent = cause instanceof Error ? cause.message : "The tool could not complete the request."; error.hidden = false; status.textContent = "Please review the message and try again.";
    } finally { restore(); busy = false; }
  });

  function briefText(report: QuoteResult) {
    const b = report.brief;
    const d = b.dimensions;
    return ["PACK LEGACY — UNSENT ENQUIRY BRIEF", "Prepared for your review. No enquiry has been sent or saved by this tool.", "",
      "Order quantity: " + (b.quantity ?? "Undecided"),
      "Dimensions: " + (d ? `${d.length ?? "?"} × ${d.width ?? "?"} × ${d.height ?? "?"} ${d.unit ?? "unit undecided"} (${d.basis ?? "basis undecided"})` : "Undecided"),
      "Material requested: " + (b.material_requested ?? "Undecided"),
      "Delivery: " + ([b.delivery_country, b.delivery_postcode].filter(Boolean).join(" ") || "Undecided"),
      ...(b.inserts_requested ? ["Insert request: " + b.inserts_requested] : []),
      "", "Project notes", b.notes,
      "", "Information needed for a final offer", ...report.missing_information_for_final_offer.map(item => "• " + item),
      "", "Final price requires an approved quote. Manufacturing compatibility and delivery feasibility are not confirmed.",
      "Quote form: " + document.body.dataset.quoteUrl,
    ].join("\n");
  }
  quoteForm.addEventListener("submit", async event => {
    event.preventDefault(); if (!quoteBase || !quoteForm.reportValidity()) return;
    if (quoteForm.getAttribute("aria-busy") === "true") return;
    clearQuoteResult(); quoteStatus.textContent = "Preparing your unsent brief…";
    const generation = quoteGeneration;
    let restore = () => {};
    try {
      const quantity = readNumber(quoteForm, "quantity", true) ?? null;
      const country = query<HTMLInputElement>('[name="delivery_country"]', quoteForm).value.trim().toUpperCase();
      const postcode = query<HTMLInputElement>('[name="delivery_postcode"]', quoteForm).value.trim();
      const material = query<HTMLInputElement>('[name="material_requested"]', quoteForm).value.trim();
      const args: QuoteBriefInput = { ...quoteBase, quantity, ...(country ? { delivery_country: country } : {}), ...(postcode ? { delivery_postcode: postcode } : {}), ...(material ? { material_requested: material } : {}) };
      restore = disableControls(quoteForm);
      const output = await callApi<QuoteResult>("prepare_quote_brief", args);
      // A layout, selected box, or source result may have changed during the request.
      if (generation !== quoteGeneration) return;
      const text = briefText(output);
      quoteResult.hidden = false; quoteResult.append(element("h3", "Your brief is prepared — and unsent"), element("div", text, "brief-copy"));
      const actions = element("div", undefined, "actions");
      actions.append(download(text, "packlegacy-unsent-enquiry.txt", "text/plain;charset=utf-8", "Download brief", quoteUrls), download(JSON.stringify(output, null, 2), "packlegacy-unsent-enquiry.json", "application/json", "Download brief JSON", quoteUrls));
      const quoteLink = element("a", "Open the quote form", "button primary"); quoteLink.href = document.body.dataset.quoteUrl!; actions.append(quoteLink); quoteResult.append(actions);
      quoteStatus.textContent = "Prepared for review. No enquiry was sent or saved. Download the brief and use the quote form when you are ready.";
    } catch (cause) { if (generation === quoteGeneration) { quoteError.textContent = cause instanceof Error ? cause.message : "The brief could not be prepared."; quoteError.hidden = false; quoteStatus.textContent = "Please review the message and try again."; } }
    finally { restore(); }
  });

  function refreshRows(tableId: string, noun: string, max: number, addId: string) {
    const rows = [...query<HTMLTableElement>("#" + tableId).querySelectorAll("tbody tr")];
    rows.forEach((row, index) => {
      row.querySelectorAll<Control>("[data-field]").forEach(control => control.setAttribute("aria-label", `${noun} ${index + 1} ${control.dataset.field!.replace(/_/g, " ")}`));
      const remove = query<HTMLButtonElement>("[data-remove-row]", row);
      remove.disabled = rows.length <= 1; remove.setAttribute("aria-label", `Remove ${noun.toLowerCase()} ${index + 1}`);
    });
    query<HTMLButtonElement>("#" + addId).disabled = rows.length >= max;
  }
  function createRow(templateId: string, values: Record<string, string | number | boolean>) {
    const template = query<HTMLTemplateElement>("#" + templateId);
    const row = template.content.firstElementChild!.cloneNode(true) as HTMLTableRowElement;
    row.querySelectorAll<Control>("[data-field]").forEach(control => {
      const name = control.dataset.field!;
      if (name in values) control.value = String(values[name]);
      else if (control instanceof HTMLInputElement) control.value = "";
    });
    return row;
  }
  function rowsController(tableId: string, templateId: string, addId: string, noun: string, max: number, defaults: () => Record<string, string | number | boolean>) {
    const body = query<HTMLTableSectionElement>("#" + tableId + " tbody");
    const refresh = () => refreshRows(tableId, noun, max, addId);
    query<HTMLButtonElement>("#" + addId).addEventListener("click", () => { if (body.rows.length >= max) return; invalidate(); const row = createRow(templateId, defaults()); body.append(row); refresh(); query<HTMLInputElement>('[data-field="name"]', row).focus(); });
    body.addEventListener("click", event => {
      const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-remove-row]") : null;
      if (button && body.rows.length > 1) { invalidate(); button.closest("tr")!.remove(); refresh(); }
    });
    refresh();
    return (values: Array<Record<string, string | number | boolean>>) => { body.replaceChildren(...values.map(value => createRow(templateId, value))); refresh(); };
  }
  function toggle(checkId: string, fieldsId: string) {
    const checkbox = query<HTMLInputElement>("#" + checkId), fields = query<HTMLFieldSetElement>("#" + fieldsId);
    const update = () => { fields.hidden = !checkbox.checked; fields.disabled = !checkbox.checked; };
    checkbox.addEventListener("change", update); update(); return update;
  }
  const setForm = (name: string, value: string | number) => { query<Control>(`[name="${name}"]`, form).value = String(value); };
  function exampleLoaded() { invalidate(); query<HTMLElement>("#example-notice").hidden = false; status.textContent = "Example loaded. Review and replace the measurements and allowances, then run the tool."; }

  if (kind === "insert") {
    const setRows = rowsController("insert-items", "insert-row-template", "add-item", "Component", 20, () => ({ id: "item-" + (++sequence), quantity: 1, allow_rotation: true }));
    const update = toggle("use-existing-box", "existing-box-fields");
    query<HTMLButtonElement>("#load-example").addEventListener("click", () => {
      setRows([{ id: "candle", name: "Candle", length: 80, width: 80, height: 100, quantity: 1, allow_rotation: true }, { id: "perfume", name: "Perfume bottle", length: 45, width: 45, height: 115, quantity: 1, allow_rotation: true }, { id: "matches", name: "Matchbox", length: 70, width: 25, height: 15, quantity: 1, allow_rotation: true }]);
      setForm("unit", "mm"); setForm("cavity_clearance", 2); setForm("gap", 8); setForm("edge_margin", 8); setForm("bottom_clearance", 5); setForm("top_clearance", 5);
      query<HTMLInputElement>("#use-existing-box").checked = false; update(); exampleLoaded();
    });
  } else if (kind === "consolidate") {
    const setRows = rowsController("catalogue-products", "product-row-template", "add-product", "Product", 50, () => ({ id: "sku-" + (++sequence), unit: "mm", orientation: "upright" }));
    rowsController("existing-boxes", "box-row-template", "add-box", "Box", 50, () => ({ id: "box-" + (++sequence), unit: "mm" }));
    const update = toggle("use-existing-boxes", "existing-boxes-fields");
    query<HTMLButtonElement>("#load-example").addEventListener("click", () => {
      setRows([{ id: "candle", name: "Candle", length: 80, width: 80, height: 100, unit: "mm", orientation: "upright" }, { id: "perfume", name: "Perfume bottle", length: 45, width: 45, height: 115, unit: "mm", orientation: "upright" }, { id: "matches", name: "Matchbox", length: 70, width: 25, height: 15, unit: "mm", orientation: "upright" }]);
      setForm("max_box_sizes", 2); setForm("clearance_per_side_mm", 2); query<HTMLInputElement>("#use-existing-boxes").checked = false; update(); exampleLoaded();
    });
  }
  form.addEventListener("input", invalidate);
  form.addEventListener("change", invalidate);
  const invalidateBrief = () => { const hadBrief = !quoteResult.hidden; clearQuoteResult(); if (hadBrief) quoteStatus.textContent = "Enquiry details changed. Prepare the brief again to include them."; };
  quoteForm.addEventListener("input", invalidateBrief);
  quoteForm.addEventListener("change", invalidateBrief);
  window.addEventListener("pagehide", event => {
    // Keep report downloads usable if Back restores this page from the browser cache.
    if (event.persisted) return;
    revoke(reportUrls); revoke(quoteUrls); if (diagramUrl) URL.revokeObjectURL(diagramUrl);
  });
}
