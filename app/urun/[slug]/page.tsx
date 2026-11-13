import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/product-purchase";
import { sizeChartRows } from "@/config/size-chart";
import { getProduct } from "@/server/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Ürün" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const chart = sizeChartRows[product.fit];

  return (
    <article className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-sm text-ink/60">{product.category.name}</p>
      <h1 className="mt-2 font-display text-5xl leading-none md:text-7xl">{product.name}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed">{product.description}</p>
      <div className="mt-8">
        <ProductPurchase
          name={product.name}
          basePrice={product.basePrice}
          productionDays={product.productionDays}
          silhouette={product.silhouette}
          colors={product.colors.map((color) => ({ id: color.id, name: color.name, hex: color.hex }))}
          sizes={product.sizes.map((size) => ({ id: size.id, name: size.name }))}
          variants={product.variants.map((variant) => ({
            id: variant.id,
            colorId: variant.colorId,
            sizeId: variant.sizeId,
            stock: variant.stock,
            priceDelta: variant.priceDelta,
          }))}
        />
      </div>
      <section className="mt-12">
        <h2 className="font-display text-3xl">Beden tablosu</h2>
        <p className="mt-2 text-sm text-ink/70">Ölçüler santimetre. Göğüs genişliği düz yatmış üründen.</p>
        <table className="mt-4 w-full max-w-lg border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink">
              <th className="py-2 font-medium">Beden</th>
              <th className="py-2 font-medium">Göğüs</th>
              <th className="py-2 font-medium">Boy</th>
            </tr>
          </thead>
          <tbody>
            {chart.map((row) => (
              <tr key={row.size} className="border-b border-line">
                <td className="py-2">{row.size}</td>
                <td className="py-2">{row.chest}</td>
                <td className="py-2">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </article>
  );
}
