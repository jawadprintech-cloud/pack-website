import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("custom-paper-bags");

export default function CustomPaperBagsPage() {
  return <IndustryPage slug="custom-paper-bags" />;
}
