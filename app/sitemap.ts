import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

/** Ürün, kategori, tasarım ve blog URL'leri; lastmod kaydın güncellenme tarihinden. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, categories, listings, posts] = await Promise.all([
    prisma.product.findMany({ where: { deletedAt: null, slug: { not: "dtf-tabaka" } }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
    prisma.listing.findMany({ where: { status: "APPROVED" }, select: { id: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/urunler`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tasarla`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/dtf-baski`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/hazir-tasarimlar`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/kurumsal`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ];

  return [
    ...staticPages,
    ...products.map((p) => ({ url: `${base}/urun/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
    ...categories.map((c) => ({ url: `${base}/urunler?kategori=${c.slug}`, lastModified: c.updatedAt, priority: 0.7 })),
    ...listings.map((l) => ({ url: `${base}/hazir-tasarimlar/${l.id}`, lastModified: l.updatedAt, priority: 0.5 })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.updatedAt, priority: 0.6 })),
  ];
}
