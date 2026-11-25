"use client";

// Interactions from packlegacy-magnetic-boxes/assets/product.js (gallery, option cards, artwork upload, quote form).
// The newsletter part is left out because the site footer has its own signup.
import { useEffect } from "react";
import { submitQuote, thankYouUrl } from "@/lib/quote";

export default function MagneticBoxesScript() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".plmb");
    if (!root) return;
    const ac = new AbortController();
    const opts = { signal: ac.signal };
    const created: Element[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Scroll reveal ---------- */
    let observer: IntersectionObserver | undefined;
    const revealTargets = [
      ...root.querySelectorAll<HTMLElement>(
        ".benefits, .section-bar, .section .reading-width, .details-grid > *, .partnership .section-intro, .partnership-grid > *, .tool-grid > *, .process li, .faq-grid > *, .review-grid > *, .related-grid > *"
      ),
    ];
    if (!reducedMotion && "IntersectionObserver" in window) {
      // Stagger items that share a parent (cards in a grid) so they cascade in.
      revealTargets.forEach((el) => {
        el.classList.add("plmb-r");
        const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => revealTargets.includes(c as HTMLElement)) : [];
        const i = siblings.indexOf(el);
        if (i > 0) el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
      });
      observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.classList.add("is-in");
          observer!.unobserve(el);
          // Once it has faded in, drop the reveal styles so the normal hover effects take over.
          const settle = (ev: TransitionEvent) => {
            if (ev.target !== el || ev.propertyName !== "opacity") return;
            el.removeEventListener("transitionend", settle);
            el.classList.remove("plmb-r", "is-in");
            el.style.transitionDelay = "";
          };
          el.addEventListener("transitionend", settle);
        }),
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealTargets.forEach((el) => observer!.observe(el));
      root.classList.add("plmb-reveal");
    }

    /* ---------- Quote rail end + section bar highlight ---------- */
    // The sticky region now runs to the end of the page (so the section bar stays pinned),
    // but the quote form should still stop following the reader after "The Details".
    const region = root.querySelector<HTMLElement>(".product-sticky-region");
    const railEnd = root.querySelector<HTMLElement>("#details");
    const placeRail = () => {
      if (!region || !railEnd) return;
      const gap = region.getBoundingClientRect().bottom - railEnd.getBoundingClientRect().bottom;
      region.style.setProperty("--rail-bottom", Math.max(24, Math.round(gap + 24)) + "px");
    };
    placeRail();
    const resizeObs = "ResizeObserver" in window ? new ResizeObserver(placeRail) : undefined;
    if (region) resizeObs?.observe(region);
    window.addEventListener("resize", placeRail, opts);

    const bar = root.querySelector<HTMLElement>(".section-bar");
    const navLinks = bar ? [...bar.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')] : [];
    const navTargets = navLinks.map((a) => root.querySelector<HTMLElement>(a.hash));
    let spyFrame = 0;
    const updateSpy = () => {
      spyFrame = 0;
      const line = (bar?.getBoundingClientRect().bottom ?? 0) + 40;
      let active = 0;
      navTargets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= line) active = i; });
      // The last section can't scroll up to the bar, so light it up once the page bottom is reached.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = navLinks.length - 1;
      navLinks.forEach((a, i) => a.setAttribute("aria-current", String(i === active)));
    };
    updateSpy();
    window.addEventListener("scroll", () => { spyFrame ||= requestAnimationFrame(updateSpy); }, { ...opts, passive: true });

    /* ---------- Gallery ---------- */
    const gallery = root.querySelector<HTMLElement>(".gallery");
    if (gallery) {
      const thumbs = [...gallery.querySelectorAll<HTMLButtonElement>(".thumbs button")];
      const dialog = gallery.querySelector("dialog")!;
      const images = gallery.querySelectorAll<HTMLImageElement>(".gallery-main > img, .lightbox img");
      const counters = gallery.querySelectorAll<HTMLElement>(".gallery-nav > span");
      let current = 0;
      const pad = (n: number) => String(n).padStart(2, "0");
      // Blurred backdrop behind each photo (see .gallery-main::before in magnetic-boxes.css)
      const setBg = (el: HTMLElement, src: string) => el.style.setProperty("--bg", `url("${src}")`);
      const main = gallery.querySelector<HTMLElement>(".gallery-main");
      thumbs.forEach((t) => setBg(t, t.querySelector("img")?.getAttribute("src") || ""));
      if (main) setBg(main, main.querySelector("img")?.getAttribute("src") || "");
      const showImage = (index: number) => {
        current = (index + thumbs.length) % thumbs.length;
        const selected = thumbs[current];
        const source = selected.querySelector("img")!.getAttribute("src") || "";
        if (main) setBg(main, source);
        const alt = (selected.getAttribute("aria-label") || "").replace(/^Show /, "");
        thumbs.forEach((t, i) => t.setAttribute("aria-pressed", String(i === current)));
        images.forEach((img) => {
          if (img.getAttribute("src") === source) return;
          img.src = source;
          img.alt = alt;
          if (!reducedMotion) img.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 320, easing: "ease-out" });
        });
        counters.forEach((c) => { c.textContent = pad(current + 1) + " / " + pad(thumbs.length); });
      };
      thumbs.forEach((t, i) => t.addEventListener("click", () => showImage(i), opts));
      gallery.querySelectorAll('[aria-label^="Previous"]').forEach((b) => b.addEventListener("click", () => showImage(current - 1), opts));
      gallery.querySelectorAll('[aria-label^="Next"]').forEach((b) => b.addEventListener("click", () => showImage(current + 1), opts));
      gallery.querySelector('[aria-label="Enlarge product image"]')?.addEventListener("click", () => dialog.showModal(), opts);
      dialog.querySelector('[aria-label="Close image"]')?.addEventListener("click", () => dialog.close(), opts);
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); }, opts);
      gallery.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        showImage(current + (e.key === "ArrowLeft" ? -1 : 1));
      }, opts);
    }

    /* ---------- Quote form ---------- */
    const form = root.querySelector<HTMLFormElement>("form.quote-form");
    if (form) {
      const field = <T,>(name: string) => form.elements.namedItem(name) as unknown as T;
      const file = field<HTMLInputElement>("artwork");
      const fileLabel = file.closest(".file-label")!;
      const uploadGroup = fileLabel.parentElement as HTMLElement;
      const uploadText = fileLabel.querySelector("span")!;
      const hint = form.querySelector<HTMLElement>(".design-hint")!;
      const submit = form.querySelector<HTMLButtonElement>(".submit")!;
      const normalButton = submit.innerHTML;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-file";
      remove.textContent = "Remove attachment";
      uploadGroup.append(remove);

      const help = document.createElement("p");
      help.className = "form-error";
      help.setAttribute("role", "alert");
      help.hidden = true;
      form.insertBefore(help, submit);
      created.push(remove, help);

      // Material & finish cards only highlight on the page; they don't change the quote form.
      root.querySelectorAll<HTMLElement>(".options .option-grid").forEach((grid) => {
        const cards = [...grid.querySelectorAll<HTMLButtonElement>("button")];
        cards.forEach((b) => b.addEventListener("click", () => {
          const on = b.getAttribute("aria-pressed") !== "true";
          cards.forEach((c) => c.setAttribute("aria-pressed", String(c === b && on)));
        }, opts));
      });

      const showError = (message: string) => {
        help.textContent = message;
        help.hidden = !message;
      };

      // Short forms (e.g. /for-ai-agents/) have no design picker, so this can be null.
      const designField = () => field<RadioNodeList | null>("design");
      const updateArtwork = () => {
        const design = designField()?.value || "";
        const required = design === "Upload my artwork";
        const attachment = file.files?.[0];
        uploadGroup.hidden = !required && !attachment;
        remove.hidden = !attachment;
        // Only name, email and phone are required on quote forms; artwork is always optional.
        file.required = false;
        uploadText.firstChild!.nodeValue = attachment ? attachment.name : "Attach artwork";
        uploadText.querySelector("small")!.textContent = "PDF, PNG or JPG, up to 4 MB · Optional";
        hint.textContent = required ? "Attach your print artwork now, or send it later." : "Our team can help prepare the design for print.";
        if (design === "Download templates") {
          hint.textContent = "Grab a ";
          const link = document.createElement("a");
          link.href = "/free-dieline-templates/";
          link.textContent = "free dieline template";
          hint.append(link, ", add your artwork, then send us your specs.");
        }
      };

      form.querySelectorAll('input[name="design"]').forEach((i) => i.addEventListener("change", updateArtwork, opts));
      root.querySelector('.options a[href="#quote"]')?.addEventListener("click", () => {
        const design = designField();
        if (design) design.value = "Design support";
        updateArtwork();
      }, opts);
      file.addEventListener("change", () => {
        const attachment = file.files?.[0];
        if (attachment && (attachment.size > 4 * 1024 * 1024 || !/\.(pdf|png|jpe?g)$/i.test(attachment.name))) {
          file.value = "";
          showError("Choose a PDF, PNG or JPG file up to 4 MB.");
        } else {
          showError("");
        }
        updateArtwork();
      }, opts);
      remove.addEventListener("click", () => { file.value = ""; updateArtwork(); }, opts);
      updateArtwork();

      let requestId = "";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (submit.disabled) return;
        showError("");
        submit.disabled = true;
        submit.textContent = "Sending…";
        const fields = new FormData(form);
        requestId ||= crypto.randomUUID();
        fields.set("id", requestId);
        fields.set("page", window.location.pathname);
        const result = await submitQuote(fields);
        if (result.ok) {
          // Keep the button in its "Sending…" state while the thank-you page loads.
          window.location.assign(thankYouUrl(result.reference, String(fields.get("name") || "")));
          return;
        }
        showError(result.message);
        submit.disabled = false;
        submit.innerHTML = normalButton;
      }, opts);
    }

    /* ---------- Hero review rotation ---------- */
    const reviewCard = root.querySelector<HTMLElement>(".hero-review");
    const slides = reviewCard ? [...reviewCard.querySelectorAll<HTMLElement>(".review-slide")] : [];
    let reviewTimer: number | undefined;
    const dotButtons: HTMLButtonElement[] = [];
    const setExpanded = (slide: HTMLElement, open: boolean) => {
      slide.classList.toggle("is-expanded", open);
      const more = slide.querySelector<HTMLButtonElement>(".review-more");
      if (more) {
        more.setAttribute("aria-expanded", String(open));
        more.textContent = open ? "Read less«" : "Read more»";
      }
    };
    const showReview = (index: number) => {
      expanded = false;
      slides.forEach((s, i) => {
        setExpanded(s, false);
        s.classList.toggle("is-active", i === index);
        s.setAttribute("aria-hidden", String(i !== index));
      });
      dotButtons.forEach((d, i) => d.setAttribute("aria-current", String(i === index)));
      current = index;
    };
    let current = 0;
    let expanded = false; // a "Read more" review stays put until it's collapsed again
    // Time on screen follows the visible text: 2.5s for a one-liner, up to 4.5s for the longest review.
    const readTime = (slide: HTMLElement) => {
      const len = (sel: string) => (slide.querySelector(sel)?.textContent || "").length;
      const chars = len("blockquote") - len(".review-rest") - len(".review-more"); // only the text shown before "Read more"
      return Math.min(4500, Math.max(2500, 1500 + chars * 25));
    };
    const stopReviews = () => window.clearTimeout(reviewTimer);
    const startReviews = () => {
      stopReviews();
      if (expanded || !slides.length) return;
      reviewTimer = window.setTimeout(() => {
        showReview((current + 1) % slides.length);
        startReviews();
      }, readTime(slides[current]));
    };
    if (reviewCard && slides.length > 1) {
      const dots = document.createElement("div");
      dots.className = "review-dots";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Show review ${i + 1} of ${slides.length}`);
        dot.addEventListener("click", () => { showReview(i); startReviews(); }, opts);
        dotButtons.push(dot);
        dots.append(dot);
      });
      reviewCard.append(dots);
      created.push(dots);
      showReview(0);
      // Pause while the reader is hovering or using the dots.
      reviewCard.addEventListener("mouseenter", stopReviews, opts);
      reviewCard.addEventListener("mouseleave", startReviews, opts);
      reviewCard.addEventListener("focusin", stopReviews, opts);
      reviewCard.addEventListener("focusout", startReviews, opts);
      startReviews();
    }
    // "Read more" reveals the rest of a long review; rotation pauses until "Read less".
    slides.forEach((slide) => {
      const more = slide.querySelector<HTMLButtonElement>(".review-more");
      more?.addEventListener("click", () => {
        const open = !slide.classList.contains("is-expanded");
        setExpanded(slide, open);
        expanded = open;
        if (open) stopReviews(); else startReviews();
      }, opts);
    });

    return () => {
      ac.abort();
      stopReviews();
      if (slides.length) showReview(0);
      observer?.disconnect();
      resizeObs?.disconnect();
      if (spyFrame) cancelAnimationFrame(spyFrame);
      region?.style.removeProperty("--rail-bottom");
      navLinks.forEach((a) => a.removeAttribute("aria-current"));
      root.classList.remove("plmb-reveal");
      revealTargets.forEach((el) => { el.classList.remove("plmb-r", "is-in"); el.style.transitionDelay = ""; });
      created.forEach((el) => el.remove());
      if (form) form.hidden = false;
    };
  }, []);

  return null;
}
