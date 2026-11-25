// Pages created in the dashboard (data/custom-pages.json), rendered by app/[slug]/page.tsx.
import type { Article } from "@/data/blog-articles/types";
import pages from "@/data/custom-pages.json";

export type CustomPage = { slug: string; title: string; description: string; image: string; lead: string; blocks: Article };
export const customPages = pages as unknown as CustomPage[];
