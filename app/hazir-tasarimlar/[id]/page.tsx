import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { ListingPurchase } from "@/components/listing-purchase";
import { PageHeader } from "@/components/page-header";
import { listingCategoryLabel } from "@/lib/listing";
import { prisma } from "@/lib/prisma";
import { clampText } from "@/lib/seo";
import { placeListing } from "@/server/actions/marketplace";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findFirst({ where: { id, status: "APPROVED" }, include: { product: true } });
  if (!listing) return { title: "Tasarım bulunamadı", robots: { index: false } };
  return {
    title: clampText(`${listing.title} Tişört Tasarımı`, 60),
    description: clampText(`${listing.title}: ${listingCategoryLabel(listing.category)} kategorisinde hazır tasarım. ${listing.product.name} üzerine bastır.`, 155),
    alternates: { canonical: `/hazir-tasarimlar/${listing.id}` },
    openGraph: listing.imageUrl ? { images: [listing.imageUrl] } : undefined,
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id, status: "APPROVED" },
    include: { product: { include: { variants: { include: { color: true, size: true }, orderBy: { size: { sortOrder: "asc" } } } } }, user: { select: { name: true, firstName: true } } },
  });
  if (!listing) notFound();
  const tags = listing.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-site px-4 pb-20 sm:px-6 xl:px-8">
      <PageHeader
        eyebrow={listingCategoryLabel(listing.category)}
        title={listing.title}
        lede={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base">
            <span>Tasarımcı: {listing.user.firstName || listing.user.name || "Bağımsız tasarımcı"}</span>
            {listing.rating ? (
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-primary text-primary" aria-hidden="true" /> {listing.rating}/5
              </span>
            ) : null}
            {listing.salesCount ? <span>{listing.salesCount} satış</span> : null}
            <span>Ürün: {listing.product.name}</span>
          </span>
        }
        crumbs={[{ href: "/", label: "Ana sayfa" }, { href: "/hazir-tasarimlar", label: "Hazır tasarımlar" }, { label: listing.title }]}
      />
      <ListingPurchase
        action={placeListing.bind(null, listing.id)}
        imageUrl={listing.imageUrl}
        title={listing.title}
        silhouette={listing.product.silhouette}
        basePrice={listing.product.basePrice}
        designPrice={listing.price}
        variants={listing.product.variants.map((v) => ({
          id: v.id,
          colorId: v.colorId,
          colorName: v.color.name,
          hex: v.color.hex,
          sizeId: v.sizeId,
          sizeName: v.size.name,
          stock: v.stock,
          priceDelta: v.priceDelta,
        }))}
      />
      {tags.length ? (
        <div className="mt-12 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link key={tag} href={`/hazir-tasarimlar?etiket=${encodeURIComponent(tag)}`} className="rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/70">
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
