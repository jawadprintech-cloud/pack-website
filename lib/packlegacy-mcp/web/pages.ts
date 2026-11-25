import { WEB_CLIENT_SOURCE } from "./generated-client";

export type ToolPageKind = "insert" | "consolidate" | "artwork" | "index";
export interface ToolPageConfig { siteUrl: string; indexable: boolean }

const paths: Record<ToolPageKind, string> = {
  index: "/tools/",
  insert: "/tools/box-and-insert-planner/",
  consolidate: "/tools/box-size-planner/",
  artwork: "/tools/packaging-artwork-checker/",
};
const titles: Record<ToolPageKind, string> = {
  index: "Packaging planning tools",
  insert: "Box & insert planner",
  consolidate: "Box size planner",
  artwork: "Packaging artwork checker",
};
const descriptions: Record<ToolPageKind, string> = {
  index: "Plan a mixed-product insert, compare a smaller family of box sizes, or inspect artwork before preparing your packaging enquiry.",
  insert: "Arrange several products in one layer, compare internal box dimensions and download a labelled layout for your packaging enquiry.",
  consolidate: "Explore a smaller family of internal box sizes for a catalogue of products, with one unit of one SKU in each parcel.",
  artwork: "Inspect PDF, PNG and JPEG artwork for reported dimensions, colour metadata, font resources and checks against your own thresholds.",
};

const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
const unitSelect = (name: string, extra = "") => `<select name="${name}" ${extra}><option value="mm">mm</option><option value="cm">cm</option><option value="in">inches</option></select>`;
const numberInput = (name: string, extra = "") => `<input type="number" inputmode="decimal" name="${name}" step="any" ${extra}>`;
const field = (label: string, control: string, help = "") => `<label class="field"><span>${label}</span>${control}${help ? `<small>${help}</small>` : ""}</label>`;
const dimensionCell = (axis: string, label: string, row: string, min = "0.001") => `<td data-label="${label}"><input type="number" inputmode="decimal" data-field="${axis}" min="${min}" max="10000" step="any" required aria-label="${row} ${axis}"></td>`;

function insertRow() {
  return `<tr data-row="insert">
    <td data-label="Component ID"><input data-field="id" value="item-1" maxlength="40" pattern="[A-Za-z0-9][A-Za-z0-9_.\\-]{0,39}" required aria-label="Component 1 ID"></td>
    <td data-label="Product name" class="name-cell"><input data-field="name" maxlength="100" required placeholder="e.g. Candle" aria-label="Component 1 name"></td>
    ${dimensionCell("length", "Length", "Component 1", "0")}${dimensionCell("width", "Width", "Component 1", "0")}${dimensionCell("height", "Height", "Component 1", "0")}
    <td data-label="Per kit"><input type="number" data-field="quantity" value="1" min="1" max="30" step="1" required aria-label="Component 1 count per kit"></td>
    <td data-label="Horizontal turn"><select data-field="allow_rotation" aria-label="Component 1 horizontal rotation"><option value="true">Allow 90°</option><option value="false">Keep axes</option></select></td>
    <td data-label="Remove"><button class="remove" type="button" data-remove-row aria-label="Remove component 1">Remove</button></td>
  </tr>`;
}
function productRow() {
  return `<tr data-row="product">
    <td data-label="SKU ID"><input data-field="id" value="sku-1" maxlength="120" required aria-label="Product 1 SKU ID"></td>
    <td data-label="Product name" class="name-cell"><input data-field="name" maxlength="120" required placeholder="e.g. Candle" aria-label="Product 1 name"></td>
    ${dimensionCell("length", "Length", "Product 1")}${dimensionCell("width", "Width", "Product 1")}${dimensionCell("height", "Height", "Product 1")}
    <td data-label="Unit">${unitSelect("product_unit", 'data-field="unit" aria-label="Product 1 measurement unit"')}</td>
    <td data-label="Orientation"><select data-field="orientation" aria-label="Product 1 allowed orientation"><option value="upright">Upright</option><option value="fixed">Fixed axes</option><option value="any">Any axis</option></select></td>
    <td data-label="Order weight"><input type="number" data-field="order_weight" min="0.000001" max="1000000" step="any" placeholder="Optional" aria-label="Product 1 relative order weight"></td>
    <td data-label="Remove"><button class="remove" type="button" data-remove-row aria-label="Remove product 1">Remove</button></td>
  </tr>`;
}
function boxRow() {
  return `<tr data-row="box">
    <td data-label="Box ID"><input data-field="id" value="box-1" maxlength="120" required aria-label="Box 1 ID"></td>
    <td data-label="Box name" class="name-cell"><input data-field="name" maxlength="120" placeholder="Optional" aria-label="Box 1 name"></td>
    ${dimensionCell("length", "Internal length", "Box 1 internal")}${dimensionCell("width", "Internal width", "Box 1 internal")}${dimensionCell("height", "Internal height", "Box 1 internal")}
    <td data-label="Unit">${unitSelect("box_unit", 'data-field="unit" aria-label="Box 1 measurement unit"')}</td>
    <td data-label="Remove"><button class="remove" type="button" data-remove-row aria-label="Remove box 1">Remove</button></td>
  </tr>`;
}
function editTable(id: string, caption: string, headers: string[], row: string) {
  return `<div class="table-wrap"><table class="edit-table" id="${id}"><caption class="sr-only">${caption}</caption><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${row}</tbody></table></div>`;
}
const actions = (submit: string, example = true) => `<div class="actions"><button class="button primary" type="submit">${submit}</button>${example ? '<button class="button secondary" type="button" id="load-example">Load example</button>' : ""}</div>`;

