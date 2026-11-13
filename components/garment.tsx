import type { Silhouette } from "@prisma/client";

const bodies: Record<Silhouette, string> = {
  TEE: "M76 34 C88 52 112 52 124 34 L154 46 L184 86 L162 98 L146 66 L146 204 L54 204 L54 66 L38 98 L16 86 L46 46 Z",
  HOODIE:
    "M70 58 C70 22 130 22 130 58 C140 48 156 50 162 62 L184 96 L162 110 L148 78 L148 206 L52 206 L52 78 L38 110 L16 96 L38 62 C44 50 60 48 70 58 Z",
  SWEAT:
    "M78 36 C90 52 110 52 122 36 L168 52 L196 128 L174 136 L156 72 L156 198 L44 198 L44 72 L26 136 L4 128 L32 52 Z",
};

export function Garment({
  kind,
  color,
  className,
}: {
  kind: Silhouette;
  color: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 200 230" className={className} aria-hidden="true">
      <path d={bodies[kind]} fill={color} stroke="#121212" strokeWidth="2" strokeLinejoin="round" />
      <rect x="78" y="96" width="44" height="58" fill="#FF3B00" />
      {kind === "SWEAT" ? (
        <path d="M54 186 H146" stroke="#121212" strokeWidth="2" />
      ) : null}
      {kind === "HOODIE" ? (
        <path d="M78 150 H122 V176 H78 Z" fill="none" stroke="#121212" strokeWidth="2" />
      ) : null}
    </svg>
  );
}
