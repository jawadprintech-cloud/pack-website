import { z } from "zod";
import { quoteBriefSchema } from "./business";
import { artworkToolSchema, consolidateBoxesSchema, insertPlanSchema } from "./additional-tools";
import { MAX_ARTWORK_BYTES, MAX_ARTWORK_PIXELS, MAX_PDF_PAGES, MAX_REPORTED_PDF_PAGES } from "./artwork/inspect";
import { MAX_ARTWORK_REQUEST_BYTES, MAX_NORMAL_REQUEST_BYTES } from "./http";
import { SERVER_VERSION } from "./config";

type JsonObject = Record<string, unknown>;
const ref = (name: string) => ({ $ref: "#/components/schemas/" + name });
const parameter = (name: string) => ({ $ref: "#/components/parameters/" + name });
const jsonContent = (schema: JsonObject) => ({ "application/json": { schema } });

/** Use the same caller-input schemas as the implementation, including optional defaults. */
function inputSchema(schema: z.ZodType, description: string): JsonObject {
  const generated: JsonObject = z.toJSONSchema(schema, { io: "input", target: "draft-2020-12" });
  delete generated.$schema;
  return { ...generated, description };
}

function toolEnvelope(tool: string, schemaName: string): JsonObject {
  return {
    type: "object",
    required: ["tool", "arguments"],
    additionalProperties: false,
    properties: { tool: { type: "string", const: tool }, arguments: ref(schemaName) },
  };
}

const privateHeaders = {
  "Cache-Control": { description: "Private operation responses are not cached.", schema: { type: "string", const: "no-store" } },
  "X-Content-Type-Options": { schema: { type: "string", const: "nosniff" } },
};
const discoveryHeaders = {
  ETag: { description: "Validator for this representation; send it in If-None-Match on a later GET or HEAD.", schema: { type: "string" } },
  "Cache-Control": { schema: { type: "string", const: "public, max-age=300" } },
  "Access-Control-Allow-Origin": { schema: { type: "string", const: "*" } },
  "Access-Control-Expose-Headers": { schema: { type: "string", const: "ETag" } },
  "Content-Length": { description: "UTF-8 byte length of the GET representation, also returned on HEAD.", schema: { type: "integer", minimum: 0 } },
};
const conditionalHeaders = {
  ETag: discoveryHeaders.ETag,
  "Cache-Control": discoveryHeaders["Cache-Control"],
  "Access-Control-Allow-Origin": discoveryHeaders["Access-Control-Allow-Origin"],
  "Access-Control-Expose-Headers": discoveryHeaders["Access-Control-Expose-Headers"],
};

function browserFailure(description: string, extraHeaders: JsonObject = {}): JsonObject {
  return { description, headers: { ...privateHeaders, ...extraHeaders }, content: jsonContent(ref("BrowserError")) };
}

function mcpFailure(description: string, extraHeaders: JsonObject = {}): JsonObject {
  return {
    description,
    headers: { ...privateHeaders, ...extraHeaders },
    content: jsonContent({ anyOf: [ref("JsonRpcError"), ref("SimpleHttpError"), ref("StructuredHttpError")] }),
  };
}

function metadataPath(name: string, summary: string, mediaType: string, schema: JsonObject): JsonObject {
  const notModified = { description: "The selected representation matches If-None-Match. No response body.", headers: conditionalHeaders };
  return {
    description: "Public read-only metadata. GET and HEAD support ETag conditional requests; OPTIONS returns 204. Other methods return 405 with Allow: GET, HEAD, OPTIONS and an application/json object containing an error string. Reading this document never executes an MCP tool.",
    get: {
      tags: ["Discovery"], operationId: "get" + name, summary,
      parameters: [parameter("IfNoneMatch")],
      responses: {
        "200": { description: "Current generated document.", headers: discoveryHeaders, content: { [mediaType]: { schema } } },
        "304": notModified,
      },
    },
    head: {
      tags: ["Discovery"], operationId: "head" + name, summary: "Read document headers without a body",
      parameters: [parameter("IfNoneMatch")],
      responses: {
        "200": { description: "The same representation headers as GET, with an empty response body.", headers: discoveryHeaders },
        "304": notModified,
      },
    },
    options: {
      tags: ["Discovery"], operationId: "options" + name, summary: "Read supported document methods",
      responses: { "204": {
        description: "GET, HEAD and OPTIONS are supported. No response body.",
        headers: {
          ...conditionalHeaders,
          "Access-Control-Allow-Methods": { schema: { type: "string", const: "GET, HEAD, OPTIONS" } },
          "Access-Control-Allow-Headers": { schema: { type: "string", const: "Content-Type, If-None-Match" } },
        },
      } },
    },
  };
}

