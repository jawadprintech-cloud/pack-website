import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import CategoryPage, { type ContentBlock } from "@/components/category/CategoryPage";

export const metadata: Metadata = withSeo("/custom-boxes/", {
  alternates: { canonical: "/custom-boxes/" },
  title: "Custom Boxes | Pack Legacy",
  description:
    "Custom printed boxes for every product type, with your logo and artwork. No minimums, free design support and free US shipping.",
});

// Product cards, in display order. They link to category pages; Book Boxes is a single product.
const categories = [
  { name: "Custom Mailer Boxes", href: "/mailer-boxes/", img: "/custom-boxes/images/cat-mailer.webp" },
  { name: "Custom Folding Cartons", href: "/folding-cartons/", img: "/custom-boxes/images/cat-folding.webp" },
  { name: "Custom Rigid Boxes", href: "/rigid-boxes/", img: "/custom-boxes/images/cat-rigid.webp" },
  { name: "Custom Retail Boxes", href: "/retail-boxes/", img: "/categories/Retail%20Boxes/Category%20Images/Retail-Boxes-pic.webp" },
  { name: "Custom Book Boxes", href: "/product/book-boxes/", img: "/custom-boxes/images/cat-book.webp" },
  { name: "Custom Gift Boxes", href: "/gift-boxes/", img: "/custom-boxes/images/cat-gift.webp" },
  { name: "Custom Jewelry Boxes", href: "/jewelry-boxes/", img: "/categories/Jewelry%20Boxes/Category%20Images/Custom-Jewelry-Box.webp" },
  { name: "Custom Cosmetics Boxes", href: "/cosmetic-boxes/", img: "/custom-boxes/images/cat-cosmetic.webp" },
  { name: "Custom Candle Boxes", href: "/candle-boxes/", img: "/categories/Candle%20Boxes/Category%20Images/Candle-Boxes.webp" },
  { name: "Custom Soap Boxes", href: "/soap-boxes/", img: "/products/Custom-Soap-Boxes.webp" },
  { name: "Custom CBD Boxes", href: "/cbd-boxes/", img: "/custom-boxes/images/cat-cbd.webp" },
  { name: "Custom Bakery Boxes", href: "/bakery-boxes/", img: "/custom-boxes/images/cat-bakery.webp" },
];

// Copy from "Custom Boxes.pdf" (November 2026). `after` keeps every paragraph above the list.
const blocks: ContentBlock[] = [
  {
    title: "Custom Printed Boxes That Protect and Promote Your Products",
    paragraphs: [
      "Custom boxes do more than protect your products. They help showcase your brand, attract customers, and create a better unboxing experience. Whether you sell products in retail stores or ship orders directly to customers, the right packaging makes a difference.",
      "We offer custom box printing with your choice of colors, artwork, and logo. You can also get a free digital proof to review your design before production.",
      "Whether you need a single box or bulk packaging, we offer custom printed boxes with no minimum order quantity.",
    ],
  },
  {
    title: "3 Main Types of Custom Boxes",
    paragraphs: [
      "When it comes to custom packaging boxes, three main types suit different business needs.",
      "Here are the 3 main types of custom boxes:",
      <><strong><a className="cb-inline-link" href="/folding-cartons/">Folding Cartons</a>:</strong> Display and package cosmetics, candles, gifts, and other retail products with folding carton paperboard boxes. These boxes are easy to assemble and can be printed to match your brand.</>,
      <><strong><a className="cb-inline-link" href="/mailer-boxes/">Custom Mailer Boxes</a>:</strong> Ship e-commerce orders in sturdy corrugated mailer boxes. Available in white or brown kraft, these boxes protect your products while giving you space to showcase your branding.</>,
      <><strong><a className="cb-inline-link" href="/rigid-boxes/">Custom Rigid Boxes</a>:</strong> Pack luxury gifts, jewelry, cosmetics, and other premium products in sturdy custom rigid boxes. Choose from magnetic closure, two-piece, drawer, and shoulder-neck styles with custom printing and finishes to match your brand.</>,
    ],
  },
  {
    title: "Benefits of Using Custom Boxes",
    paragraphs: [
      "Custom boxes offer a variety of benefits beyond standard packaging. They are a perfect solution for your brand and offer opportunities for unique and memorable branding.",
      "Here are some of the key benefits of using custom boxes.",
    ],
    bullets: [
      ["Build Brand Recognition:", "Custom boxes let you add your logo, brand colors, and message to your packaging. This helps customers recognize your brand."],
      ["Keep Products Safe:", "Custom boxes are made to fit your products. They help prevent damage during storage, handling, and shipping."],
      ["Choose Sustainable Materials:", "You can select recyclable, biodegradable, or responsibly sourced materials to reduce packaging waste and meet customer preferences."],
      ["Improve the Unboxing Experience:", "Well-designed custom boxes with logos make products look more appealing and give customers a memorable unboxing experience."],
    ],
    after: [],
  },
  {
    title: "Industries That Use Custom Printed Boxes",
    paragraphs: [
      "Many industries use custom printed boxes to protect products, promote brands, and improve presentation. Some common industries include:",
    ],
    bullets: [
      ["Retail:", "Retail brands use custom packaging boxes to display their products, attract customers, and build brand recognition."],
      ["E-commerce:", "Online businesses use custom boxes to protect products during shipping and create a better unboxing experience."],
      ["Food and Beverage:", "Food businesses use custom packaging to keep products fresh, protect them from damage, and promote their brand."],
      ["Electronics:", "Electronics brands use custom product boxes to keep delicate items secure, organize accessories, and display product details."],
    ],
    after: [
      "Businesses across these industries can customize their boxes with different sizes, shapes, materials, printing options, and designs to meet their packaging needs.",
    ],
  },
  {
    title: "Steps to Design Custom Packaging Boxes",
    paragraphs: [
      "We understand how important it is to design the perfect custom packaging boxes, which requires careful attention to many factors.",
      "Here are the essential steps that you must use when designing custom boxes:",
    ],
    bullets: [
      ["Know Your Product:", "Consider your product's size, shape, and weight before designing custom boxes. This helps you choose packaging that fits well and keeps the product secure."],
      ["Select Suitable Materials:", "Choose packaging materials based on your product's needs, shipping conditions, and budget. Common options include cardboard, kraft, corrugated, and rigid stock."],
      ["Add Your Brand Details:", "Use your brand colors, logo, and message in the box design. Keep the artwork clear and consistent with your brand identity."],
      ["Consider Sustainable Packaging:", "Choose recyclable, biodegradable, or responsibly sourced materials where suitable. You can also reduce packaging waste by using the right box size and avoiding excess materials."],
    ],
    after: [],
  },
  {
    title: "Order Wholesale Custom Boxes From Pack Legacy",
    paragraphs: [
      "We provide wholesale custom boxes for businesses of all sizes. With us, you can get your customized boxes at competitive prices, making it affordable for both startups and enterprises.",
      "Here’s why brands choose us:",
    ],
    list: ["No Minimum Order Quantity", "Wholesale Prices", "Fast Turnaround", "3D Design Tool", "Free Design Support", "Free Shipping"],
    after: [
      "Ready to order? Get in touch today to start customizing your boxes at wholesale rates with free shipping.",
    ],
  },
];

