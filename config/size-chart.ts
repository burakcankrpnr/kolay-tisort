import type { Fit } from "@prisma/client";

export const sizeChartRows: Record<Fit, { size: string; chest: string; length: string }[]> = {
  OVERSIZE: [
    { size: "S", chest: "56", length: "72" },
    { size: "M", chest: "58", length: "74" },
    { size: "L", chest: "61", length: "76" },
    { size: "XL", chest: "64", length: "78" },
    { size: "XXL", chest: "67", length: "80" },
  ],
  REGULAR: [
    { size: "S", chest: "50", length: "68" },
    { size: "M", chest: "53", length: "70" },
    { size: "L", chest: "56", length: "72" },
    { size: "XL", chest: "59", length: "74" },
    { size: "XXL", chest: "62", length: "76" },
  ],
  HOODIE: [
    { size: "S", chest: "56", length: "68" },
    { size: "M", chest: "59", length: "70" },
    { size: "L", chest: "62", length: "72" },
    { size: "XL", chest: "65", length: "74" },
    { size: "XXL", chest: "68", length: "76" },
  ],
  SWEAT: [
    { size: "S", chest: "54", length: "66" },
    { size: "M", chest: "57", length: "68" },
    { size: "L", chest: "60", length: "70" },
    { size: "XL", chest: "63", length: "72" },
    { size: "XXL", chest: "66", length: "74" },
  ],
};
