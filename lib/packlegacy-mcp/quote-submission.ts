import { randomUUID } from "node:crypto";
import { z } from "zod";

/** Base64 overhead remains within the MCP transport's 3 MiB upload envelope. */
export const MAX_QUOTE_ARTWORK_BYTES = 2 * 1024 * 1024;
export const MAX_QUOTE_ARTWORK_BASE64_LENGTH = Math.ceil(MAX_QUOTE_ARTWORK_BYTES / 3) * 4;
export const MAX_QUOTE_RESPONSE_BYTES = 64 * 1024;

const noControls = (value: string) => !/[\u0000-\u001f\u007f]/.test(value);
const optionalText = (maximum: number) => z.string().trim().max(maximum).refine(noControls, "Remove control characters.").nullable().optional();
const optionalDimension = z.union([z.number().min(0.001).max(10000), z.literal("")]).nullable().optional();
const designSchema = z.enum(["Design support", "Download templates", "Upload my artwork", ""]);

/** Only contact fields are required; no catalogue or manufacturing lookup gates an enquiry. */
export const quoteSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(120).refine(noControls, "Enter a name without control characters."),
  email: z.string().trim().max(254).email(),
  phone: z.string().trim().min(7).max(40).refine(noControls, "Enter a phone number without control characters."),
  product_id: optionalText(240).describe("Optional returned product/category path, for example /product/magnetic-closure-boxes/. This is context only; never invent a selection or require one to submit."),
  product: optionalText(240).describe("Optional packaging description in the customer's own words."),
  company: optionalText(160),
  material: optionalText(160),
  quantity: z.union([z.number().int().positive().max(Number.MAX_SAFE_INTEGER), z.literal("")]).nullable().optional()
    .describe("Optional. Leave omitted/null if undecided. One custom box is allowed; do not assume a quantity."),
  finish: optionalText(240),
  dimensions: z.object({
    length: optionalDimension,
    width: optionalDimension,
    height: optionalDimension,
    unit: z.enum(["mm", "cm", "in", "inches", ""]).nullable().optional(),
  }).strict().nullable().optional(),
  notes: z.string().trim().max(3000).refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value), "Remove unsupported control characters.").nullable().optional(),
  design: designSchema.nullable().optional(),
  design_support: z.boolean().nullable().optional().describe("Optional request for Pack Legacy's free design support. No artwork file is required."),
  artwork: z.object({
    filename: z.string().trim().min(1).max(160).refine(value => !/[\\/\u0000-\u001f\u007f]/.test(value), "Use a filename, not a path."),
    mime_type: z.enum(["application/pdf", "image/png", "image/jpeg", ""]).nullable().optional(),
    file_base64: z.string().min(4).max(MAX_QUOTE_ARTWORK_BASE64_LENGTH)
      .describe("Canonical standard base64 for one PDF, PNG or JPEG, at most 2 MiB decoded. No download URL or data-URL prefix. Sending the file does not approve it for print."),
  }).strict().nullable().optional(),
  submission_id: z.string().uuid().nullable().optional()
    .describe("Optional technical request UUID. Generate once and reuse for an authorized retry. Do not ask the customer to supply it; durable server-side deduplication is not verified."),
}).strict();

export type QuoteSubmissionInput = z.infer<typeof quoteSubmissionSchema>;
type SubmissionState = "not_sent" | "not_accepted" | "unknown";

/** Safe diagnostics only: never includes upstream response text, filenames, or contact values. */
export class QuoteSubmissionError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly submissionState: SubmissionState = "not_sent",
    readonly submissionId: string | null = null,
    readonly httpStatus: number | null = null,
  ) { super(message); this.name = "QuoteSubmissionError"; }

  toResult(): Record<string, unknown> {
    return {
      status: this.submissionState === "unknown" ? "submission_unknown" : this.submissionState === "not_accepted" ? "website_rejected" : "submission_not_sent",
      submitted: this.submissionState === "unknown" ? null : false,
      submission_id: this.submissionId,
      reference: null,
      website_http_status: this.httpStatus,
      error: { code: this.code, message: this.message },
      automatic_retry: false,
      duplicate_prevention_verified: false,
      next_step: this.submissionState === "unknown"
        ? "The website may have received the enquiry. Do not submit it again automatically. Check with Pack Legacy before an authorized retry, and retain the same submission_id."
        : this.submissionState === "not_accepted"
          ? "The website did not confirm acceptance. Review the contact details or continue through Pack Legacy's quote form. Do not retry automatically."
          : "Correct the reported input or connection issue. Only name, email and phone are required; optional packaging details can be left out.",
    };
  }
}

