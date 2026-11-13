import type { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type PaymentEvent = "payment_success" | "payment_failed" | "payment_pending" | "refund";

const nextStatus: Record<PaymentEvent, PaymentStatus> = {
  payment_success: "SUCCESS",
  payment_failed: "FAILED",
  payment_pending: "PENDING",
  refund: "REFUNDED",
};

export async function applyPaymentEvent(input: {
  orderId: string;
  event: PaymentEvent;
  providerRef?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { OR: [{ id: input.orderId }, { number: input.orderId }] },
      include: { payment: true, items: true },
    });
    if (!order?.payment) {
      throw new Error("Sipariş veya ödeme kaydı yok.");
    }

    const payment = order.payment;

    if (input.event === "payment_success") {
      if (payment.status === "SUCCESS") return order;
      for (const item of order.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || variant.stock < item.quantity) {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", providerRef: input.providerRef ?? payment.providerRef },
          });
          throw new Error("Stok yetmedi, ödeme alınmadı.");
        }
      }
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      if (order.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: order.couponCode },
        });
        if (coupon) {
          const used = await tx.couponUsage.findUnique({
            where: { couponId_userId: { couponId: coupon.id, userId: order.userId } },
          });
          if (!used) {
            await tx.couponUsage.create({
              data: { couponId: coupon.id, orderId: order.id, userId: order.userId },
            });
          }
        }
      }
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", providerRef: input.providerRef ?? payment.providerRef },
      });
      for (const item of order.items) {
        const snap = item.designSnapshot as { listingId?: string | null } | null;
        if (snap?.listingId) {
          await tx.listing.updateMany({
            where: { id: snap.listingId },
            data: { salesCount: { increment: item.quantity } },
          });
        }
      }
      return tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
    }

    if (input.event === "refund") {
      if (payment.status === "SUCCESS") {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED", providerRef: input.providerRef ?? payment.providerRef },
      });
      return tx.order.update({ where: { id: order.id }, data: { status: "REFUNDED" } });
    }

    if (input.event === "payment_pending" && payment.status === "SUCCESS") {
      return order;
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: nextStatus[input.event],
        providerRef: input.providerRef ?? payment.providerRef,
      },
    });
    return order;
  });
}
