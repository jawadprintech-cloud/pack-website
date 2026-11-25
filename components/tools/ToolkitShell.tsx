// Site header and footer around a Packaging Toolkit page.
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ToolkitShell({ html, script }: { html: string; script: string }) {
  return (
    <>
      <link rel="stylesheet" href="/toolkit/toolkit.css" />
      {script.endsWith("pack-tools.js") && <link rel="stylesheet" href="/toolkit/pack-tools.css" />}
      <Header />
      <div className="brand-toolkit" dangerouslySetInnerHTML={{ __html: html }} suppressHydrationWarning />
      <Footer />
      <script src={script} defer />
    </>
  );
}
