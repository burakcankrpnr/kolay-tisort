/** Mutlak site adresi: önce NEXT_PUBLIC_SITE_URL, sonra AUTH_URL, son çare localhost. */
export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** title ≤ 60, description ≤ 155 karakter kuralı (kelime ortasından kesmeden). */
export function clampText(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20))}…`;
}
