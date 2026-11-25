// Receives every quote form on the site (see lib/quote.ts) and emails it to the sales inbox over SMTP.
//
// Environment variables (set them in Vercel → Project → Settings → Environment Variables):
//   SMTP_HOST     e.g. smtp.gmail.com
//   SMTP_PORT     465 (SSL) or 587 (STARTTLS); defaults to 465
//   SMTP_USER     the mailbox login
//   SMTP_PASS     its password or app password
//   QUOTE_TO      optional, defaults to quotes@packlegacy.com
//   QUOTE_FROM    optional, defaults to SMTP_USER
import nodemailer from "nodemailer";
import { thankYouUrl } from "@/lib/quote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TO = process.env.QUOTE_TO || "quotes@packlegacy.com";
const MAX_FILE = 4 * 1024 * 1024; // Vercel rejects request bodies above ~4.5 MB
const SKIP = new Set(["id", "website", "artwork"]); // internal, honeypot, attachment

// Friendlier labels for the field names the forms use.
const LABELS: Record<string, string> = {
  name: "Name", email: "Email", phone: "Phone", company: "Company", page: "Page",
  design: "Design option", material: "Material", quantity: "Quantity", finish: "Special finishes",
  length: "Length", width: "Width", height: "Height", unit: "Unit", notes: "Project details",
  message: "Message", topic: "Topic", kit: "Sample kit", referral: "How they found us",
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const label = (k: string) => LABELS[k] || k.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const json = (body: object, status = 200) => Response.json(body, { status });

export async function POST(req: Request) {
  // Forms send with fetch (JavaScript on) and get JSON back. With JavaScript off the browser posts the
  // form itself (Accept: text/html), so answer with a redirect to /thank-you/ or a simple error page.
  const isPage = (req.headers.get("accept") || "").includes("text/html");
  const res = await handle(req);
  if (!isPage) return res;
  const body = await res.json().catch(() => ({}));
  if (res.ok) {
    const url = new URL(thankYouUrl(String(body.reference || ""), String(body.name || "")), req.url);
    return Response.redirect(url, 303);
  }
  const back = req.headers.get("referer") || "/get-a-quote/";
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Request not sent | Pack Legacy</title>` +
      `<body style="font-family:Arial,sans-serif;max-width:560px;margin:60px auto;padding:0 16px;line-height:1.5;color:#1d1d1b">` +
      `<h1 style="color:#1f7a3d">Your request was not sent</h1><p>${esc(String(body.message || "Please try again."))}</p>` +
      `<p><a href="${esc(back)}">Go back to the form</a> or email <a href="mailto:sales@packlegacy.com">sales@packlegacy.com</a>.</p></body>`,
    { status: res.status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

async function handle(req: Request): Promise<Response> {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("Quote email is not configured: set SMTP_HOST, SMTP_USER and SMTP_PASS.");
    return json({ message: "We couldn’t send your request right now. Please email sales@packlegacy.com." }, 500);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ message: "The form could not be read. Please try again." }, 400);
  }

  const reference = (String(form.get("id") || "") || crypto.randomUUID()).slice(0, 8).toUpperCase();
  // Bots fill the hidden "website" field: pretend it worked, send nothing.
  if (String(form.get("website") || "").trim()) return json({ reference });

  const email = String(form.get("email") || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ message: "Please enter a valid email address." }, 400);

  // Collect text fields in form order (repeated names, e.g. checkboxes, are joined).
  const rows = new Map<string, string[]>();
  for (const [k, v] of form.entries()) {
    if (SKIP.has(k) || typeof v !== "string") continue;
    const value = v.trim().slice(0, 5000);
    if (!value) continue;
    rows.set(k, [...(rows.get(k) || []), value]);
  }

  // The MCP server (lib/packlegacy-mcp) sends the same text as both "notes" and "details"; show it once.
  if (rows.get("details")?.join("\n") === rows.get("notes")?.join("\n")) rows.delete("details");

  // Without JavaScript the "page" field isn't filled in, so take it from the page that sent the form.
  if (!rows.has("page")) {
    try {
      const ref = req.headers.get("referer");
      if (ref) rows.set("page", [new URL(ref).pathname]);
    } catch {}
  }

  const attachments: { filename: string; content: Buffer; contentType?: string }[] = [];
  const file = form.get("artwork");
  if (file && typeof file !== "string" && file.size > 0) {
    if (file.size > MAX_FILE || !/\.(pdf|png|jpe?g)$/i.test(file.name)) {
      return json({ message: "Please attach a PDF, PNG or JPG file up to 4 MB." }, 400);
    }
    attachments.push({ filename: file.name, content: Buffer.from(await file.arrayBuffer()), contentType: file.type || undefined });
  }

  const name = rows.get("name")?.[0] || "Website visitor";
  const page = rows.get("page")?.[0] || "";
  const list = [...rows.entries()].map(([k, v]) => [label(k), v.join(", ")] as const);
  const text = [`New quote request ${reference}`, "", ...list.map(([k, v]) => `${k}: ${v}`), attachments.length ? `\nArtwork attached: ${attachments[0].filename}` : ""].join("\n");
  const html =
    `<h2 style="font-family:Arial,sans-serif;margin:0 0 12px">New quote request <span style="color:#1f7a3d">${reference}</span></h2>` +
    `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">` +
    list.map(([k, v]) => `<tr><td style="color:#666;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("") +
    `</table>` +
    (attachments.length ? `<p style="font-family:Arial,sans-serif;font-size:14px">Artwork attached: ${esc(attachments[0].filename)}</p>` : "");

  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });

  try {
    await transport.sendMail({
      from: { name: "Pack Legacy Website", address: process.env.QUOTE_FROM || SMTP_USER },
      to: TO,
      replyTo: email ? { name, address: email } : undefined,
      subject: `Quote request ${reference}: ${name}${page ? ` (${page})` : ""}`,
      text,
      html,
      attachments,
    });
  } catch (err) {
    console.error("Quote email failed:", err);
    return json({ message: "We couldn’t send your request right now. Please try again or email sales@packlegacy.com." }, 502);
  }

  return json({ reference, name: rows.get("name")?.[0] || "" });
}
