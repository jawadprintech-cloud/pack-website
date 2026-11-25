import { z } from "zod";
import { CatalogClient } from "./catalog";
import { prepareQuoteBrief, quoteBriefSchema } from "./business";
import { ADDITIONAL_TOOL_NAMES, executeAdditionalTool } from "./additional-tools";
import { configuredSiteUrl } from "./config";
import { allowedBrowserOrigins, checkToolBodySize, HttpInputError, privateResponseHeaders, publicError, readBoundedBody } from "./http";

export interface PackagingApiOptions { siteUrl?: string; catalog?: CatalogClient; allowedOrigins?: string[]; }
const envelope = z.object({ tool: z.enum([...ADDITIONAL_TOOL_NAMES, "prepare_quote_brief"]), arguments: z.unknown() }).strict();

/** Browser adapter to the same tool implementations. This does not submit an enquiry. */
export function createPackagingToolsApi(options: PackagingApiOptions = {}) {
  const siteUrl = options.siteUrl ?? configuredSiteUrl();
  const catalog = options.catalog ?? new CatalogClient({ siteUrl });
  const origins = allowedBrowserOrigins(siteUrl, options.allowedOrigins);
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get("origin");
    if (origin && !origins.has(origin)) return Response.json({ ok: false, error: { code: "ORIGIN_REJECTED", message: "Origin is not allowed." } }, { status: 403, headers: privateResponseHeaders(null) });
    const headers = privateResponseHeaders(origin);
    if (request.method === "OPTIONS") {
      headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") {
      headers.set("Allow", "POST, OPTIONS");
      return Response.json({ ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "Send a POST request with JSON input." } }, { status: 405, headers });
    }
    try {
      const type = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
      if (type !== "application/json") throw new HttpInputError(415, "JSON_REQUIRED", "Send application/json input.");
      const bytes = await readBoundedBody(request);
      let parsed: unknown;
      try { parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
      catch { throw new HttpInputError(400, "INVALID_JSON", "The request is not valid UTF-8 JSON."); }
      checkToolBodySize(bytes, "browser", parsed);
      const input = envelope.parse(parsed);
      const result = input.tool === "prepare_quote_brief"
        ? await prepareQuoteBrief(quoteBriefSchema.parse(input.arguments), catalog, siteUrl)
        : await executeAdditionalTool(input.tool, input.arguments, siteUrl, request.signal);
      return Response.json({ ok: true, result }, { headers });
    } catch (error) {
      const exposed = publicError(error);
      if (exposed.error.code === "ARTWORK_BUSY") headers.set("Retry-After", "2");
      return Response.json({ ok: false, error: exposed.error }, { status: exposed.status, headers });
    }
  };
}
