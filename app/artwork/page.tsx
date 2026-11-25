import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { PolicyPage, QUOTE_HREF } from "@/components/info/InfoParts";

// Text from https://packlegacy.com/artwork/
export const metadata: Metadata = withSeo("/artwork/", {
  alternates: { canonical: "/artwork/" },
  title: "Artwork Guidelines | Pack Legacy",
  description:
    "Prepare print-ready artwork for custom packaging: CMYK color, 300 DPI resolution, readable fonts, the right file formats, organized layers and dieline alignment.",
});

const sections = [
  {
    id: "color-mode",
    title: "Color Mode",
    body: (
      <>
        <p>Select the right color mode/color profile for your artwork. Each color format has its own characteristics. By default, the color profile is set to RGB, which differs from printing. You have to change the color profile to CMYK to ensure color accuracy and make your artwork file printable on boxes.</p>
        <p>This is how you can change color profile for your artwork in Adobe:</p>
        <ul>
          <li>Go to File in Menu Bar &gt; Document Color Mode &gt; CMYK Color to change your document’s color mode.</li>
        </ul>
      </>
    ),
  },
  {
    id: "fonts",
    title: "Fonts & Text",
    body: (
      <>
        <p>It’s important to keep your text simple and clear in your artwork. Here’s how you can keep your text readable and clear. Choose the font size 9. Plus, when designing your packaging artwork, make sure that you use the readable font style, as cursive-style fonts do not look great on packaging.</p>
      </>
    ),
  },
  {
    id: "file-formats",
    title: "File formats",
    body: (
      <>
        <p>Artwork files should be submitted in high-resolution, print-ready formats such as PDF, TIFF, or EPS to preserve their quality and integrity during printing. If your design includes images or non-vector elements, you can provide them as high-resolution JPEG or PNG files with a minimum resolution of 300 dots per inch (DPI) to ensure optimal print clarity.</p>
      </>
    ),
  },
  {
    id: "resolution",
    title: "Resolution",
    body: (
      <>
        <p>To achieve high-quality results, ensure your artwork is at a minimum resolution of 300 dots per inch (DPI). This resolution maintains clarity and sharpness in your prints, especially for detailed designs and small text. Files with lower resolution can lead to pixelation, blurriness, and an unprofessional appearance. Always check the resolution before submission to avoid print quality issues.</p>
      </>
    ),
  },
  {
    id: "organization",
    title: "File Organization",
    body: (
      <>
        <p>Organize artwork files in a clear, structured manner by using separate layers for different elements such as text, images, and backgrounds. Apply consistent and descriptive naming conventions for each layer to avoid confusion and ensure the correct elements are accurately processed during printing.</p>
      </>
    ),
  },
  {
    id: "dieline",
    title: "Dieline",
    body: (
      <>
        <p>Select the correct dieline for your box and <a href="/free-dieline-templates/">download it</a>. Your artwork must align with the dieline, keeping key elements within the safe area and extending the background to the bleed line. This guarantees accurate cutting and prevents design errors during production.</p>
        <p><a className="ip-btn ip-btn-red" href={QUOTE_HREF}>Get Instant Quote</a></p>
      </>
    ),
  },
];

export default function ArtworkPage() {
  return (
    <PolicyPage
      crumb="Artwork"
      title={<>Artwork <em>Guidelines</em></>}
      lead="Ensure your artwork is printed accurately on your custom packaging & boxes. We have curated a guide on how you can make a perfect, ready-to-print artwork file."
      sections={sections}
    />
  );
}
