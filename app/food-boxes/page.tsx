import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("food-boxes");

export default function FoodBoxesPage() {
  return <IndustryPage slug="food-boxes" />;
}