/**
 * Describes this package's implemented HTTP surfaces. The A2A service and the
 * website's external quote receiver have independent contracts and are omitted.
 * The caller supplies an operator-configured origin, never a request Host header.
 */
export function buildOpenApiDocument(baseUrl: string): object {
  const origin = new URL(baseUrl).origin;
  const supportedBrowserTools = [
    ["plan_multi_item_insert", "InsertPlanInput"],
    ["consolidate_box_sizes", "BoxConsolidationInput"],
    ["inspect_artwork_file", "ArtworkInspectionInput"],
    ["prepare_quote_brief", "QuoteBriefInput"],
  ] as const;
  const methodHeader = { Allow: { schema: { type: "string", const: "POST, OPTIONS" } } };
  return {
    openapi: "3.1.2",
    info: {
      title: "Pack Legacy MCP service HTTP API",
      version: SERVER_VERSION,
      description: "HTTP documentation for this Pack Legacy MCP project. The MCP endpoint provides packaging information, planning, limited artwork checks and customer-authorized enquiries. The browser API exposes only three packaging tools and unsent enquiry preparation. Only name, email and phone are required by the MCP submit_quote_request tool; optional packaging details, free design support and artwork use the existing website enquiry process. Website acceptance does not prove downstream sales notification or storage. Tool names are MCP operations, not REST paths. This document does not describe the independent A2A service, payments or the website's external quote receiver.",
    },
    jsonSchemaDialect: "https://json-schema.org/draft/2020-12/schema",
    servers: [{ url: origin, description: "Operator-configured origin of this MCP service. Local origins are for local testing only." }],
    security: [],
    tags: [
      { name: "MCP", description: "Use a compatible MCP client and its protocol negotiation and discovery facilities." },
      { name: "Browser tools", description: "JSON adapter for the three customer-facing tools and optional unsent enquiry preparation." },
      { name: "Discovery", description: "Generated connection and API documents; their presence does not guarantee client discovery or search placement." },
      { name: "Service", description: "Service health and bundled pricing guidance." },
    ],
    "x-packlegacy-request-limits": {
      normal_request_bytes: MAX_NORMAL_REQUEST_BYTES,
      artwork_request_bytes: MAX_ARTWORK_REQUEST_BYTES,
      decoded_artwork_bytes: MAX_ARTWORK_BYTES,
      artwork_formats: ["application/pdf", "image/png", "image/jpeg"],
      artwork_pixel_limit: MAX_ARTWORK_PIXELS,
      artwork_pdf_page_limit: MAX_PDF_PAGES,
      artwork_pdf_pages_reported_maximum: MAX_REPORTED_PDF_PAGES,
      description: "Limits are enforced on actual bytes, not only Content-Length. The larger MCP envelope is available only to inspect_artwork_file or submit_quote_request containing artwork.file_base64. The larger browser envelope is available only to inspect_artwork_file. Decoded artwork remains limited to 2 MiB.",
    },
    paths: {
      "/mcp/": {
        post: {
          tags: ["MCP"], operationId: "sendMcpMessage", summary: "Send an MCP JSON-RPC message",
          description: "Use a compatible MCP client. Protocol-specific headers, initialization where applicable, and _meta values follow the negotiated protocol. Discover current tools and their authoritative argument schemas with tools/list; do not turn tool names into REST paths. Accept both application/json and text/event-stream where the client protocol requires them. A JSON-RPC result may contain an isError tool result even when HTTP succeeds. Calling submit_quote_request is a real write when configured: use customer submission intent, supply only known optional details, and do not automatically retry an unknown outcome. A request body is at most 64 KiB except supported artwork-bearing operations, which accept at most 3 MiB with a 2 MiB decoded file. Supplied browser Origins must be allowlisted; omission of Origin is not an authentication scheme.",
          parameters: [parameter("McpProtocolVersion"), parameter("McpMethod"), parameter("McpName"), parameter("Origin")],
          requestBody: {
            required: true,
            description: "One MCP JSON-RPC message. The example is a harmless tool-discovery body; a real MCP client supplies the headers and metadata appropriate to its protocol version.",
            content: {
              "application/json": {
                schema: { oneOf: [ref("JsonRpcRequest"), ref("JsonRpcNotification")] },
                example: { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
              },
            },
          },
          responses: {
            "200": {
              description: "An MCP response, either JSON or a protocol event stream. Inspect the JSON-RPC error/result and any tool isError flag; HTTP success alone is not business success.",
              headers: privateHeaders,
              content: {
                "application/json": { schema: { oneOf: [ref("JsonRpcResult"), ref("JsonRpcError")] } },
                "text/event-stream": { schema: { type: "string", description: "Server-sent events carrying MCP protocol messages; parse with a compatible client." } },
              },
            },
            "202": { description: "A notification or protocol message was accepted without a response body. This is not an enquiry submission confirmation.", headers: privateHeaders },
            "400": mcpFailure("Invalid request body, JSON-RPC message, protocol headers or other protocol input."),
            "403": mcpFailure("The supplied browser Origin is not allowlisted, or the protocol handler rejected the request."),
            "405": mcpFailure("Only POST and OPTIONS are supported on this endpoint.", methodHeader),
            "406": mcpFailure("The request does not accept the response formats required by its MCP protocol."),
            "413": mcpFailure("The request exceeded the applicable byte limit."),
            "415": mcpFailure("The request Content-Type is not supported; send application/json."),
            "500": mcpFailure("The protocol handler could not complete the request."),
            default: { description: "Other protocol or transport status. Interpret with the negotiated MCP client; do not assume that a failed or interrupted transport means a write was not received." },
          },
        },
        options: {
          tags: ["MCP"], operationId: "optionsMcp", summary: "Read MCP browser preflight permissions",
          parameters: [parameter("Origin")],
          responses: {
            "204": {
              description: "Allowed preflight. No response body.",
              headers: {
                ...privateHeaders,
                "Access-Control-Allow-Methods": { schema: { type: "string", const: "POST, OPTIONS" } },
                "Access-Control-Allow-Headers": { schema: { type: "string", const: "Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name" } },
              },
            },
            "403": mcpFailure("The supplied Origin is not allowlisted."),
          },
        },
      },
      "/api/packaging-tools/": {
        post: {
          tags: ["Browser tools"], operationId: "runPackagingBrowserTool", summary: "Run a planner, artwork check or unsent enquiry preparation",
          description: "Only the four tools in the request union are available. This route does not submit enquiries. Send application/json. Normal input is limited to 64 KiB; inspect_artwork_file accepts a JSON envelope up to 3 MiB and canonical base64 for one PDF, PNG or JPEG up to 2 MiB decoded. Unknown properties are rejected. The server also validates constraints that JSON Schema does not fully express: unique item IDs, total item counts, converted dimensions and allowances, related artwork options, file signatures and canonical base64. Planning does not establish protection or manufacturability; artwork inspection does not approve printing. Supplied browser Origins must be allowlisted.",
          parameters: [parameter("Origin")],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: ref("BrowserToolRequest"),
                example: { tool: "prepare_quote_brief", arguments: {} },
              },
            },
          },
          responses: {
            "200": {
              description: "Operation completed. The result is the operation's JSON object; this envelope does not guarantee manufacturing suitability, print readiness, price, storage or submission.",
              headers: privateHeaders,
              content: jsonContent(ref("BrowserSuccess")),
            },
            "400": browserFailure("Invalid UTF-8 JSON, envelope, arguments, catalogue identifier or supported file checks."),
            "403": browserFailure("The supplied Origin is not allowlisted."),
            "404": browserFailure("The requested catalogue item is not known."),
            "405": browserFailure("Only POST and OPTIONS are supported.", methodHeader),
            "408": browserFailure("Artwork inspection exceeded its allowed processing time."),
            "413": browserFailure("The request exceeded the applicable byte limit."),
            "415": browserFailure("Send application/json input."),
            "500": browserFailure("The operation could not be completed."),
            "503": browserFailure("A catalogue dependency is unavailable or artwork processing is busy.", {
              "Retry-After": { description: "Returned as 2 seconds for ARTWORK_BUSY only; other failures need not include it.", schema: { type: "string", const: "2" } },
            }),
          },
        },
        options: {
          tags: ["Browser tools"], operationId: "optionsPackagingBrowserTools", summary: "Read browser-tool preflight permissions",
          parameters: [parameter("Origin")],
          responses: {
            "204": {
              description: "Allowed preflight. No response body.",
              headers: {
                ...privateHeaders,
                "Access-Control-Allow-Methods": { schema: { type: "string", const: "POST, OPTIONS" } },
                "Access-Control-Allow-Headers": { schema: { type: "string", const: "Content-Type" } },
              },
            },
            "403": browserFailure("The supplied Origin is not allowlisted."),
          },
        },
      },
      "/health/": {
        get: {
          tags: ["Service"], operationId: "getServiceHealth", summary: "Read process health and version",
          description: "Process health only. It does not verify the website, catalogue freshness, sales delivery or end-to-end enquiry processing.",
          responses: {
            "200": {
              description: "This service is responding.", headers: { "Cache-Control": privateHeaders["Cache-Control"] },
              content: jsonContent({ type: "object", required: ["status", "name", "version"], additionalProperties: false, properties: {
                status: { type: "string", const: "ok" }, name: { type: "string", const: "packlegacy" }, version: { type: "string", const: SERVER_VERSION },
              } }),
            },
          },
        },
        head: {
          tags: ["Service"], operationId: "headServiceHealth", summary: "Check process health without a body",
          responses: { "200": { description: "Service responds with the same content type as GET and no body.", headers: { "Cache-Control": privateHeaders["Cache-Control"] } } },
        },
      },
      "/pricing.md": {
        get: {
          tags: ["Service"], operationId: "getPricingGuidance", summary: "Read bundled pricing guidance",
          description: "Returns the bundled Markdown document. Inspect its source dates and qualifications. Indicative starting prices are not an approved quotation or a payable total; this endpoint does not calculate a final price.",
          responses: { "200": {
            description: "Bundled Markdown pricing document.",
            content: { "text/markdown": { schema: { type: "string" } } },
          } },
        },
        head: {
          tags: ["Service"], operationId: "headPricingGuidance", summary: "Read pricing-document headers without a body",
          responses: { "200": { description: "The pricing document is available; response body is empty." } },
        },
      },
      "/.well-known/mcp.json": metadataPath("McpConnectionDocument", "Read the MCP connection document alias", "application/json", ref("McpServerCard")),
      "/mcp/server-card/": metadataPath("McpServerCard", "Read the MCP server card", "application/mcp-server-card+json", ref("McpServerCard")),
      "/openapi.json": metadataPath("OpenApiDocument", "Read this HTTP API description", "application/json", ref("OpenApiDocument")),
    },
    components: {
      parameters: {
        IfNoneMatch: { name: "If-None-Match", in: "header", required: false, description: "An ETag previously returned by this document endpoint, or a standard conditional request value.", schema: { type: "string" } },
        Origin: { name: "Origin", in: "header", required: false, description: "When supplied, this origin must be in the configured allowlist. Allowed origins receive Access-Control-Allow-Origin and Vary: Origin. Non-browser clients need not fabricate an Origin header.", schema: { type: "string" } },
        McpProtocolVersion: { name: "MCP-Protocol-Version", in: "header", required: false, description: "Supply the supported protocol revision when required by the compatible MCP client's negotiated protocol.", schema: { type: "string" } },
        McpMethod: { name: "Mcp-Method", in: "header", required: false, description: "MCP method routing header where required by the negotiated protocol; it must agree with the message.", schema: { type: "string" } },
        McpName: { name: "Mcp-Name", in: "header", required: false, description: "MCP operation-name routing header where required by the negotiated protocol.", schema: { type: "string" } },
      },
      schemas: {
        JsonRpcRequest: {
          type: "object", required: ["jsonrpc", "id", "method"], additionalProperties: true,
          description: "Generic MCP request envelope. Method parameters and protocol metadata are governed by the negotiated MCP version and live method/tool schemas.",
          properties: { jsonrpc: { type: "string", const: "2.0" }, id: { type: ["string", "number"] }, method: { type: "string" }, params: { type: "object", additionalProperties: true } },
        },
        JsonRpcNotification: {
          type: "object", required: ["jsonrpc", "method"], not: { required: ["id"] }, additionalProperties: true,
          description: "An MCP notification has no id. Follow the compatible client's protocol rules; notifications do not produce a business confirmation.",
          properties: { jsonrpc: { type: "string", const: "2.0" }, method: { type: "string" }, params: { type: "object", additionalProperties: true } },
        },
        JsonRpcResult: {
          type: "object", required: ["jsonrpc", "id", "result"], additionalProperties: true,
          properties: { jsonrpc: { type: "string", const: "2.0" }, id: { type: ["string", "number"] }, result: {} },
        },
        JsonRpcError: {
          type: "object", required: ["jsonrpc", "id", "error"], additionalProperties: true,
          properties: {
            jsonrpc: { type: "string", const: "2.0" }, id: { type: ["string", "number", "null"] },
            error: { type: "object", required: ["code", "message"], additionalProperties: true, properties: { code: { type: "integer" }, message: { type: "string" }, data: {} } },
          },
        },
        PublicError: {
          type: "object", required: ["code", "message"], additionalProperties: false,
          properties: {
            code: { type: "string" }, message: { type: "string" },
            issues: { type: "array", maxItems: 20, items: { type: "object", required: ["path", "message"], additionalProperties: false, properties: { path: { type: "string" }, message: { type: "string" } } } },
          },
        },
        SimpleHttpError: { type: "object", required: ["error"], additionalProperties: false, properties: { error: { type: "string" } } },
        StructuredHttpError: { type: "object", required: ["error"], additionalProperties: false, properties: { error: ref("PublicError") } },
        BrowserError: { type: "object", required: ["ok", "error"], additionalProperties: false, properties: { ok: { type: "boolean", const: false }, error: ref("PublicError") } },
        BrowserSuccess: {
          type: "object", required: ["ok", "result"], additionalProperties: false,
          properties: { ok: { type: "boolean", const: true }, result: { type: "object", additionalProperties: true, description: "Operation-specific service output. This intentionally open result schema guarantees only the envelope; it is not an exhaustive specification of every planner, artwork or draft field." } },
        },
        BrowserToolRequest: { oneOf: supportedBrowserTools.map(([tool, schemaName]) => toolEnvelope(tool, schemaName)) },
        QuoteBriefInput: inputSchema(quoteBriefSchema, "Optional known packaging requirements for an unsent, unsaved brief. Empty arguments are allowed. This draft is not a prerequisite for an enquiry and is not submitted by this API."),
        InsertPlanInput: inputSchema(insertPlanSchema, "One upright layer of rectangular product envelopes. Server checks unique IDs, at most 30 total item instances, converted dimensions from 0.001 to 10000 mm, and allowances at most 1000 mm. Geometric plans are not production approval."),
        BoxConsolidationInput: inputSchema(consolidateBoxesSchema, "Group measured SKUs for one product unit per parcel. Server checks unique IDs and dimensions no greater than 10000 mm after conversion. Partial order weights are disclosed and ignored; fit is geometric, not protection or shipping-price approval."),
        ArtworkInspectionInput: inputSchema(artworkToolSchema, "Canonical base64 for one actual PDF, PNG or JPEG up to 2 MiB decoded. The server checks encoding, signatures, bounded decoding and filename consistency. Supply both print dimensions together or neither. Optional thresholds are caller-supplied, not an approved production profile. No file URL/path retrieval or storage occurs."),
        McpServerCard: {
          type: "object", additionalProperties: true,
          description: "Generated MCP server card. This OpenAPI description intentionally leaves the card structure to the declared MCP server-card schema and protocol revision. The well-known alias returns the same card representation as the canonical card route, with an application/json content type.",
        },
        OpenApiDocument: {
          type: "object", required: ["openapi", "info", "paths"], additionalProperties: true,
          properties: { openapi: { type: "string", const: "3.1.2" }, info: { type: "object", additionalProperties: true }, paths: { type: "object", additionalProperties: true } },
          description: "This generated OpenAPI 3.1.2 document.",
        },
      },
    },
  };
}
