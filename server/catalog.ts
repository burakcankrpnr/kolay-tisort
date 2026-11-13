import { prisma } from "@/lib/prisma";

export async function listCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { deletedAt: null } } } } },
  });
}

export async function listProducts(filters: { q?: string; category?: string }) {
  const q = filters.q?.trim();
  return prisma.product.findMany({
    where: {
      deletedAt: null,
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
    orderBy: { name: "asc" },
  });
}

export async function listPopularProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null, isPopular: true },
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
