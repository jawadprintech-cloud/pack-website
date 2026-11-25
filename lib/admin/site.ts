// What the dashboard manages: pages, SEO, products, posts, media.
import path from "node:path";
import sharp from "sharp";
import type { SeoOverride } from "@/lib/seo";
import * as src from "./source";
import { AdminError, DATA_FILES, ROOT, backup, deleteFile, exists, fileStat, hashOf, mediaPath, readBinary, readText, sourcePath, walk, writeFile } from "./store";

sharp.cache(false); // on Windows a cached file stays locked

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const POSTS = "data/blog-posts.ts", OVERVIEWS = "data/blog-overviews.ts", ARTICLES = "data/blog-articles/index.ts", CATEGORIES = "data/categories.ts";
const POST_CATEGORIES = ["Informative", "Box Types", "Packaging Ideas", "Addons"];
type Json = Record<string, unknown>;

async function readJson<T>(rel: string): Promise<{ data: T; hash: string }> {
  const t = await readText(rel);
  return { data: JSON.parse(t) as T, hash: hashOf(t) };
}
/** Indented by one space, as data/products.json is stored. */
const lines = (a: unknown[]) => JSON.stringify(a, null, 1);
const same = (a: string, b: string) => {
  if (a !== b) throw new AdminError("This was changed somewhere else since you opened it. Reload and try again.", 409);
};

// ---- Pages ---------------------------------------------------------------

export type PageInfo = { path: string; title: string; kind: "page" | "category" | "product" | "post" | "custom" | "tool"; slug: string; file?: string };

async function categoryFields() {
  return src.extract(CATEGORIES, await readText(CATEGORIES)).filter((f) => f.path[0] === "categories");
}
const rawValue = (text: string, slug: string, key: string) => {
  const i = text.indexOf(`slug: "${slug}"`);
  if (i < 0) return "";
  const m = new RegExp(`\\b${key}:\\s*("(?:[^"\\\\]|\\\\.)*")`).exec(text.slice(i));
  return m ? (JSON.parse(m[1]) as string) : "";
};

export async function listPages() {
  const out: (PageInfo & { baseTitle: string; baseDescription: string; image?: string })[] = [];
  for (const abs of await walk(path.join(ROOT, "app"))) {
    const rel = path.relative(ROOT, abs).split(path.sep).join("/");
    if (!rel.endsWith("/page.tsx") || rel.includes("[")) continue;
    const route = rel.slice(3, -"page.tsx".length);
    const text = await readText(rel);
    const cat = /industryMetadata\("([^"]+)"\)/.exec(text)?.[1];
    if (cat) {
      const c = await readText(CATEGORIES);
      out.push({ path: route, kind: "category", slug: cat, title: rawValue(c, cat, "name"), baseTitle: rawValue(c, cat, "metaTitle"), baseDescription: rawValue(c, cat, "metaDescription") });
    } else {
      const m = src.readMetadata(rel, text);
      out.push({ path: route, kind: "page", slug: route, file: rel, title: route === "/" ? "Home" : m.title.split(" | ")[0] || route, baseTitle: m.title, baseDescription: m.description });
    }
  }
  const { data: products } = await readJson<{ slug: string; title: string; metaTitle: string; metaDescription: string; gallery: string[] }[]>(DATA_FILES.products);
  for (const p of products) {
    const route = `/product/${p.slug}/`;
    if (out.some((x) => x.path === route)) continue;
    out.push({ path: route, kind: "product", slug: p.slug, title: p.title, baseTitle: p.metaTitle || `${p.title} | Pack Legacy`, baseDescription: p.metaDescription, image: p.gallery[0] });
  }
  for (const p of await listPosts()) out.push({ path: `/blog/${p.slug}/`, kind: "post", slug: p.slug, title: p.title, baseTitle: `${p.title} | Pack Legacy`, baseDescription: p.excerpt, image: p.image });
  const toolIndex = await readText("data/toolkit/index.ts");
  for (const m of toolIndex.matchAll(/^ {2}"([^"]+)": \{ title: ("(?:[^"\\]|\\.)*"), description: ("(?:[^"\\]|\\.)*")/gm))
    out.push({ path: `/tools/${m[1]}/`, kind: "tool", slug: m[1], title: JSON.parse(m[2]).split(" | ")[0], baseTitle: JSON.parse(m[2]), baseDescription: JSON.parse(m[3]) });
  const { data: custom } = await readJson<{ slug: string; title: string; description: string; image: string }[]>(DATA_FILES.pages);
  for (const p of custom) out.push({ path: `/${p.slug}/`, kind: "custom", slug: p.slug, title: p.title, baseTitle: `${p.title} | Pack Legacy`, baseDescription: p.description, image: p.image });
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