function insertForm() {
  return `<form id="tool-form" data-tool="plan_multi_item_insert">
    <fieldset><legend><span class="step">1</span> Products in one kit</legend>
      <p class="hint">Use each product’s rectangular bounding dimensions. For a round product, enter its diameter as both length and width. Per-kit counts are separate from the number of boxes you may order.</p>
      <div class="compact-fields">${field("Measurement unit for this plan", unitSelect("unit"))}</div>
      ${editTable("insert-items", "Components in one kit", ["ID", "Product name", "Length", "Width", "Height", "Per kit", "Horizontal turn", ""], insertRow())}
      <button type="button" class="text-button" id="add-item">+ Add a component</button><p class="hint">Up to 20 component types and 30 items in one kit. Products stay upright; horizontal turning is optional.</p>
    </fieldset>
    <fieldset><legend><span class="step">2</span> Enter your clearances</legend>
      <p class="hint">All five values use the unit selected above. Enter allowances for your project; zero means no added space. These values do not establish suitable cushioning or insert-wall thickness.</p>
      <div class="field-grid">
        ${field("Cavity clearance on each side", numberInput("cavity_clearance", 'min="0" max="10000" required'), "Added to both horizontal sides of each product.")}
        ${field("Gap between cavities", numberInput("gap", 'min="0" max="10000" required'), "Measured between the cavity envelopes.")}
        ${field("Margin at each box edge", numberInput("edge_margin", 'min="0" max="10000" required'))}
        ${field("Space below products", numberInput("bottom_clearance", 'min="0" max="10000" required'))}
        ${field("Space above tallest product", numberInput("top_clearance", 'min="0" max="10000" required'))}
      </div>
    </fieldset>
    <fieldset><legend><span class="step">3</span> Optional existing box</legend>
      <label class="check"><input id="use-existing-box" type="checkbox"> Check whether my existing box can fit the kit</label>
      <fieldset class="nested" id="existing-box-fields" disabled hidden><legend class="sr-only">Existing internal box dimensions</legend><p class="hint">Measure inside the box, in the same unit as the products.</p><div class="field-grid">
        ${field("Internal length", numberInput("box_length", 'min="0" max="10000" required'))}
        ${field("Internal width", numberInput("box_width", 'min="0" max="10000" required'))}
        ${field("Internal height", numberInput("box_height", 'min="0" max="10000" required'))}
      </div></fieldset>
    </fieldset>${actions("Plan my layout")}
  </form><template id="insert-row-template">${insertRow()}</template>`;
}
function consolidateForm() {
  return `<form id="tool-form" data-tool="consolidate_box_sizes">
    <fieldset><legend><span class="step">1</span> Products in your catalogue</legend>
      <p class="hint">This planner puts one unit of one SKU in each parcel. For a kit containing several products together, use the <a href="${paths.insert}">box &amp; insert planner</a>.</p>
      ${editTable("catalogue-products", "Catalogue products, one unit per parcel", ["SKU ID", "Product name", "Length", "Width", "Height", "Unit", "Orientation", "Order weight", ""], productRow())}
      <button type="button" class="text-button" id="add-product">+ Add a product</button>
      <p class="hint">Up to 50 SKUs. Upright allows a horizontal turn; fixed preserves all axes; any axis permits tipping. Order weights describe relative demand, not purchase quantities. Supply weights for every SKU to use them; partial weights are ignored.</p>
    </fieldset>
    <fieldset><legend><span class="step">2</span> Your box-size target</legend><div class="field-grid">
      ${field("Maximum number of box sizes", '<input type="number" name="max_box_sizes" value="3" min="1" max="8" step="1" required>')}
      ${field("Clearance on every side (mm)", numberInput("clearance_per_side_mm", 'min="0" max="1000" required'), "Added to both ends of all three axes. Zero is a geometric bounding fit.")}
    </div></fieldset>
    <fieldset><legend><span class="step">3</span> Optional existing boxes</legend>
      <label class="check"><input type="checkbox" id="use-existing-boxes"> Choose from box sizes I already have</label>
      <fieldset class="nested" id="existing-boxes-fields" disabled hidden><legend class="sr-only">Existing internal boxes</legend>
        <p class="hint">Enter internal dimensions for up to 50 candidate boxes. Leave this option off to propose custom internal envelopes.</p>
        ${editTable("existing-boxes", "Existing internal box sizes", ["Box ID", "Name", "Internal length", "Internal width", "Internal height", "Unit", ""], boxRow())}
        <button type="button" class="text-button" id="add-box">+ Add an existing box</button>
      </fieldset>
    </fieldset>${actions("Compare box sizes")}
  </form><template id="product-row-template">${productRow()}</template><template id="box-row-template">${boxRow()}</template>`;
}
function artworkForm() {
  return `<form id="tool-form" data-tool="inspect_artwork_file">
    <fieldset><legend><span class="step">1</span> Choose your artwork</legend>
      ${field("PDF, PNG or JPEG file", '<input id="artwork-file" name="artwork_file" type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" required>', "Maximum 2 MiB. Static images up to 10 megapixels; PDFs up to 100 pages, with the first 20 pages inspected.")}
      <p class="hint">Your file is sent for this inspection. This tool does not store it or submit an enquiry.</p>
    </fieldset>
    <fieldset><legend><span class="step">2</span> Optional print size &amp; thresholds</legend>
      <p class="hint">Leave these blank for a metadata report. Enter only the size and thresholds supplied for your project; this tool does not provide an approved print profile.</p>
      <div class="field-grid">
        ${field("Intended print width (mm)", numberInput("print_width_mm", 'min="0" max="10000"'), "For raster effective DPI, enter both width and height.")}
        ${field("Intended print height (mm)", numberInput("print_height_mm", 'min="0" max="10000"'))}
        ${field("Minimum effective DPI", numberInput("min_effective_dpi", 'min="0" max="9600"'), "Compared only for a raster image with an entered print size.")}
        ${field("Minimum bleed on each side (mm)", numberInput("min_bleed_mm", 'min="0" max="100"'), "Compared with explicit PDF TrimBox and BleedBox metadata.")}
      </div>
    </fieldset>${actions("Inspect artwork", false)}
  </form>`;
}

