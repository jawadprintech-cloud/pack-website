"use client";

import { useState } from "react";
import BoxArt from "./BoxArt";

const views = [
  { base: "#efe3cf", lid: "#f6ecdc", accent: "#2f6b3c", bg: "#e9e1d4", open: true },
  { base: "#1f2a44", lid: "#26355a", accent: "#d9b56a", bg: "#dfe3ea", open: true },
  { base: "#5a3c6e", lid: "#6b4a82", accent: "#f1d9a8", bg: "#ece6f0", open: false },
  { base: "#f2c9cf", lid: "#f7dade", accent: "#8a3b4a", bg: "#f6eef0", open: true },
];

export default function Gallery() {
  const [active, setActive] = useState(0);
  return (
    <div className="gallery">
      <div className="gallery-thumbs">
        {views.map((v, i) => (
          <button
            key={i}
            className={`thumb ${active === i ? "is-active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
          >
            <BoxArt {...v} />
          </button>
        ))}
      </div>
      <div className="gallery-main">
        <BoxArt {...views[active]} />
      </div>
    </div>
  );
}
