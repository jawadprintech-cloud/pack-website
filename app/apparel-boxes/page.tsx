import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("apparel-boxes");

export default function ApparelBoxesPage() {
  return <IndustryPage slug="apparel-boxes" />;
}