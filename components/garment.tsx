import { useId } from "react";
import type { Silhouette } from "@prisma/client";

export const garmentPaths: Record<Silhouette, string> = {
  TEE: "M76 34 C88 52 112 52 124 34 L154 46 L184 86 L162 98 L146 66 L146 204 L54 204 L54 66 L38 98 L16 86 L46 46 Z",
  HOODIE:
    "M70 58 C70 22 130 22 130 58 C140 48 156 50 162 62 L184 96 L162 110 L148 78 L148 206 L52 206 L52 78 L38 110 L16 96 L38 62 C44 50 60 48 70 58 Z",
  SWEAT:
    "M78 36 C90 52 110 52 122 36 L168 52 L196 128 L174 136 L156 72 L156 198 L44 198 L44 72 L26 136 L4 128 L32 52 Z",
};

/**
 * Vektör ürün mockup'ı: kumaş gölgesi + ışık katmanı ile baskı kumaşa oturmuş görünür.
 * `print` false ise baskı alanı çizilmez.
 */
export function Garment({
  kind,
  color,
  className,
  print = true,
}: {
  kind: Silhouette;
  color: string;
  className?: string;
  print?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const light = isLight(color);
  const stroke = light ? "rgba(17,17,17,.35)" : "rgba(255,255,255,.12)";
  return (
    <svg viewBox="0 0 200 230" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`shade-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={light ? 0.0 : 0.14} />
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={light ? 0.12 : 0.35} />
        </linearGradient>
        <radialGradient id={`fold-${id}`} cx="0.5" cy="0.3" r="0.7">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={light ? 0.08 : 0.2} />
        </radialGradient>
        <clipPath id={`clip-${id}`}>
          <path d={garmentPaths[kind]} />
        </clipPath>
      </defs>
      <ellipse cx="100" cy="216" rx="70" ry="6" fill="#000" opacity="0.08" />
      <path d={garmentPaths[kind]} fill={color} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
      <g clipPath={`url(#clip-${id})`}>
        <rect width="200" height="230" fill={`url(#fold-${id})`} />
        <path d="M70 120 C90 128 110 112 130 124" stroke="#000" strokeOpacity="0.06" strokeWidth="6" fill="none" />
        {print ? (
          <g style={{ mixBlendMode: light ? "multiply" : "normal" }}>
            <rect x="74" y="92" width="52" height="62" rx="4" style={{ fill: "hsl(var(--primary))" }} />
            <path d="M84 138 L100 106 L116 138 Z" fill={light ? "#111" : "#FAFAF8"} opacity="0.9" />
            <circle cx="112" cy="106" r="5" fill={light ? "#111" : "#FAFAF8"} opacity="0.9" />
          </g>
        ) : null}
        <rect width="200" height="230" fill={`url(#shade-${id})`} />
      </g>
      {kind === "SWEAT" ? <path d="M46 186 H154" stroke={stroke} strokeWidth="1.5" /> : null}
      {kind === "HOODIE" ? <path d="M78 160 H122 V184 H78 Z" fill="none" stroke={stroke} strokeWidth="1.5" /> : null}
      {kind !== "HOODIE" ? (
        <path d="M76 34 C88 52 112 52 124 34" fill="none" stroke={stroke} strokeWidth="1.5" />
      ) : null}
    </svg>
  );
}

function isLight(hex: string) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
