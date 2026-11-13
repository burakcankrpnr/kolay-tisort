import type { PaymentQuote } from "@/lib/payments/iyzico";

type PaymentInput = {
  orderId: string;
  amount: number;
};

export function createPaytrPayment(input: PaymentInput): PaymentQuote {
  const id = process.env.PAYTR_MERCHANT_ID;
  const key = process.env.PAYTR_MERCHANT_KEY;
  const salt = process.env.PAYTR_MERCHANT_SALT;
  if (!id || !key || !salt) {
    return {
      status: "pending",
      message: "PayTR anahtarları tanımlı değil. Sipariş ödeme bekliyor. Kart bilgisi istenmedi.",
    };
  }

  return {
    status: "pending",
    providerRef: `paytr_${input.orderId}`,
    message: "PayTR iframe bu aşamada yönlendirme iskeleti olarak kayıt edildi. Kart çekilmedi.",
  };
}
