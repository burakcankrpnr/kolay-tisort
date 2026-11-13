import {
  Anton,
  Archivo_Black,
  Bebas_Neue,
  Bungee,
  Caveat,
  Courier_Prime,
  Dancing_Script,
  Inter,
  Lobster,
  Montserrat,
  Oswald,
  Pacifico,
  Playfair_Display,
  Press_Start_2P,
  Righteous,
  Rubik,
  Space_Grotesk,
} from "next/font/google";

/*
 * Stüdyo font kütüphanesi: hepsi self-host (next/font), Türkçe karakter destekli
 * (latin-ext). preload kapalı → yalnızca kullanılan font indirilir.
 */
const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: ["400", "700", "900"] });
const montserrat = Montserrat({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: ["400", "700", "900"], style: ["normal", "italic"] });
const oswald = Oswald({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: ["400", "700"] });
const bebas = Bebas_Neue({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: "400" });
const anton = Anton({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: "400" });
const archivo = Archivo_Black({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: "400" });
const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: ["400", "700", "900"], style: ["normal", "italic"] });
const lobster = Lobster({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: "400" });
const pacifico = Pacifico({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: "400" });
const caveat = Caveat({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: ["400", "700"] });
const righteous = Righteous({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: "400" });
const bungee = Bungee({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: "400" });
const space = Space_Grotesk({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: ["400", "700"] });
const pressStart = Press_Start_2P({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: "400" });
const dancing = Dancing_Script({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: ["400", "700"] });
const rubik = Rubik({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: ["400", "700", "900"], style: ["normal", "italic"] });
const courier = Courier_Prime({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, weight: ["400", "700"], style: ["normal", "italic"] });

export type StudioFont = { name: string; family: string; category: "Sans" | "Display" | "Serif" | "El yazısı" | "Retro" };

export const studioFonts: StudioFont[] = [
  { name: "Inter", family: inter.style.fontFamily, category: "Sans" },
  { name: "Montserrat", family: montserrat.style.fontFamily, category: "Sans" },
  { name: "Rubik", family: rubik.style.fontFamily, category: "Sans" },
  { name: "Space Grotesk", family: space.style.fontFamily, category: "Sans" },
  { name: "Oswald", family: oswald.style.fontFamily, category: "Display" },
  { name: "Bebas Neue", family: bebas.style.fontFamily, category: "Display" },
  { name: "Anton", family: anton.style.fontFamily, category: "Display" },
  { name: "Archivo Black", family: archivo.style.fontFamily, category: "Display" },
  { name: "Bungee", family: bungee.style.fontFamily, category: "Display" },
  { name: "Playfair Display", family: playfair.style.fontFamily, category: "Serif" },
  { name: "Courier Prime", family: courier.style.fontFamily, category: "Serif" },
  { name: "Lobster", family: lobster.style.fontFamily, category: "El yazısı" },
  { name: "Pacifico", family: pacifico.style.fontFamily, category: "El yazısı" },
  { name: "Caveat", family: caveat.style.fontFamily, category: "El yazısı" },
  { name: "Dancing Script", family: dancing.style.fontFamily, category: "El yazısı" },
  { name: "Righteous", family: righteous.style.fontFamily, category: "Retro" },
  { name: "Press Start 2P", family: pressStart.style.fontFamily, category: "Retro" },
];

const byName = new Map(studioFonts.map((font) => [font.name, font]));

/** Kayıtlı ad → CSS font-family. Bilinmeyen adlar (eski kayıtlar) olduğu gibi döner. */
export function fontFamilyFor(name: string) {
  return byName.get(name)?.family ?? name;
}

/** Konva canvas'a çizmeden önce fontun gerçekten yüklenmesini bekler. */
export async function ensureFont(name: string, style = "normal") {
  if (typeof document === "undefined" || !document.fonts) return;
  const family = fontFamilyFor(name);
  const weight = style.includes("bold") ? "700" : "400";
  const italic = style.includes("italic") ? "italic " : "";
  try {
    await document.fonts.load(`${italic}${weight} 40px ${family}`, "AaĞğİıŞşÇçÖöÜü");
  } catch {
    // font yüklenemezse yedek fontla çizilir
  }
}