async function listPosts() {
  const text = await readText(POSTS);
  const slugs = [...text.matchAll(/\{ slug: "([^"]+)"/g)].map((m) => m[1]);
  return slugs.map((slug) => {
    const at = text.slice(text.indexOf(`{ slug: "${slug}"`));
    const image = /image: (?:img\()?"([^"]+)"/.exec(at)?.[1] || "";
    return { slug, title: rawValue(text, slug, "title"), excerpt: rawValue(text, slug, "excerpt"), date: rawValue(text, slug, "date"), category: rawValue(text, slug, "category"), image: image.startsWith("/") ? image : `/pages/blog/${image}` };
  });
}

const SHELL = ["components/Header.tsx", "components/Footer.tsx"];
async function resolveImport(from: string, spec: string) {
  const base = spec.startsWith("@/") ? spec.slice(2) : spec.startsWith(".") ? path.posix.join(path.posix.dirname(from), spec) : "";
  if (!/^(components|data)\//.test(base)) return "";
  for (const s of [".tsx", ".ts", "/index.ts", "/index.tsx"]) if (await exists(path.join(ROOT, base + s))) return base + s;
  return "";
}
async function filesOf(entry: string) {
  const skip = new Set([...SHELL, CATEGORIES, POSTS, OVERVIEWS, ARTICLES, "components/info/ArticleBody.tsx"]);
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const f = queue.shift()!;
    if (seen.has(f) || skip.has(f)) continue;
    seen.add(f);
    for (const m of (await readText(f)).matchAll(/from\s+["']([^"']+)["']/g)) {
      const r = await resolveImport(f, m[1]);
      if (r) queue.push(r);
    }
  }
  return [...seen];
}

type Doc = { file: string; hash: string; title: string; note?: string; fields: src.Field[] };
async function doc(file: string, title: string, filter: (f: src.Field) => boolean = () => true, regroup?: (f: src.Field) => string, note?: string): Promise<Doc> {
  const text = await readText(sourcePath(file).rel);
  const fields = src.extract(file, text).filter(filter);
  return { file, hash: hashOf(text), title, note, fields: regroup ? fields.map((f) => ({ ...f, group: regroup(f) })) : fields };
}
const words = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

