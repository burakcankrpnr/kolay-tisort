"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cartItemSchema, MAX_LINE_QUANTITY } from "@/lib/validators";
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

export async function addToCart(input: {
  variantId: string;
  quantity: number;
  designId?: string;
  printSide?: "NONE" | "FRONT" | "BACK" | "BOTH";
  printFee?: number;
  dtfSheetId?: string;
}) {
  const parsed = cartItemSchema.safeParse(input);
  if (!parsed.success) return { error: `Adet 1 ile ${MAX_LINE_QUANTITY} arasında olmalı.` };
  const printSide = input.printSide ?? "NONE";
  const printFee = input.printFee ?? 0;

  const variant = await prisma.productVariant.findUnique({
    where: { id: parsed.data.variantId },
    include: { product: true },
  });
  if (!variant || variant.product.deletedAt) return { error: "Bu varyant yok." };
  if (variant.stock < parsed.data.quantity) return { error: "Bu bedenin stoğu yetmiyor." };

  const cart = await cartForWrite();
  const existing =
    input.designId || input.dtfSheetId
      ? null
      : await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            variantId: variant.id,
            designId: null,
            dtfSheetId: null,
            printSide,
          },
        });
  const cap = input.dtfSheetId ? 20 : MAX_LINE_QUANTITY;
  const quantity = Math.min(cap, (existing?.quantity ?? 0) + parsed.data.quantity);
  if (quantity > variant.stock) return { error: "Sepetteki adet stoktan fazla olamaz." };

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: variant.productId,
        variantId: variant.id,
        quantity: input.designId || input.dtfSheetId ? parsed.data.quantity : quantity,
        designId: input.designId,
        printSide,
        printFee,
        dtfSheetId: input.dtfSheetId,
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
    const next = Math.min(item.dtfSheetId ? 20 : MAX_LINE_QUANTITY, quantity);
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
