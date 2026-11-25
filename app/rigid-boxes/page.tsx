import IndustryPage, { industryMetadata } from "@/components/category/IndustryPage";

export const metadata = industryMetadata("rigid-boxes");

export default function RigidBoxesPage() {
  return <IndustryPage slug="rigid-boxes" />;
}
