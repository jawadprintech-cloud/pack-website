"use client";
// The dashboard at /admin/ (npm run admin). Talks to app/admin/api/route.ts.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import Login, { Account } from "./Login";
import Snippets from "./Snippets";

type Seo = { title?: string; description?: string; keywords?: string; canonical?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; noindex?: boolean };
type Page = { path: string; title: string; kind: string; slug: string; baseTitle: string; baseDescription: string; image?: string; seo: Seo };
type Field = { id: string; label: string; type: "text" | "image" | "link"; value: string; group: string; path: string[]; options?: string[]; item?: { start: number; end: number; index: number; count: number } };
type Doc = { file: string; hash: string; title: string; note?: string; fields: Field[] };
type Media = { rel: string; url: string; name: string; size: number; time: number };
type Version = { time: number; file: string };
type Redirect = { source: string; destination: string; permanent: boolean };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

async function send(body: FormData | object): Promise<Any> {
  const form = body instanceof FormData;
  const res = await fetch("/admin/api/", { method: "POST", headers: { "x-pl-admin": "1", ...(form ? {} : { "content-type": "application/json" }) }, body: form ? body : JSON.stringify(body) });
  const j = await res.json().catch(() => ({ ok: false, error: "The server did not answer. Is it still running?" }));
  if (res.status === 401 && j.error === "Please log in") dispatchEvent(new Event("pl-admin-expired"));
  if (!j.ok) throw new Error(j.error);
  return j.result;
}
export const api = (action: string, data: object = {}) => send({ ...data, action });

type Ctx = { toast: (m: string, bad?: boolean) => void; go: (to: string) => void; pick: (cb: (url: string) => void) => void; setDirty: (d: boolean) => void; media: Media[]; reloadMedia: () => void };
const C = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(C);
export const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function useLoad<T>(action: string, data: object = {}) {
  const key = JSON.stringify(data);
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setError(""); setValue(await api(action, JSON.parse(key))); } catch (e) { setError(msg(e)); }
  }, [action, key]);
  useEffect(() => { setValue(null); load(); }, [load]);
  return { value, error, reload: load };
}
export const Loading = ({ error }: { error?: string }) => <p className={error ? "ad-error" : "ad-muted"}>{error || "Loading…"}</p>;

const NAV: [string, string][] = [
  ["", "Dashboard"], ["pages", "Pages"], ["posts", "Blog posts"], ["products", "Products"], ["categories", "Categories"], ["tools", "Toolkit"],
  ["media", "Media library"], ["seo", "SEO"], ["menus", "Header & footer"], ["snippets", "Code snippets"], ["redirects", "Redirects"], ["settings", "Settings"], ["history", "History"],
];
const ICONS: Record<string, string> = {
  "": "M3 12 12 4l9 8M5 10v10h14V10",
  "pages": "M6 3h8l4 4v14H6zM14 3v4h4",
  "posts": "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
  "products": "m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  "categories": "M3 6h7l2 2h9v11H3z",
  "tools": "M14 6a4 4 0 0 0 5 5l-9 9-4-4 9-9z",
  "media": "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 5M15.5 9h.01",
  "seo": "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16 16l5 5",
  "menus": "M3 4h18v16H3zM3 9h18M3 16h18",
  "snippets": "m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  "redirects": "M4 7h11a5 5 0 0 1 0 10H8M11 14l-3 3 3 3",
  "settings": "M4 7h10M18 7h2M4 17h2M10 17h10M16 5v4M8 15v4",
  "history": "M4 12a8 8 0 1 0 3-6L4 8M4 3v5h5M12 8v5l3 2"
};
const Icon = ({ id }: { id: string }) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[id] || ""} /></svg>;
const KINDS: Record<string, { kinds: string[]; title: string; create?: string; noun: string }> = {
  pages: { kinds: ["page", "custom"], title: "Pages", create: "custom", noun: "page" },
  posts: { kinds: ["post"], title: "Blog posts", create: "post", noun: "post" },
  products: { kinds: ["product"], title: "Products", create: "product", noun: "product" },
  categories: { kinds: ["category"], title: "Categories", noun: "category" },
  tools: { kinds: ["tool"], title: "Toolkit", noun: "tool" },
};

