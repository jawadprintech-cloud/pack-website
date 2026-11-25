import { createHash } from "node:crypto";
import { configuredMcpBaseUrl, normalizeMcpBaseUrl, SERVER_VERSION } from "./config";
import { buildMcpServerCard, type DiscoveryOptions } from "./discovery";
import { buildOpenApiDocument } from "./openapi";

type DocumentKind = "mcp-card" | "openapi";
export interface MetadataOptions extends DiscoveryOptions { canonicalCard?: boolean; }

export function serializeMetadata(value: unknown): string { return JSON.stringify(value, null, 2) + "\n"; }

function matchesEtag(value: string | null, etag: string): boolean {
  return value !== null && value.split(",").some(part => {
    const tag = part.trim();
    return tag === "*" || tag.replace(/^W\//, "") === etag;
  });
}

/** Public read-only metadata. This handler never executes an MCP tool. */
export function createMetadataHandler(kind: DocumentKind, options: MetadataOptions = {}) {
  const baseUrl = normalizeMcpBaseUrl(options.baseUrl ?? configuredMcpBaseUrl());
  const document = kind === "mcp-card" ? buildMcpServerCard({ ...options, baseUrl }) : buildOpenApiDocument(baseUrl);
  const body = serializeMetadata(document);
  const etag = '"' + createHash("sha256").update(body).digest("hex") + '"';
  const contentType = kind === "mcp-card" && options.canonicalCard
    ? "application/mcp-server-card+json; charset=utf-8" : "application/json; charset=utf-8";
  return (request: Request): Response => {
    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
      "Access-Control-Expose-Headers": "ETag",
      ETag: etag,
    });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (!["GET", "HEAD"].includes(request.method)) {
      headers.set("Allow", "GET, HEAD, OPTIONS");
      headers.set("Cache-Control", "no-store");
      headers.set("Content-Type", "application/json; charset=utf-8");
      headers.delete("ETag");
      return Response.json({ error: "This document supports GET, HEAD and OPTIONS only." }, { status: 405, headers });
    }
    if (matchesEtag(request.headers.get("if-none-match"), etag)) return new Response(null, { status: 304, headers });
    headers.set("Content-Length", String(Buffer.byteLength(body)));
    return new Response(request.method === "HEAD" ? null : body, { headers });
  };
}

/** The same lightweight health endpoint is supplied for standalone and Next hosting. */
export function healthHandler(request: Request): Response {
  if (!["GET", "HEAD"].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  const body = JSON.stringify({ status: "ok", name: "packlegacy", version: SERVER_VERSION });
  return new Response(request.method === "HEAD" ? null : body, {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

