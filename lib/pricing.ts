export type PrintSide = "NONE" | "FRONT" | "BACK" | "BOTH";

export const printFees: Record<PrintSide, number> = {
  NONE: 0,
  FRONT: 8900,
  BACK: 8900,
  BOTH: 14900,
};

/** Ense / yaka içi etiket baskısı; ön/arka ücretine eklenir. */
export const neckFee = 4900;

export const printSideLabel: Record<PrintSide, string> = {
  NONE: "Baskısız",
  FRONT: "Ön baskı",
  BACK: "Arka baskı",
  BOTH: "Ön ve arka",
};

export function bodyPrintFee(side: PrintSide) {
  return printFees[side];
}

export function totalPrintFee(side: PrintSide, hasNeck: boolean) {
  return bodyPrintFee(side) + (hasNeck ? neckFee : 0);
}

export function describePrint(side: PrintSide, hasNeck: boolean) {
  const parts: string[] = [];
  if (side !== "NONE") parts.push(printSideLabel[side]);
  if (hasNeck) parts.push("Ense etiketi");
  return parts.join(" + ") || "Baskısız";
}

export function sidesToPrintSide(front: boolean, back: boolean): PrintSide {
  if (front && back) return "BOTH";
  if (front) return "FRONT";
  if (back) return "BACK";
  return "NONE";
}

export function unitPrice(basePrice: number, priceDelta: number, printFee = 0) {
  return basePrice + priceDelta + printFee;
}

export function lineTotal(unit: number, quantity: number) {
  return unit * quantity;
}

export function quantityTierPercent(quantity: number) {
  if (quantity >= 50) return 15;
  if (quantity >= 20) return 10;
  if (quantity >= 10) return 5;
  return 0;
}

export function bulkDiscount(subtotal: number, quantity: number) {
  return Math.round((subtotal * quantityTierPercent(quantity)) / 100);
}

export function percentDiscount(subtotal: number, percentOff: number) {
  return Math.round((subtotal * percentOff) / 100);
}

export function orderTotal(subtotal: number, discount: number, shippingFee: number) {
  return Math.max(0, subtotal - discount + shippingFee);
}

export function quoteCorporate(unit: number, quantity: number) {
  const subtotal = unit * quantity;
  const discount = bulkDiscount(subtotal, quantity);
  return { subtotal, discount, total: subtotal - discount, percent: quantityTierPercent(quantity) };
}

export const dtfSheets = [
  { id: "30x40", widthCm: 30, heightCm: 40, price: 14900 },
  { id: "40x50", widthCm: 40, heightCm: 50, price: 21900 },
  { id: "50x70", widthCm: 50, heightCm: 70, price: 34900 },
  { id: "60x90", widthCm: 60, heightCm: 90, price: 49900 },
] as const;

export function dtfPrice(sheetId: string, pieceCount: number) {
  const sheet = dtfSheets.find((item) => item.id === sheetId) ?? dtfSheets[0];
  const extra = Math.max(0, pieceCount - 1) * 1500;
  return sheet.price + extra;
}

export function estimateDpi(pixelWidth: number, printWidthCm: number) {
  if (printWidthCm <= 0) return 0;
  return Math.round(pixelWidth / (printWidthCm / 2.54));
}
