"use server";

import { auth } from "@/auth";
import { dtfPrice } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { addToCart } from "@/server/actions/cart";

type Piece = {
  imageUrl: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export async function addDtfToCart(input: {
  widthCm: number;
  heightCm: number;
  quantity: number;
  pieces: Piece[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "DTF siparişi için giriş yap." };
  if (input.pieces.length === 0) return { error: "Tabakaya en az bir tasarım koy." };
  if (input.quantity < 1 || input.quantity > 20) return { error: "Adet 1 ile 20 arasında olmalı." };

  const product = await prisma.product.findUnique({
    where: { slug: "dtf-tabaka" },
    include: { variants: true },
  });
  const variant = product?.variants[0];
  if (!variant) return { error: "DTF tabaka ürünü hazır değil." };

  const perSheet = dtfPrice(`${input.widthCm}x${input.heightCm}`, input.pieces.length);
  const created = await prisma.dTFOrder.create({
    data: {
      userId: session.user.id,
      total: perSheet * input.quantity,
      sheets: {
        create: {
          widthCm: input.widthCm,
          heightCm: input.heightCm,
          price: perSheet,
          quantity: input.quantity,
          placement: input.pieces,
          designs: {
            create: input.pieces.map((piece) => ({
              imageUrl: piece.imageUrl,
              label: piece.label,
              x: piece.x,
              y: piece.y,
              width: piece.width,
              height: piece.height,
              rotation: piece.rotation,
            })),
          },
        },
      },
    },
    include: { sheets: true },
  });

  const added = await addToCart({
    variantId: variant.id,
    quantity: input.quantity,
    dtfSheetId: created.sheets[0]?.id,
    printFee: perSheet,
  });
  if (added.error) return added;
  return { ok: true as const };
}
