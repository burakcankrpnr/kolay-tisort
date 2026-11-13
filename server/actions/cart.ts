"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cartItemSchema } from "@/lib/validators";
import { CART_COOKIE } from "@/server/cart";

async function cartForWrite() {
  const session = await auth();
  const jar = await cookies();

  if (session?.user?.id) {
    const existing = await prisma.cart.findUnique({ where: { userId: session.user.id } });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId: session.user.id } });
  }

  const cookieId = jar.get(CART_COOKIE)?.value;
  if (cookieId) {
    const guest = await prisma.cart.findFirst({ where: { id: cookieId, userId: null } });
    if (guest) return guest;
  }

  const created = await prisma.cart.create({ data: {} });
  jar.set(CART_COOKIE, created.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return created;
}

export async function addToCart(input: { variantId: string; quantity: number }) {
  const parsed = cartItemSchema.safeParse(input);
  if (!parsed.success) return { error: "Adet 1 ile 10 arasında olmalı." };

  const variant = await prisma.productVariant.findUnique({
    where: { id: parsed.data.variantId },
    include: { product: true },
  });
  if (!variant || variant.product.deletedAt) return { error: "Bu varyant yok." };
  if (variant.stock < parsed.data.quantity) return { error: "Bu bedenin stoğu yetmiyor." };

  const cart = await cartForWrite();
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
  });
  const quantity = Math.min(10, (existing?.quantity ?? 0) + parsed.data.quantity);
  if (quantity > variant.stock) return { error: "Sepetteki adet stoktan fazla olamaz." };

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: variant.productId,
        variantId: variant.id,
        quantity,
      },
    });
  }

  revalidatePath("/sepet");
  return { ok: true as const };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const cart = await cartForWrite();
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { variant: true },
  });
  if (!item) return { error: "Sepet satırı yok." };

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    const next = Math.min(10, quantity);
    if (next > item.variant.stock) return { error: "Bu bedenin stoğu yetmiyor." };
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: next } });
  }

  revalidatePath("/sepet");
  return { ok: true as const };
}

export async function removeCartItem(itemId: string) {
  const cart = await cartForWrite();
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  revalidatePath("/sepet");
}