export default function App() {
  const [s, setS] = useState<{ needsSetup: boolean; user: string | null; passwordManaged?: boolean } | null>(null);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState("");
  const check = useCallback(() => api("session").then((v) => { setS(v); setExpired(false); setError(""); }).catch((e) => setError(msg(e))), []);
  useEffect(() => {
    check();
    const onExpired = () => setExpired(true);
    addEventListener("pl-admin-expired", onExpired);
    return () => removeEventListener("pl-admin-expired", onExpired);
  }, [check]);
  if (error) return <div className="ad ad-login"><Loading error={error} /></div>;
  if (!s) return null;
  if (!s.user) return <Login needsSetup={s.needsSetup} onDone={check} />;
  return (
    <>
      {/* Stays mounted when a session ends, so unsaved work survives logging in again. */}
      <div inert={expired}><Dashboard user={s.user} passwordManaged={!!s.passwordManaged} onLoggedOut={() => { location.hash = ""; check(); }} /></div>
      {expired && <Expired onDone={check} />}
    </>
  );
}
function Expired({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="ad-expired" aria-label="Log in" onCancel={(e) => e.preventDefault()}><Login needsSetup={false} expired onDone={onDone} /></dialog>;
}

function Dashboard({ user, passwordManaged, onLoggedOut }: { user: string; passwordManaged: boolean; onLoggedOut: () => void }) {
  const [route, setRoute] = useState<string | null>(null);
  const [note, setNote] = useState<{ m: string; bad?: boolean } | null>(null);
  const [picker, setPicker] = useState<{ cb: (url: string) => void } | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const dirty = useRef(false);
  const toast = useCallback((m: string, bad?: boolean) => setNote({ m, bad }), []);
  const reloadMedia = useCallback(() => { api("media").then(setMedia).catch((e) => toast(msg(e), true)); }, [toast]);

  useEffect(() => {
    let current = location.hash.slice(1);
    setRoute(current);
    reloadMedia();
    const onHash = () => {
      const next = location.hash.slice(1);
      if (next === current) return;
      if (dirty.current && !confirm("Leave without saving your changes?")) { history.replaceState(null, "", "#" + current); return; }
      dirty.current = false;
      current = next;
      setRoute(next);
    };
    const onLeave = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    addEventListener("hashchange", onHash);
    addEventListener("beforeunload", onLeave);
    return () => { removeEventListener("hashchange", onHash); removeEventListener("beforeunload", onLeave); };
  }, [reloadMedia]);
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), note.bad ? 9000 : 3500);
    return () => clearTimeout(t);
  }, [note]);

  const ctx = useMemo<Ctx>(() => ({ toast, go: (to) => { location.hash = to; }, pick: (cb) => setPicker({ cb }), setDirty: (d) => { dirty.current = d; }, media, reloadMedia }), [toast, media, reloadMedia]);
  const logout = async (everywhere: boolean) => {
    if (dirty.current && !confirm("Log out without saving your changes?")) return;
    try { await api("logout", { everywhere }); dirty.current = false; onLoggedOut(); } catch (e) { toast(msg(e), true); }
  };
  if (route === null) return null;
  const [view, a, ...rest] = route.split("|");
  const b = rest.join("|");
  return (
    <C.Provider value={ctx}>
      <div className="ad">
        <aside className="ad-side">
          <a className="ad-brand" href="#"><img src="/images/pack-legacy-logo.webp" alt="Pack Legacy" /></a>
          <nav aria-label="Dashboard">
            {NAV.map(([id, label]) => <a key={id} href={"#" + id} aria-current={(view === id || (view === "edit" && KINDS[id]?.kinds.includes(a)) || (view === "product-layout" && id === "products")) ? "page" : undefined}><Icon id={id} />{label}</a>)}
          </nav>
          <a className="ad-visit" href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <div className="ad-user">
            <a href="#account" aria-current={view === "account" ? "page" : undefined}><span aria-hidden="true">{user[0].toUpperCase()}</span><b>{user}</b></a>
            <button onClick={() => logout(false)}>Log out</button>
          </div>
        </aside>
        <main className="ad-main" key={route}>
          {view === "" && <Home />}
          {KINDS[view] && <List view={view} />}
          {view === "edit" && <Edit kind={a} slug={b} />}
          {view === "media" && <MediaScreen />}
          {view === "seo" && <SeoScreen />}
          {view === "menus" && <><Head title="Header & footer" /><Content kind="menus" slug="" /></>}
          {view === "settings" && <><Head title="Settings" /><Content kind="settings" slug="" /></>}
          {view === "product-layout" && <><Head title="Product page layout" /><Content kind="product-layout" slug="" /></>}
          {view === "snippets" && <Snippets />}
          {view === "redirects" && <Redirects />}
          {view === "account" && <Account user={user} passwordManaged={passwordManaged} onLogout={logout} />}
          {view === "history" && <History />}
        </main>
        {picker && <Modal title="Choose an image" onClose={() => setPicker(null)}><MediaGrid onPick={(u) => { picker.cb(u); setPicker(null); }} /></Modal>}
        {note && <div key={note.m} ref={(el) => { if (el && !el.matches(":popover-open")) el.showPopover(); }} popover="manual" className={"ad-toast" + (note.bad ? " bad" : "")} role="status">{note.m}<button onClick={() => setNote(null)} aria-label="Close message">×</button></div>}
      </div>
    </C.Provider>
  );
}

export const Head = ({ title, children }: { title: string; children?: ReactNode }) => <header className="ad-head"><h1>{title}</h1><div>{children}</div></header>;

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} className="ad-modal" onClose={onClose} aria-label={title}>
      <header><h2>{title}</h2><button className="ad-btn" onClick={() => ref.current?.close()}>Close</button></header>
      {children}
    </dialog>
  );
}

// ---- Overview ----------------------------------------------------------------

