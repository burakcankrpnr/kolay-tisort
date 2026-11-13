import { hexToHsl, type Effects, type Theme } from "@/lib/settings-schema";

const radius = {
  sharp: { card: "2px", control: "2px" },
  soft: { card: "16px", control: "12px" },
  round: { card: "28px", control: "9999px" },
} as const;

const motionScale = { slow: 1.4, normal: 1, fast: 0.7 } as const;

/** Panel tema ayarını :root CSS değişkenlerine çevirir (layout'ta <style> olarak basılır). */
export function themeCss(theme: Theme, effects: Effects) {
  const light = [
    `--background:${hexToHsl(theme.background)}`,
    `--foreground:${hexToHsl(theme.foreground)}`,
    `--primary:${hexToHsl(theme.primary)}`,
    `--primary-foreground:${hexToHsl(theme.primaryForeground)}`,
    `--border:${hexToHsl(theme.border)}`,
    `--r-card:${radius[theme.radius].card}`,
    `--r-control:${radius[theme.radius].control}`,
    `--font-display-active:var(--font-${theme.displayFont}-display)`,
    `--font-body-active:var(--font-${theme.bodyFont}-body)`,
    `--motion-scale:${motionScale[effects.speed]}`,
  ].join(";");
  const dark = [
    `--background:${hexToHsl(theme.darkBackground)}`,
    `--foreground:${hexToHsl(theme.darkForeground)}`,
    `--border:${hexToHsl(theme.darkBorder)}`,
  ].join(";");
  return `:root{${light}}:root[data-theme="dark"]{${dark}}`;
}

/**
 * İlk boyamadan önce çalışan küçük betik: tema tercihini uygular (FOUC yok).
 * Kullanıcının manuel seçimi localStorage'da, yoksa panel varsayılanı/sistem.
 */
export function themeBootScript(mode: Theme["mode"]) {
  return `(function(){try{var m=localStorage.getItem("theme")||${JSON.stringify(mode)};var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;
}
