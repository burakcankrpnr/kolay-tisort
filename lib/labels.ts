import type { OrderStatus, PaymentStatus } from "@prisma/client";

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Ödeme bekliyor",
  PAID: "Ödendi",
  IN_PRODUCTION: "Üretimde",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade edildi",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "Bekliyor",
  SUCCESS: "Alındı",
  FAILED: "Başarısız",
  REFUNDED: "İade",
};
