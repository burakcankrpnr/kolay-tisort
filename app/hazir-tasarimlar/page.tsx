import type { Metadata } from "next";
import Link from "next/link";
import type { ListingCategory } from "@prisma/client";
import { Palette, Star } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { PageHeader } from "@/components/page-header";
import { listingCategories, listingCategoryLabel } from "@/lib/listing";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { formatTry } from "@/utils/money";

export const metadata: Metadata = {
  title: "Hazır Tişört Tasarımları",
  description: "Bağımsız tasarımcıların onaylı tişört tasarımları: anime, oyun, sokak, vintage ve daha fazlası. Tasarımı seç, ürününe bastır.",
  alternates: { canonical: "/hazir-tasarimlar" },
};

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ kategori?: string; etiket?: string }> }) {
  const { kategori, etiket } = await searchParams;
  const category = listingCategories.some((item) => item.id === kategori) ? (kategori as ListingCategory) : undefined;
  const [listings, counts] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "APPROVED", ...(category ? { category } : {}), ...(etiket ? { tags: { contains: etiket, mode: "insensitive" } } : {}) },
      include: { product: true, user: { select: { name: true, firstName: true } } },
      orderBy: { salesCount: "desc" },
    }),
    prisma.listing.groupBy({ by: ["category"], where: { status: "APPROVED" }, _count: true }),
  ]);
  const countOf = new Map(counts.map((row) => [row.category, row._count]));

  return (
    <div className="mx-auto max-w-site px-4 pb-20 sm:px-6">
      <PageHeader
        eyebrow="Tasarımcı pazarı"
        title={category ? listingCategoryLabel(category) : "Hazır tasarımlar"}
        lede="Bağımsız tasarımcıların onaylı işleri. Bir tasarım seç, ürününü ve bedenini belirle; atölye bassın."
        crumbs={[{ href: "/", label: "Ana sayfa" }, { label: "Hazır tasarımlar" }]}
        actions={
          <Link href="/tasarimci" className="flex h-11 items-center gap-2 rounded-control border border-input px-4 text-sm font-semibold hover:border-foreground/50">
            <Palette size={16} /> Tasarımcı ol
          </Link>
        }
      />
      <nav aria-label="Kategoriler" className="mb-8 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/hazir-tasarimlar"
          className={cn("shrink-0 rounded-full border px-4 py-1.5 text-sm", !category ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50")}
        >
          Tümü
        </Link>
        {listingCategories
          .filter((item) => countOf.get(item.id) || item.id === category)
          .map((item) => (
            <Link
              key={item.id}
              href={`/hazir-tasarimlar?kategori=${item.id}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm",
                category === item.id ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50",
              )}
            >
              {item.label} <span className="opacity-60">{countOf.get(item.id) ?? 0}</span>
            </Link>
          ))}
      </nav>
      {etiket ? (
        <p className="mb-6 text-sm">
          Etiket: <strong>#{etiket}</strong> ·{" "}
          <Link href="/hazir-tasarimlar" className="underline">
            temizle
          </Link>
        </p>
      ) : null}

      {listings.length === 0 ? (
        <div className="rounded-card border border-dashed border-border px-6 py-16 text-center">
          <Palette size={34} className="mx-auto text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl">Bu kategoride henüz tasarım yok</h2>
          <p className="mt-2 text-muted-foreground">İlk tasarımı sen yükle ya da stüdyoda kendi tasarımını yap.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/tasarimci" className="flex h-11 items-center rounded-control bg-foreground px-5 text-sm font-semibold text-background">
              Tasarım yükle
            </Link>
            <Link href="/tasarla" className="flex h-11 items-center rounded-control border border-input px-5 text-sm font-semibold">
              Stüdyoyu aç
            </Link>
          </div>
        </div>
      ) : (
        <ul className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>li]:mb-3">
          {listings.map((listing, index) => (
            <Reveal as="li" key={listing.id} stagger={index % 4} className="break-inside-avoid">
              <Link href={`/hazir-tasarimlar/${listing.id}`} data-cursor="Gör" className="fx-card group block overflow-hidden rounded-card border border-border bg-card">
                <div className="checker overflow-hidden">
                  {listing.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.imageUrl} alt={listing.title} loading="lazy" className="w-full transition-transform duration-500 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="aspect-square" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{listingCategoryLabel(listing.category)}</p>
                  <h2 className="mt-1 font-display text-lg leading-tight">{listing.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{listing.user.firstName || listing.user.name || "Tasarımcı"}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold">{formatTry(listing.product.basePrice + listing.price)}</span>
                    {listing.rating ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star size={12} className="fill-primary text-primary" aria-hidden="true" /> {listing.rating}/5
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
