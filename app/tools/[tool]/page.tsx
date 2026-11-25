import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { notFound } from "next/navigation";
import ToolkitShell from "@/components/tools/ToolkitShell";
import { toolkitPages } from "@/data/toolkit";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(toolkitPages).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params;
  const t = toolkitPages[tool];
  if (!t) return {};
  return withSeo(`/tools/${tool}/`, { title: t.title, description: t.description, alternates: { canonical: `/tools/${tool}/` } });
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const t = toolkitPages[tool];
  if (!t) notFound();
  return <ToolkitShell html={t.html} script={tool === "dimensional-weight-calculator" ? "/toolkit/dimensional-weight-calculator.js" : "/toolkit/pack-tools.js"} />;
}