function quoteSection(quoteUrl: string) {
  return `<section class="panel quote-panel" id="quote-section" aria-labelledby="quote-heading" hidden>
    <div class="section-heading"><p class="eyebrow">Next step</p><h2 id="quote-heading">Prepare your enquiry brief</h2></div>
    <p>Carry the selected result into a brief you can review and download. Preparing it does not send it to Pack Legacy.</p>
    <form id="quote-form"><div id="quote-source" class="notice"></div><div class="field-grid">
      ${field("Order quantity (optional)", '<input type="number" name="quantity" min="1" max="9007199254740991" step="1" placeholder="Leave blank if undecided">', "One custom box can be supplied and shipped. Your enquiry can start without a quantity.")}
      ${field("Delivery country code (optional)", '<input name="delivery_country" maxlength="2" pattern="[A-Za-z]{2}" placeholder="e.g. US" autocapitalize="characters">')}
      ${field("Delivery postcode (optional)", '<input name="delivery_postcode" maxlength="32" autocomplete="postal-code">')}
      ${field("Requested material (optional)", '<input name="material_requested" maxlength="160" placeholder="e.g. undecided">')}
    </div><button class="button primary" type="submit">Prepare an unsent brief</button></form>
    <p id="quote-status" role="status" aria-live="polite"></p><div id="quote-error" role="alert" class="error" hidden></div><div id="quote-result" hidden></div>
    <p class="hint">Use the <a href="${esc(quoteUrl)}">Pack Legacy quote form</a> when you are ready to send your enquiry. The form is a separate step; no information is submitted automatically.</p>
  </section>`;
}

