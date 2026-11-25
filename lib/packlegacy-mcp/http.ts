import { z } from "zod";
import { CatalogError } from "./catalog";
import { ArtworkInspectionError } from "./artwork/inspect";

export const MAX_NORMAL_REQUEST_BYTES = 64 * 1024;
export const MAX_ARTWORK_REQUEST_BYTES = 3 * 1024 * 1024;

export class HttpInputError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}

/** Bounds the actual stream as well as any declared Content-Length. */
export async function readBoundedBody(request: Request, maximum = MAX_ARTWORK_REQUEST_BYTES): Promise<Uint8Array<ArrayBuffer>> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || !Number.isSafeInteger(Number(length)))) {
    throw new HttpInputError(400, "INVALID_CONTENT_LENGTH", "Invalid request length.");
  }
  if (length && Number(length) > maximum) throw new HttpInputError(413, "REQUEST_TOO_LARGE", "Request is too large.");
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maximum) {
          await reader.cancel();
          throw new HttpInputError(413, "REQUEST_TOO_LARGE", "Request is too large.");
        }
        chunks.push(value);
      }
    } catch (error) {
      if (error instanceof HttpInputError) throw error;
      throw new HttpInputError(400, "REQUEST_READ_FAILED", "The request could not be read completely.");
    } finally { reader.releaseLock(); }
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

/** Only actual file-bearing operations get the upload budget; headers cannot opt in. */
export function checkToolBodySize(body: Uint8Array, surface: "mcp" | "browser", parsed?: unknown): void {
  if (body.byteLength <= MAX_NORMAL_REQUEST_BYTES) return;
  let value: any = parsed;
  if (value === undefined) {
    try { value = JSON.parse(new TextDecoder().decode(body)); } catch { /* Invalid large requests are rejected below. */ }
  }
  const artworkCall = value && typeof value === "object" && !Array.isArray(value)
    && (surface === "mcp"
      ? value.method === "tools/call" && (value.params?.name === "inspect_artwork_file"
        || (value.params?.name === "submit_quote_request"
          && typeof value.params?.arguments?.artwork?.file_base64 === "string"))
      : value.tool === "inspect_artwork_file");
  if (!artworkCall) throw new HttpInputError(413, "REQUEST_TOO_LARGE", "This operation accepts at most 64 KiB of input.");
}

export function allowedBrowserOrigins(siteUrl: string, supplied?: string[]): Set<string> {
  const values = supplied ?? (process.env.PACKLEGACY_MCP_ALLOWED_ORIGINS ?? "").split(",").map(s => s.trim()).filter(Boolean);
  return new Set([new URL(siteUrl).origin, ...values.map(value => new URL(value).origin)]);
}

export function privateResponseHeaders(origin: string | null): Headers {
  const headers = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  if (origin) { headers.set("Access-Control-Allow-Origin", origin); headers.set("Vary", "Origin"); }
  return headers;
}

/** Known errors carry safe messages; parser traces and file content are never returned. */
export function publicError(error: unknown): { status: number; error: { code: string; message: string; issues?: Array<{ path: string; message: string }> } } {
  if (error instanceof HttpInputError) return { status: error.status, error: { code: error.code, message: error.message } };
  if (error instanceof z.ZodError) return { status: 400, error: {
    code: "INVALID_INPUT", message: "Check the supplied values and try again.",
    issues: error.issues.slice(0, 20).map(issue => ({ path: issue.path.join("."), message: issue.message })),
  } };
  if (error instanceof ArtworkInspectionError) return { status: error.code === "ARTWORK_BUSY" ? 503 : error.code === "INSPECTION_TIMEOUT" ? 408 : 400,
    error: { code: error.code, message: error.message } };
  if (error instanceof CatalogError) return { status: error.code === "NOT_FOUND" ? 404 : error.code.startsWith("INVALID_") ? 400 : 503,
    error: { code: error.code, message: error.message } };
  return { status: 500, error: { code: "TOOL_UNAVAILABLE", message: "The operation could not be completed. Please retry or use the website." } };
}
