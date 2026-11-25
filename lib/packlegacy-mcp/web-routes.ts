import { configuredSiteUrl } from "./config";
import { renderToolPage } from "./web/pages";

export type ToolPageKind = "index" | "insert" | "consolidate" | "artwork";
export const TOOL_PAGES: Record<string, ToolPageKind> = {
  "/tools/": "index",
  "/tools/box-and-insert-planner/": "insert",
  "/tools/box-size-planner/": "consolidate",
  "/tools/packaging-artwork-checker/": "artwork",
};

export function createToolPageHandler(kind: ToolPageKind, config: { siteUrl?: string; indexable?: boolean } = {}) {
  return (request: Request): Response => {
    const indexable = config.indexable ?? process.env.PACKLEGACY_TOOLS_INDEXABLE === "true";
    const headers = new Headers({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": indexable ? "index, follow" : "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    });
    if (request.method !== "GET" && request.method !== "HEAD") {
      headers.set("Allow", "GET, HEAD");
      return new Response("Method not allowed.", { status: 405, headers });
    }
    return new Response(request.method === "HEAD" ? null : renderToolPage(kind, { siteUrl: config.siteUrl ?? configuredSiteUrl(), indexable }), { headers });
  };
}