const eff = (p: Page) => ({ title: p.seo.title || p.baseTitle, description: p.seo.description || p.baseDescription });
function issues(p: Page, all: Page[]) {
  const { title, description } = eff(p);
  const out: string[] = [];
  if (p.path === "/thank-you/" || p.seo.noindex) return out;
  if (!title) out.push("No title");
  else if (title.length > 60) out.push(`Long title (${title.length})`);
  else if (title.length < 25) out.push("Short title");
  if (!description) out.push("No description");
  else if (description.length > 160) out.push(`Long description (${description.length})`);
  else if (description.length < 70) out.push("Short description");
  if (title && all.some((x) => x !== p && eff(x).title === title)) out.push("Duplicate title");
  return out;
}

function Home() {
  const { value, error } = useLoad<{ pages: Page[]; media: number; history: Version[] }>("overview");
  if (!value) return <Loading error={error} />;
  const count = (k: string) => value.pages.filter((p) => KINDS[k].kinds.includes(p.kind)).length;
  const problems = value.pages.filter((p) => issues(p, value.pages).length);
  return (
    <>
      <Head title="Dashboard" />
      <div className="ad-stats">
        {(["pages", "posts", "products", "categories", "tools"] as const).map((k) => <a key={k} href={"#" + k}><i><Icon id={k} /></i><strong>{count(k)}</strong>{KINDS[k].title}</a>)}
        <a href="#media"><i><Icon id="media" /></i><strong>{value.media}</strong>Media files</a>
        <a href="#seo"><i><Icon id="seo" /></i><strong>{problems.length}</strong>Pages with SEO suggestions</a>
      </div>
      <section className="ad-card">
        <h2>Quick actions</h2>
        <div className="ad-quick">{[["posts", "Write a post"], ["products", "Manage products"], ["media", "Upload images"], ["seo", "Improve SEO"], ["snippets", "Add a code snippet"], ["menus", "Edit header & footer"]].map(([k, t]) => <a key={k} href={"#" + k}><Icon id={k} />{t}</a>)}</div>
      </section>
      <section className="ad-card">
        <h2>Recent changes</h2>
        {value.history.length ? <ul className="ad-plain">{value.history.map((h) => <li key={h.time + h.file}>{h.file} <span className="ad-muted">{new Date(h.time).toLocaleString()}</span></li>)}</ul> : <p className="ad-muted">Nothing has been changed here yet.</p>}
      </section>
      <p className="ad-muted">Saved changes appear on this local site straight away. Deploy the project to put them on the live site.</p>
    </>
  );
}

// ---- Lists ----------------------------------------------------------------------

function List({ view }: { view: string }) {
  const cfg = KINDS[view];
  const { value, error, reload } = useLoad<Page[]>("pages");
  const { toast, go } = useApp();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState<{ copy?: Page } | null>(null);
  if (!value) return <Loading error={error} />;
  const rows = value.filter((p) => cfg.kinds.includes(p.kind) && (p.title + p.path).toLowerCase().includes(q.toLowerCase()));
  const remove = async (p: Page) => {
    if (!confirm(`Delete “${p.title}”? You can bring it back from History.`)) return;
    try { await api("remove", { kind: p.kind, slug: p.slug }); toast("Deleted"); reload(); } catch (e) { toast(msg(e), true); }
  };
  return (
    <>
      <Head title={cfg.title}>
        {view === "products" && <a className="ad-btn" href="#product-layout">Product page layout</a>}
        {cfg.create && <button className="ad-btn primary" onClick={() => setAdding({})}>Add {cfg.noun}</button>}
      </Head>
      <input className="ad-search" type="search" placeholder={`Search ${cfg.title.toLowerCase()}`} aria-label={`Search ${cfg.title}`} value={q} onChange={(e) => setQ(e.target.value)} />
      <table className="ad-table">
        <thead><tr><th>Title</th><th>Address</th><th><span className="ad-sr">Actions</span></th></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.path}>
              <td><a className="ad-title" href={`#edit|${p.kind}|${p.slug}`}>{p.image && <img src={p.image} alt="" loading="lazy" />}{p.title}</a></td>
              <td><a className="ad-muted" href={p.path} target="_blank" rel="noreferrer">{p.path}</a></td>
              <td className="ad-actions">
                <a className="ad-btn" href={`#edit|${p.kind}|${p.slug}`}>Edit</a>
                {p.kind === "product" && <button className="ad-btn" onClick={() => setAdding({ copy: p })}>Duplicate</button>}
                {cfg.create && ["product", "post", "custom"].includes(p.kind) && <button className="ad-btn danger" onClick={() => remove(p)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="ad-muted">Nothing matches.</p>}
      {adding && cfg.create && (
        <Modal title={adding.copy ? `Duplicate ${adding.copy.title}` : `Add ${cfg.noun}`} onClose={() => setAdding(null)}>
          <AddForm noun={cfg.noun} onSubmit={async (title, slug) => {
            try { await api("create", { kind: cfg.create, title, slug, copyFrom: adding.copy?.slug }); toast("Created"); go(`edit|${cfg.create}|${slug}`); } catch (e) { toast(msg(e), true); }
          }} />
        </Modal>
      )}
    </>
  );
}
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function AddForm({ noun, onSubmit }: { noun: string; onSubmit: (title: string, slug: string) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className="ad-form" onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSubmit(title, slug ?? slugify(title)); setBusy(false); }}>
      <label>Title<input required value={title} onChange={(e) => setTitle(e.target.value)} autoFocus /></label>
      <label>URL slug<input required value={slug ?? slugify(title)} onChange={(e) => setSlug(e.target.value)} /></label>
      <button className="ad-btn primary" disabled={busy}>Create {noun}</button>
    </form>
  );
}

