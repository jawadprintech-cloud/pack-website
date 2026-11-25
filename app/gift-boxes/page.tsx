import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("gift-boxes");

export default function GiftBoxesPage() {
  return <IndustryPage slug="gift-boxes" />;
}