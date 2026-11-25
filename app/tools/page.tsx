import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import ToolkitShell from "@/components/tools/ToolkitShell";
import html from "@/data/toolkit/tools";

export const metadata: Metadata = withSeo("/tools/", {
  alternates: { canonical: "/tools/" },
  title: "Packaging Toolkit | Pack Legacy",
  description: "Find free Pack Legacy tools for box sizing, shipping, materials, printing, and storage.",
});

export default function ToolkitPage() {
  return <ToolkitShell html={html} script="/toolkit/directory.js" />;
}
