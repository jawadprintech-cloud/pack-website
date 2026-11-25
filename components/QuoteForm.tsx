"use client";

import { useState } from "react";

const designModes = [
  { id: "premade", label: "Browse Our\nPre-made Designs", icon: "▦" },
  { id: "online", label: "Design Online", icon: "✎" },
  { id: "pdf", label: "Upload PDF File", icon: "⇪" },
];

export default function QuoteForm() {
  const [mode, setMode] = useState("premade");
  const [sent, setSent] = useState(false);

  return (
    <aside className="quote-card" id="quote">
      <div className="quote-head">
        <h3>Get a Quote</h3>
      </div>
      <ul className="quote-perks">
        <li>✓ No Minimum Quantity</li>
        <li>✓ Free Design Support</li>
        <li>✓ Free US Shipping</li>
        <li>✓ Custom Printing</li>
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <p className="quote-lead">Let&apos;s create your box.</p>
        <p className="quote-sub">How would you like to design your box?</p>
        <div className="design-modes">
          {designModes.map((m) => (
            <button
              type="button"
              key={m.id}
              className={`design-mode ${mode === m.id ? "is-active" : ""}`}
              onClick={() => setMode(m.id)}
            >
              <span className="dm-icon">{m.icon}</span>
              <span className="dm-label">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="grid-2">
          <label>
            Full Name
            <input required placeholder="Full Name" />
          </label>
          <label>
            Email Address
            <input required type="email" placeholder="Email Address" />
          </label>
          <label>
            Phone Number
            <input type="tel" placeholder="Phone Number" />
          </label>
          <label>
            Material Options
            <select defaultValue="">
              <option value="" disabled>
                Material Options
              </option>
              <option>Grey Chipboard</option>
              <option>Thick Cardstock</option>
              <option>Duplex Chipboard</option>
            </select>
          </label>
        </div>

        <div className="grid-3">
          <label>
            Quantity
            <input type="number" name="quantity" min={1} step={1} placeholder="Quantity" inputMode="numeric" />
          </label>
          <label>
            Special Finishes
            <select defaultValue="">
              <option value="" disabled>
                Choose an option
              </option>
              <option>Matte</option>
              <option>Gloss</option>
              <option>Soft Touch</option>
              <option>Spot UV</option>
              <option>Foil Stamping</option>
            </select>
          </label>
        </div>

        <div className="grid-4">
          <label>
            Length
            <input inputMode="decimal" placeholder="Length" />
          </label>
          <label>
            Width
            <input inputMode="decimal" placeholder="Width" />
          </label>
          <label>
            Height
            <input inputMode="decimal" placeholder="Height" />
          </label>
          <label>
            Unit
            <select defaultValue="inches">
              <option>inches</option>
              <option>cm</option>
              <option>mm</option>
            </select>
          </label>
        </div>

        <label>
          Project Details / Special Instructions
          <textarea rows={3} placeholder="Tell us about your product, finish, and ideal delivery date..." />
        </label>

        <label className="check">
          <input type="checkbox" required />
          <span>I agree to the Privacy Policy and consent to being contacted about my packaging request.</span>
        </label>

        <div className="starting">
          <span>Starting From</span>
          <strong>$0.42</strong>
        </div>

        <button className="btn-red btn-block" type="submit">
          {sent ? "Request received ✓" : "Submit"}
        </button>
        <p className="quote-foot">Custom sizes. Free design support. No minimums.</p>
        <p className="quote-note">
          Preview form: submission and spam protection require the WordPress connection. Send your request on Pack
          Legacy
        </p>
      </form>
    </aside>
  );
}
