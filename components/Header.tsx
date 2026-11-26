"use client";

// Header copied from https://packlegacy.com/ (top bar, logo row and main navigation).
import { useEffect, useState } from "react";
import SearchBox from "@/components/SearchBox";

// Links stay on this site (no links out to packlegacy.com).
const SITE = "";

const topMessages = [
  "No Minimum Order Quantity",
  "Friendly Customer Support",
  "Fast TAT & Free Shipping",
  "Easy Online Payment ",
];

const socials = [
  { label: "Facebook", href: "https://www.facebook.com/people/Pack-Legacy/61577888315684/", icon: "#i-facebook" },
  { label: "Pinterest", href: "https://www.pinterest.com/PackLegacy/", icon: "#i-pinterest" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/packlegacy/", icon: "#i-linkedin" },
  { label: "Instagram", href: "https://www.instagram.com/pack_legacy/", icon: "#i-instagram" },
];

function Chevron({ dir }: { dir: "left" | "right" }) {
  return dir === "left" ? (
    <svg aria-hidden="true" viewBox="0 0 1000 1000">
      <path d="M646 125C629 125 613 133 604 142L308 442C296 454 292 471 292 487 292 504 296 521 308 533L604 854C617 867 629 875 646 875 663 875 679 871 692 858 704 846 713 829 713 812 713 796 708 779 692 767L438 487 692 225C700 217 708 204 708 187 708 171 704 154 692 142 675 129 663 125 646 125Z" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 1000 1000">
      <path d="M696 533C708 521 713 504 713 487 713 471 708 454 696 446L400 146C388 133 375 125 354 125 338 125 325 129 313 142 300 154 292 171 292 187 292 204 296 221 308 233L563 492 304 771C292 783 288 800 288 817 288 833 296 850 308 863 321 871 338 875 354 875 371 875 388 867 400 854L696 533Z" />
    </svg>
  );
}

function TopCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % topMessages.length), 2500);
    return () => clearInterval(t);
  }, [paused]);
  const go = (d: number) => setI((n) => (n + d + topMessages.length) % topMessages.length);
  return (
    <div className="plt-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <button type="button" className="plt-arrow" aria-label="Previous" onClick={() => go(-1)}>
        <Chevron dir="left" />
      </button>
      <div className="plt-slide" aria-live="polite" key={i}>
        {topMessages[i]}
      </div>
      <button type="button" className="plt-arrow" aria-label="Next" onClick={() => go(1)}>
        <Chevron dir="right" />
      </button>
    </div>
  );
}


/* Mobile menu without JavaScript. Browsers only use <noscript> content when scripts are off, so none of this
   affects normal visitors. The menu and close buttons become links: "#plMainNav" opens the drawer with CSS
   :target, "#" closes it. Every sub-menu is shown expanded because the toggles need JavaScript. */
const NOJS_MENU =
  `<a class="pl-header-hamburger pl-nojs-burger" href="#plMainNav" aria-label="Open menu"><svg class="pli pli-bars" aria-hidden="true"><use href="#i-bars"></use></svg></a>` +
  `<style>@media (max-width:1024px){` +
  `#plHeader #plHamburger,#plHeader #plMobileClose{display:none!important}` +
  `#plHeader .pl-nojs-burger,#plHeader .pl-nojs-close{display:inline-flex!important;position:relative;z-index:1102}` +
  `#plHeader .pl-header-nav:target{opacity:1;visibility:visible;pointer-events:auto;transform:none}` +
  `#plHeader:has(#plMainNav:target) .pl-nojs-burger,body:has(#plMainNav:target) .plt-mobile-search{visibility:hidden}` +
  `#plHeader .pl-header-has-dropdown>.pl-header-dropdown{display:block!important;padding:4px 0 10px}` +
  `#plHeader .pl-header-has-dropdown>.pl-header-mega{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 20px;padding:6px 0 14px}` +
  `#plHeader .pl-header-dropdown-arrow{display:none}` +
  `}</style>`;
