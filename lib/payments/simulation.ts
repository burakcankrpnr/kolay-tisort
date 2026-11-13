import type { PaymentQuote } from "@/lib/payments/iyzico";

export function createSimulationPayment(orderId: string): PaymentQuote {
  if (process.env.PAYMENT_SIMULATION !== "true") {
    return { status: "failed", message: "Ödeme simülasyonu kapalı." };
  }

  return {
    status: "success",
    providerRef: `sim_${orderId}`,
    message: "Simülasyon ödemesi alındı. Kart bilgisi tutulmadı.",
  };
}
