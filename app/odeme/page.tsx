import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutForm } from "@/components/checkout-form";
import { prisma } from "@/lib/prisma";
import { unitPrice } from "@/lib/pricing";
import { readCart } from "@/server/cart";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/odeme");

  const cart = await readCart();
  if (!cart || cart.items.length === 0) redirect("/sepet");

  const address = await prisma.address.findFirst({
    where: { userId: session.user.id, isDefault: true },
    orderBy: { updatedAt: "desc" },
  });

  const lines = cart.items.map((item) => ({
    name: item.product.name,
    detail: `${item.variant.color.name} / ${item.variant.size.name}`,
    quantity: item.quantity,
    unitPrice: unitPrice(item.product.basePrice, item.variant.priceDelta),
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-5xl md:text-7xl">Ödeme</h1>
      <div className="mt-8">
        <CheckoutForm
          lines={lines}
          subtotal={subtotal}
          simulationEnabled={process.env.PAYMENT_SIMULATION === "true"}
          defaults={
            address
              ? {
                  fullName: address.fullName,
                  phone: address.phone,
                  city: address.city,
                  district: address.district,
                  line1: address.line1,
                  postalCode: address.postalCode,
                }
              : {
                  fullName: session.user.name ?? "",
                }
          }
        />
      </div>
    </div>
  );
}