function method(kind: Exclude<ToolPageKind, "index">) {
  const content = kind === "insert" ? `
    <h3>What the layout means</h3><p>The planner explores several deterministic shelf arrangements and compares their internal footprints. It uses rectangular product bounds, one layer, and optional 90° horizontal turns. It does not search every possible arrangement or guarantee the smallest box.</p>
    <h3>An example you can try</h3><p>A candle measuring 80 × 80 × 100 mm, a perfume bottle measuring 45 × 45 × 115 mm, and a matchbox measuring 70 × 25 × 15 mm can be explored as one kit. “Load example” fills these measurements and clearly labelled example allowances; replace them with your own.</p>
    <h3>What still needs review</h3><p>The SVG is a planning sketch, not a production dieline. Insert material, wall thickness, cushioning, retention, tolerances and transit protection need a packaging specialist. Results use millimetres and a conservative 0.001 mm calculation grid; that grid is not a manufacturing tolerance.</p>
    <h3>Supported limits</h3><p>Up to 20 distinct components and 30 total items per kit. Entered dimensions must convert to 0.001–10,000 mm; each allowance must convert to no more than 1,000 mm. If an existing box cannot accommodate a known dimension or area bound, that reason is reported. Otherwise, an unsuccessful search means the heuristic found no layout.</p>`
    : kind === "consolidate" ? `
    <h3>What is being compared</h3><p>The planner groups product envelopes using a deterministic geometric heuristic, or chooses from internal box sizes you enter. It checks each reported assignment against the permitted orientation and clearance. The method does not guarantee the best possible family of boxes.</p>
    <h3>An example you can try</h3><p>Enter a candle, a bottle and a matchbox as three separate SKUs, then request at most two box sizes. Each shipment contains one unit of its SKU. Compare the suggested boxes, assignments and extra internal volume against a separate exact envelope for each product.</p>
    <h3>What the figures do not establish</h3><p>Internal volume is a geometry comparison. It does not measure shipping charges, production cost, environmental impact or protective performance. Proposed dimensions are preliminary internal envelopes, and existing boxes must be measured inside.</p>
    <h3>Supported limits</h3><p>Up to 50 SKUs, 50 existing box candidates and eight selected box sizes. Dimensions may be entered in mm, cm or inches and may convert to no more than 10,000 mm. Clearance is entered in mm, from zero to 1,000 on each side. Order weights are used only when every SKU has one.</p>`
    : `
    <h3>For PNG and JPEG</h3><p>The checker decodes a supported static image and reports pixel dimensions, EXIF orientation, colour-space metadata, alpha-channel presence and whether an ICC profile is embedded. With both print dimensions, it calculates effective DPI for the complete oriented image. Cropping or a different placement changes that result.</p>
    <h3>For PDF</h3><p>The report covers page-box metadata and declared page/form font, image and colour-space resources. It measures bleed margins only where explicit trim and bleed boxes allow it. Embedded-image effective DPI stays unknown because image placement and clipping are not interpreted.</p>
    <h3>How to use the report</h3><p>Try your artwork with the print size and thresholds supplied for your project. A threshold match describes that single check. The checker does not approve production, confirm artwork covers the bleed, render PDF content, verify barcodes or establish correct physical print colours.</p>
    <h3>Supported limits</h3><p>PDF, PNG and JPEG files up to 2 MiB. Raster images may contain up to 10 megapixels. PDFs may contain up to 100 pages; only the first 20 pages and bounded declared resources are inspected. Decoded PDF streams are limited to 16 MiB each and 32 MiB of cumulative decoder buffer allocations per inspection. Encrypted PDFs, animated images and unsupported formats are rejected.</p>`;
  return `<section class="method" aria-labelledby="method-heading"><p class="eyebrow">Before you use the result</p><h2 id="method-heading">Method, examples &amp; limits</h2><div class="method-grid">${content}</div></section>`;
}

