// Finds the editable text, links and images in a .ts/.tsx file and writes changes back in place.
import { parseFragment } from "parse5";
import ts from "typescript";
import { AdminError } from "./store";

export type Field = {
  id: string;
  label: string;
  type: "text" | "image" | "link";
  value: string;
  group: string;
  path: string[];
  options?: string[];
  /** The list item this field belongs to (can be duplicated or removed). */
  item?: { start: number; end: number; index: number; count: number };
};
type Mode = "jsx" | "attr" | "string" | "html" | "tpl";
type Internal = Field & { mode: Mode; start: number; end: number; inner?: [number, number]; htmlAttr?: boolean };
export type Edit = { id: string; value: string };

const IMAGE = /\.(webp|png|jpe?g|gif|svg|avif)(\?.*)?$/i;
const LINK = /^(https?:\/\/|\/|#|mailto:|tel:)\S*$/;
const SVG_PATH = /^[MmLlHhVvCcSsQqTtAaZzEe0-9\s.,-]+$/;
const SKIP_ATTR =
  /^(className|class|id|style|d|viewBox|key|type|role|rel|target|fill|stroke.*|xmlns|points|name|htmlFor|method|action|loading|decoding|fetchPriority|sizes|crossOrigin|inputMode|autoComplete|lang|as|preserveAspectRatio|transform|textAnchor|font.*|data-.*|aria-(hidden|labelledby|describedby|controls|expanded|pressed|live|current|selected|haspopup|modal|atomic|orientation|busy))$/;
const SKIP_PROP = /^(slug|id|key|className|cls|class|icon|type|variant|color|colour|bg|accent|calc|kind|date|d|path|style|tone|theme|width|height|robots|canonical|url|credentials|method)$/;
const SECTION_TAG = /^(section|header|footer|aside|article|nav|form)$/;
const TAGS: Record<string, string> = {
  h1: "Main heading (H1)", h2: "Heading (H2)", h3: "Heading (H3)", h4: "Heading (H4)", p: "Paragraph", a: "Link text", button: "Button text",
  li: "List item", em: "Highlighted text", strong: "Bold text", small: "Small text", label: "Form label", option: "Option", td: "Table cell", th: "Table heading", summary: "Question",
};
const ATTRS: Record<string, string> = { src: "Image", alt: "Image alt text", href: "Link address", "aria-label": "Accessible label", title: "Title", placeholder: "Placeholder", content: "Content" };

const collapse = (s: string) => s.replace(/[ \t\r\n]+/g, " ").trim();
type Node5 = { nodeName: string; tagName?: string; value?: string; childNodes?: Node5[]; attrs?: { name: string; value: string }[]; sourceCodeLocation?: { startOffset: number; endOffset: number; attrs?: Record<string, { startOffset: number; endOffset: number }> } };
const decode = (s: string) => {
  const walk = (n: Node5): string => (n.nodeName === "#text" ? n.value || "" : (n.childNodes || []).map(walk).join(""));
  return walk(parseFragment(s.replace(/</g, "&lt;")) as unknown as Node5);
};
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const kindOf = (v: string): Field["type"] => (IMAGE.test(v) && !/\s\S+\s/.test(v) ? "image" : LINK.test(v) ? "link" : "text");
const human = (v: string) =>
  kindOf(v) !== "text" || (/[A-Za-z]/.test(v) && !(SVG_PATH.test(v) && /\d/.test(v)) && (/\S\s+\S/.test(v) || /^[A-Z]/.test(v)));

const parse = (file: string, text: string) =>
  ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
const syntaxErrors = (file: string, text: string) =>
  ts.transpileModule(text, { fileName: file, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2022 } }).diagnostics || [];

const tagOf = (n: ts.Node): string => {
  if (ts.isJsxElement(n)) return n.openingElement.tagName.getText();
  if (ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n)) return n.tagName.getText();
  return "";
};
const propName = (n: ts.PropertyName) => (ts.isStringLiteral(n) || ts.isIdentifier(n) || ts.isNumericLiteral(n) ? n.text : n.getText());

