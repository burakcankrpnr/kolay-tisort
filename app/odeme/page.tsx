import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutForm } from "@/components/checkout-form";
import { PageHeader } from "@/components/page-header";
import { bulkDiscount, printSideLabel, quantityTierPercent, unitPrice } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { readCart } from "@/server/cart";

export const metadata: Metadata = { title: "Ödeme", robots: { index: false } };

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
    name: item.dtfSheet ? `DTF tabaka ${item.dtfSheet.widthCm}×${item.dtfSheet.heightCm} cm` : item.product.name,
    detail: item.dtfSheet
      ? "Baskı filmi"
      : `${item.variant.color.name} / ${item.variant.size.name}${item.printSide === "NONE" ? "" : ` · ${printSideLabel[item.printSide]}`}`,
    quantity: item.quantity,
    unitPrice: unitPrice(item.product.basePrice, item.variant.priceDelta, item.printFee),
    previewUrl: item.design?.previewUrl ?? null,
    isDtf: Boolean(item.dtfSheetId),
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const garments = lines.filter((line) => !line.isDtf);
  const garmentQty = garments.reduce((sum, line) => sum + line.quantity, 0);
  const bulk = bulkDiscount(garments.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0), garmentQty);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
      <PageHeader title="Güvenli ödeme" crumbs={[{ href: "/sepet", label: "Sepet" }, { label: "Ödeme" }]} />
      <CheckoutForm
        lines={lines}
        subtotal={subtotal}
        bulk={bulk}
        bulkPercent={quantityTierPercent(garmentQty)}
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
            : { fullName: session.user.name ?? "" }
        }
      />
    </div>
  );
}
