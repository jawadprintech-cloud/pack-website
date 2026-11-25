import { configuredMcpBaseUrl, configuredSiteUrl, normalizeMcpBaseUrl, SERVER_NAME, SERVER_VERSION } from "./config";

export interface DiscoveryOptions { baseUrl?: string; siteUrl?: string; }

/**
 * Optional MCP Server Cards extension. Tool/resource lists remain available
 * through MCP itself; they are deliberately not copied into connection metadata.
 */
export function buildMcpServerCard(options: DiscoveryOptions = {}) {
  const baseUrl = normalizeMcpBaseUrl(options.baseUrl ?? configuredMcpBaseUrl());
  const website = new URL(options.siteUrl ?? configuredSiteUrl());
  if (!["http:", "https:"].includes(website.protocol) || website.username || website.password || website.search || website.hash) {
    throw new Error("Configure a public website URL without credentials, query or fragment.");
  }
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: SERVER_NAME,
    title: "Pack Legacy MCP Server",
    description: "Packaging products, website information, planning, artwork checks and customer-requested enquiries.",
    version: SERVER_VERSION,
    websiteUrl: website.origin,
    remotes: [{ type: "streamable-http", url: baseUrl + "/mcp/" }],
    _meta: { "com.packlegacy/openapi": baseUrl + "/openapi.json" },
  };
}