function hub(quoteUrl: string) {
  return `<section class="tool-cards" aria-label="Choose a packaging tool">
    ${(["insert", "consolidate", "artwork"] as const).map((kind, index) => `<a class="tool-card" href="${paths[kind]}"><span class="card-number">0${index + 1}</span><h2>${titles[kind]}</h2><p>${descriptions[kind]}</p><span class="card-link">Open tool <span aria-hidden="true">↗</span></span></a>`).join("")}
  </section><section class="panel hub-explainer"><p class="eyebrow">From measurements to an enquiry</p><h2>Bring a clearer brief to your packaging conversation.</h2><p>Use the tools to explore dimensions or inspect an artwork file, then review the measured results. Each tool lets you download its report and prepare an unsent enquiry brief.</p><p>Final materials, manufacturing details, protective performance, price and delivery need review. One custom box can be supplied and shipped, and your enquiry can begin without an order quantity.</p><a class="button secondary" href="${esc(quoteUrl)}">Visit the quote form</a></section>`;
}

const styles = `
:root{color-scheme:light;--cream:#fef5f0;--green:#0d5c4e;--ink:#213b34;--muted:#5b6b64;--line:#d7dfd7;--soft:#edf3ed;--white:#fffdfa;--error:#922f29}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font:16px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--green);text-underline-offset:3px}button,input,select,textarea{font:inherit}button,a,input,select{touch-action:manipulation}a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:3px solid #d28a37;outline-offset:3px}.skip{position:absolute;top:-100px;left:20px;background:#fff;padding:10px;z-index:5}.skip:focus{top:10px}.site-header{max-width:1240px;margin:auto;padding:24px 32px;display:flex;justify-content:space-between;align-items:center;gap:20px;border-bottom:1px solid var(--line)}.brand{text-decoration:none;font-size:24px;letter-spacing:-1px;font-weight:800;display:flex;align-items:center;gap:10px}.brand-mark{display:grid;place-items:center;background:var(--green);color:var(--cream);border-radius:9px;width:36px;height:36px;font-size:18px;letter-spacing:-2px}.site-header nav{display:flex;gap:24px;align-items:center;font-size:14px;font-weight:650}.site-header nav a{text-decoration:none}.container{max-width:1240px;margin:auto;padding:0 32px}.hero{padding:57px 0 35px;max-width:900px}.eyebrow{color:var(--green);font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:750;margin:0 0 12px}.breadcrumb{font-size:13px;display:block;margin-bottom:24px}h1,h2,h3,p{overflow-wrap:anywhere}h1{font-size:clamp(35px,4.5vw,58px);line-height:1.08;letter-spacing:-2px;font-weight:650;margin:0 0 22px;max-width:860px}h2{font-size:28px;line-height:1.22;letter-spacing:-.7px;margin:0 0 18px}h3{font-size:18px;line-height:1.3;margin:24px 0 9px}p{margin:0 0 18px}.lead{font-size:19px;max-width:790px;color:var(--muted)}.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:25px}.chip{font-size:12px;border:1px solid var(--line);border-radius:30px;padding:5px 12px;background:rgba(255,255,255,.45)}.panel{background:var(--white);border:1px solid var(--line);border-radius:18px;padding:28px;margin-bottom:26px;box-shadow:0 4px 18px #183a2804}fieldset{border:0;padding:0;margin:0 0 30px;min-width:0}fieldset:last-of-type{margin-bottom:22px}legend{font-size:21px;font-weight:650;padding:0;margin-bottom:14px;line-height:1.3;display:flex;align-items:center;gap:10px}.step{display:inline-grid;place-items:center;border-radius:50%;background:var(--soft);color:var(--green);font-size:13px;width:27px;height:27px;flex-shrink:0}.hint,.field small{font-size:13px;line-height:1.55;color:var(--muted)}.hint{margin:10px 0 17px}.field-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin:16px 0 24px}.compact-fields{max-width:290px;margin-bottom:18px}.field{display:flex;flex-direction:column;gap:7px;min-width:0}.field>span{font-size:14px;font-weight:600}.field small{font-weight:400}input,select,textarea{width:100%;min-width:0;border:1px solid #b9c8be;border-radius:7px;background:#fff;color:var(--ink);padding:10px 11px;font-size:14px;min-height:44px}input:disabled,select:disabled{background:#f3f3ee}input[type=checkbox]{width:18px;height:18px;min-height:18px;accent-color:var(--green);flex:none}input[type=file]{padding:12px;background:var(--soft)}input::file-selector-button{border:0;border-radius:5px;background:var(--green);color:#fff;padding:8px 13px;margin-right:13px;font:inherit}.check{display:flex;align-items:center;gap:10px;font-size:15px}.nested{margin-top:18px!important;padding:19px;background:#f4f6f0;border:1px solid var(--line);border-radius:10px}.table-wrap{overflow:auto;max-width:100%;border-radius:9px;border:1px solid var(--line);margin:15px 0}.edit-table{width:100%;border-collapse:collapse;min-width:850px;font-size:13px}.edit-table th{font-size:12px;font-weight:650;text-align:left;padding:9px 6px;background:var(--soft);white-space:nowrap}.edit-table td{padding:9px 5px;vertical-align:top;border-top:1px solid var(--line)}.edit-table input,.edit-table select{padding:8px 6px;font-size:13px;min-width:64px}.edit-table .name-cell{min-width:145px}.edit-table td:first-child{width:115px}.edit-table td:last-child{width:70px}.edit-table td:nth-last-child(2){min-width:100px}.remove{border:0;background:none;color:var(--error);text-decoration:underline;font-size:12px;cursor:pointer;min-height:44px;padding:7px 3px}.remove:disabled{color:#8b948d;cursor:default;text-decoration:none}.text-button{border:0;padding:7px 0;min-height:40px;background:none;color:var(--green);font-weight:650;cursor:pointer;font-size:14px}.text-button:disabled{opacity:.5;cursor:default}.actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:8px}.button{display:inline-flex;justify-content:center;align-items:center;gap:8px;padding:12px 20px;border:1px solid var(--green);border-radius:7px;text-decoration:none;font-weight:650;font-size:14px;min-height:47px;cursor:pointer}.primary{background:var(--green);color:#fff}.secondary{background:transparent;color:var(--green)}.button:hover{filter:brightness(.96)}.button:disabled{opacity:.6;cursor:wait}.tool-status{margin:14px 0 0;color:var(--green);font-size:14px}.error{padding:15px;border-radius:9px;background:#fff0eb;border:1px solid #d5a193;color:var(--error);margin:15px 0;white-space:pre-line}.notice{padding:16px 19px;background:var(--soft);border-left:3px solid var(--green);border-radius:4px;margin:16px 0;font-size:14px;overflow-wrap:anywhere}.notice.attention{background:#fff4dc;border-color:#b28531;color:#694b15}.result-section{scroll-margin-top:25px}.result-heading{display:flex;justify-content:space-between;align-items:start;gap:16px;flex-wrap:wrap}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:20px 0}.stat{padding:17px;background:var(--soft);border-radius:9px;min-width:0}.stat strong{display:block;font-size:22px;line-height:1.3;letter-spacing:-.5px;overflow-wrap:anywhere}.stat span{font-size:12px;line-height:1.4;color:var(--muted)}.layout-image{width:100%;height:auto;max-height:730px;display:block;object-fit:contain;background:#fff;border:1px solid var(--line);border-radius:10px;margin:18px 0}.result-table{width:100%;border-collapse:collapse;font-size:13px;min-width:590px}.result-table caption{text-align:left;font-weight:650;padding:11px;background:var(--soft);font-size:14px}.result-table th,.result-table td{padding:11px 13px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere;max-width:350px}.result-table th{font-size:12px;color:var(--muted);font-weight:650;background:#f6f8f3}.result-table tr:last-child td{border-bottom:0}.details-list{padding-left:21px;font-size:14px;color:var(--muted)}.details-list li{margin:9px 0}details{margin:18px 0;border-top:1px solid var(--line);padding-top:14px}summary{font-weight:650;cursor:pointer;color:var(--green)}.quote-panel{background:#eef3ed}.quote-panel .notice{background:#fffdfa}.brief-copy{white-space:pre-wrap;background:#fffdfa;border:1px solid var(--line);border-radius:9px;padding:18px;font:14px/1.7 system-ui;overflow-wrap:anywhere}.section-heading{margin-bottom:14px}.method{padding:36px 0 46px;max-width:1000px}.method-grid{display:grid;grid-template-columns:230px minmax(0,1fr);gap:16px 36px}.method-grid h3{margin:4px 0;font-size:16px}.method-grid p{margin:0;color:var(--muted);font-size:14px}.tool-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin:7px 0 35px}.tool-card{background:var(--white);border:1px solid var(--line);border-radius:15px;padding:26px;text-decoration:none;display:flex;flex-direction:column;color:var(--ink);transition:transform .15s}.tool-card:hover{transform:translateY(-3px)}.card-number{font-size:13px;font-weight:700;color:var(--green);margin-bottom:35px}.tool-card h2{font-size:27px}.tool-card p{font-size:14px;color:var(--muted);flex:1}.card-link{font-size:14px;font-weight:650;color:var(--green);margin-top:16px;display:flex;justify-content:space-between}.hub-explainer{max-width:880px;margin:0 0 70px}.hub-explainer p{max-width:720px;color:var(--muted)}footer{border-top:1px solid var(--line);padding:25px 0 38px;color:var(--muted);font-size:12px;display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap}footer a{margin-right:15px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}[hidden]{display:none!important}noscript p{padding:20px;background:#fff4dc;border-radius:8px}.example-notice{font-size:13px;margin:14px 0;color:#76511b}
@media(max-width:1000px){.field-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tool-cards{gap:13px}.tool-card{padding:20px}.tool-card h2{font-size:23px}.panel{padding:22px}.container{padding:0 24px}.site-header{padding:20px 24px}.method-grid{grid-template-columns:200px minmax(0,1fr);gap:18px 24px}}
@media(max-width:760px){.site-header{padding:18px}.site-header nav{gap:14px;font-size:12px}.brand{font-size:21px}.brand-mark{width:30px;height:30px;font-size:15px}.container{padding:0 16px}.hero{padding:35px 0 25px}h1{letter-spacing:-1.3px}.lead{font-size:17px}.panel{padding:18px 15px;border-radius:12px}.field-grid{gap:16px}.tool-cards{grid-template-columns:1fr}.tool-card{padding:25px}.card-number{margin-bottom:20px}.method-grid{display:block}.method-grid h3{margin:24px 0 9px}.method-grid p{margin-bottom:15px}.edit-table{min-width:0;display:block}.edit-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.edit-table tbody{display:block}.edit-table tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;padding:14px;border-top:1px solid var(--line)}.edit-table tr:first-child{border-top:0}.edit-table td{display:block;width:auto!important;min-width:0!important;padding:0;border:0}.edit-table td::before{content:attr(data-label);display:block;font-size:11px;font-weight:650;color:var(--muted);margin-bottom:4px}.edit-table .name-cell{grid-column:span 1}.edit-table td:last-child{align-self:end}.edit-table td:last-child::before{display:none}.edit-table input,.edit-table select{min-width:0;width:100%;font-size:14px;padding:9px}.edit-table .remove{padding:6px}.nested{padding:13px}.result-table{font-size:12px}.result-table th,.result-table td{padding:10px}.layout-image{max-height:520px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.stat{padding:14px}.stat strong{font-size:18px}.tool-status{min-height:20px}}
@media(max-width:420px){.field-grid{grid-template-columns:1fr}.site-header nav a:last-child{display:none}.button{padding:11px 14px}.actions .button{flex:1}.quote-panel .button{width:100%}.stats{grid-template-columns:1fr}}
`;

