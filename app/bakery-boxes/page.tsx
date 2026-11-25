import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("bakery-boxes");

export default function BakeryBoxesPage() {
  return <IndustryPage slug="bakery-boxes" />;
}