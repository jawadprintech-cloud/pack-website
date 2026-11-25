import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("display-boxes");

export default function DisplayBoxesPage() {
  return <IndustryPage slug="display-boxes" />;
}
