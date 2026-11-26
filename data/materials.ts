// Materials & Options Library, from https://packlegacy.com/materials/. Images are in public/pages/materials/.
export type Material = { name: string; image: string; text: string; tag?: string };
export type MaterialGroup = { id: string; title: string; intro: string; items: Material[] };

const m = (name: string, file: string, text: string, tag?: string): Material => ({ name, image: file, text, tag });

export const materialGroups: MaterialGroup[] = [
  {
    id: "paperboard",
    title: "Paperboard Materials",
    intro: "Lightweight, printable boards for folding cartons, retail boxes and product packaging.",
    items: [
      m("SBS C1S", "/images/sbs-c1s.webp", "Bleached white paperboard with a smooth surface and one side glossy coated, excellent for printing.", "Coated 1 side"),
      m("SBS C2S", "/images/sbs-c2s.webp", "Premium, solid bleached paperboard recognized for its superior quality and durability, coated on both sides.", "Coated 2 sides"),
      m("CCNB", "/images/ccnb.webp", "Recyclable paperboard made with a top layer of white clay coating, ideal for high-resolution printing.", "Recyclable"),
      m("Fully Recycled CCNB", "/images/fully-recycled-ccnb.webp", "A sustainable paperboard made from 100% recycled fibers featuring white clay coating for smooth printing.", "100% recycled"),
      m("Natural Brown Kraft", "/images/natural-brown-kraft.webp", "A recyclable material made from a mixture of virgin pulp and recycled paper, coated on both sides.", "Eco-friendly"),
      m("White Kraft", "/images/white-kraft.webp", "Eco-friendly kraft with a sleek, white surface, famous for its strength and flexibility, coated on both sides.", "Eco-friendly"),
      m("Black Kraft", "/images/black-kraft.webp", "Black-colored kraft material, made from a combination of virgin pulp and recycled paper, can be coated on both sides."),
      m("Uncoated Unbleached Kraft", "/images/uncoated-unbleached-kraft.webp", "Unbleached, lightweight kraft, famous for its durability and tear-resistant properties; no coating on both sides.", "Uncoated"),
      m("CCK (Clay Coated Kraft Back)", "/images/cck-clay-coated-kraft-back.webp", "Recyclable kraft with a white clay-coated front side for high-quality printing and a brown-colored back side."),
      m("CNK (Clay Natural Kraft)", "/images/cnk-clay-natural-kraft.webp", "Sustainable material crafted with a minimum of 80% virgin unbleached wood pulp, one-sided printing."),
      m("Metallic", "/images/metallic-paper.webp", "High-end material with a glossy or matte metallic laminated surface featuring water-resistant & wear-resistant.", "Premium"),
      m("Holographic", "/images/holographic.webp", "Glossy or matte holographic laminated paper that creates a three-dimensional effect.", "Premium"),
      m("Textured", "/images/textured.webp", "Premium paper stock with a raised surface adds tactile and visual appeal to packaging.", "Premium"),
    ],
  },
  {
    id: "corrugated",
    title: "Corrugated Materials",
    intro: "Liner boards for mailer and shipping boxes that need extra strength.",
    items: [
      m("Bleached White Board", "/images/bleached-white-board.webp", "Bleached kraft linerboard is known for its bright white finish, which makes colors appear more vibrant."),
      m("Kemi White Board", "/images/kemi-white-board.webp", "A semi-gloss-coated, brilliant white C1S linerboard on one side, perfect for high-quality printing."),
      m("Natural Kraft Board", "/images/natural-kraft-board.webp", "Naturally brown-colored kraft linerboard, uncoated and unbleached with optimal durability and recyclability, perfect for shipping.", "Recyclable"),
      m("Oyster White", "/images/oyster-white.webp", "A durable clay-coated linerboard with a bleached, textured off-white surface for high-resolution printing."),
    ],
  },
  {
    id: "flutes",
    title: "Flute Grades",
    intro: "Flutes are the wavy layers inside corrugated board. Thicker flutes cushion more; thinner flutes print better.",
    items: [
      m("A-Flute", "/images/a-flute.webp", "1/4 inch thick, best for stacking, greatest cushioning for fragile products.", '1/4"'),
      m("B Flute", "/images/bflute.webp", "1/8 inch thick, flat surface for higher-quality printing and die cutting.", '1/8"'),
      m("C Flute", "/images/c-flute.webp", "3/16 inch thick, perfect for shipping, excellent for die-cutting & high printing.", '3/16"'),
      m("E Flute", "/images/e-flute.webp", "1/16 inch thick, a strong alternative for paperboard folding cartons.", '1/16"'),
      m("F Flutes", "/images/f-flutes.webp", "1/32 thick, ideal for specialty packaging & point-of-purchase displays.", '1/32"'),
      m("Single Face", "/images/single-face.webp", "One piece of fiberboard glued to one flat sheet of liner board."),
      m("Single Wall", "/images/single-wall.webp", "Three layers of paper are glued together using starch to form a single, sturdy linerboard."),
      m("Double", "/images/double.webp", "Two layers of corrugated (flutes), with a liner board facing between them."),
      m("Triple", "/images/triple.webp", "Three layers of fluted corrugated sandwiched between four layers of flat linerboard."),
    ],
  },
  {
    id: "rigid",
    title: "Rigid Materials",
    intro: "Thick chipboard for luxury rigid, magnetic and drawer boxes.",
    items: [
      m("Duplex Chipboard", "/images/duplex-chipboard-materials.webp", "Made from two layers of bleached chemical pulp, famous for its strength and cost-effectiveness."),
      m("Grey Chipboard", "/images/grey-chipboard-materials.webp", "A thick paperboard made from recycled materials, perfect for producing rigid boxes.", "Recycled"),
    ],
  },
  {
    id: "special",
    title: "Special Qualifications",
    intro: "Extras that make your packaging feel finished and exclusive.",
    items: [
      m("Accessory Collections", "/images/accessory-collections.webp", "Custom accessory collections, including handles to make exclusive packaging."),
      m("Custom Insert", "/images/custom-insert.webp", "Perfectly designed custom inserts for optimum product protection."),
      m("Custom Ribbons", "/images/custom-ribbons.webp", "Beautify your packaging with unlimited custom ribbons."),
      m("Custom Structures", "/images/custom-structures.webp", "Customized rigid structures made for your packaging needs."),
      m("Paper Collections", "/images/paper-collections.webp", "A wide range of colored paper & textured to design ideal packaging."),
    ],
  },
  {
    id: "inserts",
    title: "Insert Materials",
    intro: "Keep products secure and beautifully presented inside the box.",
    items: [
      m("Cardboard Inserts", "/images/cardboard-inserts-materials.webp", "Custom-cut cardboard placed inside a packaging box for better protection.", "Recyclable"),
      m("EVA Foam", "/images/eva-foam-materials.webp", "Flexible and lightweight material with excellent shock-absorbing properties."),
    ],
  },
  {
    id: "bags",
    title: "Bag Materials",
    intro: "Paper stocks for custom printed shopping and gift bags.",
    items: [
      m("CCNB", "/images/ccnb-1.webp", "Recyclable paperboard made with a top layer of white clay coating, ideal for high-resolution printing."),
      m("Holographic", "/images/holographic-1.webp", "Glossy or matte holographic laminated paper that creates a three-dimensional effect."),
      m("Metallic Paper", "/images/metallic-paper-1.webp", "A glossy or matte metallic laminated material featuring water-resistant and wear-resistant."),
      m("Natural Brown Kraft", "/images/natural-brown-kraft-1.webp", "A recyclable material made from a mixture of virgin pulp and recycled paper, coated on both sides."),
      m("SBS C1S", "/images/sbs-c1s-1.webp", "Bleached white paperboard with a smooth surface and one side glossy coated, excellent for printing."),
      m("Textured", "/images/textured-1.webp", "Premium paper stock with a raised surface that adds visual appeal to packaging."),
      m("White Kraft", "/images/white-kraft-1.webp", "Eco-friendly kraft with a white surface coated on both sides, famous for its strength & flexibility."),
    ],
  },
  {
    id: "mylar",
    title: "Mylar Bag Materials",
    intro: "Films for food, coffee and CBD pouches that need a strong barrier.",
    items: [
      m("Metalized Film", "/images/metalized-filmz.webp", "Metalized polyester with a very lightweight structure and is resistant to punctures and tears."),
      m("White Film", "/images/white-film.webp", "Durable Mylar polyester film, popularly known for its strong and protective nature."),
    ],
  },
  {
    id: "coatings",
    title: "Coatings & Laminations",
    intro: "Protect your print and change how your box looks and feels.",
    items: [
      m("Varnish", "/images/varnish-materials.webp", "A clear ink applied with the CMYK method to enhance color; available in gloss & matte."),
      m("Aqueous Coating", "/images/aqueous-coating.webp", "Water-based, environmentally friendly coating that dries quickly when applied to printed materials.", "Eco-friendly"),
      m("Soft Touch Coating", "/images/soft-touch-coating.webp", "A fast-drying coating that creates a velvety texture, enhancing the visual appeal."),
      m("Soft Touch Lamination", "/images/soft-touch-lamination.webp", "A protective finish with a matte effect and a velvet texture creates an appealing surface."),
      m("Spot UV", "/images/spot-uv-materials.webp", "A flexible coating technique applied to a specific area and cured by UV light."),
      m("UV Coating", "/images/uv-coating.webp", "Instantly dried matte or glossy coating cured by UV light, protecting the underlying material."),
      m("Lamination", "/images/lamination.webp", "Covering the packaging with a thin plastic coating to improve the overall appearance."),
    ],
  },
  {
    id: "finishes",
    title: "Premium Finishes",
    intro: "Add-ons that make your logo shine, rise or reveal what is inside.",
    items: [
      m("Cold Foil Stamping", "/images/cold-foil-stamping.webp", "A UV-curable adhesive printed onto the substrate to create a high-end and elegant look."),
      m("Hot Foil Stamping", "/images/hot-foiling.webp", "A printing technique with heat, die plate, and a metallic foil to create a shiny design."),
      m("Emboss", "/images/embosszz.webp", "A printing technique that creates raised designs, adding texture and dimension to the packaging."),
      m("Deboss", "/images/deboos.webp", "A printing technique that creates recessed designs, adding a more luxurious feel to the packaging."),
      m("Window Patching", "/images/window-patching.webp", "A thin film layer is applied over a die-cut window for product preview."),
    ],
  },
  {
    id: "printing",
    title: "Printing Options",
    intro: "Choose the method that fits your quantity and color needs.",
    items: [
      m("Offset Printing", "/images/offset-printing.webp", "It uses plates and rubber blankets to transfer the designs onto packaging, ideal for large orders.", "Large runs"),
      m("Digital Printing", "/images/digital-printing.webp", "It prints directly onto the packaging, no printing plate is required, perfect for small runs.", "Short runs"),
    ],
  },
  {
    id: "terms",
    title: "Material Terms",
    intro: "Three words you will see on every quote.",
    items: [
      m("PT", "/images/pt-1024x681.webp", "The thickness measurements of paper stock."),
      m("Flute", "/images/flute-1024x681.webp", "The wave-like lines or arches adhered to layer(s) of linerboard."),
      m("GSM", "/images/gsm-1024x681.webp", "The density measurements of paper stock."),
    ],
  },
  {
    id: "sustainability",
    title: "Sustainability",
    intro: "Options for brands that want packaging that is kinder to the planet.",
    items: [
      m("Plastic Free", "/images/plastic-free-1024x681.webp", "The material doesn’t contain harmful petroleum-based plastics."),
      m("Compostable", "/images/compostable-1024x681.webp", "The material breaks down easily into a part of the soil."),
      m("Biodegradable", "/images/biodegradable-1024x681.webp", "The material will break down when it’s exposed to air, light, and moisture."),
      m("Recyclable", "/images/recyclable-1024x681.webp", "The material contains a great percentage of recycled material."),
    ],
  },
];
