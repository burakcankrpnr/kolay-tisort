"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/guard";
import { applyPaymentEvent } from "@/server/payments";

const statuses: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!statuses.includes(status)) return;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath(`/admin/siparisler/${id}`);
}

export async function refundOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3) return;
  await prisma.returnRequest.create({ data: { orderId: id, reason, status: "REFUNDED" } });
  await applyPaymentEvent({ orderId: id, event: "refund", providerRef: "admin-refund" });
  revalidatePath(`/admin/siparisler/${id}`);
}

export async function createCatalogProduct(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const basePrice = Math.round(Number(formData.get("price") ?? 0) * 100);
  const colorName = String(formData.get("colorName") ?? "Siyah").trim();
  const hex = String(formData.get("hex") ?? "#161616");
  const sizeName = String(formData.get("sizeName") ?? "M").trim();
  const stock = Number(formData.get("stock") ?? 0);
  if (name.length < 2 || description.length < 8 || basePrice < 1000 || stock < 0) return;
  const slug = `${name.toLocaleLowerCase("tr").replaceAll(" ", "-").replace(/[^a-z0-9-]/g, "")}-${Date.now().toString().slice(-4)}`;
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      basePrice,
      silhouette: "TEE",
      fit: "REGULAR",
      categoryId,
      colors: { create: { name: colorName, hex } },
      sizes: { create: { name: sizeName, sortOrder: 0 } },
    },
    include: { colors: true, sizes: true },
  });
  await prisma.productVariant.create({
    data: {
      productId: product.id,
      colorId: product.colors[0].id,
      sizeId: product.sizes[0].id,
      sku: `${slug}-${sizeName}`.toLocaleLowerCase("tr"),
      stock,
    },
  });
  revalidatePath("/admin/urunler");
  revalidatePath("/urunler");
}

export async function updateVariant(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const stock = Number(formData.get("stock") ?? 0);
  const priceDelta = Math.round(Number(formData.get("priceDelta") ?? 0) * 100);
  if (stock < 0) return;
  await prisma.productVariant.update({ where: { id }, data: { stock, priceDelta } });
  revalidatePath("/admin/urunler");
}

export async function updateBasePrice(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const basePrice = Math.round(Number(formData.get("price") ?? 0) * 100);
  if (basePrice < 0) return;
  await prisma.product.update({ where: { id }, data: { basePrice } });
  revalidatePath("/admin/urunler");
}

export async function saveCoupon(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const percentOff = Number(formData.get("percentOff") ?? 0);
  if (code.length < 3 || percentOff < 1 || percentOff > 80) return;
  await prisma.coupon.upsert({
    where: { code },
    update: { percentOff, active: true },
    create: { code, percentOff, active: true },
  });
  revalidatePath("/admin/kuponlar");
}

export async function saveCms(formData: FormData) {
  await requireAdmin();
  const heroTitle = String(formData.get("heroTitle") ?? "").trim();
  const heroBody = String(formData.get("heroBody") ?? "").trim();
  const faq = String(formData.get("faq") ?? "").trim();
  try {
    const parsed = JSON.parse(faq) as unknown;
    if (!Array.isArray(parsed)) return;
  } catch {
    return;
  }
  await prisma.page.upsert({
    where: { slug: "hero" },
    update: { title: heroTitle, body: heroBody },
    create: { slug: "hero", title: heroTitle, body: heroBody, kind: "hero" },
  });
  await prisma.page.upsert({
    where: { slug: "faq" },
    update: { title: "Sık sorulanlar", body: faq },
    create: { slug: "faq", title: "Sık sorulanlar", body: faq, kind: "faq" },
  });
  revalidatePath("/");
  revalidatePath("/admin/icerik");
}

export async function createPost(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (title.length < 4 || body.length < 40) return;
  const slug = `${title.toLocaleLowerCase("tr").replaceAll(" ", "-").replace(/[^a-z0-9-]/g, "")}-${Date.now().toString().slice(-4)}`;
  await prisma.blogPost.create({ data: { title, slug, excerpt, body } });
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}