export async function content(kind: string, slug: string): Promise<Doc[]> {
  if (kind === "category") {
    const layout = await filesOf("components/category/CategoryPage.tsx");
    const docs = [await doc(CATEGORIES, "Page content", (f) => f.path[0] === "categories" && f.path[1] === slug, (f) => words(f.path[2] || "Content"))];
    docs.push(await doc(CATEGORIES, "Default specifications", (f) => f.path[0] === "baseSpecs", undefined, "Used by every category page."));
    for (const f of layout) docs.push(await doc(f, words(path.posix.basename(f).replace(/\.tsx?$/, "")), undefined, undefined, "Shared: changes appear on every page that uses this section."));
    return docs.filter((d) => d.fields.length);
  }
  if (kind === "post") {
    const article = `data/blog-articles/${slug}.ts`;
    const start = (await readText(POSTS)).indexOf(`{ slug: "${slug}"`);
    const text = await readText(POSTS);
    const end = text.indexOf("\n", start);
    const docs = [
      await doc(POSTS, "Post details", (f) => Number(f.id) >= start && Number(f.id) < end, () => "Post details"),
      await doc(OVERVIEWS, "Overview box", (f) => f.path[1] === slug, () => "Overview"),
    ];
    docs[0].fields = docs[0].fields.map((f) => ({ ...f, item: undefined, ...(f.label === "category" ? { options: POST_CATEGORIES } : {}) }));
    if (SLUG.test(slug) && (await exists(path.join(ROOT, article)))) docs.push(await doc(article, "Article", undefined, () => "Article"));
    return docs.filter((d) => d.fields.length);
  }
  if (kind === "page") {
    const page = (await listPages()).find((p) => p.kind === "page" && p.path === slug);
    if (!page?.file) throw new AdminError("Page not found", 404);
    const docs: Doc[] = [];
    for (const f of await filesOf(page.file))
      docs.push(await doc(f, f === page.file ? "Page content" : words(path.posix.basename(f).replace(/\.tsx?$/, "")), undefined, undefined, f === page.file ? undefined : "May be shared: changes appear on every page that uses this section."));
    return docs.filter((d) => d.fields.length);
  }
  if (kind === "tool") {
    if (!SLUG.test(slug)) throw new AdminError("Not found", 404);
    return [await doc(`data/toolkit/${slug}.ts`, "Page content")];
  }
  if (kind === "product-layout") {
    const docs: Doc[] = [];
    for (const f of await filesOf("components/product/ProductPage.tsx")) docs.push(await doc(f, words(path.posix.basename(f).replace(/\.tsx?$/, "")), undefined, undefined, "Appears on every product page."));
    return docs.filter((d) => d.fields.length);
  }
  if (kind === "menus") return Promise.all(SHELL.map((f) => doc(f, path.posix.basename(f, ".tsx"), undefined, undefined, "Appears on every page.")));
  if (kind === "settings") {
    return [
      await doc("lib/site.ts", "Business details", (f) => f.path[0] === "BUSINESS" || f.path[0] === "bUSINESS", () => "Business details", "Used in structured data (Google business info) and llms.txt."),
      await doc("components/info/InfoParts.tsx", "Contact details & shared blocks", undefined, undefined, "Contact details shown on the information pages."),
    ];
  }
  throw new AdminError("Unknown content", 404);
}

export async function saveContent(file: string, hash: string, edits: src.Edit[]) {
  const { rel } = sourcePath(file);
  const text = await readText(rel);
  same(hashOf(text), hash);
  const all = src.extract(rel, text);
  for (const e of edits) {
    const f = all.find((x) => x.id === e.id);
    // Images written as a bare file name live in a fixed folder: put a copy of the chosen image there.
    if (f?.type === "image" && !/^(\/|https?:)/.test(f.value) && e.value.startsWith("/")) e.value = await copyBeside(f.value, e.value);
    if (rel === POSTS && f?.label === "category" && !POST_CATEGORIES.includes(e.value)) throw new AdminError("Unknown blog category");
  }
  await writeFile(rel, src.applyEdits(rel, text, edits));
}
export async function changeItem(file: string, hash: string, start: number, op: "duplicate" | "remove") {
  const { rel } = sourcePath(file);
  const text = await readText(rel);
  same(hashOf(text), hash);
  await writeFile(rel, src.listItem(rel, text, start, op));
}

async function copyBeside(oldName: string, chosen: string) {
  const from = mediaPath(decodeURIComponent(chosen)).abs;
  const want = decodeURIComponent(oldName);
  const dirs = [...new Set((await walk(path.join(ROOT, "public"))).filter((f) => f.split(path.sep).join("/").endsWith("/" + want)).map((f) => f.slice(0, -want.length)))];
  if (!dirs.length) throw new AdminError("Could not find the folder this image belongs to");
  const data = await readBinary(from);
  const name = path.basename(from).replace(/[^\w.-]+/g, "-");
  const final = `${path.parse(name).name}-${hashOf(data).slice(0, 6)}${path.extname(name)}`;
  for (const d of dirs) await writeFile(path.relative(ROOT, path.join(d, final)).split(path.sep).join("/"), data);
  return final;
}

// ---- Records: products and custom pages ------------------------------------

