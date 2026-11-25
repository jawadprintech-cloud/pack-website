import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { CONTACT, CtaBand, FaqList, FaqSchema, Icons, InfoShell, PageHero, QUOTE_HREF } from "@/components/info/InfoParts";

export const metadata: Metadata = withSeo("/faqs/", {
  alternates: { canonical: "/faqs/" },
  title: "Frequently Asked Questions | Pack Legacy",
  description: "Answers about custom box pricing, minimum order, artwork files, printing, samples, sizing, shipping and turnaround at Pack Legacy.",
});

// Text from https://packlegacy.com/faqs/
const faqs = [
  { q: "How much is the price for a custom box? And what factors affect the pricing?", a: "The price of a custom box varies depending on factors such as the material, size, and customization. However, our custom boxes are affordable and competitive." },
  { q: "How many minimum boxes should I order?", a: "We have no minimum order quantity requirement; you can order as many boxes as you need." },
  { q: "In which file format should I send my artwork for the box?", a: "You can send your artwork to us in AI, PSD, or PDF format." },
  { q: "Can my box be printed on the inside and outside?", a: "Yes, we can print your box on the inside, outside, and both (inside & outside)." },
  { q: "How do I choose the right packaging material for my product?", a: "To choose the right packaging material, consider your product’s size, shape, weight, fragility, and shelf life. Cardboard is typically a flexible choice for custom packaging due to its strength, affordability, and recyclability." },
  { q: "Can I order a sample before placing a bulk order for my custom box?", a: "Yes, you can contact our customer representative to order a box sample." },
  { q: "Will you help me get the right size for my box?", a: "Yes, our packaging team will help you get the right size for your box by measuring the size and dimensions of your product." },
  { q: "Do you ship to countries other than the United States?", a: "Yes, we ship to countries other than the US, including the United Kingdom, Australia, and Canada." },
  { q: "Do I have to pay for any hidden fees? What about die and plate costs?", a: "No, we don’t charge our clients any hidden fees, and you will not have to pay for die and plate costs, either." },
  { q: "When will I receive my custom box order?", a: "We typically complete orders within 8 to 12 business days. If you need a rush order, you can discuss it with us." },
  { q: "Do you provide eco-friendly options?", a: "Yes, we use materials like kraft, paperboard, and cardboard for eco-friendly custom boxes." },
  { q: "Do I have to pay the shipping fee?", a: "No, you don’t have to pay the shipping fee, as we provide fast and free shipping to deliver custom boxes to your doorstep." },
];

export default function FaqsPage() {
  return (
    <InfoShell>
      <FaqSchema items={faqs.map((f) => ({ q: f.q, text: f.a }))} />
      <PageHero
        crumb="FAQs"
        eyebrow="Help center"
        title={<>Frequently <em>Asked</em> Questions</>}
        lead="We’ve answered all the common questions you may have before ordering a custom box."
      />
      <section className="ip-section" aria-label="Questions and answers">
        <div className="ip-wrap ip-faq-layout">
          <FaqList items={faqs} />
          <aside className="ip-aside" aria-labelledby="aside-h">
            <h2 id="aside-h">Still have a question?</h2>
            <p>Our packaging specialists reply quickly and are happy to help with sizing, materials and artwork.</p>
            <ul>
              <li><a href={`mailto:${CONTACT.email}`}><Icons.mail size={18} />{CONTACT.email}</a></li>
              <li><a href={`tel:${CONTACT.tel}`}><Icons.phone size={18} />{CONTACT.phone}</a></li>
              <li><a href="/how-to-order/"><Icons.box size={18} />How to order</a></li>
              <li><a href="/track-your-order/"><Icons.truck size={18} />Track your order</a></li>
            </ul>
            <a className="ip-btn ip-btn-red" href={QUOTE_HREF}>Get a free quote <Icons.arrow size={16} /></a>
          </aside>
        </div>
      </section>
      <CtaBand />
    </InfoShell>
  );
}
