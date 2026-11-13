"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ListingCategory, ListingStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addToCart } from "@/server/actions/cart";

const categories: ListingCategory[] = [
  "ANIME",
  "GAMING",
  "GOTHIC",
  "STREETWEAR",
  "MINIMAL",
  "VINTAGE",
  "COUPLE",
  "FUNNY",
  "MEME",
  "MUSIC",
  "SPORT",
  "KIDS",
  "TRENDING",
];

export async function createListing(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "İlan için giriş yap." };
  const title = String(formData.get("title") ?? "").trim();
  const productId = String(formData.get("productId") ?? "");
  const category = String(formData.get("category") ?? "") as ListingCategory;
  const tags = String(formData.get("tags") ?? "").trim();
  const price = Math.round(Number(formData.get("price") ?? 0) * 100);
  const imageUrl = String(formData.get("imageUrl") ?? "");
  if (title.length < 3) return { error: "Başlık en az 3 karakter olmalı." };
  if (!categories.includes(category)) return { error: "Kategori seç." };
  if (price < 1000) return { error: "Tasarım fiyatı en az 10 TL olmalı." };

  await prisma.designerProfile.upsert({
    where: { userId: session.user.id },
    update: { displayName: session.user.name ?? "Tasarımcı" },
    create: { userId: session.user.id, displayName: session.user.name ?? "Tasarımcı" },
  });
  const design = await prisma.design.create({
    data: {
      userId: session.user.id,
      productId,
      name: title,
      previewUrl: imageUrl,
      frontJson: { pieces: [{ kind: "image", src: imageUrl }] },
    },
  });
  await prisma.listing.create({
    data: {
      userId: session.user.id,
      productId,
      designId: design.id,
      title,
      category,
      tags,
      price,
      imageUrl,
      status: "PENDING",
    },
  });
  revalidatePath("/tasarimci");
  revalidatePath("/admin/ilanlar");
  return { ok: true as const };
}

export async function applyListingStatus(id: string, status: ListingStatus) {
  await setListingStatus(id, status);
}

export async function setListingStatus(id: string, status: ListingStatus) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return { error: "Bu işlem yöneticiye açık." };
  }
  const listing = await prisma.listing.update({ where: { id }, data: { status } });
  if (status === "APPROVED" || status === "REJECTED") {
    await prisma.notification.create({
      data: {
        userId: listing.userId,
        title: status === "APPROVED" ? "İlanın yayında" : "İlanın reddedildi",
        body: listing.title,
      },
    });
  }
  revalidatePath("/hazir-tasarimlar");
  revalidatePath("/admin/ilanlar");
  return { ok: true as const };
}

export async function placeListing(listingId: string, formData: FormData) {
  const result = await addListingToCart(listingId, formData);
  if (result && "error" in result && result.error) return;
  redirect("/sepet");
}

export async function addListingToCart(listingId: string, formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: "APPROVED" },
    include: { design: true },
  });
  if (!listing) return { error: "İlan satışta değil." };
  return addToCart({
    variantId,
    quantity: 1,
    designId: listing.designId ?? undefined,
    printSide: "FRONT",
    printFee: listing.price,
  });
}

export async function favoriteProduct(productId: string) {
  await toggleFavorite(productId);
}

export async function toggleFavorite(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Favori için giriş yap." };
  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });
  if (existing) await prisma.favorite.delete({ where: { id: existing.id } });
  else await prisma.favorite.create({ data: { userId: session.user.id, productId } });
  revalidatePath("/urun");
  revalidatePath("/hesap");
  return { ok: true as const, saved: !existing };
}

export async function addReview(productId: string, rating: number, body: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Yorum için giriş yap." };
  if (rating < 1 || rating > 5) return { error: "Puan 1 ile 5 arasında olmalı." };
  if (body.trim().length < 8) return { error: "Yorum en az 8 karakter olmalı." };
  await prisma.review.create({
    data: { userId: session.user.id, productId, rating, body: body.trim() },
  });
  revalidatePath(`/urun`);
  return { ok: true as const };
}

export async function submitCorporate(formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const printSide = String(formData.get("printSide") ?? "FRONT");
  const quantity = Number(formData.get("quantity") ?? 0);
  const printType = String(formData.get("printType") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  // Birim fiyat istemciden alınmaz: seçilen ürün + baskı yüzünden sunucuda hesaplanır.
  const product = productSlug ? await prisma.product.findFirst({ where: { slug: productSlug, deletedAt: null } }) : null;
  if (!product) return { ok: false as const, error: "Ürün seç." };
  const { printFees } = await import("@/lib/pricing");
  const fee = printSide === "BOTH" ? printFees.BOTH : printSide === "NONE" ? 0 : printFees.FRONT;
  const unit = product.basePrice + fee;
  const productName = product.name;
  if (company.length < 2 || contactName.length < 2 || phone.length < 10 || !email.includes("@")) {
    return { ok: false as const, error: "Firma, yetkili, telefon ve e-posta gerekli." };
  }
  if (quantity < 10) return { ok: false as const, error: "Kurumsal teklif 10 adetten başlar." };
  const { quoteCorporate } = await import("@/lib/pricing");
  const quote = quoteCorporate(unit, quantity);
  await prisma.businessRequest.create({
    data: {
      company,
      contactName,
      phone,
      email,
      productName,
      quantity,
      printType,
      dueDate,
      note,
      quoteAmount: quote.total,
    },
  });
  revalidatePath("/admin/kurumsal");
  return { ok: true as const, total: quote.total, percent: quote.percent };
}
