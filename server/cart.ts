import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const CART_COOKIE = "katman_cart";

export const cartInclude = {
  items: {
    include: {
      product: true,
      variant: { include: { color: true, size: true } },
      design: { include: { layers: { where: { kind: "print-file" }, orderBy: { sortOrder: "asc" as const } } } },
      dtfSheet: { include: { designs: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export type CartWithItems = NonNullable<Awaited<ReturnType<typeof readCart>>>;

export async function readCart() {
  const session = await auth();
  const jar = await cookies();
  const cookieId = jar.get(CART_COOKIE)?.value;

  if (session?.user?.id) {
    return prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });
  }

  if (!cookieId) return null;

  return prisma.cart.findFirst({
    where: { id: cookieId, userId: null },
    include: cartInclude,
  });
}

export function cartCount(cart: { items: { quantity: number }[] } | null) {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export async function mergeGuestCart(userId: string) {
  const jar = await cookies();
  const cookieId = jar.get(CART_COOKIE)?.value;
  if (!cookieId) return;

  const guest = await prisma.cart.findFirst({
    where: { id: cookieId, userId: null },
    include: { items: true },
  });
  if (!guest) {
    jar.delete(CART_COOKIE);
    return;
  }

  const userCart = await prisma.cart.findUnique({ where: { userId } });
  if (!userCart) {
    await prisma.cart.update({ where: { id: guest.id }, data: { userId } });
    jar.delete(CART_COOKIE);
    return;
  }

  for (const item of guest.items) {
    const existing = item.designId || item.dtfSheetId
      ? null
      : await prisma.cartItem.findFirst({
          where: {
            cartId: userCart.id,
            variantId: item.variantId,
            designId: null,
            dtfSheetId: null,
            printSide: item.printSide,
          },
        });
    const quantity = Math.min(10, (existing?.quantity ?? 0) + item.quantity);
    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          designId: item.designId,
          printSide: item.printSide,
          printFee: item.printFee,
          dtfSheetId: item.dtfSheetId,
        },
      });
    }
  }

  await prisma.cartItem.deleteMany({ where: { cartId: guest.id } });
  await prisma.cart.delete({ where: { id: guest.id } });
  jar.delete(CART_COOKIE);
}
