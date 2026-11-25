import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("jewelry-boxes");

export default function JewelryBoxesPage() {
  return <IndustryPage slug="jewelry-boxes" />;
}
