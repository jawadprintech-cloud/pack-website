import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("soap-boxes");

export default function SoapBoxesPage() {
  return <IndustryPage slug="soap-boxes" />;
}