const faqs = [
  { q: "What are custom boxes?", a: "Custom boxes are specialized containers that help to advertise, protect, and ship your products effectively. You can print them with your branded artwork and custom logo to strengthen your brand identity." },
  { q: "How do I choose the right box size for my custom box?", a: "To determine your box size, measure your product's widest side for width, longest side for length, and tallest side for height. Once you have these measurements, add a few inches (e.g., 0.25 inches) to allow room for fit and any packaging fillers. You can also read our full guide on measuring your box dimensions for more detail." },
  { q: "What are the most popular types of custom boxes?", a: "The most popular types of custom boxes are folding cartons for retail products, mailer boxes for shipping ecommerce products, and rigid boxes for showcasing and protecting luxury or premium items." },
  { q: "Which custom box is perfect for shipping ecommerce items?", a: "For shipping ecommerce items, custom corrugated boxes are the best choice. The most popular choice for shipping ecommerce products is a mailer box, as it is made from corrugated materials and can protect your product while leaving a lasting impression with each delivery." },
  { q: "Can I order a sample of my custom box?", a: "Absolutely. You can order a sample of your custom box to check the material quality, printing, finishing, and size. If you are satisfied with the result, we will start manufacturing the rest of your order." },
  { q: "How does ordering custom boxes benefit my small business?", a: "Ordering custom boxes from Pack Legacy can benefit your small business. We offer no minimum order, no setup fees, and no die-plate charges, making it cost-effective and easy for small businesses to order from us." },
  { q: "Which sides are printable on my box?", a: "Your box sides are fully customizable. You can choose where you want your artwork printed, such as the inside, outside, or both sides. If you need a plain custom box, we can provide that too." },
  { q: "Do you also offer custom box inserts?", a: "Yes. We do offer custom box inserts, such as EVA foam inserts, cardboard inserts, corrugated box dividers, and packaging card inserts. You can customize your box insert size as per your product size requirements." },
  { q: "How much do custom boxes cost?", a: "Custom box pricing depends on several factors, including size, material, style, and design complexity. There is also no extra charge for additional color prints." },
  {
    q: "Can you help me with designing my box artwork?",
    a: (
      <>
        Yes. We offer dedicated design support to help you with your custom box artwork. Also, if you require a dieline
        template for your box, please visit our <a href="/free-dieline-templates/">free dieline template</a> page. Or you
        can also use our 3D packaging design tool to design your custom box in real time with a 3D preview.
      </>
    ),
  },
];

export default function CustomBoxesPage() {
  return (
    <CategoryPage
      crumb="Custom boxes"
      h1="Custom Boxes"
      intro={[
        "Impress customers and enhance the unboxing experience with custom boxes for every product type. Design custom boxes to match your product’s unique needs, and print them with your brand logo and essential information.",
      ]}
      strong="Request a custom quote for your custom-printed boxes and bring your packaging ideas to life with designs tailored to your products and brand."
      grid={{
        title: "Explore All Custom Boxes",
        intro: "Explore our custom packaging box solutions designed to meet every industry's unique demands.",
        cards: categories,
      }}
      why={{
        title: "Why Choose Pack Legacy For Custom Boxes?",
        intro: "Pack Legacy is a leading custom box manufacturer and a top choice for brands to order custom boxes at wholesale rates. Choosing us as your packaging partner gives you various benefits, such as:",
        reorder: true,
        headings: true,
      }}
      content={{
        title: "Custom Boxes for Every Business Need",
        intro: [
          "Design custom boxes that showcase your brand while keeping your product safe and secure. You might have a great product, but if its packaging isn't visually strong, it may not represent your brand well.",
          "Custom printed boxes can help customers recognize your products, understand their value, and remember your brand. A well-designed box can also create a better unboxing experience and make your products more appealing on store shelves and in online product photos.",
        ],
        blocks,
        blockHeading: "h2",
      }}
      faqTitle={<>Frequently <em>Asked</em> Question</>}
      maxFaqs={faqs.length}
      faqs={faqs}
    />
  );
}
