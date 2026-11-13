"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getShipping } from "@/lib/shipping";
import { orderTotal, percentDiscount, unitPrice } from "@/lib/pricing";
import { quotePayment } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import { readCart } from "@/server/cart";
import { applyPaymentEvent } from "@/server/payments";

function orderNumber() {
  return `KT-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function pricedCart(userId: string) {
  const cart = await readCart();
  if (!cart || cart.userId !== userId || cart.items.length === 0) {
    return { error: "Sepetin boş." as const };
  }

  const lines = cart.items.map((item) => {
    const price = unitPrice(item.product.basePrice, item.variant.priceDelta);
    return {
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product.name,
      colorName: item.variant.color.name,
      sizeName: item.variant.size.name,
      unitPrice: price,
      quantity: item.quantity,
      stock: item.variant.stock,
      deleted: Boolean(item.product.deletedAt),
    };
  });

  if (lines.some((line) => line.deleted)) {
    return { error: "Sepette satıştan kalkan bir ürün var." as const };
  }
  if (lines.some((line) => line.quantity > line.stock)) {
    return { error: "Sepette stoğu yetmeyen bir beden var." as const };
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return { cartId: cart.id, lines, subtotal };
}

export async function previewCheckout(input: { shippingId: string; couponCode?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Ödeme için giriş yap." };

  const shipping = getShipping(input.shippingId);
  if (!shipping) return { error: "Kargo firması seç." };

  const cart = await pricedCart(session.user.id);
  if ("error" in cart) return cart;

  const coupon = await resolveCoupon(input.couponCode, session.user.id, cart.subtotal);
  if ("error" in coupon && input.couponCode?.trim()) return coupon;

  const discount = "discount" in coupon ? coupon.discount : 0;
  return {
    subtotal: cart.subtotal,
    discount,
    shippingFee: shipping.fee,
    total: orderTotal(cart.subtotal, discount, shipping.fee),
  };
}

async function resolveCoupon(code: string | undefined, userId: string, subtotal: number) {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return { discount: 0, code: null as string | null };

  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
  if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt < new Date())) {
    return { error: "Kupon kodu geçersiz." as const };
  }

  const used = await prisma.couponUsage.findUnique({
    where: { couponId_userId: { couponId: coupon.id, userId } },
  });
  if (used) return { error: "Bu kuponu daha önce kullandın." as const };

  const discount = coupon.percentOff
    ? percentDiscount(subtotal, coupon.percentOff)
    : Math.min(subtotal, coupon.amountOff ?? 0);

  return { discount, code: coupon.code };
}

export async function placeOrder(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Ödeme için giriş yap." };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Sipariş bilgilerini kontrol et." };
  }

  if (parsed.data.provider === "SIMULATION" && process.env.PAYMENT_SIMULATION !== "true") {
    return { error: "Ödeme simülasyonu kapalı." };
  }

  const shipping = getShipping(parsed.data.shippingId);
  if (!shipping) return { error: "Kargo firması seç." };

  const userId = session.user.id;
  const cart = await pricedCart(userId);
  if ("error" in cart) return cart;

  const coupon = await resolveCoupon(parsed.data.couponCode, userId, cart.subtotal);
  if ("error" in coupon) return coupon;

  const discount = coupon.discount;
  const total = orderTotal(cart.subtotal, discount, shipping.fee);

  let number = orderNumber();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const exists = await prisma.order.findUnique({ where: { number } });
    if (!exists) break;
    number = orderNumber();
  }

  const order = await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    const address = await tx.address.create({
      data: {
        userId,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        city: parsed.data.city,
        district: parsed.data.district,
        line1: parsed.data.line1,
        postalCode: parsed.data.postalCode,
        isDefault: true,
      },
    });

    const created = await tx.order.create({
      data: {
        number,
        userId,
        addressId: address.id,
        subtotal: cart.subtotal,
        shippingFee: shipping.fee,
        discount,
        total,
        couponCode: coupon.code,
        shippingProvider: shipping.id,
        recipientName: parsed.data.fullName,
        phone: parsed.data.phone,
        city: parsed.data.city,
        district: parsed.data.district,
        line1: parsed.data.line1,
        postalCode: parsed.data.postalCode,
        items: {
          create: cart.lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            productName: line.productName,
            colorName: line.colorName,
            sizeName: line.sizeName,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
          })),
        },
        payment: {
          create: {
            provider: parsed.data.provider,
            amount: total,
            status: "PENDING",
          },
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.cartId } });
    return created;
  });

  const quote = quotePayment(parsed.data.provider, order.id, total);
  if (quote.status === "failed") {
    redirect(`/odeme/tamamlandi?siparis=${order.number}&uyari=${encodeURIComponent(quote.message)}`);
  }

  try {
    if (quote.status === "success") {
      await applyPaymentEvent({
        orderId: order.id,
        event: "payment_success",
        providerRef: quote.providerRef,
      });
    } else if (quote.providerRef) {
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { providerRef: quote.providerRef },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ödeme tamamlanamadı.";
    revalidatePath("/hesap");
    redirect(`/odeme/tamamlandi?siparis=${order.number}&uyari=${encodeURIComponent(message)}`);
  }

  revalidatePath("/sepet");
  revalidatePath("/hesap");
  redirect(`/odeme/tamamlandi?siparis=${order.number}`);
}