const NOJS_CLOSE = `<a class="pl-header-mobile-close pl-nojs-close" href="#" aria-label="Close menu"><svg class="pli pli-xmark" aria-hidden="true"><use href="#i-xmark"></use></svg></a>`;

/* Same behaviour as the inline script on packlegacy.com */
function useHeaderMenu() {
  useEffect(() => {
    const header = document.getElementById("plHeader");
    const hamburger = document.getElementById("plHamburger");
    if (!header || !hamburger) return;

    const off: Array<() => void> = [];
    const on = (el: EventTarget, type: string, fn: EventListener) => {
      el.addEventListener(type, fn);
      off.push(() => el.removeEventListener(type, fn));
    };

    const dropdowns = Array.from(header.querySelectorAll<HTMLElement>(".pl-header-has-dropdown"));
    const arrows = Array.from(header.querySelectorAll<HTMLElement>(".pl-header-dropdown-arrow"));
    const parentToggles = Array.from(header.querySelectorAll<HTMLElement>(".pl-header-parent-toggle"));
    const mobileClose = document.getElementById("plMobileClose");
    const mq = window.matchMedia("(max-width: 1024px)");
    const isMobile = () => mq.matches;

    const setExpanded = (li: Element, expanded: boolean) => {
      li.querySelectorAll(".pl-header-dropdown-arrow, .pl-header-parent-toggle").forEach((c) =>
        c.setAttribute("aria-expanded", expanded ? "true" : "false")
      );
    };
    const closeDropdown = (li: Element) => {
      li.classList.remove("is-open");
      setExpanded(li, false);
    };
    const closeAllDropdowns = (except?: Element) => {
      dropdowns.forEach((li) => {
        if (li !== except) closeDropdown(li);
      });
    };
    const toggleDropdown = (li: Element) => {
      const willOpen = !li.classList.contains("is-open");
      closeAllDropdowns(li);
      if (willOpen) {
        li.classList.add("is-open");
        setExpanded(li, true);
      } else closeDropdown(li);
    };

    arrows.forEach((arrow) => {
      const li = arrow.closest(".pl-header-has-dropdown");
      if (!li) return;
      on(arrow, "click", (e) => {
        e.preventDefault();
        if (isMobile()) return toggleDropdown(li);
        closeAllDropdowns();
        arrow.blur();
      });
      on(li, "mouseenter", () => {
        if (!isMobile()) setExpanded(li, true);
      });
      on(li, "mouseleave", () => {
        if (!isMobile() && !li.classList.contains("is-open")) setExpanded(li, false);
      });
    });

    parentToggles.forEach((toggle) => {
      const li = toggle.closest(".pl-header-has-dropdown");
      if (!li) return;
      on(toggle, "click", (e) => {
        if (!isMobile()) return;
        e.preventDefault();
        toggleDropdown(li);
      });
    });

    const openMenu = () => {
      header.classList.add("pl-header-menu-open");
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.setAttribute("aria-label", "Close menu");
      document.body.classList.add("pl-header-no-scroll");
    };
    const closeMenu = () => {
      header.classList.remove("pl-header-menu-open");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("pl-header-no-scroll");
      closeAllDropdowns();
    };

    on(hamburger, "click", () => {
      if (header.classList.contains("pl-header-menu-open")) closeMenu();
      else openMenu();
    });
    if (mobileClose) on(mobileClose, "click", closeMenu);

    on(document, "click", (e) => {
      if (!header.contains(e.target as Node)) {
        closeAllDropdowns();
        if (header.classList.contains("pl-header-menu-open")) closeMenu();
      }
    });
    on(document, "keydown", (e) => {
      const k = (e as KeyboardEvent).key;
      if (k !== "Escape" && k !== "Esc") return;
      closeAllDropdowns();
      if (header.classList.contains("pl-header-menu-open")) {
        closeMenu();
        hamburger.focus();
      }
    });
    on(mq, "change", () => {
      closeAllDropdowns();
      closeMenu();
    });

    return () => {
      off.forEach((fn) => fn());
      document.body.classList.remove("pl-header-no-scroll");
    };
  }, []);
}

