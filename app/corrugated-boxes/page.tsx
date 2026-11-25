import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("corrugated-boxes");

export default function CorrugatedBoxesPage() {
  return <IndustryPage slug="corrugated-boxes" />;
}
