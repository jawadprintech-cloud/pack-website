// File access for the local dashboard: path checks, backups and history.
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();
const BACKUPS = path.join(ROOT, ".admin-backups");

export class AdminError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export const hashOf = (s: string | Buffer) => createHash("sha1").update(s).digest("hex");
const remote = () => process.env.NODE_ENV === "production" && process.env.PL_ADMIN === "1";
const remoteConfig = () => {
  const token = process.env.PL_ADMIN_GITHUB_TOKEN;
  if (!token) throw new AdminError("Admin storage is not configured. Add PL_ADMIN_GITHUB_TOKEN in Vercel.", 503);
  return {
    token,
    owner: process.env.PL_ADMIN_GITHUB_OWNER || "jawadprintech-cloud",
    repo: process.env.PL_ADMIN_GITHUB_REPO || "pack-website",
    branch: process.env.PL_ADMIN_GITHUB_BRANCH || "main",
  };
};

type GithubFile = { type?: string; encoding?: string; content?: string; size?: number; sha?: string; download_url?: string };
type GithubTreeItem = { path: string; type: string; sha: string; size?: number };
type GithubCommit = { sha: string; parents?: { sha: string }[]; commit?: { message?: string; author?: { date?: string } } };
const apiRoot = "https://api.github.com";
let treeCache: { key: string; expires: number; files: GithubTreeItem[] } | null = null;

