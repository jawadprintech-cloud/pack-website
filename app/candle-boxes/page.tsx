import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("candle-boxes");

export default function CandleBoxesPage() {
  return <IndustryPage slug="candle-boxes" />;
}
