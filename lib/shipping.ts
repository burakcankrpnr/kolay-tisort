export const shippingOptions = [
  { id: "aras", name: "Aras Kargo", fee: 7990, eta: "2-4 iş günü" },
  { id: "yurtici", name: "Yurtiçi Kargo", fee: 8990, eta: "1-3 iş günü" },
  { id: "mng", name: "MNG Kargo", fee: 8490, eta: "2-4 iş günü" },
  { id: "surat", name: "Sürat Kargo", fee: 7490, eta: "2-5 iş günü" },
] as const;

export type ShippingId = (typeof shippingOptions)[number]["id"];

export function getShipping(id: string) {
  return shippingOptions.find((option) => option.id === id) ?? null;
}
