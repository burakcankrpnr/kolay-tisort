import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DesignEditor } from "@/features/design-editor/loader";
import { prisma } from "@/lib/prisma";
import { getProduct, listProducts } from "@/server/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product ? `${product.name} tasarla` : "Tasarla",
    description: product ? `${product.name} için kendi tasarımını oluştur: metin, görsel, şablon ve grafik ekle, fiyatı canlı gör.` : undefined,
    alternates: { canonical: `/tasarla/${slug}` },
  };
}

export default async function DesignEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tasarim?: string }>;
}) {
  const [{ slug }, { tasarim }, session] = await Promise.all([params, searchParams, auth()]);
  const product = await getProduct(slug);
  if (!product || product.slug === "dtf-tabaka") notFound();

  const [products, listings, design] = await Promise.all([
    listProducts({}),
    prisma.listing.findMany({
      where: { status: "APPROVED", imageUrl: { not: "" } },
      select: { id: true, title: true, imageUrl: true },
      orderBy: { salesCount: "desc" },
      take: 8,
    }),
    tasarim && session?.user?.id
      ? prisma.design.findFirst({ where: { id: tasarim, userId: session.user.id, deletedAt: null } })
      : null,
  ]);

  return (
    <DesignEditor
      signedIn={Boolean(session?.user)}
      product={{
        id: product.id,
        slug: product.slug,
        name: product.name,
        silhouette: product.silhouette,
        basePrice: product.basePrice,
        productionDays: product.productionDays,
        colors: product.colors.map((color) => ({ id: color.id, name: color.name, hex: color.hex })),
        sizes: product.sizes.map((size) => ({ id: size.id, name: size.name })),
        variants: product.variants.map((variant) => ({
          id: variant.id,
          colorId: variant.colorId,
          sizeId: variant.sizeId,
          stock: variant.stock,
          priceDelta: variant.priceDelta,
        })),
      }}
      products={products
        .filter((item) => item.slug !== "dtf-tabaka")
        .map((item) => ({
          slug: item.slug,
          name: item.name,
          silhouette: item.silhouette,
          basePrice: item.basePrice,
          color: item.colors[0]?.hex ?? "#161616",
        }))}
      listings={listings}
      initialDesign={
        design
          ? { id: design.id, name: design.name, front: design.frontJson, back: design.backJson, neck: design.neckJson }
          : null
      }
    />
  );
}
