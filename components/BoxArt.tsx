// Drawn box illustration used as a placeholder until real product photos are added.
type Props = {
  base?: string; // box body colour
  lid?: string; // lid colour
  accent?: string; // logo / trim colour
  bg?: string; // backdrop
  open?: boolean;
  label?: string;
};

export default function BoxArt({
  base = "#efe3cf",
  lid = "#f6ecdc",
  accent = "#2f6b3c",
  bg = "#e9e1d4",
  open = true,
  label = "PACK LEGACY",
}: Props) {
  return (
    <svg viewBox="0 0 400 320" className="box-art" role="img" aria-label="Magnetic closure box">
      <rect width="400" height="320" fill={bg} />
      <ellipse cx="200" cy="268" rx="150" ry="18" fill="#000" opacity="0.08" />
      {/* box body */}
      <polygon points="70,170 200,215 330,170 330,250 200,295 70,250" fill={base} />
      <polygon points="200,215 330,170 330,250 200,295" fill="#000" opacity="0.08" />
      <polygon points="70,170 200,125 330,170 200,215" fill="#000" opacity="0.18" />
      {open ? (
        <>
          {/* inside + lid hinged open */}
          <polygon points="85,170 200,132 315,170 200,208" fill="#fff" opacity="0.55" />
          <rect x="150" y="150" width="34" height="40" rx="4" fill={accent} opacity="0.55" />
          <rect x="196" y="146" width="28" height="46" rx="6" fill="#d9a89b" opacity="0.8" />
          <polygon points="70,170 200,125 200,40 70,85" fill={lid} />
          <polygon points="70,170 200,125 200,40 70,85" fill="#000" opacity="0.04" />
          <text
            x="135"
            y="110"
            fill={accent}
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            transform="rotate(-19 135 110)"
            fontFamily="Poppins, sans-serif"
          >
            {label}
          </text>
        </>
      ) : (
        <>
          <polygon points="70,160 200,115 330,160 200,205" fill={lid} />
          <text
            x="200"
            y="165"
            fill={accent}
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="Poppins, sans-serif"
          >
            {label}
          </text>
        </>
      )}
    </svg>
  );
}
