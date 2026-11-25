export const DEFAULT_SITE_URL = "https://packlegacy-website.vercel.app";
export const SERVER_VERSION = "0.6.0";
export const SERVER_NAME = "com.packlegacy/mcp";

export function configuredSiteUrl(): string {
  return process.env.PACKLEGACY_SITE_URL ?? DEFAULT_SITE_URL;
}

/** Operator configuration only; callers cannot choose where customer details are sent. */
export function configuredQuoteEndpoint(): string {
  return process.env.PACKLEGACY_QUOTE_ENDPOINT ?? "/api/quote/";
}

export function configuredMcpPort(): number {
  const port = Number(process.env.PACKLEGACY_MCP_PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("Choose a valid PACKLEGACY_MCP_PORT from 1024 to 65535.");
  }
  return port;
}

/** Use operator configuration for the advertised origin. */
export function normalizeMcpBaseUrl(value: string): string {
  const originError = "PACKLEGACY_MCP_BASE_URL requires an HTTPS origin or loopback HTTP origin without credentials, paths, queries or fragments.";
  if (!/^https?:\/\/[^/?#@]+\/?$/i.test(value) || /[\u0000-\u0020\u007f\\]/.test(value)) {
    throw new Error(originError);
  }
  let url: URL;
  try { url = new URL(value); }
  catch { throw new Error(originError); }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
    throw new Error(originError);
  }
  return url.origin;
}

export function configuredMcpBaseUrl(): string {
  // Inside the Next.js website on Vercel the MCP routes share the website's origin, so default to it there.
  const fallback = process.env.VERCEL ? configuredSiteUrl() : "http://127.0.0.1:" + configuredMcpPort();
  return normalizeMcpBaseUrl(process.env.PACKLEGACY_MCP_BASE_URL ?? fallback);
}
