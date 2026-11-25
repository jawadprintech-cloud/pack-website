"use client";
// Code snippets screen of the dashboard.
import { useEffect, useRef, useState } from "react";
import type { Snippet } from "@/lib/snippets";
import { Head, Loading, Modal, api, msg, useApp, useLoad } from "./Dashboard";

const WHERE = { head: "Head", body_start: "Start of body", body_end: "End of body" } as const;
const KIND = { html: "HTML", js: "JavaScript", css: "CSS" } as const;

type Preset = Pick<Snippet, "name" | "type" | "location" | "code"> & { about: string };
const PRESETS: Preset[] = [
  { name: "Blank snippet", about: "Start from scratch", type: "html", location: "body_end", code: "" },
  { name: "Google Analytics 4", about: "Visitor tracking", type: "html", location: "head", code: `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXXXX');\n</script>` },
  { name: "Google Tag Manager", about: "Tag container", type: "js", location: "head", code: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-XXXXXXX');` },
  { name: "Search Console verification", about: "Prove you own the site", type: "html", location: "head", code: `<meta name="google-site-verification" content="YOUR_CODE">` },
  { name: "Structured data (JSON-LD)", about: "Schema markup", type: "html", location: "head", code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Pack Legacy"\n}\n</script>` },
  { name: "Custom CSS", about: "Restyle any part of the site", type: "css", location: "head", code: `/* Your styles */\n` },
  { name: "Custom JavaScript", about: "Run your own script", type: "js", location: "body_end", code: `// Your script\n` },
];
const newId = () => "s-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default function Snippets() {
  const { value, error, reload } = useLoad<{ list: Snippet[]; hash: string }>("snippets");
  const { toast, setDirty } = useApp();
  const [edit, setEdit] = useState<Snippet | null>(null);
  const [choose, setChoose] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!value) return <Loading error={error} />;
  const { list, hash } = value;

  const save = async (next: Snippet[], done: string) => {
    setBusy(true);
    let ok = true;
    try { await api("saveSnippets", { list: next, hash }); setDirty(false); toast(done); await reload(); } catch (e) { toast(msg(e), true); ok = false; }
    setBusy(false);
    return ok;
  };
  const saveOne = (s: Snippet) => save(list.some((x) => x.id === s.id) ? list.map((x) => (x.id === s.id ? s : x)) : [...list, s], "Snippet saved");

  if (edit)
    return <Editor snippet={edit} isNew={!list.some((x) => x.id === edit.id)} busy={busy} onBack={() => setEdit(null)} onSave={async (s) => { if (await saveOne(s)) setEdit(null); }} />;

  return (
    <>
      <Head title="Code snippets"><button className="ad-btn primary" onClick={() => setChoose(true)}>Add snippet</button></Head>
      <p className="ad-muted">Add tracking codes, verification tags, scripts or styles without touching the site’s files.</p>
      {list.length ? (
        <table className="ad-table">
          <thead><tr><th>On</th><th>Name</th><th>Type</th><th>Location</th><th>Pages</th><th><span className="ad-sr">Actions</span></th></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td><label className="ad-switch"><input type="checkbox" role="switch" aria-label={`${s.name} on`} checked={s.active} disabled={busy} onChange={(e) => saveOne({ ...s, active: e.target.checked })} /><span /></label></td>
                <td><button className="ad-link strong" onClick={() => setEdit(s)}>{s.name}</button></td>
                <td><span className={"ad-tag " + s.type}>{KIND[s.type]}</span></td>
                <td>{WHERE[s.location]}</td>
                <td className="ad-muted">{s.pages.length ? s.pages.join(", ") : "Every page"}</td>
                <td className="ad-actions">
                  <button className="ad-btn" onClick={() => setEdit(s)}>Edit</button>
                  <button className="ad-btn" disabled={busy} onClick={() => save([...list, { ...s, id: newId(), name: s.name + " copy", active: false }], "Duplicated")}>Duplicate</button>
                  <button className="ad-btn danger" disabled={busy} onClick={() => confirm(`Delete “${s.name}”?`) && save(list.filter((x) => x.id !== s.id), "Deleted")}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <div className="ad-empty"><strong>No snippets yet</strong><p>Add your first one, such as Google Analytics.</p><button className="ad-btn primary" onClick={() => setChoose(true)}>Add snippet</button></div>}
      {choose && (
        <Modal title="Add a snippet" onClose={() => setChoose(false)}>
          <div className="ad-presets">
            {PRESETS.map(({ about, ...p }) => (
              <button key={p.name} onClick={() => { setChoose(false); setEdit({ ...p, id: newId(), name: p.name === "Blank snippet" ? "" : p.name, pages: [], active: false }); }}>
                <strong>{p.name}</strong><span>{about}</span><span className={"ad-tag " + p.type}>{KIND[p.type]}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

function Editor({ snippet, isNew, busy, onBack, onSave }: { snippet: Snippet; isNew: boolean; busy: boolean; onBack: () => void; onSave: (s: Snippet) => void }) {
  const { setDirty } = useApp();
  const [s, setS] = useState(snippet);
  const [pages, setPages] = useState(snippet.pages.join("\n"));
  const [scope, setScope] = useState(snippet.pages.length ? "some" : "all");
  const full: Snippet = { ...s, pages: scope === "all" ? [] : pages.split(/[\n,]/).map((p) => p.trim()).filter(Boolean) };
  const dirty = isNew || JSON.stringify(full) !== JSON.stringify(snippet);
  useEffect(() => { setDirty(dirty); return () => setDirty(false); }, [dirty, setDirty]);
  const set = (p: Partial<Snippet>) => setS((o) => ({ ...o, ...p }));
  return (
    <>
      <p className="ad-crumb"><button className="ad-link" onClick={() => (!dirty || confirm("Leave without saving your changes?")) && onBack()}>← Code snippets</button></p>
      <Head title={isNew ? "New snippet" : snippet.name}>
        <label className="ad-switch labelled"><input type="checkbox" role="switch" checked={s.active} onChange={(e) => set({ active: e.target.checked })} /><span />{s.active ? "On" : "Off"}</label>
        <button className="ad-btn primary" disabled={busy || !dirty || (scope === "some" && !full.pages.length)} onClick={() => onSave(full)}>{busy ? "Saving…" : "Save snippet"}</button>
      </Head>
      <div className="ad-split">
        <section className="ad-card">
          <label className="ad-stack">Name<input value={s.name} onChange={(e) => set({ name: e.target.value })} /></label>
          <CodeBox value={s.code} onChange={(code) => set({ code })} />
        </section>
        <aside className="ad-card ad-form">
          <label>Code type<select value={s.type} onChange={(e) => set({ type: e.target.value as Snippet["type"] })}>{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label>Location<select value={s.location} onChange={(e) => set({ location: e.target.value as Snippet["location"] })}>{Object.entries(WHERE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label>Show on<select value={scope} onChange={(e) => setScope(e.target.value)}><option value="all">Every page</option><option value="some">Chosen pages</option></select></label>
          {scope === "some" && (
            <label>Page addresses, one per line<textarea rows={4} placeholder={"/faqs/\n/blog/*"} value={pages} onChange={(e) => setPages(e.target.value)} /></label>
          )}
          {scope === "some" && <p className="ad-muted">Use * to include everything below an address. Code for chosen pages is added after the page loads, so use “Every page” for verification tags and structured data.</p>}
        </aside>
      </div>
    </>
  );
}

/** Code area with line numbers; Tab indents (Escape, then Tab, leaves the box). */
function CodeBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const gutter = useRef<HTMLPreElement>(null);
  const escaped = useRef(false);
  const count = Math.max(16, value.split("\n").length);
  return (
    <div className="ad-code">
      <pre ref={gutter} aria-hidden="true">{Array.from({ length: count }, (_, i) => i + 1).join("\n")}</pre>
      <textarea
        aria-label="Code" spellCheck={false} autoCapitalize="off" wrap="off" value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }}
        onKeyDown={(e) => {
          if (e.key === "Escape") { escaped.current = true; return; }
          if (e.key === "Tab" && !e.shiftKey && !escaped.current) {
            e.preventDefault();
            const t = e.currentTarget;
            t.setRangeText("  ", t.selectionStart, t.selectionEnd, "end");
            onChange(t.value);
          }
          escaped.current = false;
        }}
      />
    </div>
  );
}
