import type { Article } from "./types";

// Text and images from https://packlegacy.com/blog/paper-weight-chart-with-conversion-calculator/
const article: Article = [
  { p: "Paper weight can be a confusing topic, especially when you are dealing with multiple measurements at once. With so many manufacturers and box suppliers using their own specific measurement units, buyers can be confused about paper weight and thickness." },
  { p: "In this guide, we will explain each unit that gets used by manufacturers when specifying paper weight and thickness, such as PT, LBS, and GSM." },
  { p: "Let’s dive in." },

  { h2: "What is PT in Paper Weight & Thickness?" },
  { p: "PT stands for points and is a unit of measurement for paper thickness or caliper. It is mainly used by box manufacturers and suppliers in North America. The one point equals 1/1000th of an inch (0.001”). The thicker the material, the sturdier and more rigid it is." },
  { p: "For example, 10pt of material is 0.010 inches thick, while a 16pt material is 0.016 inches thick." },

  { h2: "What is LBS in Paper Weight & Thickness?" },
  { p: "LBS stands for pounds and refers to the weight of paper used in packaging, newspapers, flyers, and more. The heavier the weight, the thicker your printing paper will be." },
  { p: "Also, the thickness can vary depending on the paper material used in manufacturing. For example, 60lb text paper is much lighter and thinner than 60lb cover paper because their sizes differ." },

  { h2: "What is GSM in Paper Weight & Thickness?" },
  { p: "GSM stands for Grams per Square Meter. It refers to a metric that represents the weight of the paper, where higher numbers indicate greater thickness. GSM is an international standard for measuring paper density. 80-100 gsm indicates the standard paper, whereas 300+ gsm indicates the heavier cardstock." },
  { p: "Now that you know about measuring units that get used by packaging companies, let’s talk about the paper types and their paper weight chart conversions." },

  { h2: "Calculate GSM In Real Time With Our Calculator" },
  { p: "Calculate GSM in real time using this calculator. Easily convert PT and lbs to GSM for all types of paper stock." },
  { calc: "gsm" },

  { h2: "Types of Paper" },
  { img: { src: "/images/types-of-paper.webp", alt: "Types of Paper", width: 780, height: 520 } },
  { p: "There are a lot of paper materials available in the market, but the most common ones that are used for the printing job are as follows:" },
  { ul: [
    "Text Stock",
    "Uncoated Stock",
    "Coated Stock",
  ] },

  { h2: "What Is Text Stock & Its Paper Weight Chart?" },
  { p: "Text stock is a type of paper used for printing books, magazines, flyers, brochures, and other lightweight printed materials. It is a lighter paper stock compared to uncoated and coated stock options available in the market." },
  { p: "Text stock usually gets measured in PT and GSM, and we have provided the table of conversion below for a better understanding:" },
  { table: {
    head: ["Text Stock in PT Units", "Text Stock in GSM Units"],
    rows: [
      ["10 pt", "~60 GSM"],
      ["12 pt", "~72 GSM"],
      ["14 pt", "~84 GSM"],
      ["16 pt", "~96 GSM"],
      ["18 pt", "~108 GSM"],
    ],
  } },
  { p: "Although there is no defined formula for calculating PT to GSM, this will give you an approx GSM conversion of your text stock measured in PT." },
  { ul: [
    "GSM ≈ PT X (600)/100",
    "Let’s take 24pt text stock as an example",
    "GSM ≈ 24 X (600)/100 ≈ 144",
  ] },
  { p: "Using the above formula will allow you to calculate the approx GSM of text stock material." },

  { h2: "What is Uncoated Stock & Its Paper Weight Chart?" },
  { p: "Uncoated stock is a type of paper used to manufacture boxes, business cards, and more. It is perfect for printing packaging designs. This material is highly durable compared to text stock, which makes it ideal for manufacturing [custom boxes](/custom-boxes/)." },
  { p: "Uncoated paper stock usually gets measured in PT; however, we have provided the conversion table to GSM as well, below:" },
  { table: {
    head: ["Uncoated Stock in PT Units", "Uncoated Stock in GSM Units"],
    rows: [
      ["10 pt", "~140 GSM"],
      ["12 pt", "~168 GSM"],
      ["14 pt", "~196 GSM"],
      ["16 pt", "~224 GSM"],
      ["18 pt", "~252 GSM"],
    ],
  } },
  { p: "Why does it differ from the text stock? Due to its thickness. Here’s how you can calculate the GSM of your uncoated stock if you have PT units defined:" },
  { ul: [
    "GSM ≈ PT X (1400)/100",
    "Lets 20 pt as an example",
    "GSM ≈ 20 X (1400)/100 ≈ 280 GSM",
  ] },

  { h2: "What is Coated Stock & Its Paper Weight Chart?" },
  { p: "Coated Stock is the most durable and heaviest material. It comes in two variations: C1S and C2S. C1S refers to material with one coated side, whereas C2S has both sides coated with lamination for better protection." },
  { h3: "Conversion Table of C1S PT to GSM" },
  { table: {
    head: ["C1S Stock in PT Units", "C1S Stock in GSM Units"],
    rows: [
      ["10 pt", "~150 GSM"],
      ["12 pt", "~180 GSM"],
      ["14 pt", "~210 GSM"],
      ["16 pt", "~240 GSM"],
      ["18 pt", "~270 GSM"],
    ],
  } },
  { p: "To calculate the GSM for your C1S stock, you must add the coated adjustment of 100. Here is the formula of PT to GSM for C1S Stock:" },
  { p: "GSM ≈ PT X (1400 + C)/100" },
  { p: "Let’s take 20 pt as an example, and C refers to the coated adjustment." },
  { p: "GSM ≈ 20 X (1400 + 100)/100" },
  { p: "GSM ≈ 300 GSM" },
  { h3: "Conversion Table of C2S PT to GSM" },
  { table: {
    head: ["C2S Stock in PT Units", "C2S Stock in GSM Units"],
    rows: [
      ["10 pt", "~165 GSM"],
      ["12 pt", "~198 GSM"],
      ["14 pt", "~231 GSM"],
      ["16 pt", "~264 GSM"],
      ["18 pt", "~297 GSM"],
    ],
  } },
  { p: "To calculate the GSM for your C2S stock, you must add coated adjustments, such as a medium adjustment of 100 and a high adjustment of 150. Here is the formula of PT to GSM for C2S Stock:" },
  { p: "GSM ≈ PT X (1400 + C₁ + C₂)/100" },
  { p: "Let’s take 20 pt as an example, and C₁ and C₂refers to the coated adjustment." },
  { p: "GSM ≈ 20 X (1400 + 100 + 150)/100" },
  { p: "GSM ≈ 330 GSM" },
  { p: "Now that you have learned how to convert paper stock options into GSM when you have defined units for PT, what about LBS? Not to worry, we’ve got you covered." },

  { h2: "How To Convert LBS to GSM?" },
  { p: "Converting LBS (Pounds) to GSM (Gram Per Square Meter) isn’t as complicated as PT units. You can easily convert lbs to GSM by using the following formula:" },
  { p: "For Text Stock: GSM ≈ lbs X 1.48" },
  { p: "For Coated Stock: GSM ≈ lbs X 2.71" },
  { p: "Here is the table of conversion from lbs to GSM for a better understanding:" },
  { table: {
    head: ["Coated & Text Stock in lbs", "Text Stock in GSM", "Coated Stock in GSM Units"],
    rows: [
      ["54 lbs", "~80", "~146"],
      ["61 lbs", "~90", "~165"],
      ["68 lbs", "~100", "~184"],
      ["82 lbs", "~121", "~222"],
      ["101 lbs", "~150", "~274"],
    ],
  } },
  { p: "Now you can easily convert lb to GSM using this method. If you still have any questions, feel free to connect with our experts through live chat support." },
  { p: "Note: All calculated values are approximate and may slightly vary from the exact GSM measured using the scaling method." },
];

export default article;