// ---- Edit one page ---------------------------------------------------------------

function Edit({ kind, slug }: { kind: string; slug: string }) {
  const { value, error, reload } = useLoad<Page[]>("pages");
  const [tab, setTab] = useState<"content" | "seo">("content");
  const { setDirty } = useApp();
  const changeTab = (t: "content" | "seo") => {
    if (t === tab || (document.querySelector("[data-dirty='1']") && !confirm("Leave without saving your changes?"))) return;
    setDirty(false);
    setTab(t);
  };
  if (!value) return <Loading error={error} />;
  const page = value.find((p) => p.kind === kind && p.slug === slug);
  if (!page) return <Loading error="This page does not exist." />;
  const back = Object.entries(KINDS).find(([, k]) => k.kinds.includes(kind))?.[0] || "";
  return (
    <>
      <p className="ad-crumb"><a href={"#" + back}>← {KINDS[back]?.title}</a></p>
      <Head title={page.title}><a className="ad-btn" href={page.path} target="_blank" rel="noreferrer">View page ↗</a></Head>
      <div className="ad-tabs">
        <button aria-pressed={tab === "content"} onClick={() => changeTab("content")}>Content</button>
        <button aria-pressed={tab === "seo"} onClick={() => changeTab("seo")}>SEO</button>
      </div>
      {tab === "seo" ? <SeoForm page={page} onSaved={reload} /> : kind === "product" || kind === "custom" ? <RecordEditor kind={kind} slug={slug} /> : <Content kind={kind} slug={slug} />}
    </>
  );
}

function ImageInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const { pick, media } = useApp();
  // Some images are stored as a bare file name; find the file it stands for.
  const src = /^(\/|https?:|data:)/.test(value) ? value : media.find((m) => m.rel.endsWith("/" + value))?.url || value;
  return (
    <div className="ad-image">
      {value && <img src={src} alt="" loading="lazy" />}
      <div>
        <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="ad-btn" onClick={() => pick(onChange)}>Choose image</button>
      </div>
    </div>
  );
}
function Auto({ value, onChange, label, changed }: { value: string; onChange: (v: string) => void; label: string; changed?: boolean }) {
  const rows = Math.min(14, Math.max(1, Math.ceil(value.length / 90) + (value.match(/\n/g)?.length || 0)));
  return <textarea className={changed ? "changed" : ""} aria-label={label} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />;
}

function Content({ kind, slug }: { kind: string; slug: string }) {
  const { value, error, reload } = useLoad<Doc[]>("content", { kind, slug });
  const [open, setOpen] = useState(0);
  const { setDirty } = useApp();
  if (!value) return <Loading error={error} />;
  if (!value.length) return <p className="ad-muted">There is no editable content here.</p>;
  const i = Math.min(open, value.length - 1);
  return (
    <div className="ad-content">
      {value.length > 1 && (
        <div className="ad-docs" role="group" aria-label="Parts of this page">
          {value.map((d, n) => (
            <button key={n} aria-pressed={n === i} onClick={() => {
              if (n === i || (document.querySelector("[data-dirty='1']") && !confirm("Leave without saving your changes?"))) return;
              setDirty(false);
              setOpen(n);
            }}>{d.title}</button>
          ))}
        </div>
      )}
      <DocEditor key={i + value[i].hash} doc={value[i]} reload={reload} />
    </div>
  );
}