function headingOf(n: ts.Node): string {
  let found = "";
  const visit = (c: ts.Node) => {
    if (found) return;
    if (ts.isJsxElement(c) && /^h[1-4]$/.test(tagOf(c))) {
      const bits: string[] = [];
      const t = (x: ts.Node) => { if (ts.isJsxText(x)) bits.push(decode(x.text)); ts.forEachChild(x, t); };
      t(c);
      found = collapse(bits.join(" "));
      return;
    }
    ts.forEachChild(c, visit);
  };
  visit(n);
  return found;
}

/** Names the part of the page a node belongs to, plus its position in the data ("faqs › 2 › q"). */
function place(node: ts.Node) {
  const path: string[] = [];
  let section = "", owner = "", item: Field["item"];
  for (let n = node, p = node.parent; p; n = p, p = p.parent) {
    if (ts.isPropertyAssignment(p) && p.initializer === n) path.unshift(propName(p.name));
    if (ts.isArrayLiteralExpression(p)) {
      const i = p.elements.indexOf(n as ts.Expression);
      path.unshift(String(i + 1));
      // A list of strings inside another list is a row/pair, so the outer list is the one that can grow.
      const isTuple = ts.isArrayLiteralExpression(p.parent) && !ts.isObjectLiteralExpression(n);
      if (!item && !isTuple) item = { start: n.getStart(), end: n.getEnd(), index: i, count: p.elements.length };
    }
    if (!section && ts.isJsxElement(p) && SECTION_TAG.test(tagOf(p))) {
      const label = p.openingElement.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText() === "aria-label") as ts.JsxAttribute | undefined;
      section = headingOf(p) || (label?.initializer && ts.isStringLiteral(label.initializer) ? decode(label.initializer.text) : "");
    }
    if (ts.isFunctionDeclaration(p) && p.name) owner = p.name.text;
    if (ts.isVariableDeclaration(p) && ts.isIdentifier(p.name)) owner = p.name.text;
  }
  const nice = owner.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
  return { path: [owner, ...path], group: section || nice || "Content", item };
}

