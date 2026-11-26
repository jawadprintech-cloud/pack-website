import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import ToolkitShell from "@/components/tools/ToolkitShell";
import html from "@/data/toolkit/tools";

export const metadata: Metadata = withSeo("/tools/", {
  alternates: { canonical: "/tools/" },
  title: "Free Packaging Tools | Pack Legacy",
  description: "Use our free packaging tools to find the right sizes, weight, material, GSM, and Mylar bag sizes, and add QR codes, barcodes, and more.",
});

export default function ToolkitPage() {
  return <ToolkitShell html={html} script="/toolkit/directory.js" />;
}