function DocEditor({ doc, reload }: { doc: Doc; reload: () => Promise<void> }) {
  const { toast, setDirty, reloadMedia } = useApp();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const n = Object.keys(edits).length;
  useEffect(() => { setDirty(n > 0); }, [n, setDirty]);
  const set = (f: Field, v: string) => setEdits((e) => { const next = { ...e }; if (v === f.value) delete next[f.id]; else next[f.id] = v; return next; });
  const run = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try { await fn(); setEdits({}); setDirty(false); toast(done); reloadMedia(); await reload(); } catch (e) { toast(msg(e), true); }
    setBusy(false);
  };
  const save = () => run(() => api("saveContent", { file: doc.file, hash: doc.hash, edits: Object.entries(edits).map(([id, value]) => ({ id, value })) }), "Saved");
  const item = (f: Field, op: "duplicate" | "remove") => {
    if (n) return toast("Save your changes first", true);
    if (op === "remove" && !confirm("Remove this item?")) return;
    run(() => api("item", { file: doc.file, hash: doc.hash, start: f.item!.start, op }), op === "remove" ? "Removed" : "Duplicated");
  };
  const groups = useMemo(() => {
    const m = new Map<string, Field[]>();
    for (const f of doc.fields) if (!q || (f.value + f.label + f.group).toLowerCase().includes(q.toLowerCase())) m.set(f.group, [...(m.get(f.group) || []), f]);
    return [...m];
  }, [doc, q]);
  let lastItem = -1;
  return (
    <div data-dirty={n ? "1" : "0"}>
      {doc.note && <p className="ad-note">{doc.note}</p>}
      <input className="ad-search" type="search" placeholder="Find text on this page" aria-label="Find text" value={q} onChange={(e) => setQ(e.target.value)} />
      {groups.map(([name, fields], gi) => (
        <details className="ad-card" key={name} open={!!q || gi < 4 || undefined}>
          <summary>{name}<span className="ad-muted">{fields.length}</span></summary>
          {fields.map((f) => {
            const first = f.item && f.item.start !== lastItem;
            if (f.item) lastItem = f.item.start;
            const value = edits[f.id] ?? f.value;
            return (
              <div key={f.id}>
                {first && (
                  <div className="ad-item">Item {f.item!.index + 1} of {f.item!.count}
                    <button className="ad-link" disabled={busy} onClick={() => item(f, "duplicate")}>Duplicate</button>
                    {f.item!.count > 1 && <button className="ad-link danger" disabled={busy} onClick={() => item(f, "remove")}>Remove</button>}
                  </div>
                )}
                <div className="ad-field">
                  <span className="ad-label">{f.label.replace(/^./, (c) => c.toUpperCase())}</span>
                  {f.options ? <select aria-label={f.label} value={value} onChange={(e) => set(f, e.target.value)}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
                    : f.type === "image" ? <ImageInput label={f.label} value={value} onChange={(v) => set(f, v)} />
                    : <Auto label={f.label} value={value} changed={f.id in edits} onChange={(v) => set(f, v)} />}
                </div>
              </div>
            );
          })}
        </details>
      ))}
      {!groups.length && <p className="ad-muted">Nothing matches.</p>}
      <SaveBar dirty={n > 0} busy={busy} onSave={save} onDiscard={() => setEdits({})} label={`${n} unsaved ${n === 1 ? "change" : "changes"}`} />
    </div>
  );
}
function SaveBar({ dirty, busy, onSave, onDiscard, label = "Unsaved changes" }: { dirty: boolean; busy: boolean; onSave: () => void; onDiscard: () => void; label?: string }) {
  if (!dirty) return null;
  return <div className="ad-save"><span>{label}</span><button className="ad-btn" disabled={busy} onClick={onDiscard}>Discard</button><button className="ad-btn primary" disabled={busy} onClick={onSave}>{busy ? "Saving…" : "Save changes"}</button></div>;
}

// ---- Products and custom pages (structured) ----------------------------------------

const BLOCKS: Record<string, () => Any> = {
  Heading: () => ({ h2: "New heading" }), Subheading: () => ({ h3: "New subheading" }), Paragraph: () => ({ p: "New paragraph" }),
  "Bulleted list": () => ({ ul: ["First point"] }), "Numbered list": () => ({ ol: ["First step"] }), Tip: () => ({ tip: "New tip" }),
  Image: () => ({ img: { src: "/images/feature-blog.webp", alt: "", width: 780, height: 520 } }), Table: () => ({ table: { head: ["Column 1", "Column 2"], rows: [["", ""]] } }),
};
const PRODUCT_BLOCKS: Record<string, () => Any> = {
  Heading: () => ({ t: "h2", html: "New heading" }), Subheading: () => ({ t: "h3", html: "New subheading" }), Paragraph: () => ({ t: "p", html: "New paragraph" }),
  List: () => ({ t: "ul", items: ["First point"] }), Image: () => ({ t: "img", src: "/images/feature-blog.webp", alt: "" }),
};
const EMPTY: Record<string, () => Any> = { gallery: () => "", faqs: () => ({ q: "", a: "" }), specs: () => ["", ""], related: () => ({ name: "", href: "", img: "" }), rows: () => [""] };
const NAMES: Record<string, string> = { slug: "URL slug", metaTitle: "Default SEO title", metaDescription: "Default SEO description", gallery: "Photos", whatYouGet: "What you get", whyUs: "Why us", quickFaqs: "Quick FAQs", q: "Question", a: "Answer", html: "Text", t: "Block type", img: "Image", src: "Image", alt: "Image alt text", href: "Link", blocks: "Page content", lead: "Introduction", cta: "Closing line", specs: "Specifications", related: "Related products" };
const nameOf = (k: string) => NAMES[k] || k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const isImg = (k: string, v: string) => /^(image|img|src|gallery)$/.test(k) || /\.(webp|png|jpe?g|svg|gif|avif)$/i.test(v);

