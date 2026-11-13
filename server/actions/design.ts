"use server";

import { auth } from "@/auth";
import { totalPrintFee, type PrintSide } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { saveDataUrl } from "@/lib/storage";
import { addToCart } from "@/server/actions/cart";

/** Yalnızca kendi yükleme klasörümüzdeki dosyalar kabul edilir. */
function isUpload(url: string | undefined): url is string {
  return typeof url === "string" && /^\/(api\/)?uploads\/[a-f0-9-]+\.(png|jpg|webp|svg)$/i.test(url);
}

type PrintFileSide = "front" | "back" | "neck";

export async function saveDesign(input: {
  productId: string;
  name: string;
  printWidthCm: number;
  printHeightCm: number;
  frontJson: unknown;
  backJson: unknown;
  neckJson?: unknown;
  previewDataUrl?: string;
  previewUrl?: string;
  printFiles?: { side: PrintFileSide; url: string; dpi: number; widthCm?: number; heightCm?: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Tasarımı kaydetmek için giriş yap." };

  const previewUrl = isUpload(input.previewUrl) ? input.previewUrl : input.previewDataUrl ? await saveDataUrl(input.previewDataUrl) : null;
  const printFiles = (input.printFiles ?? [])
    .filter((file) => isUpload(file.url) && (file.side === "front" || file.side === "back" || file.side === "neck"))
    .slice(0, 3);
  const design = await prisma.design.create({
    data: {
      userId: session.user.id,
      productId: input.productId,
      name: input.name.slice(0, 80) || "Adsız tasarım",
      printWidthCm: input.printWidthCm,
      printHeightCm: input.printHeightCm,
      frontJson: input.frontJson ?? [],
      backJson: input.backJson ?? [],
      neckJson: input.neckJson ?? [],
      previewUrl,
      layers: printFiles.length
        ? {
            create: printFiles.map((file, index) => ({
              kind: "print-file",
              sortOrder: index,
              payload: {
                side: file.side,
                url: file.url,
                dpi: Math.round(file.dpi),
                widthCm: file.widthCm ?? input.printWidthCm,
                heightCm: file.heightCm ?? input.printHeightCm,
              },
            })),
          }
        : undefined,
    },
  });
  return { id: design.id, previewUrl };
}

export async function addDesignToCart(input: {
  productId: string;
  name: string;
  variantId: string;
  quantity: number;
  printSide: PrintSide;
  hasNeck?: boolean;
  printWidthCm: number;
  printHeightCm: number;
  frontJson: unknown;
  backJson: unknown;
  neckJson?: unknown;
  previewDataUrl?: string;
  previewUrl?: string;
  printFiles?: { side: PrintFileSide; url: string; dpi: number; widthCm?: number; heightCm?: number }[];
}) {
  const saved = await saveDesign(input);
  if ("error" in saved) return saved;
  const hasNeck = Boolean(input.hasNeck);
  const added = await addToCart({
    variantId: input.variantId,
    quantity: input.quantity,
    designId: saved.id,
    printSide: input.printSide,
    printFee: totalPrintFee(input.printSide, hasNeck),
  });
  if (added.error) return added;
  return { ok: true as const, designId: saved.id };
}
