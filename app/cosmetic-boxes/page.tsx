import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("cosmetic-boxes");

export default function CosmeticBoxesPage() {
  return <IndustryPage slug="cosmetic-boxes" />;
}