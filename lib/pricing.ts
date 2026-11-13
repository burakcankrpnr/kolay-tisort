export function unitPrice(basePrice: number, priceDelta: number) {
  return basePrice + priceDelta;
}

export function lineTotal(unit: number, quantity: number) {
  return unit * quantity;
}

export function percentDiscount(subtotal: number, percentOff: number) {
  return Math.round((subtotal * percentOff) / 100);
}

export function orderTotal(subtotal: number, discount: number, shippingFee: number) {
  return Math.max(0, subtotal - discount + shippingFee);
}
