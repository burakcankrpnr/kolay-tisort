import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { listCategories, listProducts } from "@/server/catalog";

export const metadata: Metadata = { title: "Ürünler" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string }>;
}) {
  const { q, kategori } = await searchParams;
  const [products, categories] = await Promise.all([
    listProducts({ q, category: kategori }),
    listCategories(),
  ]);
  const active = categories.find((category) => category.slug === kategori);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-5xl md:text-7xl">{active?.name ?? "Ürünler"}</h1>
      {q ? <p className="mt-3 text-sm">Arama: {q}</p> : null}
      <div className="mt-6 flex gap-4 overflow-x-auto border-b border-line pb-3 text-sm">
        <Link href="/urunler" className={!kategori ? "border-b border-ink" : "text-ink/60"}>
          Tümü
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/urunler?kategori=${category.slug}`}
            className={kategori === category.slug ? "border-b border-ink whitespace-nowrap" : "whitespace-nowrap text-ink/60"}
          >
            {category.name}
          </Link>
        ))}
      </div>
      {products.length === 0 ? (
        <p className="mt-10">Bu aramayla eşleşen ürün yok.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              href={`/urun/${product.slug}`}
              name={product.name}
              price={product.basePrice}
              category={product.category.name}
              color={product.colors[0]?.hex ?? "#161616"}
              silhouette={product.silhouette}
            />
          ))}
        </div>
      )}
    </div>
  );
}
