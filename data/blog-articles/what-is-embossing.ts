import type { Article } from "./types";

// Text and images from https://packlegacy.com/blog/what-is-embossing/
const article: Article = [
  { p: "Embossing is a technique that raises a specific part of your artwork, adding a raised texture to the touch and making it more prominent. It creates a three-dimensional, raised effect on the selected areas of the artwork." },
  { p: "You have probably seen this technique in your life, done on various items, including business cards, books, and more. If you have ever run your hand over a topographical globe, you’ll feel its bumps and recesses; its raised surface feels comfortable. Embossing creates a similar effect." },
  { p: "This blog post will cover all aspects of embossing, including its procedure, advantages, and differences from debossing." },

  { h2: "The Process of Embossing" },
  { img: { src: "/pages/blog/The-Process-of-Embossing.webp", alt: "The Process of Embossing", width: 780, height: 520 } },
  { p: "Embossing involves multiple steps to produce the effect on the printing material. A printing company uses two main tools to create this effect: a die and a press." },
  { p: "Before I explain the embossing process, let’s take a closer look at how an embossing die is made." },
  { p: "Creating a die involves two metal plates, one for the front and one for the back (also called counterdies), that sandwich the paper to create the effect." },
  { p: "The following steps are involved in the process of embossing:" },
  { ul: [
    "**Prepare the Embossing Die:** The printer prepares a male and female die based on the artwork, logo, or design you want to emboss.",
    "**Place the Material Between the Dies:** The paper or packaging stock is positioned between both dies. For embossing, the female die stays on top while the male die works as the counterdie underneath.",
    "**Apply Heat and Pressure:** The machine applies controlled heat and pressure. This pushes the material into the die and creates a raised impression on the surface.",
    "**Create the Raised Design:** Once pressed, the selected logo, text, or artwork becomes raised above the surrounding surface. This is known as embossing.",
    "**Choose Blind Embossing:** If you add no ink or foil, the process is called blind embossing. The design relies only on the raised texture for its appearance.",
    "**Add Ink or Foil if Required:** You can also combine embossing with ink or metallic foil. This is commonly called registered embossing or combination embossing.",
    "**Inspect the Final Impression:** Check the finished material for proper depth, alignment, and clarity to ensure the embossed design looks clean and consistent.",
  ] },

  { h2: "Difference Between Embossing & Debossing" },
  { img: { src: "/pages/blog/Difference-Between-Embossing-Debossing.webp", alt: "Difference Between Embossing Debossing", width: 780, height: 520 } },
  { p: "Embossing and debossing are two sides of the same coin. Embossing raises the printed area above the surface, while debossing presses the design inward to create a recessed effect." },
  { p: "Here are the differences between embossing & debossing:" },
  { table: {
    head: ["Feature", "Embossing", "Debossing"],
    rows: [
      ["**Effect**", "Creates a raised design above the surface.", "Creates a pressed or recessed design into the surface."],
      ["**Appearance**", "Makes logos, text, or patterns stand out.", "Gives logos, text, or patterns an engraved appearance."],
      ["**Die Position**", "The male die pushes the material upward into the female die.", "The male die presses the material downward into the female die."],
      ["**Texture**", "Produces a noticeable raised texture.", "Produces a deep, indented texture."],
      ["**Best For**", "Logos, brand names, patterns, and premium packaging.", "Minimal logos, typography, and subtle packaging designs."],
      ["**Ink or Foil**", "Can be combined with ink or foil stamping.", "Can also be combined with ink or foil for added detail."],
      ["**Overall Look**", "Bold, prominent, and premium.", "Subtle, elegant, and sophisticated."],
    ],
  } },

  { h2: "Benefits of Using Embossing" },
  { img: { src: "/pages/blog/Benefits-of-Using-Embossing.webp", alt: "Benefits of Using Embossing", width: 780, height: 520 } },
  { p: "Embossing adds texture and depth to packaging, helping important design elements stand out while creating a more premium customer experience." },
  { ul: [
    "**Improves Brand Visibility:** Raised logos and graphics catch attention, making packaging memorable and helping customers recognize your brand easily and quickly.",
    "**Creates a Premium Feel:** Embossed details add a tactile finish that makes [custom boxes](/custom-boxes/) feel more refined, professional, and valuable.",
    "**Highlights Key Elements:** Embossing draws attention to logos, product names, patterns, or artwork without relying entirely on additional printed colors alone.",
  ] },
  { p: "By using embossing, brands can improve presentation, strengthen identity, and give packaging a premium finish customers can see and feel." },

  { h2: "Conclusion:" },
  { p: "Embossing is a practical finishing technique that adds texture, depth, and visual interest to printed materials and packaging. By raising selected design elements, it helps logos, text, and artwork stand out while creating a premium feel. Whether used alone or with ink and foil, embossing gives brands another effective way to improve presentation and strengthen overall packaging appeal for customers." },
];

export default article;