export interface QuoteSubmissionClientOptions {
  siteUrl: string;
  endpoint?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

function usableOrigin(value: string): URL {
  let parsed: URL;
  try { parsed = new URL(value); }
  catch { throw new QuoteSubmissionError("QUOTE_ENDPOINT_INVALID", "Configure a valid Pack Legacy site origin."); }
  const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname);
  if ((parsed.protocol !== "https:" && !(parsed.protocol === "http:" && loopback)) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new QuoteSubmissionError("QUOTE_ENDPOINT_INVALID", "Use HTTPS for the configured site; loopback HTTP is allowed for local tests. Credentials, queries and fragments are not accepted.");
  }
  return new URL(parsed.origin);
}

function endpointFor(origin: URL, value: string | undefined): URL {
  let endpoint: URL;
  try {
    if (value !== undefined && (!value.trim() || /[\u0000-\u001f\u007f\\]/.test(value))) throw new Error();
    endpoint = new URL(value ?? "/api/quote/", origin);
  } catch { throw new QuoteSubmissionError("QUOTE_ENDPOINT_INVALID", "Configure a valid same-origin quote endpoint."); }
  if (endpoint.origin !== origin.origin || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new QuoteSubmissionError("QUOTE_ENDPOINT_INVALID", "The quote endpoint must be on the configured site and must not contain credentials, query parameters or a fragment.");
  }
  return endpoint;
}

function sourcePage(productId: string | null | undefined, submissionId: string): string {
  if (!productId) return "/get-a-quote/";
  // Context path only, never a URL to fetch. Product/category paths use the public site's slug layout.
  if (!/^\/(?:product\/)?[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(productId)
      || /^(?:\/(?:api|admin|wp-admin|login|account|checkout|cart|mcp|tools)\/)/.test(productId)) {
    throw new QuoteSubmissionError("QUOTE_SOURCE_PAGE_INVALID", "Use a returned public product/category path, or omit product_id and describe the packaging in notes.", "not_sent", submissionId);
  }
  return productId;
}

function artworkFile(artwork: NonNullable<QuoteSubmissionInput["artwork"]>, submissionId: string) {
  const value = artwork.file_base64;
  if (value.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new QuoteSubmissionError("QUOTE_ARTWORK_INVALID_BASE64", "Provide canonical standard base64 without a data-URL prefix or whitespace.", "not_sent", submissionId);
  }
  const bytes = Buffer.from(value, "base64");
  if (bytes.length === 0 || bytes.length > MAX_QUOTE_ARTWORK_BYTES || bytes.toString("base64") !== value) {
    throw new QuoteSubmissionError("QUOTE_ARTWORK_INVALID_BASE64", "Provide canonical base64 for one file no larger than 2 MiB.", "not_sent", submissionId);
  }
  const extension = artwork.filename.split(".").pop()?.toLowerCase();
  const expected = extension === "pdf" ? "application/pdf" : extension === "png" ? "image/png" : ["jpg", "jpeg"].includes(extension ?? "") ? "image/jpeg" : null;
  const detected = bytes.subarray(0, 5).equals(Buffer.from("%PDF-")) ? "application/pdf"
    : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "image/png"
      : bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? "image/jpeg" : null;
  if (!expected || !detected || expected !== detected || (artwork.mime_type && artwork.mime_type !== detected)) {
    throw new QuoteSubmissionError("QUOTE_ARTWORK_TYPE_MISMATCH", "Use a PDF, PNG or JPEG whose filename and optional MIME type match its file signature.", "not_sent", submissionId);
  }
  return { bytes, mimeType: detected };
}

function formFor(input: QuoteSubmissionInput, submissionId: string) {
  const page = sourcePage(input.product_id, submissionId);
  const form = new FormData();
  form.set("name", input.name);
  form.set("email", input.email);
  form.set("phone", input.phone);
  form.set("id", submissionId);
  form.set("page", page);
  form.set("website", ""); // Same empty honeypot as the public product form.
  // Mounted optional text/select controls are present as empty strings in browser FormData.
  // Keep unknown values blank rather than guessing a quantity, measurement, unit or attribution.
  for (const key of ["material", "quantity", "finish", "length", "width", "height", "unit", "notes", "details", "source"]) form.set(key, "");
  // An unselected radio group and an absent attachment are not included.
  for (const key of ["material", "finish"] as const) if (input[key]) form.set(key, input[key]);
  if (typeof input.quantity === "number") form.set("quantity", String(input.quantity));
  for (const key of ["length", "width", "height"] as const) {
    const value = input.dimensions?.[key];
    if (typeof value === "number") form.set(key, String(value));
  }
  const unit = input.dimensions?.unit;
  if (unit) form.set("unit", unit === "in" ? "inches" : unit);
  const noteParts: string[] = [];
  if (input.notes) noteParts.push(input.notes);
  if (input.product) noteParts.push("Packaging requested: " + input.product);
  if (input.company) noteParts.push("Company: " + input.company);
  if (!unit && [input.dimensions?.length, input.dimensions?.width, input.dimensions?.height].some(value => typeof value === "number")) {
    noteParts.push("Measurement unit was not supplied; sales to confirm.");
  }
  const design = input.design_support === true ? "Design support" : input.design || (input.artwork ? "Upload my artwork" : undefined);
  if (design) form.set("design", design);
  if (input.design_support === true && input.design && input.design !== "Design support") {
    noteParts.push("Additional design preference: " + input.design);
  }
  const notes = noteParts.join("\n\n");
  if (notes.length > 3000) {
    throw new QuoteSubmissionError("QUOTE_DETAILS_TOO_LONG", "The combined optional notes, packaging description and company information must fit within 3,000 characters.", "not_sent", submissionId);
  }
  if (notes) {
    // Both observed form variants share one endpoint. Mirror the same text, without losing fields.
    form.set("notes", notes);
    form.set("details", notes);
  }
  let file: { filename: string; mime_type: string; size_bytes: number } | null = null;
  if (input.artwork) {
    const decoded = artworkFile(input.artwork, submissionId);
    form.set("artwork", new Blob([new Uint8Array(decoded.bytes)], { type: decoded.mimeType }), input.artwork.filename);
    file = { filename: input.artwork.filename, mime_type: decoded.mimeType, size_bytes: decoded.bytes.byteLength };
  }
  return { form, page, file };
}

function hasFailure(body: Record<string, unknown>): boolean {
  const negative = (value: unknown) => value === false || value === 0 || (typeof value === "string" && ["false", "0"].includes(value.trim().toLowerCase()));
  const error = (value: unknown) => typeof value === "string" ? Boolean(value.trim()) : Array.isArray(value) ? value.length > 0 : value !== null && typeof value === "object" ? Object.keys(value).length > 0 : value === true;
  return negative(body.success) || negative(body.ok) || error(body.error) || error(body.errors)
    || (body.error !== null && typeof body.error === "object" && !Array.isArray(body.error))
    || (typeof body.status === "number" && body.status >= 400 && body.status <= 599)
    || (typeof body.status === "string" && ["error", "failed", "failure", "rejected"].includes(body.status.trim().toLowerCase()));
}

function safeReference(value: unknown): string | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return String(value);
  if (typeof value !== "string" || !value.trim() || value.length > 200 || !noControls(value)) return null;
  return value;
}