function Arrow({ controls, label }: { controls: string; label: string }) {
  return (
    <button
      type="button"
      className="pl-header-dropdown-arrow"
      aria-label={label}
      aria-haspopup="true"
      aria-expanded="false"
      aria-controls={controls}
    >
      <svg className="pli pli-angle-down" aria-hidden="true" focusable="false">
        <use href="#i-angle-down"></use>
      </svg>
    </button>
  );
}

function Di({ icon }: { icon: string }) {
  return (
    <svg className="pli pl-header-di" aria-hidden="true">
      <use href={icon}></use>
    </svg>
  );
}

const mega = [
  {
    title: "Luxury Boxes",
    links: [
      ["Rigid Boxes", "/rigid-boxes/"],
      ["Magnetic Closure Boxes", "/product/magnetic-closure-boxes/"],
      ["Two-Piece Rigid Boxes", "/product/two-piece-rigid-boxes/"],
      ["Shoulder & Neck Boxes", "/product/shoulder-neck-rigid-boxes/"],
      ["Collapsible Rigid Boxes", "/product/collapsible-rigid-boxes/"],
      ["Rigid Drawer Boxes", "/product/rigid-drawer-boxes/"],
      ["Presentation Boxes", "/product/presentation-boxes/"],
      ["Book boxes", "/product/book-boxes/"],
    ],
  },
  {
    title: "Shipping & Mailer",
    links: [
      ["Mailer Boxes", "/mailer-boxes/"],
      ["Corrugated Boxes", "/corrugated-boxes/"],
      ["Subscription Boxes", "/product/subscription-boxes/"],
      ["Kraft Boxes", "/product/kraft-boxes/"],
      ["Die-Cut Boxes", "/product/die-cut-boxes/"],
      ["Auto-Lock Bottom", "/product/auto-lock-bottom-boxes/"],
      ["1-2-3 Bottom Boxes", "/product/123-bottom-boxes/"],
      ["Handle Boxes", "/product/handle-boxes/"],
    ],
  },
  {
    title: "Gift & Specialty",
    links: [
      ["Gift Boxes", "/gift-boxes/"],
      ["Candle Boxes", "/candle-boxes/"],
      ["PR Boxes", "/product/pr-boxes/"],
      ["Blind Boxes", "/product/custom-blind-boxes/"],
      ["Holographic Boxes", "/product/holographic-boxes/"],
      ["Foiling Boxes", "/product/foiling-boxes/"],
      ["Apparel Boxes", "/apparel-boxes/"],
      ["Ornament Boxes", "/product/ornament-boxes/"],
    ],
  },
  {
    title: "Display & Retail",
    links: [
      ["Display Boxes", "/display-boxes/"],
      ["Shelf-Ready Boxes", "/product/shelf-ready-boxes/"],
      ["Pop-Up Display Boxes", "/product/pop-up-display-boxes/"],
      ["Counter-Top Displays", "/product/cardboard-counter-top-displays/"],
      ["Dispenser Boxes", "/product/dispenser-boxes/"],
      ["Front Cut-Out Display", "/product/front-cut-out-display-boxes/"],
      ["Perforated Boxes", "/product/perforated-boxes/"],
      ["Bath Bomb Boxes", "/product/bath-bomb-boxes/"],
    ],
  },
  {
    title: "Food & Bakery",
    links: [
      ["Food Boxes", "/food-boxes/"],
      ["Bakery Boxes", "/bakery-boxes/"],
      ["Cake Boxes", "/product/cake-boxes/"],
      ["Macaron Boxes", "/product/macaron-boxes/"],
      ["Cookie Boxes", "/product/cookie-boxes/"],
      ["Donut Boxes", "/product/donut-boxes/"],
      ["Pizza Boxes", "/product/pizza-boxes/"],
      ["Burger boxes", "/product/burger-boxes/"],
    ],
  },
];