function Value({ k, v, kind, onChange }: { k: string; v: Any; kind: string; onChange: (v: Any) => void }) {
  if (Array.isArray(v)) {
    const adders = k === "blocks" ? BLOCKS : k === "description" && kind === "product" ? PRODUCT_BLOCKS : null;
    const move = (i: number, d: number) => { const n = [...v]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
    const add = (make: () => Any) => onChange([...v, make()]);
    return (
      <div className="ad-list">
        {v.map((x, i) => (
          <div className="ad-row" key={i}>
            <div className="ad-grow"><Value k={k} v={x} kind={kind} onChange={(n) => onChange(v.map((y, j) => (j === i ? n : y)))} /></div>
            <div className="ad-rowbtns">
              <button type="button" aria-label="Move up" disabled={!i} onClick={() => move(i, -1)}>↑</button>
              <button type="button" aria-label="Move down" disabled={i === v.length - 1} onClick={() => move(i, 1)}>↓</button>
              <button type="button" aria-label="Remove" onClick={() => onChange(v.filter((_, j) => j !== i))}>×</button>
            </div>
          </div>
        ))}
        {adders ? <div className="ad-adders">{Object.entries(adders).map(([n, make]) => <button type="button" className="ad-btn" key={n} onClick={() => add(make)}>+ {n}</button>)}</div>
          : <button type="button" className="ad-btn" onClick={() => add(EMPTY[k] || (() => (v.length && typeof v[0] !== "string" ? structuredClone(v[v.length - 1]) : "")))}>+ Add</button>}
      </div>
    );
  }
  if (v && typeof v === "object")
    return <div className="ad-obj">{Object.entries(v).map(([kk, x]) => <div className="ad-field" key={kk}><span className="ad-label">{nameOf(kk)}</span><Value k={kk} v={x} kind={kind} onChange={(n) => onChange({ ...v, [kk]: n })} /></div>)}</div>;
  if (typeof v === "number") return <input type="number" aria-label={nameOf(k)} value={v} onChange={(e) => onChange(Number(e.target.value))} />;
  if (typeof v === "boolean") return <input type="checkbox" aria-label={nameOf(k)} checked={v} onChange={(e) => onChange(e.target.checked)} />;
  const s = String(v ?? "");
  if (k === "t") return <code>{s}</code>;
  if (k === "updated") return <input type="date" aria-label="Updated" value={s} onChange={(e) => onChange(e.target.value)} />;
  if (isImg(k, s)) return <ImageInput label={nameOf(k)} value={s} onChange={onChange} />;
  return <Auto label={nameOf(k)} value={s} onChange={onChange} />;
}

function RecordEditor({ kind, slug }: { kind: string; slug: string }) {
  const { value, error, reload } = useLoad<{ record: Any; hash: string }>("record", { kind, slug });
  const { toast, go, setDirty } = useApp();
  const [draft, setDraft] = useState<Any>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setDirty(!!draft); }, [draft, setDirty]);
  if (!value) return <Loading error={error} />;
  const r = draft || value.record;
  const save = async () => {
    setBusy(true);
    try {
      await api("saveRecord", { kind, slug, hash: value.hash, record: r });
      setDraft(null); setDirty(false); toast("Saved");
      if (r.slug !== slug) go(`edit|${kind}|${r.slug}`); else await reload();
    } catch (e) { toast(msg(e), true); }
    setBusy(false);
  };
  return (
    <div data-dirty={draft ? "1" : "0"}>
      {Object.entries(r).map(([k, v]) => (
        <details className="ad-card" key={k} open={typeof v === "string" || k === "gallery" || k === "blocks" || undefined}>
          <summary>{nameOf(k)}{Array.isArray(v) && <span className="ad-muted">{v.length}</span>}</summary>
          <Value k={k} v={v} kind={kind} onChange={(n) => setDraft({ ...r, [k]: n })} />
        </details>
      ))}
      {kind === "product" && <p className="ad-muted">Changing the URL slug moves the page. Add a redirect from the old address.</p>}
      <SaveBar dirty={!!draft} busy={busy} onSave={save} onDiscard={() => setDraft(null)} />
    </div>
  );
}

// ---- SEO ---------------------------------------------------------------------------

function SeoForm({ page, onSaved }: { page: Page; onSaved: () => void }) {
  const { toast, setDirty } = useApp();
  const [s, setS] = useState<Seo>(page.seo);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(s) !== JSON.stringify(page.seo);
  useEffect(() => { setDirty(dirty); }, [dirty, setDirty]);
  const set = (k: keyof Seo, v: string | boolean) => setS((o) => { const n: Any = { ...o, [k]: v }; if (!v) delete n[k]; return n; });
  const title = s.title || page.baseTitle, description = s.description || page.baseDescription;
  const save = async () => {
    setBusy(true);
    try { await api("saveSeo", { path: page.path, seo: s }); setDirty(false); toast("SEO saved"); onSaved(); } catch (e) { toast(msg(e), true); }
    setBusy(false);
  };
  const count = (n: number, max: number) => <span className={n > max ? "ad-over" : "ad-muted"}>{n} / {max}</span>;
  return (
    <div className="ad-form" data-dirty={dirty ? "1" : "0"}>
      <div className="ad-serp" aria-label="Search preview"><small>packlegacy.com{page.path}</small><strong>{title || "No title"}</strong><p>{description || "No description"}</p></div>
      <label><span>Meta title {count(title.length, 60)}</span><input value={s.title || ""} placeholder={page.baseTitle} onChange={(e) => set("title", e.target.value)} /></label>
      <label><span>Meta description {count(description.length, 160)}</span><textarea rows={3} value={s.description || ""} placeholder={page.baseDescription} onChange={(e) => set("description", e.target.value)} /></label>
      <label>Keywords<input value={s.keywords || ""} onChange={(e) => set("keywords", e.target.value)} /></label>
      <label>Canonical URL<input value={s.canonical || ""} placeholder={page.path} onChange={(e) => set("canonical", e.target.value)} /></label>
      <h2>Social sharing</h2>
      <label>Title<input value={s.ogTitle || ""} placeholder={title} onChange={(e) => set("ogTitle", e.target.value)} /></label>
      <label>Description<textarea rows={2} value={s.ogDescription || ""} placeholder={description} onChange={(e) => set("ogDescription", e.target.value)} /></label>
      <div className="ad-field"><span className="ad-label">Image</span><ImageInput label="Social image" value={s.ogImage || ""} onChange={(v) => set("ogImage", v)} /></div>
      <label className="ad-check"><input type="checkbox" checked={!!s.noindex} onChange={(e) => set("noindex", e.target.checked)} /> Hide this page from search engines (noindex, removed from the sitemap)</label>
      <p className="ad-muted">Leave a box empty to use the page’s own value.</p>
      <SaveBar dirty={dirty} busy={busy} onSave={save} onDiscard={() => setS(page.seo)} />
    </div>
  );
}