/** Sends exactly one multipart request to the same business handler used by the website form. */
export class QuoteSubmissionClient {
  readonly endpointUrl: string;
  readonly quoteFormUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: QuoteSubmissionClientOptions) {
    const origin = usableOrigin(options.siteUrl);
    this.endpointUrl = endpointFor(origin, options.endpoint).href;
    this.quoteFormUrl = new URL("/get-a-quote/", origin).href;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 15000;
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 1 || this.timeoutMs > 25000) {
      throw new QuoteSubmissionError("QUOTE_TIMEOUT_INVALID", "Configure a request timeout between 1 and 25,000 milliseconds.");
    }
  }

  async submit(input: QuoteSubmissionInput, signal?: AbortSignal): Promise<Record<string, unknown>> {
    const parsed = quoteSubmissionSchema.parse(input);
    const submissionId = parsed.submission_id ?? randomUUID();
    const prepared = formFor(parsed, submissionId);
    if (signal?.aborted) throw new QuoteSubmissionError("QUOTE_SUBMISSION_CANCELLED", "The enquiry was cancelled before transmission.", "not_sent", submissionId);
    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let responseStatus: number | null = null;
    let timedOut = false;
    let rejectAbort: (error: QuoteSubmissionError) => void = () => {};
    const abortPromise = new Promise<never>((_, reject) => { rejectAbort = reject; });
    const abort = () => {
      controller.abort();
      if (reader) void reader.cancel().catch(() => {});
      rejectAbort(new QuoteSubmissionError(timedOut ? "QUOTE_SUBMISSION_TIMEOUT" : "QUOTE_SUBMISSION_CANCELLED",
        timedOut ? "The website did not provide a complete confirmation before the timeout." : "The enquiry was cancelled after transmission began; its acceptance could not be confirmed.",
        "unknown", submissionId, responseStatus));
    };
    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => { timedOut = true; abort(); }, this.timeoutMs);
    const operation = async () => {
      let response: Response;
      try {
        response = await this.fetchImpl(this.endpointUrl, {
          method: "POST", body: prepared.form, signal: controller.signal,
          redirect: "error", credentials: "omit", cache: "no-store", headers: { Accept: "application/json" },
        });
      } catch {
        throw new QuoteSubmissionError("QUOTE_SUBMISSION_CONNECTION_FAILED", "The website connection did not return a confirmation. The enquiry may have reached the website.", "unknown", submissionId);
      }
      responseStatus = response.status;
      if (response.redirected || (response.url && response.url !== this.endpointUrl)) {
        void response.body?.cancel().catch(() => {});
        throw new QuoteSubmissionError("QUOTE_RESPONSE_UNTRUSTED", "The quote endpoint redirected or returned a response from an unexpected URL.", "unknown", submissionId, response.status);
      }
      if (!response.ok) {
        void response.body?.cancel().catch(() => {});
        throw new QuoteSubmissionError("QUOTE_WEBSITE_REJECTED", "The website did not return a successful acceptance response.", response.status >= 500 || response.status < 400 ? "unknown" : "not_accepted", submissionId, response.status);
      }
      const contentType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
      if (contentType === "application/problem+json") {
        void response.body?.cancel().catch(() => {});
        throw new QuoteSubmissionError("QUOTE_WEBSITE_REJECTED", "The website returned a problem response instead of accepting the enquiry.", "not_accepted", submissionId, response.status);
      }
      if (!contentType || !(contentType === "application/json" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/.test(contentType))) {
        void response.body?.cancel().catch(() => {});
        throw new QuoteSubmissionError("QUOTE_CONFIRMATION_INVALID", "The website did not return a JSON acceptance response. A page or browser challenge is not a submission confirmation.", "unknown", submissionId, response.status);
      }
      const declaredLength = response.headers.get("content-length");
      if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_QUOTE_RESPONSE_BYTES)) {
        void response.body?.cancel().catch(() => {});
        throw new QuoteSubmissionError("QUOTE_CONFIRMATION_TOO_LARGE", "The website confirmation exceeded the supported response size.", "unknown", submissionId, response.status);
      }
      const chunks: Uint8Array[] = [];
      let size = 0;
      reader = response.body?.getReader();
      try {
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_QUOTE_RESPONSE_BYTES) {
              void reader.cancel().catch(() => {});
              throw new QuoteSubmissionError("QUOTE_CONFIRMATION_TOO_LARGE", "The website confirmation exceeded the supported response size.", "unknown", submissionId, response.status);
            }
            chunks.push(value);
          }
        }
      } catch (error) {
        if (error instanceof QuoteSubmissionError) throw error;
        throw new QuoteSubmissionError("QUOTE_CONFIRMATION_INCOMPLETE", "The website confirmation could not be read completely.", "unknown", submissionId, response.status);
      } finally { reader?.releaseLock(); reader = undefined; }
      let body: unknown;
      try { body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks, size))); }
      catch { throw new QuoteSubmissionError("QUOTE_CONFIRMATION_INVALID", "The website confirmation was not valid JSON.", "unknown", submissionId, response.status); }
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new QuoteSubmissionError("QUOTE_CONFIRMATION_INVALID", "The website confirmation was not a supported JSON object.", "unknown", submissionId, response.status);
      }
      if (hasFailure(body as Record<string, unknown>)) {
        throw new QuoteSubmissionError("QUOTE_WEBSITE_REJECTED", "The website response reported that the enquiry was not accepted.", "not_accepted", submissionId, response.status);
      }
      return {
        status: "accepted_by_website",
        submitted: true,
        submission_id: submissionId,
        reference: safeReference((body as Record<string, unknown>).reference),
        website_http_status: response.status,
        quote_form_url: this.quoteFormUrl,
        source_page: prepared.page,
        acceptance_basis: "One multipart POST received a successful HTTP status and a JSON object without an explicit failure.",
        sales_notification_delivery: "not_reported",
        storage_confirmation: "not_reported",
        final_price: null,
        order_created: false,
        artwork_sent: prepared.file,
        artwork_production_approved: false,
        automatic_retry: false,
        duplicate_prevention_verified: false,
        next_step: "Pack Legacy's sales agent handles the remaining packaging and design discussion. No further packaging fields are required to submit this enquiry.",
      };
    };
    try { return await Promise.race([operation(), abortPromise]); }
    finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
  }
}
