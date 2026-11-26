// "All Products" page (/shop/): category tabs and their product cards, as listed on https://packlegacy.com/shop/.
// Tab order follows the reference design (Folding Cartons → Retail), then Display and Mailer.
// Corrugated products have no tab of their own: they are listed under Retail, Mailer, Folding Cartons and Food.
// Each card is [label, product slug]; images come from that product's gallery in data/products.json.
// A card can instead point at a category page with [label, href, image].

export type ShopCard = [label: string, slug: string] | [label: string, href: string, img: string];
export type ShopCategory = { id: string; tab: string; title: string; page?: string; cards: ShopCard[] };

export const shopCategories: ShopCategory[] = [
  {
    id: "folding-cartons", tab: "Folding Cartons", title: "Folding Cartons",
    cards: [
      ["Straight Tuck End Box", "straight-tuck-end-boxes"], ["Roll End Tuck Top Box", "roll-end-tuck-top-boxes"],
      ["Auto Lock Bottom Box", "auto-lock-bottom-boxes"], ["Reverse Tuck End Box", "reverse-tuck-end-boxes"],
      ["Pillow Box", "pillow-boxes"], ["Handle Box", "handle-boxes"], ["Gable Box", "gable-boxes"], ["123 Bottom Boxes", "123-bottom-boxes"],
      ["Tuck Top Boxes", "tuck-top-boxes"],
    ],
  },
  {
    id: "food", tab: "Food", title: "Food Boxes", page: "/food-boxes/",
    cards: [
      ["Burger Boxes", "burger-boxes"], ["Truffle Boxes", "truffle-boxes"], ["Popcorn Boxes", "popcorn-boxes"], ["Pizza Boxes", "pizza-boxes"],
      ["French Fry Boxes", "french-fry-boxes"], ["Cone Sleeves", "cone-sleeves"], ["Chocolate Boxes", "chocolate-boxes"],
      ["Chinese Takeout Boxes", "chinese-takeout-boxes"], ["Cereal Boxes", "cereal-boxes"], ["Candy Boxes", "candy-boxes"],
      ["Tea Boxes", "tea-boxes"], ["Sandwich Boxes", "sandwich-boxes"],
    ],
  },
  {
    id: "rigid", tab: "Rigid", title: "Rigid Boxes", page: "/rigid-boxes/",
    cards: [
      ["Two Piece Rigid Boxes", "two-piece-rigid-boxes"], ["Shoulder Neck Rigid Boxes", "shoulder-neck-rigid-boxes"],
      ["Rigid Drawer Boxes", "rigid-drawer-boxes"], ["Collapsible Rigid Boxes", "collapsible-rigid-boxes"],
      ["Magnetic Closure Boxes", "magnetic-closure-boxes"], ["Match Slide Box", "match-slide-boxes"], ["Book-Style Boxes", "book-boxes"],
      ["Flip Top Boxes", "flip-top-boxes"], ["Watch Boxes", "watch-boxes"],
    ],
  },
  {
    id: "mylar", tab: "Mylar Bags", title: "Mylar Bags", page: "/custom-mylar-bags/",
    cards: [
      ["Coffee Packaging Bags", "coffee-packaging-bags"], ["Die Cut Mylar Bags", "die-cut-mylar-bags"],
      ["Custom Mylar Bags", "/custom-mylar-bags/", "/images/custom-printed-mylar-bags.webp"],
    ],
  },
  {
    id: "paper-bags", tab: "Paper Bags", title: "Paper Bags", page: "/custom-paper-bags/",
    cards: [
      ["Custom Paper Bags", "/custom-paper-bags/", "/images/kraft-paper-bags-with-handle.webp"],
    ],
  },
  {
    id: "cbd", tab: "CBD", title: "CBD Boxes", page: "/cbd-boxes/",
    cards: [
      ["Hemp Oil Boxes", "cbd-hemp-oil-boxes"], ["Cigar Boxes", "custom-cigar-boxes"], ["Vape Boxes", "vape-boxes"], ["CBD Oil Boxes", "cbd-oil-boxes"],
      ["CBD Tincture Boxes", "cbd-tincture-boxes"], ["CBD Gummies Boxes", "cbd-gummies-boxes"], ["CBD Cream Boxes", "cbd-cream-boxes"],
      ["CBD Lotion Boxes", "cbd-lotion-boxes"], ["CBD Display Boxes", "cbd-display-boxes"], ["CBD Pre-roll Packaging", "cbd-pre-roll-packaging"],
      ["CBD Pre-roll Display Boxes", "cbd-pre-roll-display-boxes"], ["E-liquid Boxes", "e-liquid-boxes"], ["CBD Medicine Boxes", "cbd-medicine-boxes"],
      ["CBD Cigarette Boxes", "cbd-cigarette-boxes"],
    ],
  },
  {
    id: "cosmetic", tab: "Cosmetic", title: "Cosmetic Boxes", page: "/cosmetic-boxes/",
    cards: [
      ["Bath Bomb Boxes", "bath-bomb-boxes"], ["Cream Boxes", "cream-boxes"], ["Eyelash Boxes", "eyelash-boxes"], ["Eyeliner Boxes", "eyeliner-boxes"],
      ["Eyeshadow Boxes", "eyeshadow-boxes"], ["Foundation Boxes", "foundation-boxes"], ["Hair Extension Boxes", "hair-extension-boxes"],
      ["Hairspray Boxes", "hairspray-boxes"], ["Lip Balm Boxes", "lip-balm-boxes"], ["Lip Gloss Boxes", "lip-gloss-boxes"],
      ["Nail Polish Boxes", "nail-polish-boxes"], ["Perfume Boxes", "perfume-boxes"], ["Makeup Boxes", "makeup-boxes"], ["Lotion Boxes", "lotion-boxes"],
      ["Lipstick Boxes", "lipstick-boxes"], ["Mascara Boxes", "mascara-boxes"],
    ],
  },
  {
    id: "bakery", tab: "Bakery", title: "Bakery Boxes", page: "/bakery-boxes/",
    cards: [
      ["Macaron Boxes", "macaron-boxes"], ["Pie Boxes", "pie-boxes"], ["Donut Boxes", "donut-boxes"], ["Cupcake Boxes", "cupcake-boxes"],
      ["Cookie Boxes", "cookie-boxes"], ["Cake Boxes", "cake-boxes"], ["Panettone Boxes", "panettone-boxes"], ["Dessert Boxes", "dessert-boxes"],
      ["Pastry Boxes", "pastry-boxes"],
    ],
  },
  {
    id: "gift", tab: "Gift", title: "Gift Boxes", page: "/gift-boxes/",
    cards: [
      ["Ornament Boxes", "ornament-boxes"], ["Holographic Boxes", "holographic-boxes"], ["Foiling Boxes", "foiling-boxes"], ["Die Cut Boxes", "die-cut-boxes"],
      ["Blind Boxes", "custom-blind-boxes"], ["PR Boxes", "pr-boxes"], ["Invitation Boxes", "invitation-boxes"],
    ],
  },
  {
    id: "retail", tab: "Retail", title: "Retail Boxes", page: "/retail-boxes/",
    cards: [
      ["Candle Boxes", "/candle-boxes/", "/images/luxury-candle-boxes-candle.webp"], ["Game Boxes", "game-boxes"],
      ["Tray and Sleeve Boxes", "tray-sleeve-boxes"], ["Presentation Boxes", "presentation-boxes"], ["Kraft Boxes", "kraft-boxes"],
      ["Medicine Boxes", "medicine-boxes"], ["Playing Card Boxes", "playing-card-boxes"], ["Business Card Boxes", "business-card-boxes"],
      ["Archive Boxes", "archive-boxes"], ["Cube Boxes", "cube-boxes"], ["Hand Sanitizer Boxes", "hand-sanitizer-boxes"], ["School Boxes", "school-boxes"],
      ["Packaging Sleeves", "packaging-sleeves"], ["Window Boxes", "window-boxes"], ["Coaster Boxes", "coaster-boxes"],
      ["Corrugated Boxes", "/corrugated-boxes/", "/images/corrugated-box.webp"],
    ],
  },
  {
    id: "display", tab: "Display", title: "Display Boxes", page: "/display-boxes/",
    cards: [
      ["Counter Top Displays", "cardboard-counter-top-displays"], ["Dispenser Boxes", "dispenser-boxes"],
      ["Front Cut Out Display Boxes", "front-cut-out-display-boxes"], ["Pop-up Display Boxes", "pop-up-display-boxes"],
      ["Perforated Display Boxes", "perforated-boxes"], ["PDQ Display Boxes", "pdq-boxes"], ["Display Mailer Boxes", "display-mailer-boxes"],
      ["Shelf Ready Boxes", "shelf-ready-boxes"], ["Double Wall Display Lid", "double-wall-display-lid"],
    ],
  },
  {
    id: "mailer", tab: "Mailer", title: "Mailer Boxes", page: "/mailer-boxes/",
    cards: [
      ["Subscription Boxes", "subscription-boxes"], ["PR Boxes", "pr-boxes"], ["White Mailer Boxes", "white-mailer-boxes"],
      ["Black Mailer Boxes", "black-mailer-boxes"], ["Colored Mailer Boxes", "colored-mailer-boxes"],
      ["Literature Mailer Boxes", "literature-mailer-boxes"], ["Display Mailer Boxes", "display-mailer-boxes"],
      ["Corrugated Mailer Boxes", "corrugated-mailer-boxes"],
    ],
  },
];