function SeoScreen() {
  const { value, error, reload } = useLoad<Page[]>("pages");
  const [q, setQ] = useState("");
  const [only, setOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const { setDirty } = useApp();
  if (!value) return <Loading error={error} />;
  const rows = value.map((p) => ({ p, bad: issues(p, value) })).filter(({ p, bad }) => (!only || bad.length) && (p.path + eff(p).title).toLowerCase().includes(q.toLowerCase()));
  const page = value.find((p) => p.path === open);
  return (
    <>
      <Head title="SEO" />
      <div className="ad-bar">
        <input className="ad-search" type="search" placeholder="Search pages" aria-label="Search pages" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="ad-check"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Only pages with suggestions</label>
      </div>
      <table className="ad-table">
        <thead><tr><th>Page</th><th>Title and description</th><th>Suggestions</th><th><span className="ad-sr">Actions</span></th></tr></thead>
        <tbody>
          {rows.map(({ p, bad }) => (
            <tr key={p.path}>
              <td className="ad-path">{p.path}</td>
              <td><strong>{eff(p).title}</strong><br /><span className="ad-muted">{eff(p).description}</span></td>
              <td>{p.seo.noindex && <span className="ad-tag">noindex</span>}{bad.map((b) => <span className="ad-tag warn" key={b}>{b}</span>)}</td>
              <td className="ad-actions"><button className="ad-btn" onClick={() => setOpen(p.path)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {page && <Modal title={page.title} onClose={() => { setDirty(false); setOpen(null); }}><SeoForm page={page} onSaved={reload} /></Modal>}
    </>
  );
}

// ---- Media ----------------------------------------------------------------------------

const size = (n: number) => (n > 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB");
const picture = (m: Media) => /\.(webp|png|jpe?g|gif|svg|avif)$/i.test(m.name);

function MediaGrid({ onPick }: { onPick: (url: string) => void }) {
  const { media, reloadMedia, toast } = useApp();
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("");
  const [limit, setLimit] = useState(60);
  const [webp, setWebp] = useState(true);
  const [busy, setBusy] = useState(false);
  const folders = useMemo(() => [...new Set(media.map((m) => m.rel.split("/").slice(0, -1).join("/")))].sort(), [media]);
  const rows = media.filter((m) => (!folder || m.rel.startsWith(folder + "/")) && m.rel.toLowerCase().includes(q.toLowerCase()));
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      const form = new FormData();
      form.set("file", f); form.set("folder", folder || "uploads"); form.set("webp", webp ? "1" : "0");
      try { await send(form); toast(`Uploaded ${f.name}`); } catch (e) { toast(`${f.name}: ${msg(e)}`, true); }
    }
    setBusy(false);
    reloadMedia();
  };
  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}>
      <div className="ad-bar">
        <input className="ad-search" type="search" placeholder="Search files" aria-label="Search files" value={q} onChange={(e) => { setQ(e.target.value); setLimit(60); }} />
        <select aria-label="Folder" value={folder} onChange={(e) => { setFolder(e.target.value); setLimit(60); }}><option value="">All folders</option>{folders.map((f) => f && <option key={f}>{f}</option>)}</select>
        <label className="ad-check"><input type="checkbox" checked={webp} onChange={(e) => setWebp(e.target.checked)} /> Convert to WebP</label>
        <label className="ad-btn primary">{busy ? "Uploading…" : "Upload files"}<input className="ad-sr" type="file" multiple accept="image/*,.pdf,.mp4,.webm" disabled={busy} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} /></label>
      </div>
      <div className="ad-grid">
        {rows.slice(0, limit).map((m) => (
          <button key={m.rel} onClick={() => onPick(m.url)} title={m.rel}>
            {picture(m) ? <img src={m.url + "?v=" + Math.round(m.time)} alt="" loading="lazy" /> : <span className="ad-file">{m.name.split(".").pop()}</span>}
            <span>{m.name}</span>
          </button>
        ))}
      </div>
      {rows.length > limit && <button className="ad-btn" onClick={() => setLimit(limit + 120)}>Show more ({rows.length - limit} left)</button>}
      {!rows.length && <p className="ad-muted">No files match.</p>}
    </div>
  );
}

function MediaScreen() {
  const { media } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const m = media.find((x) => x.url === open);
  return (
    <>
      <Head title="Media library" />
      <MediaGrid onPick={setOpen} />
      {m && <Modal title={m.name} onClose={() => setOpen(null)}><MediaDetail m={m} close={() => setOpen(null)} /></Modal>}
    </>
  );
}
function MediaDetail({ m, close }: { m: Media; close: () => void }) {
  const { value, error } = useLoad<{ width?: number; height?: number; used: string[] }>("mediaInfo", { rel: m.rel });
  const { toast, reloadMedia } = useApp();
  const act = async (fn: () => Promise<unknown>, done: string, shut: boolean) => {
    try { await fn(); toast(done); reloadMedia(); if (shut) close(); } catch (e) { toast(msg(e), true); }
  };
  return (
    <div className="ad-detail">
      {picture(m) && <img src={m.url + "?v=" + Math.round(m.time)} alt="" />}
      <div>
        <p><code>{m.url}</code></p>
        <p>{size(m.size)}{value?.width ? `, ${value.width} × ${value.height}` : ""}</p>
        <h3>Used in</h3>
        {!value ? <Loading error={error} /> : value.used.length ? <ul className="ad-plain">{value.used.map((u) => <li key={u}>{u}</li>)}</ul> : <p className="ad-muted">Not used anywhere.</p>}
        <div className="ad-bar">
          <button className="ad-btn" onClick={() => act(() => navigator.clipboard.writeText(m.url), "Address copied", false)}>Copy address</button>
          <label className="ad-btn">Replace file<input className="ad-sr" type="file" accept="image/*,.pdf,.mp4,.webm" onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const form = new FormData();
            form.set("file", f); form.set("replace", m.rel);
            act(() => send(form), "Replaced everywhere it is used", false);
          }} /></label>
          <button className="ad-btn danger" disabled={!value || value.used.length > 0} onClick={() => confirm(`Delete ${m.name}? You can bring it back from History.`) && act(() => api("deleteMedia", { rel: m.rel }), "Deleted", true)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ---- Redirects and history --------------------------------------------------------------

function Redirects() {
  const { value, error, reload } = useLoad<Redirect[]>("redirects");
  const { toast, setDirty } = useApp();
  const [draft, setDraft] = useState<Redirect[] | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setDirty(!!draft); }, [draft, setDirty]);
  if (!value) return <Loading error={error} />;
  const list = draft || value;
  const set = (i: number, p: Partial<Redirect>) => setDraft(list.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const save = async () => {
    setBusy(true);
    try { await api("saveRedirects", { list }); setDraft(null); await reload(); toast("Saved. Restart the server to use the new redirects."); } catch (e) { toast(msg(e), true); }
    setBusy(false);
  };
  return (
    <>
      <Head title="Redirects"><button className="ad-btn primary" onClick={() => setDraft([...list, { source: "", destination: "", permanent: true }])}>Add redirect</button></Head>
      {list.map((r, i) => (
        <div className="ad-bar" key={i}>
          <input aria-label="Old address" placeholder="/old-page/" value={r.source} onChange={(e) => set(i, { source: e.target.value })} />
          <span>→</span>
          <input aria-label="New address" placeholder="/new-page/" value={r.destination} onChange={(e) => set(i, { destination: e.target.value })} />
          <select aria-label="Type" value={r.permanent ? "1" : "0"} onChange={(e) => set(i, { permanent: e.target.value === "1" })}><option value="1">Permanent</option><option value="0">Temporary</option></select>
          <button className="ad-btn danger" onClick={() => setDraft(list.filter((_, j) => j !== i))}>Remove</button>
        </div>
      ))}
      {!list.length && <p className="ad-muted">No redirects yet.</p>}
      <SaveBar dirty={!!draft} busy={busy} onSave={save} onDiscard={() => setDraft(null)} />
    </>
  );
}

function History() {
  const { value, error, reload } = useLoad<Version[]>("history");
  const { toast, reloadMedia } = useApp();
  if (!value) return <Loading error={error} />;
  return (
    <>
      <Head title="History" />
      <p className="ad-muted">Each entry is the version from just before a change. Restoring it replaces the whole file, including later changes to it.</p>
      <table className="ad-table">
        <thead><tr><th>Changed</th><th>File</th><th><span className="ad-sr">Actions</span></th></tr></thead>
        <tbody>
          {value.map((h) => (
            <tr key={h.time + h.file}>
              <td>{new Date(h.time).toLocaleString()}</td><td>{h.file}</td>
              <td className="ad-actions"><button className="ad-btn" onClick={async () => {
                if (!confirm(`Restore ${h.file} as it was before ${new Date(h.time).toLocaleString()}?`)) return;
                try { await api("restore", h); toast("Restored"); reloadMedia(); reload(); } catch (e) { toast(msg(e), true); }
              }}>Restore</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!value.length && <p className="ad-muted">Nothing has been changed yet.</p>}
    </>
  );
}
