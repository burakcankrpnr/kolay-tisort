import { z } from "zod";

/**
 * Panelden yönetilen tüm görünüm ayarlarının tipli şemaları.
 * İstemci ve sunucu bileşenleri bu dosyayı paylaşır; Prisma içermez.
 */

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Renk #RRGGBB biçiminde olmalı");

export const brandSchema = z.object({
  name: z.string().min(1).max(40).default("StylingPark"),
  domain: z.string().max(80).default("www.stylingpark.com"),
  slogan: z.string().max(120).default("Kendi tasarımını giy."),
  description: z
    .string()
    .max(300)
    .default(
      "Kişiye özel tişört, oversize, hoodie, sweatshirt ve DTF baskı. Tasarımını yükle, fiyatını anında gör, atölyemiz üretip kapına göndersin.",
    ),
  email: z.string().max(120).default("destek@stylingpark.com"),
  phone: z.string().max(40).default(""),
  whatsapp: z.string().max(40).default(""),
  instagram: z.string().max(200).default(""),
});

export const displayFonts = ["bricolage", "space", "barlow"] as const;
export const bodyFonts = ["inter", "barlow"] as const;

export const fontLabels: Record<(typeof displayFonts)[number] | (typeof bodyFonts)[number], string> = {
  bricolage: "Bricolage Grotesque",
  space: "Space Grotesk",
  barlow: "Barlow",
  inter: "Inter",
};

export const themeSchema = z.object({
  primary: hex.default("#FF3B00"),
  primaryForeground: hex.default("#FFFFFF"),
  background: hex.default("#FAFAF8"),
  foreground: hex.default("#111111"),
  border: hex.default("#E8E6E1"),
  darkBackground: hex.default("#0E0E0D"),
  darkForeground: hex.default("#F4F3EF"),
  darkBorder: hex.default("#2A2926"),
  mode: z.enum(["system", "light", "dark"]).default("system"),
  displayFont: z.enum(displayFonts).default("bricolage"),
  bodyFont: z.enum(bodyFonts).default("inter"),
  radius: z.enum(["sharp", "soft", "round"]).default("soft"),
});

export const effectLevels = ["off", "light", "normal", "show"] as const;
export type EffectLevel = (typeof effectLevels)[number];

export const effectLevelLabels: Record<EffectLevel, string> = {
  off: "Kapalı",
  light: "Hafif",
  normal: "Normal",
  show: "Şov",
};

/**
 * Her efektin hangi yoğunluk seviyesinden itibaren açıldığı.
 * Seviye bu değere eşit veya büyükse ve efektin anahtarı kapalı değilse efekt çalışır.
 */
export const effectCatalog = {
  kineticTitle: { label: "Kinetik başlık", minLevel: "light" },
  scrollReveal: { label: "Scroll animasyonları", minLevel: "light" },
  marquee: { label: "Kayan şerit (marquee)", minLevel: "normal" },
  tiltCard: { label: "Kart tilt + parıltı", minLevel: "normal" },
  spotlight: { label: "Spotlight ışığı", minLevel: "normal" },
  counters: { label: "Sayı sayaçları", minLevel: "normal" },
  meshGradient: { label: "Mesh gradient arka plan", minLevel: "normal" },
  grain: { label: "Grain dokusu", minLevel: "normal" },
  stickyStory: { label: "Sticky “Nasıl çalışır”", minLevel: "normal" },
  scrollProgress: { label: "Sayfa ilerleme çubuğu", minLevel: "normal" },
  heroParallax: { label: "Hero ürün parallax", minLevel: "show" },
  magnetic: { label: "Magnetic buton", minLevel: "show" },
  customCursor: { label: "Özel imleç", minLevel: "show" },
  confetti: { label: "Konfeti / kutlama", minLevel: "light" },
  pageTransitions: { label: "Sayfa geçişleri", minLevel: "show" },
  sound: { label: "Ses efektleri", minLevel: "show" },
} as const satisfies Record<string, { label: string; minLevel: EffectLevel }>;

export type EffectName = keyof typeof effectCatalog;
export const effectNames = Object.keys(effectCatalog) as EffectName[];

/** "auto" seviyeye uyar, "on"/"off" seviyeden bağımsız zorlar. */
const toggle = z.enum(["auto", "on", "off"]).default("auto");

export const effectsSchema = z.object({
  level: z.enum(effectLevels).default("normal"),
  mobileLevel: z.enum([...effectLevels, "inherit"]).default("inherit"),
  speed: z.enum(["slow", "normal", "fast"]).default("normal"),
  toggles: z
    .object(Object.fromEntries(effectNames.map((name) => [name, toggle])) as Record<EffectName, typeof toggle>)
    .default({}),
  stats: z
    .array(z.object({ value: z.number().min(0), prefix: z.string().max(4).default(""), suffix: z.string().max(6), label: z.string().max(40), decimals: z.number().int().min(0).max(2) }))
    .max(4)
    .default([
      { value: 3, suffix: " gün", label: "standart üretim süresi", decimals: 0 },
      { value: 300, suffix: " DPI", label: "baskı çözünürlüğü kontrolü", decimals: 0 },
      { value: 15, prefix: "%", suffix: "", label: "toplu siparişte indirime kadar", decimals: 0 },
      { value: 4, suffix: "", label: "anlaşmalı kargo firması", decimals: 0 },
    ]),
});

export const promoSchema = z.object({
  enabled: z.boolean().default(true),
  text: z.string().max(160).default("Üretim 3 iş günü · 10 adet ve üzerine otomatik toplu indirim"),
  href: z.string().max(200).default("/urunler"),
  startsAt: z.string().default(""),
  endsAt: z.string().default(""),
});

export const settingSchemas = {
  brand: brandSchema,
  theme: themeSchema,
  effects: effectsSchema,
  promo: promoSchema,
} as const;

export type SettingKey = keyof typeof settingSchemas;
export type Brand = z.infer<typeof brandSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Effects = z.infer<typeof effectsSchema>;
export type Promo = z.infer<typeof promoSchema>;
export type Settings = { brand: Brand; theme: Theme; effects: Effects; promo: Promo };

export function parseSetting<K extends SettingKey>(key: K, raw: unknown): Settings[K] {
  const result = settingSchemas[key].safeParse(raw ?? {});
  // Bozuk/eksik kayıt siteyi düşürmez: varsayılanlara döner.
  return (result.success ? result.data : settingSchemas[key].parse({})) as Settings[K];
}

const levelRank: Record<EffectLevel, number> = { off: 0, light: 1, normal: 2, show: 3 };

export function isEffectEnabled(effects: Effects, name: EffectName, level: EffectLevel = effects.level) {
  const toggleValue = effects.toggles[name] ?? "auto";
  if (toggleValue === "off") return false;
  if (name === "sound") return toggleValue === "on"; // ses varsayılan kapalı
  if (toggleValue === "on") return level !== "off";
  return levelRank[level] >= levelRank[effectCatalog[name].minLevel];
}

/** Hex → "H S% L%" (CSS hsl() içinde kullanılmak üzere). */
export function hexToHsl(value: string) {
  const r = parseInt(value.slice(1, 3), 16) / 255;
  const g = parseInt(value.slice(3, 5), 16) / 255;
  const b = parseInt(value.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function luminance(value: string) {
  const channel = (i: number) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** WCAG kontrast oranı (panelde uyarı için). */
export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
