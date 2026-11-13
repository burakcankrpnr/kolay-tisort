/**
 * Tasarım stüdyosu veri modeli. Tüm koordinatlar "mantıksal" sahne birimindedir
 * (STAGE genişliği 600). Baskı alanı PRINT, gerçek ölçüsü printWidthCm × printHeightCm.
 */

export const STAGE = { w: 600, h: 690 } as const;
export const PRINT_WIDTH_CM = 35;
export const PRINT_HEIGHT_CM = 40;
const printW = 240;
const printH = Math.round((printW * PRINT_HEIGHT_CM) / PRINT_WIDTH_CM);
export const PRINT = { x: (STAGE.w - printW) / 2, y: 190, w: printW, h: printH } as const;
export const PX_PER_CM = PRINT.w / PRINT_WIDTH_CM;

export type PieceKind = "text" | "image" | "shape" | "icon";
export type ShapeType = "rect" | "circle" | "triangle" | "star" | "heart" | "line" | "badge";

export type Piece = {
  id: string;
  kind: PieceKind;
  name: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  flipX: boolean;
  flipY: boolean;
  // metin
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string; // "normal" | "bold" | "italic" | "bold italic"
  textDecoration: string; // "" | "underline"
  letterSpacing: number;
  lineHeight: number;
  align: string;
  curve: number; // -100..100, 0 = düz
  uppercase: boolean;
  // ortak boya
  fill: string;
  stroke: string;
  strokeWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  // görsel
  src: string;
  width: number;
  height: number;
  pixelWidth: number;
  grayscale: boolean;
  brightness: number; // -1..1
  contrast: number; // -100..100
  // şekil / ikon
  shape: ShapeType;
  cornerRadius: number;
  icon: string;
  iconFilled: boolean;
};

export type Doc = { front: Piece[]; back: Piece[] };
export type Side = keyof Doc;

let counter = 0;
export function newId() {
  counter += 1;
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `p${Date.now()}${counter}`;
}

export function makePiece(partial: Partial<Piece>): Piece {
  return {
    id: newId(),
    kind: "text",
    name: "",
    x: PRINT.x + 40,
    y: PRINT.y + 60,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    locked: false,
    hidden: false,
    flipX: false,
    flipY: false,
    text: "Metin",
    fontSize: 40,
    fontFamily: "Inter",
    fontStyle: "bold",
    textDecoration: "",
    letterSpacing: 0,
    lineHeight: 1.1,
    align: "center",
    curve: 0,
    uppercase: false,
    fill: "#111111",
    stroke: "#000000",
    strokeWidth: 0,
    shadow: false,
    shadowColor: "#000000",
    shadowBlur: 8,
    src: "",
    width: 120,
    height: 120,
    pixelWidth: 0,
    grayscale: false,
    brightness: 0,
    contrast: 0,
    shape: "rect",
    cornerRadius: 0,
    icon: "",
    iconFilled: false,
    ...partial,
  };
}

/** Eski kayıtlar ve yabancı JSON'lar için güvenli dönüştürme. */
export function normalizePieces(raw: unknown): Piece[] {
  const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" && Array.isArray((raw as { pieces?: unknown }).pieces) ? (raw as { pieces: unknown[] }).pieces : [];
  return list
    .filter((item): item is Partial<Piece> => Boolean(item) && typeof item === "object")
    .map((item) => makePiece({ ...item, id: typeof item.id === "string" ? item.id : newId() }));
}

export function pieceLabel(piece: Piece) {
  if (piece.name) return piece.name;
  if (piece.kind === "text") return piece.text.split("\n")[0]?.slice(0, 24) || "Metin";
  if (piece.kind === "image") return "Görsel";
  if (piece.kind === "icon") return `İkon · ${piece.icon}`;
  return shapeLabels[piece.shape];
}

export const shapeLabels: Record<ShapeType, string> = {
  rect: "Kare",
  circle: "Daire",
  triangle: "Üçgen",
  star: "Yıldız",
  heart: "Kalp",
  line: "Çizgi",
  badge: "Rozet",
};

export const pxToCm = (px: number) => px / PX_PER_CM;
export const cmToPx = (cm: number) => cm * PX_PER_CM;

/** Görselin baskıdaki DPI'ı (ekrandaki genişliğe göre). */
export function pieceDpi(piece: Piece) {
  if (piece.kind !== "image" || piece.pixelWidth <= 0) return null;
  const cm = pxToCm(piece.width * Math.abs(piece.scaleX));
  if (cm <= 0) return null;
  return Math.round(piece.pixelWidth / (cm / 2.54));
}

export function dpiLevel(dpi: number | null): "good" | "ok" | "bad" | null {
  if (dpi === null) return null;
  if (dpi >= 300) return "good";
  if (dpi >= 150) return "ok";
  return "bad";
}

/** Eğri metin için kuadratik yol (piece yerelinde). */
export function curvePath(width: number, curve: number) {
  const h = (curve / 100) * width * 0.45;
  return `M0,${Math.max(h, 0) + 4} Q${width / 2},${-h + Math.max(h, 0) + 4} ${width},${Math.max(h, 0) + 4}`;
}

export const sideLabel: Record<Side, string> = { front: "Ön", back: "Arka" };