type Rec = Json & { slug: string };
const fileFor = (kind: string) => {
  if (kind === "product") return DATA_FILES.products;
  if (kind === "custom") return DATA_FILES.pages;
  throw new AdminError("Unknown record type");
};
export async function getRecord(kind: string, slug: string) {
  const { data } = await readJson<Rec[]>(fileFor(kind));
  const record = data.find((r) => r.slug === slug);
  if (!record) throw new AdminError("Not found", 404);
  return { record, hash: hashOf(JSON.stringify(record)) };
}
const isList = Array.isArray;
function validate(kind: string, r: Rec) {
  if (!r || !SLUG.test(r.slug || "")) throw new AdminError("The URL slug may only use lowercase letters, numbers and dashes");
  if (!String(r.title || "").trim()) throw new AdminError("Title is required");
  if (kind === "product") {
    for (const k of ["gallery", "intro", "description", "specs", "faqs", "related"]) if (!isList(r[k])) throw new AdminError(`${k} must be a list`);
    for (const k of ["metaTitle", "metaDescription", "category"]) if (typeof r[k] !== "string") throw new AdminError(`${k} must be text`);
    if (r.updated !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(r.updated))) throw new AdminError("Updated must be a date like 2026-11-25");
  } else if (!isList(r.blocks)) throw new AdminError("blocks must be a list");
}
export async function saveRecord(kind: string, slug: string, hash: string, record: Rec) {
  validate(kind, record);
  const { data } = await readJson<Rec[]>(fileFor(kind));
  const i = data.findIndex((r) => r.slug === slug);
  if (i < 0) throw new AdminError("Not found", 404);
  same(hashOf(JSON.stringify(data[i])), hash);
  if (record.slug !== slug) await freeSlug(kind, record.slug);
  data[i] = record;
  await writeFile(fileFor(kind), lines(data));
}
async function freeSlug(kind: string, slug: string) {
  const route = kind === "product" ? `/product/${slug}/` : kind === "post" ? `/blog/${slug}/` : `/${slug}/`;
  const taken = (await listPages()).some((p) => p.path === route) || (kind === "product" && (await readJson<Rec[]>(DATA_FILES.products)).data.some((r) => r.slug === slug));
  if (taken || (kind === "custom" && (/^(admin|api|mcp|tools|health|product)$/.test(slug) || (await exists(path.join(ROOT, "public", slug)))))) throw new AdminError("That URL is already used");
}
export async function create(kind: string, title: string, slug: string, copyFrom?: string) {
  if (!title?.trim()) throw new AdminError("Title is required");
  if (!SLUG.test(slug || "")) throw new AdminError("The URL slug may only use lowercase letters, numbers and dashes");
  await freeSlug(kind, slug);
  const today = new Date().toISOString().slice(0, 10);
  if (kind === "post") {
    const article = `data/blog-articles/${slug}.ts`;
    if (await exists(path.join(ROOT, article))) throw new AdminError("An article file with that name already exists");
    const key = JSON.stringify(slug);
    const index = await readText(ARTICLES);
    const id = "p_" + slug.replace(/-/g, "_");
    const name = /export const articles/.test(index) ? "articles" : "";
    if (!name) throw new AdminError("The article list could not be read");
    const nextIndex = src.insertFirst(ARTICLES, index, name, `${key}: ${id}`).replace(/(import type \{ Article \}[^\n]*\n)/, `$1import ${id} from ${JSON.stringify("./" + slug)};\n`);
    const nextPosts = src.insertFirst(POSTS, await readText(POSTS), "blogPosts",
      `{ slug: ${key}, title: ${JSON.stringify(title)}, date: "${today}", category: "Informative", image: "/pages/blog/Feature.webp", excerpt: "Write a short summary here." }`);
    const nextOver = src.insertFirst(OVERVIEWS, await readText(OVERVIEWS), "blogOverviews", `${key}: "Write the overview here."`);
    await writeFile(article, `import type { Article } from "./types";\n\nconst article: Article = [\n  { p: "Write your introduction here." },\n  { h2: "First heading" },\n  { p: "Write a paragraph here." },\n  { ul: ["First point", "Second point"] },\n  { img: { src: "/pages/blog/Feature.webp", alt: "Describe the image", width: 780, height: 520 } },\n  { tip: "Write a tip here." },\n];\n\nexport default article;\n`);
    await writeFile(ARTICLES, nextIndex);
    await writeFile(OVERVIEWS, nextOver);
    await writeFile(POSTS, nextPosts);
    return;
  }
  const { data } = await readJson<Rec[]>(fileFor(kind));
  let rec: Rec;
  if (kind === "product") {
    const base = data.find((r) => r.slug === copyFrom);
    rec = base
      ? { ...structuredClone(base), slug, title, metaTitle: `${title} | Pack Legacy`, updated: today }
      : { slug, title, metaTitle: `${title} | Pack Legacy`, metaDescription: "", category: "Folding Cartons", gallery: (data[0].gallery as string[]).slice(0, 1), hero: { body: ["Write the introduction here."], cta: "Request a free quote." }, takeaway: "", updated: today, intro: ["Write the introduction here."], whatYouGet: [], whyUs: [], quickFaqs: [], description: [{ t: "h2", html: title }, { t: "p", html: "Write the description here." }], specs: [["Dimensions", "All custom sizes & shapes"]], faqs: [], related: [] };
  } else rec = { slug, title, description: "", image: "", lead: "Write a short introduction here.", blocks: [{ h2: "First heading" }, { p: "Write a paragraph here." }] };
  data.push(rec);
  await writeFile(fileFor(kind), lines(data));
}
export async function remove(kind: string, slug: string) {
  if (kind === "post") {
    const posts = await readText(POSTS);
    const next = src.removeEntry(POSTS, posts, "blogPosts", slug);
    if (next === posts) throw new AdminError("Not found", 404);
    await writeFile(POSTS, next);
    const over = await readText(OVERVIEWS);
    const nextOver = src.removeEntry(OVERVIEWS, over, "blogOverviews", slug);
    if (nextOver !== over) await writeFile(OVERVIEWS, nextOver);
    return; // the article file stays on disk, so restoring the post list brings the post back
  }
  const { data } = await readJson<Rec[]>(fileFor(kind));
  const next = data.filter((r) => r.slug !== slug);
  if (next.length === data.length) throw new AdminError("Not found", 404);
  await writeFile(fileFor(kind), lines(next));
}

