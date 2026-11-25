"use client";

// PT / LBS to GSM calculator used in the paper weight article. Same multipliers as the article's formulas.
import { useState } from "react";

const STOCKS = {
  text: { label: "Text Stock", pt: 600, lbs: 1.48 },
  uncoated: { label: "Uncoated Stock", pt: 1400, lbs: 1.48 },
  c1s: { label: "Coated Stock — C1S (One Side)", pt: 1500, lbs: 2.71 },
  c2s: { label: "Coated Stock — C2S (Both Sides)", pt: 1650, lbs: 2.71 },
};

export default function GsmCalculator() {
  const [stock, setStock] = useState<keyof typeof STOCKS>("text");
  const [unit, setUnit] = useState<"pt" | "lbs">("pt");
  const [value, setValue] = useState("");

  const n = parseFloat(value);
  const m = STOCKS[stock][unit];
  const gsm = n > 0 ? Math.round(unit === "pt" ? (n * m) / 100 : n * m) : null;
  const formula = unit === "pt" ? `${n} pt × ${m} ÷ 100` : `${n} lbs × ${m}`;

  return (
    <div className="ba-card ba-calc" role="group" aria-label="GSM Conversion Calculator">
      <div className="ba-calc-fields">
        <label>
          Paper Stock Type
          <select value={stock} onChange={(e) => setStock(e.target.value as keyof typeof STOCKS)}>
            {Object.entries(STOCKS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </label>
        <label>
          Measurement Unit
          <select value={unit} onChange={(e) => setUnit(e.target.value as "pt" | "lbs")}>
            <option value="pt">PT (Points)</option>
            <option value="lbs">LBS (Pounds)</option>
          </select>
        </label>
        <label>
          Enter Value
          <input type="number" min="0" step="any" inputMode="decimal" placeholder="e.g. 16" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
      </div>
      <p className="ba-calc-result" aria-live="polite">
        {gsm === null ? "Enter a value above zero to see the GSM." : <><strong>≈ {gsm} GSM</strong> <span>({formula}, approximate)</span></>}
      </p>
    </div>
  );
}