/** Complete HTML; generated client is bundled at build time, never read from disk at runtime. */
export function renderToolPage(kind: ToolPageKind, config: ToolPageConfig): string {
  const parsed = new URL(config.siteUrl);
  if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("Tool pages require an HTTP(S) site URL.");
  const origin = parsed.origin;
  const quoteUrl = new URL("/get-a-quote/", origin).href;
  const title = titles[kind];
  const body = kind === "index" ? hub(quoteUrl) : `<section class="panel" aria-label="${esc(title)} input form">${kind === "insert" ? insertForm() : kind === "consolidate" ? consolidateForm() : artworkForm()}<p id="example-notice" class="example-notice" hidden>Example measurements and allowances are loaded. Replace them with values for your project.</p><p id="tool-status" class="tool-status" role="status" aria-live="polite"></p><div id="tool-error" class="error" role="alert" hidden></div></section><section id="tool-results" class="panel result-section" aria-labelledby="results-heading" tabindex="-1" hidden></section>${quoteSection(quoteUrl)}${method(kind)}`;
  const script = kind === "index" ? "" : `<script>${WEB_CLIENT_SOURCE.replace(/<\/script/gi, "<\\/script")}</script>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Pack Legacy</title><meta name="description" content="${esc(descriptions[kind])}"><meta name="robots" content="${config.indexable === true ? "index, follow" : "noindex, nofollow"}"><link rel="canonical" href="${esc(new URL(paths[kind], origin).href)}"><meta name="theme-color" content="#0d5c4e"><style>${styles}</style></head><body data-page="${kind}" data-quote-url="${esc(quoteUrl)}"><a class="skip" href="#main">Skip to main content</a><header class="site-header"><a class="brand" href="${esc(origin)}" aria-label="Pack Legacy home"><span class="brand-mark" aria-hidden="true">PL</span>Pack Legacy</a><nav aria-label="Main navigation"><a href="${paths.index}">All tools</a><a href="${esc(quoteUrl)}">Get a quote</a></nav></header><main id="main" class="container"><section class="hero">${kind === "index" ? "" : `<a class="breadcrumb" href="${paths.index}">← Packaging tools</a>`}<p class="eyebrow">Plan with Pack Legacy</p><h1>${kind === "index" ? "A clearer path to<br>your next package." : esc(title)}</h1><p class="lead">${esc(descriptions[kind])}</p><div class="chips"><span class="chip">${kind === "artwork" ? "PDF · PNG · JPEG" : "Measured inputs. Reviewable results."}</span><span class="chip">Enquiry quantity is optional</span><span class="chip">One custom box can be shipped</span></div></section><noscript><p>Enable JavaScript to run the interactive tools. You can still read their methods and limits, or use the <a href="${esc(quoteUrl)}">quote form</a> to discuss your project.</p></noscript>${body}<footer><span>Pack Legacy · Preliminary planning, ready for your review.</span><div><a href="${paths.index}">Packaging tools</a><a href="${esc(quoteUrl)}">Quote form</a></div></footer></main>${script}</body></html>`;
}