// ---- SEO and redirects -----------------------------------------------------

export async function seoList() {
  const { data } = await readJson<Record<string, SeoOverride>>(DATA_FILES.seo);
  return (await listPages()).map((p) => ({ ...p, seo: data[p.path] || {} }));
}
export async function saveSeo(route: string, o: SeoOverride) {
  if (!(await listPages()).some((p) => p.path === route)) throw new AdminError("Page not found", 404);
  const { data } = await readJson<Record<string, SeoOverride>>(DATA_FILES.seo);
  const clean: Json = {};
  for (const k of ["title", "description", "keywords", "canonical", "ogTitle", "ogDescription", "ogImage"] as const) if (typeof o[k] === "string" && o[k]!.trim()) clean[k] = o[k]!.trim();
  if (clean.canonical && !/^(\/|https:\/\/)/.test(clean.canonical as string)) throw new AdminError("The canonical URL must start with / or https://");
  if (o.noindex) clean.noindex = true;
  if (Object.keys(clean).length) data[route] = clean;
  else delete data[route];
  await writeFile(DATA_FILES.seo, JSON.stringify(data, null, 2) + "\n");
}
type Redirect = { source: string; destination: string; permanent: boolean };
export const getRedirects = async () => (await readJson<Redirect[]>(DATA_FILES.redirects)).data;
export async function saveRedirects(list: Redirect[]) {
  if (!isList(list)) throw new AdminError("Bad list");
  const seen = new Set<string>();
  const clean = list.map((r) => {
    if (!/^\/[\w\-./%]+$/.test(r.source || "")) throw new AdminError(`"${r.source}" is not a valid old address (start with /)`);
    if (!/^(\/|https?:\/\/)[^\s:*]*[^\s]*$/.test(r.destination || "")) throw new AdminError(`"${r.destination}" is not a valid new address`);
    if (r.source === r.destination || seen.has(r.source)) throw new AdminError(`"${r.source}" is listed twice or redirects to itself`);
    seen.add(r.source);
    return { source: r.source, destination: r.destination, permanent: !!r.permanent };
  });
  await writeFile(DATA_FILES.redirects, JSON.stringify(clean, null, 2) + "\n");
}

