import type { PaymentProviderName } from "@prisma/client";
import { createIyzicoPayment } from "@/lib/payments/iyzico";
import { createPaytrPayment } from "@/lib/payments/paytr";
import { createSimulationPayment } from "@/lib/payments/simulation";

export function quotePayment(provider: PaymentProviderName, orderId: string, amount: number) {
  if (provider === "SIMULATION") return createSimulationPayment(orderId);
  if (provider === "IYZICO") return createIyzicoPayment({ orderId, amount });
  return createPaytrPayment({ orderId, amount });
}