function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="i-angle-down" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></symbol>
        <symbol id="i-xmark" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></symbol>
        <symbol id="i-bars" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></symbol>
        <symbol id="i-utensils" viewBox="0 0 448 512"><path d="M416 0C400 0 288 32 288 176V276.5c0 17.3 7.1 33.9 19.6 45.9l35.6 34.4c4.6 4.4 7.2 10.6 7.2 17V496c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V500c0 6.600 5.4 12 12 12h24c6.6 0 12-5.4 12-12V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L175.6 12.5c-1.800-7.9-8.900-13.4-17-12.5S144 7.8 144 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L112 14.6C111.2 6.3 104.3 0 96 0s-15.2 6.3-16 14.6L67.6 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16z" /></symbol>
        <symbol id="i-basket" viewBox="0 0 576 512"><path d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32L83.9 463c7.1 28.5 32.7 49 62.1 49H429.9c29.4 0 55-20.5 62.1-49L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32H458.4L365.3 12.9C359.2 1.2 344.7-3.4 333 2.7s-16.3 20.6-10.2 32.4L404.3 192H171.7L253.3 35.1zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16s16 7.2 16 16zm128 0v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16s16 7.2 16 16z" /></symbol>
        <symbol id="i-bread" viewBox="0 0 576 512"><path d="M288 0C422.4 0 512 35.2 512 80c0 33.6-50.4 62.4-122.4 74.4c-13.6 2.4-25.6 12-32 24L308 335.2c-3.2 6.4-9.6 10.4-16.8 10.4c-12 0-20.8-11.2-18.4-23.2L288 240H208c-8.8 0-16-7.2-16-16s7.2-16 16-16h88.8L312 128H208c-8.8 0-16-7.2-16-16s7.2-16 16-16H318.4L336 12.8C337.6 5.6 344 0 352 0H288zM64 80C64 35.2 153.6 0 288 0C153.6 0 64 35.2 64 80zM32 192c-17.7 0-32 14.3-32 32V432c0 44.2 35.8 80 80 80H496c44.2 0 80-35.8 80-80V224c0-17.7-14.3-32-32-32H32z" /></symbol>
        <symbol id="i-leaf" viewBox="0 0 512 512"><path d="M243.3 3.8c3.2-2.5 7.7-2.5 10.9 0C267.1 14 288 36.6 288 72c0 20.3-6.9 40.6-15.2 58.1c15.5-9.6 34.4-16.1 55.2-16.1c39.3 0 66.5 22.3 79.4 34.6c3.5 3.4 3.9 8.9 .9 12.7c-8.4 10.5-25.1 28.6-48.4 40.6c17.2 3.5 33.7 11.4 47.1 20.9c26.6 18.8 44.8 44.6 52.7 57.3c2.5 4 1.4 9.2-2.4 12c-14.8 10.8-45.9 30.2-84.2 30.2c-24.4 0-46.6-7.9-63.6-16.9c9.9 14.3 18.5 31.9 22.8 51.5c1 4.5-1.7 9-6.1 10.3c-15.9 4.7-49.4 12.8-79.2 4.6L246 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l1-107.9c-29.7 8.2-63.3 .1-79.2-4.6c-4.4-1.3-7.1-5.8-6.1-10.3c4.3-19.6 12.9-37.2 22.8-51.5c-17 9-39.2 16.9-63.6 16.9c-38.3 0-69.4-19.4-84.2-30.2c-3.8-2.8-4.9-8-2.4-12c7.9-12.7 26.1-38.5 52.7-57.3c13.4-9.5 29.9-17.4 47.1-20.9C46.8 190.2 30.1 172.1 21.7 161.6c-3-3.8-2.6-9.3 .9-12.7c12.9-12.3 40.1-34.6 79.4-34.6c20.8 0 39.7 6.5 55.2 16.1C148.9 112.6 142 92.3 142 72c0-35.4 20.9-58 34.1-68.2c3.2-2.5 7.7-2.5 10.9 0C193.6 8.8 205.3 20 214 34.6C222.7 20 234.4 8.8 243.3 3.8z" /></symbol>
        <symbol id="i-gift" viewBox="0 0 512 512"><path d="M190.5 68.8L225.3 128H224 152c-22.1 0-40-17.9-40-40s17.9-40 40-40h2.2c14.9 0 28.8 7.9 36.3 20.8zM64 88c0 14.4 3.5 28 9.6 40H32c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32H480c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32H438.4c6.1-12 9.6-25.6 9.6-40c0-48.6-39.4-88-88-88h-2.2c-31.9 0-61.5 16.9-77.7 44.4L256 85.5l-24.1-41C215.7 16.9 186.1 0 154.2 0H152C103.4 0 64 39.4 64 88zm336 0c0 22.1-17.9 40-40 40H288h-1.3l34.8-59.2C329 55.9 342.9 48 357.8 48H360c22.1 0 40 17.9 40 40zM32 288V464c0 26.5 21.5 48 48 48H224V288H32zM288 512H432c26.5 0 48-21.5 48-48V288H288V512z" /></symbol>
        <symbol id="i-spray" viewBox="0 0 512 512"><path d="M192 0c-17.7 0-32 14.3-32 32V96c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H192zM128 179.2V224c0 17.7 14.3 32 32 32H288c17.7 0 32-14.3 32-32V179.2c0-38.6-26.8-72.1-64.5-80.5l0 0V128c0 17.7-14.3 32-32 32H224c-17.7 0-32-14.3-32-32V98.7l0 0C154.8 107.1 128 140.6 128 179.2zM160 288c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H288c35.3 0 64-28.7 64-64V352c0-35.3-28.7-64-64-64H160zM432 0c-8.8 0-16 7.2-16 16V48H384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32v32c0 8.8 7.2 16 16 16s16-7.2 16-16V80h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H448V16c0-8.8-7.2-16-16-16zM368 160c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16zm112 32c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16zM416 272c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16zm64 96c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16z" /></symbol>
        <symbol id="i-arrow-right-solid" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 0 45.3 0l160-160z" /></symbol>
        <symbol id="i-envelope" viewBox="0 0 24 24"><path d="M3 6.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11zM3.5 7l8.5 5.8L20.5 7" /></symbol>
        <symbol id="i-facebook" viewBox="0 0 24 24"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.1-2.5-.1-2.5 0-4.200 1.5-4.200 4.3v2.1H7.3V13H10v8h3.5z" /></symbol>
        <symbol id="i-instagram" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></symbol>
        <symbol id="i-linkedin" viewBox="0 0 24 24"><path d="M4.6 8.9h3.1V20H4.6zM6.15 3.4a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM10.1 8.9H13v1.6a3.3 3.3 0 0 1 2.95-1.7c3.05 0 3.75 1.9 3.75 4.55V20h-3.05v-5.05c0-1.3-.3-2.3-1.7-2.3s-1.9.9-1.9 2.25V20h-2.95z" /></symbol>
        <symbol id="i-pinterest" viewBox="0 0 24 24"><path d="M12 2.5a9.5 9.5 0 0 0-3.45 18.35c-.08-.78-.15-1.98.03-2.83l1.15-4.9s-.29-.59-.29-1.45c0-1.36.79-2.37 1.770-2.37.83 0 1.24.63 1.24 1.38 0 .84-.54 2.1-.81 3.27-.23.98.49 1.78 1.46 1.78 1.75 0 3.1-1.85 3.1-4.51 0-2.36-1.7-4.01-4.12-4.01-2.8 0-4.45 2.1-4.45 4.28 0 .85.33 1.76.74 2.25.08.1.09.19.07.29l-.28 1.13c-.04.18-.15.22-.34.13-1.25-.58-2.03-2.4-2.03-3.86 0-3.14 2.28-6.03 6.58-6.030 3.45 0 6.14 2.46 6.14 5.75 0 3.43-2.16 6.19-5.17 6.19-1.01 0-1.96-.53-2.28-1.15l-.63 2.38c-.22.86-.83 1.94-1.24 2.6A9.5 9.5 0 1 0 12 2.5z" /></symbol>
        <symbol id="i-phone" viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z" /></symbol>
      </defs>
    </svg>
  );
}

