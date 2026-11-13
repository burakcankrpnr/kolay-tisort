export type PaymentQuote = {
  status: "pending" | "success" | "failed";
  providerRef?: string;
  message: string;
};

type PaymentInput = {
  orderId: string;
  amount: number;
};

export function createIyzicoPayment(input: PaymentInput): PaymentQuote {
  const key = process.env.IYZICO_API_KEY;
  const secret = process.env.IYZICO_SECRET_KEY;
  if (!key || !secret) {
    return {
      status: "pending",
      message: "iyzico anahtarları tanımlı değil. Sipariş ödeme bekliyor. Kart bilgisi istenmedi.",
    };
  }

  return {
    status: "pending",
    providerRef: `iyzico_${input.orderId}`,
    message: "iyzico ödeme formu bu aşamada yönlendirme iskeleti olarak kayıt edildi. Kart çekilmedi.",
  };
}
