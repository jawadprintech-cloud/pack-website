// Dashboard API. Local mode is localhost-only; production mode uses signed admin sessions and GitHub-backed storage.
import { getSnippets, saveSnippets } from "@/lib/admin/snippets";
import * as auth from "@/lib/admin/auth";
import * as site from "@/lib/admin/site";
import { AdminError, history, restore } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

function guard(req: Request) {
  if (process.env.PL_ADMIN !== "1") throw new AdminError("Not found", 404);
  const host = req.headers.get("host") || "";
  const origin = req.headers.get("origin");
  const local = process.env.NODE_ENV !== "production";
  if (local && !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) throw new AdminError("Open the dashboard on this computer (localhost)", 403);
  if (!origin || origin !== new URL(req.url).origin || req.headers.get("x-pl-admin") !== "1") throw new AdminError("Forbidden", 403);
}

// Saves run one at a time, so two quick saves cannot overwrite each other.
let queue: Promise<unknown> = Promise.resolve();
const inTurn = <T>(fn: () => Promise<T>): Promise<T> => {
  const p = queue.then(fn, fn);
  queue = p.catch(() => undefined);
  return p;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const actions: Record<string, (b: any) => Promise<unknown>> = {
  overview: async () => ({ pages: await site.seoList(), media: (await site.listMedia()).length, history: (await history()).slice(0, 8) }),
  pages: () => site.seoList(),
  content: (b) => site.content(b.kind, b.slug),
  saveContent: (b) => site.saveContent(b.file, b.hash, b.edits),
  item: (b) => site.changeItem(b.file, b.hash, b.start, b.op === "remove" ? "remove" : "duplicate"),
  record: (b) => site.getRecord(b.kind, b.slug),
  saveRecord: (b) => site.saveRecord(b.kind, b.slug, b.hash, b.record),
  create: (b) => site.create(b.kind, b.title, b.slug, b.copyFrom),
  remove: (b) => site.remove(b.kind, b.slug),
  saveSeo: (b) => site.saveSeo(b.path, b.seo),
  redirects: () => site.getRedirects(),
  saveRedirects: (b) => site.saveRedirects(b.list),
  snippets: () => getSnippets(),
  saveSnippets: (b) => saveSnippets(b.list, b.hash),
  media: () => site.listMedia(),
  mediaInfo: (b) => site.mediaInfo(b.rel),
  deleteMedia: (b) => site.deleteMedia(b.rel),
  history: () => history(),
  restore: (b) => restore(b.time, b.file),
};

/** Log-in actions; each returns the session cookie to set. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function authAction(req: Request, b: any): Promise<string | null> {
  if (b.action === "setup") return auth.setup(b.username, b.password);
  if (b.action === "login") return auth.login(b.username, b.password, b.remember === true);
  if (b.action === "logout" || b.action === "changePassword") {
    if (!(await auth.currentUser(req))) throw new AdminError("Please log in", 401);
    return b.action === "logout" ? auth.logout(req, b.everywhere === true) : auth.changePassword(b.current, b.next);
  }
  return null;
}

export async function POST(req: Request) {
  try {
    guard(req);
    let result: unknown;
    const multipart = (req.headers.get("content-type") || "").startsWith("multipart/form-data");
    const body = multipart ? null : await req.json();
    if (body?.action === "session") return Response.json({ ok: true, result: await auth.status(req) });
    if (body) {
      const cookie = await inTurn(() => authAction(req, body));
      if (cookie !== null) return Response.json({ ok: true, result: null }, { headers: { "Set-Cookie": cookie, "Cache-Control": "no-store" } });
    }
    if (!(await auth.currentUser(req))) throw new AdminError("Please log in", 401);
    if (multipart) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) throw new AdminError("No file was sent");
      result = await inTurn(() => site.upload(file, String(form.get("folder") || ""), String(form.get("replace") || ""), form.get("webp") === "1"));
    } else {
      if (!Object.hasOwn(actions, body.action)) throw new AdminError("Unknown action");
      result = await inTurn(() => actions[body.action](body));
    }
    return Response.json({ ok: true, result: result ?? null });
  } catch (e) {
    if (e instanceof AdminError) return Response.json({ ok: false, error: e.message }, { status: e.status });
    console.error(e);
    return Response.json({ ok: false, error: "Something went wrong. See the terminal for details." }, { status: 500 });
  }
}