function htmlFields(node: ts.Node, html: string, mode: "html" | "tpl", base: Pick<Field, "group" | "path" | "item">): Internal[] {
  const out: Internal[] = [];
  let group = base.group;
  const add = (label: string, value: string, inner: [number, number], type: Field["type"], htmlAttr: boolean) =>
    out.push({ ...base, item: undefined, group, id: `${node.getStart()}:${inner[0]}`, label, value, type, mode, start: node.getStart(), end: node.getEnd(), inner, htmlAttr });
  const text = (n: Node5): string => (n.nodeName === "#text" ? n.value || "" : (n.childNodes || []).map(text).join(""));
  const visit = (n: Node5, parent: string) => {
    if (n.tagName && /^(script|style|svg)$/.test(n.tagName)) return;
    if (n.tagName && /^h[1-3]$/.test(n.tagName)) group = collapse(text(n)).replace(/[]+/g, "") || group;
    const loc = n.sourceCodeLocation;
    if (n.nodeName === "#text" && loc) {
      const raw = html.slice(loc.startOffset, loc.endOffset);
      const lead = raw.length - raw.trimStart().length;
      const body = raw.trim();
      if (body && /[A-Za-z0-9]/.test(body) && !/[\\<]/.test(body)) add(TAGS[parent] || "Text", decode(body), [loc.startOffset + lead, loc.startOffset + lead + body.length], "text", false);
    }
    for (const a of n.attrs || []) {
      const al = loc?.attrs?.[a.name];
      if (!al || !/^(src|alt|href|aria-label|placeholder|title)$/.test(a.name) || !a.value.trim()) continue;
      const raw = html.slice(al.startOffset, al.endOffset);
      const m = /^([^=]+=\s*)(["'])([\s\S]*)\2$/.exec(raw);
      if (!m || /[\\]/.test(m[3])) continue;
      const s = al.startOffset + m[1].length + 1;
      add(ATTRS[a.name], a.value, [s, s + m[3].length], a.name === "src" ? "image" : a.name === "href" ? "link" : "text", true);
    }
    for (const c of n.childNodes || []) visit(c, n.tagName || parent);
  };
  visit(parseFragment(html, { sourceCodeLocationInfo: true }) as unknown as Node5, "");
  return out;
}

const isMarkup = (s: string) => s.length > 300 && (s.match(/<\/?[a-z][^>]*>/gi) || []).length > 5;

function collect(file: string, text: string): Internal[] {
  const sf = parse(file, text);
  const out: Internal[] = [];
  const push = (n: ts.Node, mode: Mode, label: string, value: string, start = n.getStart(), end = n.getEnd(), type = kindOf(value)) =>
    out.push({ ...place(n), id: String(start), label, value, type, mode, start, end });

  const literal = (n: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral) => {
    const v = n.text;
    const p = n.parent;
    if (isMarkup(v) && !ts.isJsxAttribute(p)) {
      if (ts.isStringLiteral(n)) out.push(...htmlFields(n, v, "html", place(n)));
      else out.push(...htmlFields(n, n.getText().slice(1, -1), "tpl", place(n)));
      return;
    }
    if (!v.trim()) {
      if (ts.isJsxExpression(p) && !ts.isJsxAttribute(p.parent) && ts.isJsxElement(p.parent)) push(n, "string", TAGS[tagOf(p.parent)] || "Text (empty)", v);
      return;
    }
    if (ts.isJsxAttribute(p)) {
      const name = p.name.getText();
      if (SKIP_ATTR.test(name) || name === "value" || !(name in ATTRS || human(v))) return;
      const onDom = /^[a-z]/.test(p.parent.parent.getText().replace(/^</, ""));
      if (onDom && !(name in ATTRS)) return;
      push(n, "attr", ATTRS[name] || name, decode(v), undefined, undefined, name === "alt" ? "text" : kindOf(v));
      return;
    }
    // Climb through wrappers that only choose or group the value.
    let c: ts.Node = n, q: ts.Node = p;
    while (ts.isParenthesizedExpression(q) || ts.isAsExpression(q) || (ts.isConditionalExpression(q) && q.condition !== c) ||
      (ts.isBinaryExpression(q) && (q.operatorToken.kind === ts.SyntaxKind.PlusToken || ((q.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken || q.operatorToken.kind === ts.SyntaxKind.BarBarToken) && q.right === c)))) {
      c = q; q = q.parent;
    }
    if (ts.isPropertyAssignment(q) && q.initializer === c) {
      const name = propName(q.name);
      if (SKIP_PROP.test(name)) return;
      if (!human(v) && !/^(q|a|p|h2|h3|h4|tip|title|text|label|name|alt|desc|description)$/.test(name)) return;
      push(n, "string", ATTRS[name] || name.replace(/([a-z])([A-Z])/g, "$1 $2"), v);
      return;
    }
    if (ts.isArrayLiteralExpression(q)) { if (human(v)) push(n, "string", kindOf(v) === "image" ? "Image" : "Text", v); return; }
    if (ts.isJsxExpression(q)) {
      const attr = ts.isJsxAttribute(q.parent) ? q.parent.name.getText() : "";
      if (attr && (SKIP_ATTR.test(attr) || attr === "value")) return;
      if (human(v) || (!attr && /[A-Za-z]/.test(v))) push(n, "string", ATTRS[attr] || attr || "Text", v);
      return;
    }
    if (ts.isVariableDeclaration(q) && q.initializer === c) {
      if (/^(PATH|.*_PATH|API.*|ENDPOINT.*)$/.test(q.name.getText())) return;
      if (human(v) && (/\s/.test(v) || kindOf(v) !== "link")) push(n, "string", q.name.getText().replace(/_/g, " ").toLowerCase(), v);
      return;
    }
    // e.g. img("photo.webp") in the blog list
    if (ts.isCallExpression(q) && kindOf(v) === "image") push(n, "string", "Image", v);
  };

  const visit = (n: ts.Node) => {
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n) || ts.isTypeNode(n) || ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n) || ts.isTaggedTemplateExpression(n)) return;
    if (ts.isExpressionStatement(n) && ts.isStringLiteral(n.expression)) return;
    if (ts.isJsxAttribute(n) && /^(style|className)$/.test(n.name.getText())) return;
    if (ts.isVariableDeclaration(n) && n.name.getText() === "metadata") return; // edited on the SEO screen
    if (ts.isFunctionDeclaration(n) && n.name?.text === "generateMetadata") return;
    if (ts.isJsxText(n)) {
      const raw = text.slice(n.pos, n.end);
      const body = raw.trim();
      if (body && /[\p{L}\p{N}]/u.test(decode(body))) {
        const s = n.pos + raw.indexOf(body);
        push(n, "jsx", TAGS[tagOf(n.parent)] || "Text", collapse(decode(body)), s, s + body.length, "text");
      }
      return;
    }
    if (ts.isTemplateExpression(n)) {
      const raw = n.getText().slice(1, -1);
      if (isMarkup(raw)) {
        let masked = raw;
        const base = n.getStart() + 1;
        for (const span of n.templateSpans) {
          const s = span.expression.getFullStart() - 2 - base, e = span.literal.getStart() + 1 - base;
          masked = masked.slice(0, s) + "".repeat(e - s) + masked.slice(e);
        }
        out.push(...htmlFields(n, masked, "tpl", place(n)));
        return;
      }
    }
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) { literal(n); return; }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

