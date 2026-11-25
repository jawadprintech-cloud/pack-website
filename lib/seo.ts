// Per-page SEO settings saved by the dashboard (data/seo-overrides.json). Blank values keep what the page's own code says.
import type { Metadata } from "next";
import overrides from "@/data/seo-overrides.json";

export type SeoOverride = {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
};
export const seoOverrides = overrides as Record<string, SeoOverride>;
export const isNoindex = (path: string) => !!seoOverrides[path]?.noindex;

export function withSeo(path: string, base: Metadata): Metadata {
  const o = seoOverrides[path];
  if (!o) return base;
  const m: Metadata = { ...base };
  if (o.title) m.title = o.title;
  if (o.description) m.description = o.description;
  if (o.keywords) m.keywords = o.keywords;
  if (o.canonical) m.alternates = { ...base.alternates, canonical: o.canonical };
  if (o.noindex) m.robots = { index: false, follow: true };
  const ogTitle = o.ogTitle || o.title;
  const ogDescription = o.ogDescription || o.description;
  if (ogTitle || ogDescription || o.ogImage || base.openGraph) {
    m.openGraph = {
      url: path,
      title: m.title ?? undefined,
      description: m.description ?? undefined,
      ...base.openGraph,
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(ogDescription ? { description: ogDescription } : {}),
      ...(o.ogImage ? { images: [o.ogImage] } : {}),
    } as Metadata["openGraph"];
  }
  if (o.ogImage) m.twitter = { card: "summary_large_image", images: [o.ogImage], ...(ogTitle ? { title: ogTitle } : {}), ...(ogDescription ? { description: ogDescription } : {}) };
  return m;
}
