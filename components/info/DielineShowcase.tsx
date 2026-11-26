/* Hero visual for /free-dieline-templates: an interactive tuck-end dieline. Pure CSS hover, no JS. */

const panels = [
  { id: "glue", label: "Glue flap", d: "M30 98 L45 90 L45 210 L30 202 Z" },
  { id: "front", label: "Front", d: "M45 90 H125 V210 H45 Z" },
  { id: "side-l", label: "Side", d: "M125 90 H175 V210 H125 Z" },
  { id: "back", label: "Back", d: "M175 90 H255 V210 H175 Z" },
  { id: "side-r", label: "Side", d: "M255 90 H305 V210 H255 Z" },
  { id: "lid", label: "Top lid", d: "M175 90 V40 H255 V90 Z" },
  { id: "tuck-t", label: "Tuck", d: "M178 40 Q180 24 196 24 H234 Q250 24 252 40 Z" },
  { id: "dust-tl", label: "Dust flap", d: "M127 90 L135 62 H167 L173 90 Z" },
  { id: "dust-tr", label: "Dust flap", d: "M257 90 L263 62 H297 L303 90 Z" },
  { id: "base", label: "Bottom lid", d: "M45 210 V260 H125 V210 Z" },
  { id: "tuck-b", label: "Tuck", d: "M48 260 Q50 276 66 276 H104 Q120 276 122 260 Z" },
  { id: "dust-bl", label: "Dust flap", d: "M127 210 L135 238 H167 L173 210 Z" },
  { id: "dust-br", label: "Dust flap", d: "M257 210 L263 238 H297 L303 210 Z" },
];

const folds = [
  "M45 90 V210", "M125 90 V210", "M175 90 V210", "M255 90 V210",
  "M175 90 H255", "M178 40 H252", "M127 90 H173", "M257 90 H303",
  "M45 210 H125", "M48 260 H122", "M127 210 H173", "M257 210 H303",
];

export default function DielineShowcase() {
  return (
    <div className="dls" aria-hidden="true">
      <div className="dls-fan">
        <img className="dls-thumb dls-thumb-a" src="/images/mailer-box-dieline.webp" alt="" width={480} height={360} />
        <img className="dls-thumb dls-thumb-b" src="/images/pillow-box-dieline.webp" alt="" width={480} height={360} />
      </div>

      <div className="dls-board">
        <div className="dls-bar">
          <span className="dls-dots"><i /><i /><i /></span>
          <span className="dls-file">tuck-end-box.pdf</span>
          <span className="dls-size">4 × 2.5 × 6 in</span>
        </div>

        <svg className="dls-svg" viewBox="15 10 305 280" role="presentation">
          <defs>
            <pattern id="dls-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0H0V10" fill="none" className="dls-gridline" />
            </pattern>
          </defs>
          <rect x="15" y="10" width="305" height="280" fill="url(#dls-grid)" />
          {panels.map((p) => (
            <path key={p.id} className="dls-panel" d={p.d}>
              <title>{p.label}</title>
            </path>
          ))}
          {folds.map((d) => <path key={d} className="dls-fold-under" d={d} />)}
          {folds.map((d) => <path key={`f${d}`} className="dls-fold" d={d} />)}
          <text className="dls-label" x="85" y="154">FRONT</text>
          <text className="dls-label" x="215" y="154">BACK</text>
          <text className="dls-label dls-label-sm" x="150" y="154">SIDE</text>
          <text className="dls-label dls-label-sm" x="280" y="154">SIDE</text>
        </svg>

        <ul className="dls-legend">
          <li><span className="dls-key dls-key-cut" />Cut</li>
          <li><span className="dls-key dls-key-fold" />Fold</li>
          <li><span className="dls-key dls-key-glue" />Glue</li>
        </ul>
      </div>

      <span className="dls-chip dls-chip-a">✓ Print-ready PDF</span>
      <span className="dls-chip dls-chip-b">10 free templates</span>
    </div>
  );
}
