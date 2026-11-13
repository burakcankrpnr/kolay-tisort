import { __iconNode as n_heart } from "lucide-react/dist/esm/icons/heart.js";
import { __iconNode as n_star } from "lucide-react/dist/esm/icons/star.js";
import { __iconNode as n_zap } from "lucide-react/dist/esm/icons/zap.js";
import { __iconNode as n_crown } from "lucide-react/dist/esm/icons/crown.js";
import { __iconNode as n_flame } from "lucide-react/dist/esm/icons/flame.js";
import { __iconNode as n_smile } from "lucide-react/dist/esm/icons/smile.js";
import { __iconNode as n_music } from "lucide-react/dist/esm/icons/music.js";
import { __iconNode as n_sun } from "lucide-react/dist/esm/icons/sun.js";
import { __iconNode as n_moon } from "lucide-react/dist/esm/icons/moon.js";
import { __iconNode as n_cloud } from "lucide-react/dist/esm/icons/cloud.js";
import { __iconNode as n_skull } from "lucide-react/dist/esm/icons/skull.js";
import { __iconNode as n_rocket } from "lucide-react/dist/esm/icons/rocket.js";
import { __iconNode as n_gamepad } from "lucide-react/dist/esm/icons/gamepad-2.js";
import { __iconNode as n_trophy } from "lucide-react/dist/esm/icons/trophy.js";
import { __iconNode as n_anchor } from "lucide-react/dist/esm/icons/anchor.js";
import { __iconNode as n_leaf } from "lucide-react/dist/esm/icons/leaf.js";
import { __iconNode as n_flower } from "lucide-react/dist/esm/icons/flower-2.js";
import { __iconNode as n_cat } from "lucide-react/dist/esm/icons/cat.js";
import { __iconNode as n_dog } from "lucide-react/dist/esm/icons/dog.js";
import { __iconNode as n_paw } from "lucide-react/dist/esm/icons/paw-print.js";
import { __iconNode as n_coffee } from "lucide-react/dist/esm/icons/coffee.js";
import { __iconNode as n_camera } from "lucide-react/dist/esm/icons/camera.js";
import { __iconNode as n_mountain } from "lucide-react/dist/esm/icons/mountain.js";
import { __iconNode as n_waves } from "lucide-react/dist/esm/icons/waves.js";
import { __iconNode as n_sparkles } from "lucide-react/dist/esm/icons/sparkles.js";
import { __iconNode as n_infinity } from "lucide-react/dist/esm/icons/infinity.js";
import { __iconNode as n_diamond } from "lucide-react/dist/esm/icons/diamond.js";
import { __iconNode as n_ghost } from "lucide-react/dist/esm/icons/ghost.js";
import { __iconNode as n_bike } from "lucide-react/dist/esm/icons/bike.js";
import { __iconNode as n_dumbbell } from "lucide-react/dist/esm/icons/dumbbell.js";
import { __iconNode as n_plane } from "lucide-react/dist/esm/icons/plane.js";
import { __iconNode as n_palette } from "lucide-react/dist/esm/icons/palette.js";
import { __iconNode as n_snowflake } from "lucide-react/dist/esm/icons/snowflake.js";
import { __iconNode as n_umbrella } from "lucide-react/dist/esm/icons/umbrella.js";
import { __iconNode as n_glasses } from "lucide-react/dist/esm/icons/glasses.js";
import { __iconNode as n_feather } from "lucide-react/dist/esm/icons/feather.js";
import {
  Anchor,
  Bike,
  Camera,
  Cat,
  Cloud,
  Coffee,
  Crown,
  Diamond,
  Dog,
  Dumbbell,
  Feather,
  Flame,
  Flower2,
  Gamepad2,
  Ghost,
  Glasses,
  Heart,
  Infinity as InfinityIcon,
  Leaf,
  Moon,
  Mountain,
  Music,
  Palette,
  PawPrint,
  Plane,
  Rocket,
  Skull,
  Smile,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Umbrella,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { makePiece, PRINT, type Piece, type ShapeType } from "./model";

/** Grafik kütüphanesi: çizgi ikonlar, renk/kalınlık ayarlanabilir vektör. */
export const iconLibrary: Record<string, { label: string; Icon: LucideIcon }> = {
  heart: { label: "Kalp", Icon: Heart },
  star: { label: "Yıldız", Icon: Star },
  zap: { label: "Şimşek", Icon: Zap },
  crown: { label: "Taç", Icon: Crown },
  flame: { label: "Alev", Icon: Flame },
  smile: { label: "Gülen yüz", Icon: Smile },
  music: { label: "Müzik", Icon: Music },
  sun: { label: "Güneş", Icon: Sun },
  moon: { label: "Ay", Icon: Moon },
  cloud: { label: "Bulut", Icon: Cloud },
  skull: { label: "Kurukafa", Icon: Skull },
  rocket: { label: "Roket", Icon: Rocket },
  gamepad: { label: "Oyun", Icon: Gamepad2 },
  trophy: { label: "Kupa", Icon: Trophy },
  anchor: { label: "Çapa", Icon: Anchor },
  leaf: { label: "Yaprak", Icon: Leaf },
  flower: { label: "Çiçek", Icon: Flower2 },
  cat: { label: "Kedi", Icon: Cat },
  dog: { label: "Köpek", Icon: Dog },
  paw: { label: "Pati", Icon: PawPrint },
  coffee: { label: "Kahve", Icon: Coffee },
  camera: { label: "Kamera", Icon: Camera },
  mountain: { label: "Dağ", Icon: Mountain },
  waves: { label: "Dalga", Icon: Waves },
  sparkles: { label: "Parıltı", Icon: Sparkles },
  infinity: { label: "Sonsuz", Icon: InfinityIcon },
  diamond: { label: "Elmas", Icon: Diamond },
  ghost: { label: "Hayalet", Icon: Ghost },
  bike: { label: "Bisiklet", Icon: Bike },
  dumbbell: { label: "Spor", Icon: Dumbbell },
  plane: { label: "Uçak", Icon: Plane },
  palette: { label: "Palet", Icon: Palette },
  snowflake: { label: "Kar", Icon: Snowflake },
  umbrella: { label: "Şemsiye", Icon: Umbrella },
  glasses: { label: "Gözlük", Icon: Glasses },
  feather: { label: "Tüy", Icon: Feather },
};

type IconNode = [string, Record<string, string | number>][];
const iconNodes: Record<string, IconNode> = {
  heart: n_heart,
  star: n_star,
  zap: n_zap,
  crown: n_crown,
  flame: n_flame,
  smile: n_smile,
  music: n_music,
  sun: n_sun,
  moon: n_moon,
  cloud: n_cloud,
  skull: n_skull,
  rocket: n_rocket,
  gamepad: n_gamepad,
  trophy: n_trophy,
  anchor: n_anchor,
  leaf: n_leaf,
  flower: n_flower,
  cat: n_cat,
  dog: n_dog,
  paw: n_paw,
  coffee: n_coffee,
  camera: n_camera,
  mountain: n_mountain,
  waves: n_waves,
  sparkles: n_sparkles,
  infinity: n_infinity,
  diamond: n_diamond,
  ghost: n_ghost,
  bike: n_bike,
  dumbbell: n_dumbbell,
  plane: n_plane,
  palette: n_palette,
  snowflake: n_snowflake,
  umbrella: n_umbrella,
  glasses: n_glasses,
  feather: n_feather,
};

const iconCache = new Map<string, string>();
const escapeAttr = (value: string | number) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Lucide ikonunu 512 px vektör SVG data URL'ine çevirir (canvas'ta keskin çizilir). */
export function iconDataUrl(name: string, color: string, strokeWidth: number, filled: boolean) {
  const key = `${name}|${color}|${strokeWidth}|${filled}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const node = iconNodes[name];
  if (!node) return "";
  const children = node
    .map(([tag, attrs]) =>
      `<${tag} ${Object.entries(attrs)
        .filter(([attr]) => attr !== "key")
        .map(([attr, value]) => `${attr}="${escapeAttr(value)}"`)
        .join(" ")}/>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24" fill="${filled ? escapeAttr(color) : "none"}" stroke="${escapeAttr(color)}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  iconCache.set(key, url);
  return url;
}