// ---- Media -----------------------------------------------------------------

const MEDIA = /\.(webp|png|jpe?g|gif|svg|avif|pdf|mp4|webm)$/i;
const toUrl = (rel: string) => "/" + rel.split("/").map(encodeURIComponent).join("/");

export async function listMedia() {
  const pub = path.join(ROOT, "public");
  const files = (await walk(pub)).filter((f) => MEDIA.test(f));
  return Promise.all(
    files.map(async (f) => {
      const rel = path.relative(pub, f).split(path.sep).join("/");
      const st = await fileStat(f);
      return { rel, url: toUrl(rel), name: path.basename(f), size: st.size, time: st.mtimeMs };
    })
  ).then((l) => l.sort((a, b) => b.time - a.time));
}
export async function mediaInfo(rel: string) {
  const { abs } = mediaPath(rel);
  if (!(await exists(abs))) throw new AdminError("Not found", 404);
  const meta = /\.(webp|png|jpe?g|gif|avif|svg)$/i.test(rel) ? await sharp(await readBinary(abs)).metadata().catch(() => null) : null;
  const name = path.basename(rel);
  const keys = [name, encodeURIComponent(name)];
  const used: string[] = [];
  for (const dir of ["app", "components", "data", "lib", "styles"])
    for (const f of await walk(path.join(ROOT, dir))) {
      if (!/\.(tsx?|json|css)$/.test(f)) continue;
      const t = await readText(path.relative(ROOT, f).split(path.sep).join("/"));
      if (keys.some((k) => t.includes(k))) used.push(path.relative(ROOT, f).split(path.sep).join("/"));
    }
  return { width: meta?.width, height: meta?.height, used };
}
export async function upload(file: File, folder: string, replace: string, toWebp: boolean) {
  if (file.size > 25 * 1024 * 1024) throw new AdminError("Files can be up to 25 MB");
  if (!MEDIA.test(file.name)) throw new AdminError("This file type is not supported");
  let data: Buffer = Buffer.from(await file.arrayBuffer());
  let ext = path.extname(file.name).toLowerCase();
  const raster = /^\.(webp|png|jpe?g|avif)$/;
  try {
    if (replace) {
      // Keep the address: convert to the old file's format.
      const target = mediaPath(replace);
      if (!(await exists(target.abs))) throw new AdminError("The file to replace no longer exists", 404);
      const want = path.extname(replace).toLowerCase();
      if (want !== ext) {
        if (!raster.test(want) || !raster.test(ext)) throw new AdminError(`Choose a ${want} file to replace this one`);
        data = await sharp(data).rotate().toFormat(want.slice(1).replace("jpg", "jpeg") as "webp").toBuffer();
      }
      await writeFile(target.rel, data);
      return toUrl(replace);
    }
    if (toWebp && /^\.(png|jpe?g)$/.test(ext)) {
      data = await sharp(data).rotate().webp({ quality: 85 }).toBuffer();
      ext = ".webp";
    }
  } catch (e) {
    if (e instanceof AdminError) throw e;
    throw new AdminError("That image could not be read");
  }
  const base = path.parse(file.name).name.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
  const dir = (folder || "uploads").replace(/^\/+|\/+$/g, "");
  for (let i = 0; ; i++) {
    const rel = `${dir}/${base}${i ? `-${i}` : ""}${ext}`;
    const target = mediaPath(rel);
    if (await exists(target.abs)) continue;
    await writeFile(target.rel, data);
    return toUrl(rel);
  }
}
export async function deleteMedia(rel: string) {
  const { abs, rel: clean } = mediaPath(rel);
  if (!MEDIA.test(clean)) throw new AdminError("This file cannot be deleted here");
  const { used } = await mediaInfo(rel);
  if (used.length) throw new AdminError("This file is still used in: " + used.slice(0, 5).join(", "));
  await backup(clean);
  await deleteFile(clean);
}
