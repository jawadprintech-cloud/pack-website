import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("retail-boxes");

export default function RetailBoxesPage() {
  return <IndustryPage slug="retail-boxes" />;
}