export const shapePresets: { shape: ShapeType; w: number; h: number }[] = [
  { shape: "rect", w: 140, h: 140 },
  { shape: "circle", w: 140, h: 140 },
  { shape: "triangle", w: 150, h: 130 },
  { shape: "star", w: 150, h: 150 },
  { shape: "heart", w: 150, h: 135 },
  { shape: "badge", w: 150, h: 150 },
  { shape: "line", w: 200, h: 8 },
];

export const swatchPalette = [
  "#111111", "#FFFFFF", "#FF3B00", "#E11D48", "#F59E0B", "#FACC15", "#22C55E", "#10B981",
  "#06B6D4", "#3B82F6", "#6366F1", "#A855F7", "#EC4899", "#8B5A2B", "#9CA3AF", "#1E3A8A",
];

const cx = PRINT.x + PRINT.w / 2;

/** Hazır kompozisyonlar: tek tıkla yerleşir, her öğe ayrıca düzenlenebilir. */
export const templates: { id: string; name: string; hint: string; build: (ink: string) => Piece[] }[] = [
  {
    id: "varsity",
    name: "Kolej",
    hint: "Kavisli başlık + büyük numara",
    build: (ink) => [
      makePiece({ text: "İSTANBUL", fontFamily: "Archivo Black", fontSize: 30, curve: 35, fill: ink, x: PRINT.x + 14, y: PRINT.y + 30, letterSpacing: 2 }),
      makePiece({ text: "34", fontFamily: "Bebas Neue", fontSize: 150, fill: ink, stroke: "#FF3B00", strokeWidth: 4, x: cx - 55, y: PRINT.y + 80 }),
      makePiece({ text: "EST. 2026", fontFamily: "Oswald", fontSize: 20, fontStyle: "normal", letterSpacing: 6, fill: ink, x: cx - 60, y: PRINT.y + 235 }),
    ],
  },
  {
    id: "minimal",
    name: "Minimal göğüs",
    hint: "Sol göğüse küçük yazı",
    build: (ink) => [
      makePiece({ text: "atölye", fontFamily: "Playfair Display", fontStyle: "italic", fontSize: 26, fill: ink, x: PRINT.x + 150, y: PRINT.y + 18, align: "left" }),
      makePiece({ text: "since 2026", fontFamily: "Inter", fontStyle: "normal", fontSize: 10, letterSpacing: 3, fill: ink, x: PRINT.x + 152, y: PRINT.y + 52, align: "left" }),
    ],
  },
  {
    id: "sunset",
    name: "Retro gün batımı",
    hint: "Daire + şeritler + başlık",
    build: (ink) => [
      makePiece({ kind: "shape", shape: "circle", width: 170, height: 170, fill: "#FF3B00", x: cx - 85, y: PRINT.y + 30, strokeWidth: 0 }),
      makePiece({ kind: "shape", shape: "rect", width: 200, height: 10, fill: ink, x: cx - 100, y: PRINT.y + 130, strokeWidth: 0 }),
      makePiece({ kind: "shape", shape: "rect", width: 200, height: 10, fill: ink, x: cx - 100, y: PRINT.y + 155, strokeWidth: 0 }),
      makePiece({ text: "GOOD VIBES", fontFamily: "Righteous", fontSize: 38, fill: ink, x: cx - 112, y: PRINT.y + 215 }),
    ],
  },
  {
    id: "team",
    name: "Takım forması",
    hint: "İsim + numara (arka için ideal)",
    build: (ink) => [
      makePiece({ text: "YILMAZ", fontFamily: "Oswald", fontSize: 44, letterSpacing: 4, fill: ink, x: cx - 80, y: PRINT.y + 20 }),
      makePiece({ text: "10", fontFamily: "Anton", fontSize: 170, fill: ink, x: cx - 60, y: PRINT.y + 75 }),
    ],
  },
  {
    id: "quote",
    name: "Söz",
    hint: "İki satırlı alıntı",
    build: (ink) => [
      makePiece({ text: "Hayal et.\nTasarla. Giy.", fontFamily: "Montserrat", fontSize: 36, fontStyle: "bold", lineHeight: 1.15, fill: ink, x: cx - 110, y: PRINT.y + 90 }),
      makePiece({ kind: "shape", shape: "line", width: 80, height: 4, fill: "#FF3B00", x: cx - 40, y: PRINT.y + 200, strokeWidth: 0 }),
    ],
  },
  {
    id: "birthday",
    name: "Doğum günü",
    hint: "El yazısı + yaş",
    build: (ink) => [
      makePiece({ text: "İyi ki doğdun", fontFamily: "Pacifico", fontSize: 34, fontStyle: "normal", fill: ink, x: cx - 115, y: PRINT.y + 40 }),
      makePiece({ text: "30", fontFamily: "Bungee", fontSize: 110, fill: "#FF3B00", x: cx - 70, y: PRINT.y + 100 }),
      makePiece({ kind: "icon", icon: "sparkles", width: 60, height: 60, fill: ink, strokeWidth: 2, x: cx + 70, y: PRINT.y + 95 }),
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    hint: "Piksel font + ikon",
    build: (ink) => [
      makePiece({ kind: "icon", icon: "gamepad", width: 110, height: 110, fill: ink, strokeWidth: 1.5, x: cx - 55, y: PRINT.y + 40 }),
      makePiece({ text: "PLAYER 1", fontFamily: "Press Start 2P", fontSize: 22, fontStyle: "normal", fill: ink, x: cx - 95, y: PRINT.y + 175 }),
      makePiece({ text: "READY", fontFamily: "Press Start 2P", fontSize: 12, fontStyle: "normal", fill: "#FF3B00", x: cx - 32, y: PRINT.y + 210 }),
    ],
  },
  {
    id: "brand",
    name: "Kurumsal logo",
    hint: "Logo yeri + şirket adı",
    build: (ink) => [
      makePiece({ kind: "shape", shape: "badge", width: 90, height: 90, fill: ink, strokeWidth: 0, x: cx - 45, y: PRINT.y + 50 }),
      makePiece({ text: "ŞİRKET ADI", fontFamily: "Space Grotesk", fontSize: 30, letterSpacing: 3, fill: ink, x: cx - 95, y: PRINT.y + 160 }),
      makePiece({ text: "Ekip · 2026", fontFamily: "Inter", fontStyle: "normal", fontSize: 14, fill: ink, x: cx - 40, y: PRINT.y + 200 }),
    ],
  },
];

/** Sık kullanılan metin stilleri. */
export const textStyles: { name: string; preview: string; patch: Partial<Piece> }[] = [
  { name: "Başlık", preview: "BAŞLIK", patch: { text: "BAŞLIK", fontFamily: "Anton", fontSize: 64, fontStyle: "normal", letterSpacing: 1 } },
  { name: "Alt başlık", preview: "Alt başlık", patch: { text: "Alt başlık", fontFamily: "Montserrat", fontSize: 30, fontStyle: "bold" } },
  { name: "Gövde", preview: "Kısa bir cümle", patch: { text: "Kısa bir cümle", fontFamily: "Inter", fontSize: 20, fontStyle: "normal" } },
  { name: "El yazısı", preview: "imza", patch: { text: "imza", fontFamily: "Caveat", fontSize: 48, fontStyle: "bold" } },
  { name: "Kavisli", preview: "KAVİSLİ YAZI", patch: { text: "KAVİSLİ YAZI", fontFamily: "Archivo Black", fontSize: 30, curve: 40, letterSpacing: 2 } },
  { name: "Konturlu", preview: "KONTUR", patch: { text: "KONTUR", fontFamily: "Bebas Neue", fontSize: 72, fontStyle: "normal", fill: "#FFFFFF", stroke: "#111111", strokeWidth: 3 } },
  { name: "Gölgeli", preview: "Gölge", patch: { text: "Gölge", fontFamily: "Lobster", fontSize: 56, fontStyle: "normal", shadow: true, shadowBlur: 0, shadowColor: "#FF3B00" } },
  { name: "Retro", preview: "RETRO", patch: { text: "RETRO", fontFamily: "Righteous", fontSize: 54, fontStyle: "normal" } },
];