async function github<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const { token, owner, repo } = remoteConfig();
  const response = await fetch(`${apiRoot}/repos/${owner}/${repo}/${endpoint}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({})) as { message?: string };
    const status = response.status === 404 ? 404 : response.status === 409 || response.status === 422 ? 409 : response.status >= 500 ? 502 : 503;
    throw new AdminError(response.status === 404 ? "The repository file was not found" : `GitHub could not save this change${detail.message ? `: ${detail.message}` : "."}`, status);
  }
  return response.json() as Promise<T>;
}

const githubPath = (rel: string) => rel.split("/").map(encodeURIComponent).join("/");
const refQuery = (ref: string) => `?ref=${encodeURIComponent(ref)}`;

async function remoteFile(rel: string, ref?: string): Promise<GithubFile | null> {
  const { branch } = remoteConfig();
  try { return await github<GithubFile>(`contents/${githubPath(rel)}${refQuery(ref || branch)}`); }
  catch (e) { if (e instanceof AdminError && e.status === 404) return null; throw e; }
}

async function remoteBuffer(rel: string, ref?: string): Promise<Buffer> {
  const file = await remoteFile(rel, ref);
  if (!file || file.type !== "file") throw new AdminError("Repository file not found", 404);
  if (file.content && file.encoding === "base64") return Buffer.from(file.content.replace(/\n/g, ""), "base64");
  if (!file.sha) throw new AdminError("GitHub did not return file content", 502);
  const blob = await github<{ content: string; encoding: string }>(`git/blobs/${file.sha}`);
  if (blob.encoding !== "base64") throw new AdminError("GitHub returned an unsupported file format", 502);
  return Buffer.from(blob.content.replace(/\n/g, ""), "base64");
}

async function remoteTree(): Promise<GithubTreeItem[]> {
  const { owner, repo, branch } = remoteConfig();
  const key = `${owner}/${repo}/${branch}`;
  if (treeCache?.key === key && treeCache.expires > Date.now()) return treeCache.files;
  const branchInfo = await github<{ commit: { commit: { tree: { sha: string } } } }>(`branches/${encodeURIComponent(branch)}`);
  const treeSha = branchInfo.commit.commit.tree.sha;
  const tree = await github<{ tree: GithubTreeItem[] }>(`git/trees/${treeSha}?recursive=1`);
  treeCache = { key, expires: Date.now() + 15_000, files: tree.tree.filter((item) => item.type === "blob") };
  return treeCache.files;
}

async function commitFile(rel: string, content: string | Buffer) {
  const { branch } = remoteConfig();
  const previous = await remoteFile(rel, branch);
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
  await github(`contents/${githubPath(rel)}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Pack Legacy admin edit: ${rel}`,
      content: bytes.toString("base64"),
      branch,
      ...(previous?.sha ? { sha: previous.sha } : {}),
    }),
  });
  treeCache = null;
}

export async function deleteFile(rel: string) {
  if (remote()) {
    const { branch } = remoteConfig();
    const previous = await remoteFile(rel, branch);
    if (!previous?.sha) throw new AdminError("File not found", 404);
    await github(`contents/${githubPath(rel)}`, {
      method: "DELETE",
      body: JSON.stringify({ message: `Pack Legacy admin delete: ${rel}`, sha: previous.sha, branch }),
    });
    treeCache = null;
    return;
  }
  await fs.unlink(inside(rel).abs);
}

export const exists = async (abs: string) => {
  if (!remote()) return fs.access(abs).then(() => true, () => false);
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  return !!(await remoteFile(rel));
};

export async function fileStat(abs: string) {
  if (!remote()) {
    const stat = await fs.stat(abs);
    return { size: stat.size, mtimeMs: stat.mtimeMs };
  }
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  const item = (await remoteTree()).find((f) => f.path === rel);
  if (!item) throw new AdminError("File not found", 404);
  return { size: item.size || 0, mtimeMs: 0 };
}

export async function readBinary(abs: string) {
  if (!remote()) return fs.readFile(abs);
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  return remoteBuffer(rel);
}

/** Project-relative path with forward slashes; throws if it is outside the project. */
function inside(rel: string) {
  if (typeof rel !== "string" || rel.includes("\0")) throw new AdminError("Bad path");
  const abs = path.resolve(ROOT, rel);
  const clean = path.relative(ROOT, abs).split(path.sep).join("/");
  if (!clean || clean.startsWith("..") || path.isAbsolute(clean)) throw new AdminError("Path is outside the project");
  return { abs, rel: clean };
}

/** Source files the dashboard may edit. */
export function sourcePath(rel: string) {
  const p = inside(rel);
  const ok = /^(app|components|data)\/.+\.tsx?$/.test(p.rel) || p.rel === "lib/site.ts";
  if (!ok || /(^|\/)admin\//.test(p.rel)) throw new AdminError("This file cannot be edited here");
  return p;
}

/** Files under public/. */
export function mediaPath(rel: string) {
  const p = inside(`public/${rel.replace(/^\/+/, "")}`);
  if (!p.rel.startsWith("public/")) throw new AdminError("Path is outside the media library");
  return p;
}

export const DATA_FILES = {
  products: "data/products.json",
  seo: "data/seo-overrides.json",
  pages: "data/custom-pages.json",
  snippets: "data/snippets.json",
  redirects: "data/redirects.json",
} as const;

function restorable(rel: string) {
  return (Object.values(DATA_FILES) as string[]).includes(rel) || rel.startsWith("public/") ? inside(rel) : sourcePath(rel);
}

/** Copies the current version of a file into .admin-backups/<time>/. */
export async function backup(rel: string) {
  if (remote()) return; // GitHub commits provide the production version history.
  const { abs, rel: clean } = inside(rel);
  if (!(await exists(abs))) return;
  const dest = path.join(BACKUPS, String(Date.now()), clean);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(abs, dest);
}

export async function writeFile(rel: string, content: string | Buffer) {
  const { abs, rel: clean } = inside(rel);
  if (remote()) return commitFile(clean, content);
  await backup(rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  const tmp = `${abs}.${process.pid}.tmp`;
  await fs.writeFile(tmp, content);
  await fs.rename(tmp, abs);
}

export async function readText(rel: string) {
  const clean = inside(rel).rel;
  return remote() ? (await remoteBuffer(clean)).toString("utf8") : fs.readFile(path.join(ROOT, clean), "utf8");
}

export async function walk(dir: string): Promise<string[]> {
  if (remote()) {
    const dirRel = path.relative(ROOT, dir).split(path.sep).join("/").replace(/\/$/, "");
    return (await remoteTree())
      .filter((item) => !dirRel || item.path.startsWith(`${dirRel}/`))
      .map((item) => path.join(ROOT, ...item.path.split("/")));
  }
  const out: string[] = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

export async function history() {
  if (remote()) {
    const { branch } = remoteConfig();
    const commits = await github<GithubCommit[]>(`commits?sha=${encodeURIComponent(branch)}&per_page=100`);
    return commits.flatMap((entry) => {
      const match = /^Pack Legacy admin (?:edit|delete): (.+)$/.exec(entry.commit?.message || "");
      const time = Date.parse(entry.commit?.author?.date || "");
      return match && Number.isFinite(time) ? [{ time, file: match[1] }] : [];
    });
  }
  const files = await walk(BACKUPS);
  return files
    .map((f) => {
      const [time, ...rest] = path.relative(BACKUPS, f).split(path.sep);
      return { time: Number(time), file: rest.join("/") };
    })
    .filter((h) => h.time)
    .sort((a, b) => b.time - a.time)
    .slice(0, 300);
}

export async function restore(time: number, file: string) {
  const target = restorable(file);
  if (remote()) {
    const { branch } = remoteConfig();
    const commits = await github<GithubCommit[]>(`commits?path=${githubPath(target.rel)}&sha=${encodeURIComponent(branch)}&per_page=100`);
    const selected = commits.find((entry) => /^Pack Legacy admin (?:edit|delete):/.test(entry.commit?.message || "") && Date.parse(entry.commit?.author?.date || "") === Number(time));
    if (!selected) throw new AdminError("That version no longer exists", 404);
    const before = selected.parents?.[0]?.sha;
    if (!before) throw new AdminError("That version no longer exists", 404);
    const previous = await remoteFile(target.rel, before);
    if (!previous) return deleteFile(target.rel);
    return writeFile(target.rel, await remoteBuffer(target.rel, before));
  }
  const src = path.join(BACKUPS, String(Number(time)), target.rel);
  if (!(await exists(src))) throw new AdminError("That version no longer exists", 404);
  await writeFile(target.rel, await fs.readFile(src));
}
