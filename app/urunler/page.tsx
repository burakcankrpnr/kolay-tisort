import type { Metadata } from "next";
import Link from "next/link";
import { Search, SearchX, X } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { listCategories, listProducts, type ProductSort } from "@/server/catalog";

const sorts: { id: ProductSort; label: string; short: string }[] = [
  { id: "onerilen", label: "Önerilen", short: "Önerilen" },
  { id: "yeni", label: "En yeni", short: "Yeni" },
  { id: "fiyat-artan", label: "Fiyat (artan)", short: "Ucuz" },
  { id: "fiyat-azalan", label: "Fiyat (azalan)", short: "Pahalı" },
];

type Search = { q?: string; kategori?: string; sirala?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const { q, kategori, sirala } = await searchParams;
  const categories = await listCategories();
  const active = categories.find((category) => category.slug === kategori);
  const title = active ? `${active.name} Baskı ve Tasarım` : "Baskılı Ürünler";
  return {
    title,
    description: active
      ? `${active.name} modellerini seç, kendi tasarımını bastır. ${active.description}`
      : "Tişört, oversize, sweatshirt ve hoodie modellerini seç, kendi tasarımını bastır.",
    alternates: { canonical: active ? `/urunler?kategori=${active.slug}` : "/urunler" },
    robots: q || sirala ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q, kategori, sirala } = await searchParams;
  const sort = sorts.some((s) => s.id === sirala) ? (sirala as ProductSort) : "onerilen";
  const [products, categories] = await Promise.all([listProducts({ q, category: kategori, sort }), listCategories()]);
  const active = categories.find((category) => category.slug === kategori);
  const visible = categories.filter((category) => category._count.products > 0);

  const href = (patch: Partial<Search>) => {
    const params = new URLSearchParams();
    const next = { q, kategori, sirala: sort === "onerilen" ? undefined : sort, ...patch };
    for (const [key, value] of Object.entries(next)) if (value) params.set(key, value);
    const query = params.toString();
    return query ? `/urunler?${query}` : "/urunler";
  };

  return (
    <div className="mx-auto max-w-site overflow-x-clip px-4 pb-28 sm:px-6 md:pb-20">
      <PageHeader
        className="!pt-6 !pb-6 md:!pt-12 md:!pb-14"
        eyebrow="Mağaza"
        title={active ? active.name : "Tüm ürünler"}
        lede={
          <span className="block text-base md:text-lg">
            {active?.description || "Ürününü seç, stüdyoda tasarla ya da baskısız sipariş et. Tüm fiyatlar ürün bedelidir; baskı ücreti tasarıma göre eklenir."}
          </span>
        }
        crumbs={[{ href: "/", label: "Ana sayfa" }, ...(active ? [{ href: "/urunler", label: "Ürünler" }, { label: active.name }] : [{ label: "Ürünler" }])]}
      />

      {/* Mobil: arama / sıralama / kategori ayrı satırlar; yatay taşma yok */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 space-y-3 border-y border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:mb-8 sm:rounded-card sm:border sm:px-4 md:top-20">
        <form action="/urunler" role="search" className="relative w-full">
          {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
          {sort !== "onerilen" ? <input type="hidden" name="sirala" value={sort} /> : null}
          <label htmlFor="liste-ara" className="sr-only">
            Ürün ara
          </label>
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="liste-ara"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Ara: oversize, hoodie…"
            enterKeyHint="search"
            className="h-11 w-full rounded-control border border-input bg-card pr-3 pl-9 text-base outline-none focus:border-foreground sm:h-10 sm:max-w-sm sm:text-sm"
          />
        </form>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">Sırala</span>
          <nav aria-label="Sıralama" className="chip-scroll chip-scroll-fade min-w-0 flex-1">
            {sorts.map((item) => (
              <Link
                key={item.id}
                href={href({ sirala: item.id === "onerilen" ? undefined : item.id })}
                aria-current={sort === item.id ? "true" : undefined}
                className={cn(
                  "shrink-0 snap-start rounded-full px-3 py-1.5 text-sm transition-colors",
                  sort === item.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <nav aria-label="Kategoriler" className="chip-scroll chip-scroll-fade -mx-1 px-1">
          <Link
            href={href({ kategori: undefined })}
            className={cn(
              "shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              !kategori ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50",
            )}
          >
            Tümü
          </Link>
          {visible.map((category) => (
            <Link
              key={category.id}
              href={href({ kategori: category.slug })}
              className={cn(
                "shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors",
                kategori === category.slug ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50",
              )}
            >
              {category.name}
              <span className="ml-1 opacity-60">{category._count.products}</span>
            </Link>
          ))}
        </nav>
      </div>

      {q || kategori ? (
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">{products.length} ürün</span>
          {q ? (
            <Link href={href({ q: undefined })} className="flex max-w-full items-center gap-1 truncate rounded-full bg-muted px-3 py-1">
              <span className="truncate">“{q}”</span> <X size={13} aria-label="Aramayı kaldır" className="shrink-0" />
            </Link>
          ) : null}
          {active ? (
            <Link href={href({ kategori: undefined })} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              {active.name} <X size={13} aria-label="Kategoriyi kaldır" />
            </Link>
          ) : null}
          <Link href="/urunler" className="ml-1 underline">
            Tümünü temizle
          </Link>
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground sm:mb-6">{products.length} ürün</p>
      )}

      {products.length === 0 ? (
        <div className="rounded-card border border-dashed border-border px-4 py-14 text-center sm:px-6 sm:py-16">
          <SearchX size={36} className="mx-auto text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl">Bu aramayla eşleşen ürün yok</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">Farklı bir kelime dene ya da popüler kategorilere göz at.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {visible.slice(0, 4).map((category) => (
              <Link key={category.id} href={`/urunler?kategori=${category.slug}`} className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/50">
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} stagger={index % 4} className="min-w-0 h-full">
              <ProductCard
                href={`/urun/${product.slug}`}
                name={product.name}
                price={product.basePrice}
                category={product.category.name}
                color={product.colors[0]?.hex ?? "#161616"}
                colors={product.colors.map((color) => color.hex)}
                silhouette={product.silhouette}
                badge={product.isPopular ? "Çok satan" : undefined}
              />
            </Reveal>
          ))}
        </div>
      )}

      <section className="mx-auto mt-14 max-w-3xl border-t border-border pt-8 text-muted-foreground sm:mt-20 sm:pt-10" aria-labelledby="liste-seo">
        <h2 id="liste-seo" className="text-h2 text-foreground">
          {active ? `${active.name} baskı` : "Kişiye özel baskılı ürünler"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed sm:mt-4 sm:text-base">
          Her ürün DTF tekniğiyle, kendi yüklediğin görsel veya stüdyoda hazırladığın tasarımla basılır. Ön ve arka için 35×40 cm’ye
          kadar baskı alanı, 10 adetten itibaren otomatik toplu indirim ve çoğu üründe 3 iş gününde üretim.
        </p>
      </section>
    </div>
  );
}
