// "How to Order" steps with the quote form, on the homepage and About Us. Outside the homepage, wrap it in <div className="plh">.
import { QuoteBox } from "@/components/home/HomeClient";
import "@/styles/home.css";

const steps = [
  ["Choose Your Box Style", "Select the box style, size, and material that best fits your product. Share your required quantity and any special packaging needs."],
  ["Customize Your Packaging", "Add your logo, artwork, brand colors, and preferred finishes. Our design team can help you prepare your design and review a digital proof before production."],
  ["Get Your Boxes Delivered", "Review your quote, approve the final design, and confirm your order. We will produce your custom boxes and ship them to your doorstep."],
];

export default function OrderSection() {
  return (
    <section className="h-wrap h-section h-split h-process" aria-labelledby="h-process-title">
      <div>
        <p className="h-eyebrow">How to Order</p>
        <h2 className="h-display" id="h-process-title">From Your Idea to Custom Packaging</h2>
        <p className="h-sub">
          Ordering custom boxes is simple. Share your packaging needs, choose your design, and let us handle the
          production.
        </p>
        <ol className="h-steps">
          {steps.map(([t, d], i) => (
            <li key={t}>
              <span className="h-step-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <QuoteBox />
    </section>
  );
}
