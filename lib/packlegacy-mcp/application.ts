import { createPackLegacyHandler, type HandlerOptions } from "./handler";
import { createPackagingToolsApi } from "./web-api";
import { createToolPageHandler, TOOL_PAGES } from "./web-routes";
import { CatalogClient } from "./catalog";
import { configuredSiteUrl } from "./config";
import { PRICING_DOCUMENT } from "./documents.generated";
import { createMetadataHandler, healthHandler } from "./metadata-routes";

/** Standalone local harness; Next.js uses the supplied route adapters instead. */
export function createApplicationHandler(options: HandlerOptions & { indexable?: boolean; mcpBaseUrl?: string } = {}) {
  const siteUrl = options.siteUrl ?? configuredSiteUrl();
  const shared = { ...options, siteUrl, catalog: options.catalog ?? new CatalogClient({ siteUrl }) };
  const mcp = createPackLegacyHandler(shared);
  const api = createPackagingToolsApi(shared);
  const discoveryOptions = { siteUrl, baseUrl: options.mcpBaseUrl };
  const connectionDocument = createMetadataHandler("mcp-card", discoveryOptions);
  const serverCard = createMetadataHandler("mcp-card", { ...discoveryOptions, canonicalCard: true });
  const openapi = createMetadataHandler("openapi", discoveryOptions);
  const pages = Object.fromEntries(Object.entries(TOOL_PAGES).map(([path, kind]) => [path, createToolPageHandler(kind, shared)]));
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const normalized = url.pathname.replace(/\/+$/, "") || "/";
    if (normalized === "/mcp") return mcp(request);
    if (normalized === "/api/packaging-tools") return api(request);
    if (normalized === "/.well-known/mcp.json") return connectionDocument(request);
    if (normalized === "/mcp/server-card") return serverCard(request);
    if (normalized === "/openapi.json") return openapi(request);
    if (normalized === "/health") return healthHandler(request);
    if (normalized === "/pricing.md") {
      if (!["GET", "HEAD"].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
      return new Response(request.method === "HEAD" ? null : PRICING_DOCUMENT.content, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
    }
    if (normalized === "/favicon.ico") return new Response(null, { status: 204 });
    if (normalized === "/" && request.method === "GET") return Response.redirect(new URL("/tools/", url.origin), 307);
    const page = pages[normalized + "/"];
    return page ? page(request) : new Response("Page not found.", { status: 404 });
  };
}