export function extract(file: string, text: string): Field[] {
  return collect(file, text).map(({ mode: _m, start: _s, end: _e, inner: _i, htmlAttr: _h, ...f }) => f);
}

const encodeHtml = (f: Internal, v: string) => {
  // Line breaks inside text are kept: some headings use them (white-space: pre-line).
  return f.htmlAttr ? esc(v.replace(/\s*[\r\n]+\s*/g, " ")).replace(/"/g, "&quot;").replace(/'/g, "&#39;") : esc(v.replace(/\r\n/g, "\n"));
};

export function applyEdits(file: string, text: string, edits: Edit[]): string {
  const fields = new Map(collect(file, text).map((f) => [f.id, f]));
  const patches: { start: number; end: number; text: string }[] = [];
  const literals = new Map<number, { f: Internal; edits: { f: Internal; value: string }[] }>();
  for (const { id, value } of edits) {
    const f = fields.get(id);
    if (!f || typeof value !== "string") throw new AdminError("The file changed. Reload and try again.", 409);
    if (f.mode === "html") {
      const g = literals.get(f.start) || { f, edits: [] };
      g.edits.push({ f, value });
      literals.set(f.start, g);
    } else if (f.mode === "tpl") {
      const v = encodeHtml(f, value).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
      patches.push({ start: f.start + 1 + f.inner![0], end: f.start + 1 + f.inner![1], text: v });
    } else if (f.mode === "jsx") {
      const v = value.trim().replace(/\s*[\r\n]+\s*/g, " ");
      patches.push({ start: f.start, end: f.end, text: v ? esc(v).replace(/\{/g, "&#123;").replace(/\}/g, "&#125;") : '{""}' });
    } else if (f.mode === "attr") {
      patches.push({ start: f.start, end: f.end, text: `"${value.replace(/[\r\n]+/g, " ").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"` });
    } else patches.push({ start: f.start, end: f.end, text: JSON.stringify(value) });
  }
  if (literals.size) {
    const find = (n: ts.Node, start: number): string | undefined =>
      ts.isStringLiteral(n) && n.getStart() === start ? n.text : ts.forEachChild(n, (c) => find(c, start));
    const sf = parse(file, text);
    for (const [start, g] of literals) {
      let html = find(sf, start);
      if (html === undefined) throw new AdminError("Could not find that text", 409);
      for (const e of g.edits.sort((a, b) => b.f.inner![0] - a.f.inner![0])) html = html.slice(0, e.f.inner![0]) + encodeHtml(e.f, e.value) + html.slice(e.f.inner![1]);
      patches.push({ start, end: g.f.end, text: JSON.stringify(html) });
    }
  }
  return check(file, splice(text, patches));
}

function splice(text: string, patches: { start: number; end: number; text: string }[]) {
  for (const p of patches.sort((a, b) => b.start - a.start)) text = text.slice(0, p.start) + p.text + text.slice(p.end);
  return text;
}
function check(file: string, text: string) {
  const errors = syntaxErrors(file, text);
  if (errors.length) throw new AdminError("That change would break the page: " + ts.flattenDiagnosticMessageText(errors[0].messageText, " "));
  return text;
}

/** Duplicates or removes one item of a list (FAQ, card, paragraph…). */
export function listItem(file: string, text: string, start: number, op: "duplicate" | "remove"): string {
  const item = collect(file, text).find((f) => f.item?.start === start)?.item;
  if (!item) throw new AdminError("The file changed. Reload and try again.", 409);
  if (op === "duplicate") return check(file, text.slice(0, item.end) + ", " + text.slice(item.start, item.end) + text.slice(item.end));
  if (item.count < 2) throw new AdminError("A list needs at least one item");
  let s = item.start, e = item.end;
  const after = /^\s*,[ \t]*\r?\n?/.exec(text.slice(e));
  if (after) e += after[0].length;
  else s -= /,?\s*$/.exec(text.slice(0, s))![0].length;
  if (after && after[0].endsWith("\n")) s -= /[ \t]*$/.exec(text.slice(0, s))![0].length;
  return check(file, text.slice(0, s) + text.slice(e));
}

// ---- Blog helpers -------------------------------------------------------

function topLevel(sf: ts.SourceFile, name: string) {
  let found: ts.Expression | undefined;
  sf.forEachChild((s) => {
    if (ts.isVariableStatement(s)) for (const d of s.declarationList.declarations) if (d.name.getText() === name) found = d.initializer;
  });
  if (!found) throw new AdminError(`Could not find ${name}`);
  return found;
}

/** Adds code as the first entry of a top-level array or object. */
export function insertFirst(file: string, text: string, name: string, code: string) {
  const n = topLevel(parse(file, text), name);
  return check(file, text.slice(0, n.getStart() + 1) + `\n  ${code},` + text.slice(n.getStart() + 1));
}

/** Removes the array object whose slug matches, or the object property with that key. */
export function removeEntry(file: string, text: string, name: string, slug: string) {
  const n = topLevel(parse(file, text), name);
  let target: ts.Node | undefined;
  if (ts.isArrayLiteralExpression(n))
    target = n.elements.find((e) => ts.isObjectLiteralExpression(e) && e.properties.some((p) => ts.isPropertyAssignment(p) && propName(p.name) === "slug" && ts.isStringLiteral(p.initializer) && p.initializer.text === slug));
  else if (ts.isObjectLiteralExpression(n)) target = n.properties.find((p) => p.name && propName(p.name) === slug);
  if (!target) return text;
  const tail = /^\s*,[ \t]*\r?\n?/.exec(text.slice(target.getEnd()))?.[0] || "";
  return check(file, text.slice(0, target.getStart()) + text.slice(target.getEnd() + tail.length));
}

/** Plain values of `title`/`description` in a page's `export const metadata`. */
export function readMetadata(file: string, text: string) {
  const sf = parse(file, text);
  const consts = new Map<string, string>();
  const r: Record<string, string> = {};
  const visit = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && n.initializer) {
      if (ts.isStringLiteralLike(n.initializer)) consts.set(n.name.getText(), n.initializer.text);
      if (n.name.getText() === "metadata") {
        const obj = ts.isCallExpression(n.initializer) ? n.initializer.arguments[1] : n.initializer;
        if (obj && ts.isObjectLiteralExpression(obj))
          for (const p of obj.properties)
            if (ts.isPropertyAssignment(p)) r[propName(p.name)] = ts.isStringLiteralLike(p.initializer) ? p.initializer.text : consts.get(p.initializer.getText()) || "";
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { title: r.title || "", description: r.description || "" };
}
