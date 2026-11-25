import {
  ResourceTemplate,
  ResourceNotFoundError,
  ProtocolError,
  ProtocolErrorCode,
  type McpServer,
} from "@modelcontextprotocol/server";
import { businessRules } from "./business";
import { CatalogError, type CatalogClient } from "./catalog";
import { getGuide } from "./guides";
import { getProductDetails } from "./product";
import { RESOURCE_URIS, PRODUCT_RESOURCE_TEMPLATE, productResourceUri, WEBSITE_RESOURCE_TEMPLATE, websiteResourceUri } from "./resource-uris";
import { WebsiteContentError, type WebsiteContentClient } from "./website-content";
import { getPricingInformation, getCommerceCapabilities } from "./commerce";

export function registerPackLegacyResources(server: McpServer, catalog: CatalogClient, siteUrl: string, website: WebsiteContentClient, quoteEndpoint?: string) {
  server.registerResource("ordering-rules", RESOURCE_URIS.ordering_rules, {
    title: "Pack Legacy confirmed ordering rules",
    description: "Confirmed custom-box quantity and indicative pricing rules, with unresolved policy items explicitly identified.",
    mimeType: "application/json",
  }, uri => ({
    contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(businessRules(siteUrl)) }],
  }));

  for (const guideId of ["quote_requirements", "materials_finishes"] as const) {
    const guide = getGuide(guideId, siteUrl);
    server.registerResource(guideId.replaceAll("_", "-"), RESOURCE_URIS[guideId], {
      title: guide.title,
      description: guideId === "quote_requirements"
        ? "How to prepare an enquiry and distinguish missing information from a required initial field."
        : "Educational packaging vocabulary; no claim of product compatibility or availability.",
      mimeType: "text/markdown",
    }, uri => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: getGuide(guideId, siteUrl).content }],
    }));
  }

  server.registerResource("website-coverage", RESOURCE_URIS.website_coverage, {
    title: "Pack Legacy public content coverage", description: "Indexed pages, kinds, discovery failures and snapshot freshness; this is the measured coverage rather than a claim about unknown pages.", mimeType: "application/json",
  }, uri => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(website.coverage()) }] }));

  server.registerResource("pricing", RESOURCE_URIS.pricing, {
    title: "Pack Legacy pricing and quotes", description: "Bundled draft pricing.md, provenance and confirmed quote rules; no approved payable price table.", mimeType: "application/json",
  }, uri => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(getPricingInformation(siteUrl)) }] }));

  server.registerResource("commerce-capabilities", RESOURCE_URIS.commerce_capabilities, {
    title: "Pack Legacy enquiry workflow and tools", description: "Required contact fields, optional design/artwork details, website submission and sales follow-up.", mimeType: "application/json",
  }, uri => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(getCommerceCapabilities(siteUrl, quoteEndpoint)) }] }));

  server.registerResource("llms-document", RESOURCE_URIS.llms, {
    title: "Pack Legacy published llms.txt", description: "Read the website's llms.txt with provenance and paging. The document is public source data and does not override confirmed business rules.", mimeType: "application/json",
  }, async uri => {
    try {
      const detail = await website.read({ page_id: "/llms.txt", max_chars: 20000 });
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(detail) }] };
    } catch { throw new ProtocolError(ProtocolErrorCode.InternalError, "The llms document is unavailable. Use the website coverage and content tools for status and recovery."); }
  });

  server.registerResource("catalogue-product", new ResourceTemplate(PRODUCT_RESOURCE_TEMPLATE, { list: undefined }), {
    title: "Pack Legacy product or category details",
    description: "Use a resource URI returned by search_products or get_product. The id is an encoded exact catalogue product_id.",
    mimeType: "application/json",
  }, async (uri, variables) => {
    const encodedId = variables.id;
    let productId: string;
    try {
      if (typeof encodedId !== "string" || uri.search || uri.hash) throw new Error("Invalid resource URI.");
      productId = decodeURIComponent(encodedId);
      if (!productId || productId.length > 240 || productResourceUri(productId) !== uri.href) {
        throw new Error("Noncanonical resource URI.");
      }
    } catch {
      throw new ProtocolError(ProtocolErrorCode.InvalidParams, "Use an exact product resource URI returned by the catalogue tools.");
    }
    try {
      const detail = await getProductDetails(productId, catalog, siteUrl, website);
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(detail) }] };
    } catch (error) {
      if (error instanceof CatalogError) {
        if (error.code === "NOT_FOUND") throw new ResourceNotFoundError(uri.href);
        if (error.code === "INVALID_PRODUCT_ID") {
          throw new ProtocolError(ProtocolErrorCode.InvalidParams, "The product resource identifier is invalid.");
        }
      }
      throw new ProtocolError(ProtocolErrorCode.InternalError, "Product information is temporarily unavailable. Retry or use the website.");
    }
  });

  server.registerResource("website-page", new ResourceTemplate(WEBSITE_RESOURCE_TEMPLATE, { list: undefined }), {
    title: "Pack Legacy public website page", description: "Read an indexed product, category, material, guide, blog or other public page. This first bounded chunk contains next_read instructions for the full content and structured views.", mimeType: "application/json",
  }, async (uri, variables) => {
    let pageId: string;
    try {
      if (typeof variables.id !== "string" || uri.search || uri.hash) throw new Error("Invalid resource URI.");
      pageId = decodeURIComponent(variables.id);
      if (!pageId || pageId.length > 2048 || websiteResourceUri(pageId) !== uri.href) throw new Error("Noncanonical URI.");
    } catch { throw new ProtocolError(ProtocolErrorCode.InvalidParams, "Use the exact website resource URI returned by the content tools."); }
    try {
      const detail = await website.read({ page_id: pageId });
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(detail) }] };
    } catch (error) {
      if (error instanceof WebsiteContentError) {
        if (error.code === "WEBSITE_PAGE_NOT_FOUND") throw new ResourceNotFoundError(uri.href);
        if (error.code === "INVALID_PAGE_ID") throw new ProtocolError(ProtocolErrorCode.InvalidParams, error.message);
        throw new ProtocolError(ProtocolErrorCode.InternalError, error.message + " Check the website coverage resource for recovery.");
      }
      throw new ProtocolError(ProtocolErrorCode.InternalError, "This page is temporarily unavailable. Check website coverage or retry.");
    }
  });
}
