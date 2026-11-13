import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { deletedAt: null, slug: { not: "dtf-tabaka" } } } } } },
  });
}

export type ProductSort = "onerilen" | "yeni" | "fiyat-artan" | "fiyat-azalan";

const sortOrder: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  onerilen: [{ isPopular: "desc" }, { name: "asc" }],
  yeni: [{ createdAt: "desc" }],
  "fiyat-artan": [{ basePrice: "asc" }],
  "fiyat-azalan": [{ basePrice: "desc" }],
};

export async function listProducts(filters: { q?: string; category?: string; sort?: ProductSort }) {
  const q = filters.q?.trim();
  return prisma.product.findMany({
    where: {
      deletedAt: null,
      slug: { not: "dtf-tabaka" },
      category: filters.category ? { slug: filters.category, deletedAt: null } : { deletedAt: null },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      colors: { orderBy: { name: "asc" } },
    },
    orderBy: sortOrder[filters.sort ?? "onerilen"] ?? sortOrder.onerilen,
  });
}

export async function listPopularProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null, isPopular: true, slug: { not: "dtf-tabaka" } },
    include: { colors: { orderBy: { name: "asc" } }, category: true },
    orderBy: { name: "asc" },
    take: 6,
  });
}

export async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, deletedAt: null },
    include: {
      category: true,
      colors: { orderBy: { name: "asc" } },
      sizes: { orderBy: { sortOrder: "asc" } },
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}