export default function Header() {
  useHeaderMenu();

  return (
    <div className="site-header">
      {/* Row 1: rotating messages + contact (desktop) */}
      <div className="plt-topbar plt-desktop">
        <div className="plt-inner">
          <div className="plt-topbar-left">
            <TopCarousel />
          </div>
          <div className="plt-topbar-right">
            <a className="plt-contact plt-email" href="mailto:sales@packlegacy.com">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden="true">
                <path d="M0.494792 0L8.13542 6.1511L15.4492 0H0.494792ZM0 10.3508L5.44271 4.9633L0 0.58233V10.3521V10.3508ZM6.04297 5.44665L0.43099 11H15.5221L10.1563 5.44665L8.39063 6.93397C8.32178 6.99062 8.2353 7.02218 8.14569 7.02335C8.05607 7.02452 7.96878 6.99523 7.89844 6.9404L6.04297 5.44665ZM10.7461 4.95302L16 10.3945V0.534767L10.7461 4.95302Z" fill="#098543" />
              </svg>
              sales@packlegacy.com
            </a>
            <a className="plt-contact plt-phone" href="tel:+14243216460">
              <svg viewBox="0 0 512 512" aria-hidden="true">
                <path d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.290 24.290 0 0 0-14.010-27.6z" />
              </svg>
              +1 (424) 321-6460
            </a>
          </div>
        </div>
      </div>

      {/* Row 1 (tablet/mobile): rotating messages only */}
      <div className="plt-topbar plt-mobile">
        <div className="plt-inner plt-center">
          <TopCarousel />
        </div>
      </div>

      {/* Row 2: logo, search, socials (desktop) */}
      <div className="plt-logo-row plt-desktop">
        <div className="plt-inner">
          <div className="plt-logo">
            <a href="/">
              <img src="/images/pack-legacy-logo.webp" alt="Pack-legacy-Logo" width={800} height={169} />
            </a>
          </div>
          <div className="plt-search">
            <SearchBox />
          </div>
          <ul className="plt-socials">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="nofollow" aria-label={s.label}>
                  <svg className="plt-social-icon" aria-hidden="true">
                    <use href={s.icon}></use>
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 3: main navigation (desktop) / logo + search + hamburger (mobile) */}
      <div className="plt-nav-row">
        <div className="plt-mobile-search plt-mobile">
          <SearchBox />
        </div>
        <div className="plt-mobile-logo plt-mobile">
          <a href="/">
            <img src="/images/pack-legacy-logo.svg" alt="Pack legacy Logo" width={1283} height={270} />
          </a>
        </div>

        <header className="pl-header" id="plHeader">
          <IconSprite />

          <div className="pl-header-inner">
            <nav className="pl-header-nav" id="plMainNav" aria-label="Main navigation">
              <div className="pl-header-mobile-head" style={{ display: "none" }}>
                <a href="/" className="pl-header-mobile-logo-link" aria-label="Pack Legacy Home">
                  <img src="/images/pack-legacy-logo.svg" alt="Pack Legacy" className="pl-header-mobile-logo" width={150} height={40} decoding="async" />
                </a>
                <button type="button" className="pl-header-mobile-close" id="plMobileClose" aria-label="Close menu">
                  <svg className="pli pli-xmark" aria-hidden="true" focusable="false">
                    <use href="#i-xmark"></use>
                  </svg>
                </button>
                <noscript dangerouslySetInnerHTML={{ __html: NOJS_CLOSE }} />
              </div>

              <ul className="pl-header-menu">
                <li>
                  <a href="/" className="pl-header-nav-link">Home</a>
                </li>

                <li className="pl-header-has-dropdown">
                  <div className="pl-header-top-item">
                    <button type="button" className="pl-header-nav-link pl-header-parent-toggle" aria-haspopup="true" aria-expanded="false" aria-controls="pl-dd-industries">
                      Explore Industries
                    </button>
                    <Arrow controls="pl-dd-industries" label="Open Industries menu" />
                  </div>
                  <div className="pl-header-dropdown" id="pl-dd-industries">
                    <ul>
                      <li><a href={`${SITE}/food-boxes/`}><Di icon="#i-utensils" />Food Boxes</a></li>
                      <li><a href={`${SITE}/retail-boxes/`}><Di icon="#i-basket" />Retail Boxes</a></li>
                      <li><a href={`${SITE}/bakery-boxes/`}><Di icon="#i-bread" />Bakery Boxes</a></li>
                      <li><a href={`${SITE}/cbd-boxes/`}><Di icon="#i-leaf" />CBD Boxes</a></li>
                      <li><a href={`${SITE}/gift-boxes/`}><Di icon="#i-gift" />Gift Boxes</a></li>
                      <li><a href={`${SITE}/cosmetic-boxes/`}><Di icon="#i-spray" />Cosmetic Boxes</a></li>
                      <li><a className="pl-header-viewall" href={`${SITE}/industries/`}><Di icon="#i-arrow-right-solid" />View All Industries</a></li>
                    </ul>
                  </div>
                </li>

                <li className="pl-header-has-dropdown pl-header-mega-parent">
                  <div className="pl-header-top-item">
                    <a href={`${SITE}/custom-boxes/`} className="pl-header-nav-link">Custom Boxes</a>
                    <Arrow controls="pl-dd-products" label="Open Explore Custom Boxes menu" />
                  </div>

                  <div className="pl-header-mega" id="pl-dd-products" aria-label="Custom Boxes & Packaging Solutions">
                    {mega.map((col, ci) => (
                      <div className="pl-header-mega-col" key={col.title}>
                        <div className="pl-header-mega-border">
                          <span className="pl-header-mega-title">{col.title}</span>
                          <span className="single-slash" aria-hidden="true"></span>
                        </div>
                        <ul>
                          {col.links.map(([name, href]) => (
                            <li key={name}>
                              <a href={`${SITE}${href}`}>{name}</a>
                            </li>
                          ))}
                          {ci === mega.length - 1 && (
                            <li className="view-for-mobile">
                              <a href={`${SITE}/shop/`}><Di icon="#i-arrow-right-solid" />View All</a>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}

                    <aside className="pl-header-promo">
                      <div className="promo-card">
                        <span className="pl-header-promo-pill">PACK LEGACY</span>
                        <div className="card-heading">Packaging That Feels Premium</div>
                        <p>Create premium printed boxes with no MOQs, fast turnarounds, and free shipping.</p>
                        <a href={`${SITE}/shop/`} className="pl-header-promo-cta">
                          Browse All Products
                          <svg className="pli" aria-hidden="true"><use href="#i-arrow-right-solid"></use></svg>
                        </a>
                      </div>
                    </aside>
                  </div>
                </li>

                <li className="pl-header-has-dropdown">
                  <div className="pl-header-top-item">
                    <button type="button" className="pl-header-nav-link pl-header-parent-toggle" aria-haspopup="true" aria-expanded="false" aria-controls="pl-dd-styles">
                      Box By Styles
                    </button>
                    <Arrow controls="pl-dd-styles" label="Open Box By Styles menu" />
                  </div>
                  <div className="pl-header-dropdown" id="pl-dd-styles">
                    <ul>
                      <li><a href={`${SITE}/mailer-boxes/`}>Mailer Boxes</a></li>
                      <li><a href={`${SITE}/product/tray-sleeve-boxes/`}>Tray And Sleeve Boxes</a></li>
                      <li><a href={`${SITE}/display-boxes/`}>Display Boxes</a></li>
                      <li><a href={`${SITE}/product/gable-boxes/`}>Gable Boxes</a></li>
                      <li><a href={`${SITE}/product/straight-tuck-end-boxes/`}>Straight Tuck End Boxes</a></li>
                      <li><a className="pl-header-viewall" href={`${SITE}/box-by-style/`}>View Box By Style</a></li>
                    </ul>
                  </div>
                </li>

                <li className="pl-header-has-dropdown">
                  <div className="pl-header-top-item">
                    <button type="button" className="pl-header-nav-link pl-header-parent-toggle" aria-haspopup="true" aria-expanded="false" aria-controls="pl-dd-resources">
                      Resources
                    </button>
                    <Arrow controls="pl-dd-resources" label="Open Resources menu" />
                  </div>
                  <div className="pl-header-dropdown" id="pl-dd-resources">
                    <ul>
                      <li><a href={`${SITE}/blog/`}>Blogs</a></li>
                      <li><a href={`${SITE}/tools/`}>Packaging Tools</a></li>
                      <li><a href={`${SITE}/how-to-order/`}>How To Order</a></li>
                      <li><a href={`${SITE}/faqs/`}>FAQs</a></li>
                      <li><a href={`${SITE}/track-your-order/`}>Track Your Order</a></li>
                      <li><a href={`${SITE}/for-ai-agents/`}>For AI Agents</a></li>
                    </ul>
                  </div>
                </li>

                <li>
                  <a href={`${SITE}/about-us/`} className="pl-header-nav-link" style={{ marginTop: 0 }}>About Us</a>
                </li>
              </ul>

              <div className="pl-header-mobile-contact">
                <a href="tel:+14243216460" className="pl-header-mobile-contact-row">
                  <svg className="pli pli-phone" aria-hidden="true"><use href="#i-phone"></use></svg>
                  <span>+1 (424) 321-6460</span>
                </a>
                <a href="mailto:sales@packlegacy.com" className="pl-header-mobile-contact-row">
                  <svg className="pli" aria-hidden="true"><use href="#i-envelope"></use></svg>
                  <span>sales@packlegacy.com</span>
                </a>
                <a href={`${SITE}/get-a-quote/`} className="pl-header-mobile-contact-quote">Get a Quote</a>
                <div className="pl-header-mobile-socials">
                  <a href="https://www.facebook.com/people/Pack-Legacy/61577888315684/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg className="pli pli-facebook" aria-hidden="true"><use href="#i-facebook"></use></svg>
                  </a>
                  <a href="https://www.instagram.com/pack_legacy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg className="pli pli-instagram" aria-hidden="true"><use href="#i-instagram"></use></svg>
                  </a>
                  <a href="https://www.linkedin.com/company/packlegacy/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <svg className="pli pli-linkedin" aria-hidden="true"><use href="#i-linkedin"></use></svg>
                  </a>
                  <a href="https://www.pinterest.com/PackLegacy/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                    <svg className="pli pli-pinterest" aria-hidden="true"><use href="#i-pinterest"></use></svg>
                  </a>
                </div>
              </div>

              <a href={`${SITE}/get-a-quote/`} className="pl-header-cta">Get a Quote</a>
            </nav>

            <button type="button" className="pl-header-hamburger" id="plHamburger" aria-label="Open menu" aria-expanded="false" aria-controls="plMainNav" style={{ display: "none" }}>
              <svg className="pli pli-bars" aria-hidden="true"><use href="#i-bars"></use></svg>
            </button>
            <noscript dangerouslySetInnerHTML={{ __html: NOJS_MENU }} />
          </div>
        </header>
      </div>
    </div>
  );
}
