import { prisma } from "@/lib/prisma";
import { createCatalogProduct, updateBasePrice, updateVariant } from "@/server/actions/admin";
import { formatTry } from "@/utils/money";

export default async function AdminProducts() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null, slug: { not: "dtf-tabaka" } },
      include: { variants: { include: { color: true, size: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-5xl">Ürünler</h1>
      <form action={createCatalogProduct} className="mt-6 grid max-w-xl gap-2 text-sm">
        <input name="name" required placeholder="Ürün adı" className="h-11 border border-ink px-3" />
        <textarea name="description" required minLength={8} placeholder="Açıklama" className="h-20 border border-ink p-3" />
        <select name="categoryId" className="h-11 border border-ink px-2">
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input name="price" type="number" min={10} step="0.01" placeholder="Fiyat TL" className="h-11 border border-ink px-3" />
        <input name="colorName" placeholder="Renk" defaultValue="Siyah" className="h-11 border border-ink px-3" />
        <input name="hex" defaultValue="#161616" className="h-11 border border-ink px-3" />
        <input name="sizeName" placeholder="Beden" defaultValue="M" className="h-11 border border-ink px-3" />
        <input name="stock" type="number" min={0} defaultValue={12} className="h-11 border border-ink px-3" />
        <button className="h-11 bg-ink text-paper">Ürünü oluştur</button>
      </form>
      <ul className="mt-10 space-y-8">
        {products.map((product) => (
          <li key={product.id} className="border border-line p-4">
            <p className="font-display text-3xl">{product.name}</p>
            <form action={updateBasePrice} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={product.id} />
              <input name="price" type="number" step="0.01" defaultValue={(product.basePrice / 100).toFixed(2)} className="h-10 w-32 border border-ink px-2" />
              <button className="h-10 border border-ink px-3 text-sm">Taban fiyatı kaydet</button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {product.variants.map((variant) => (
                <li key={variant.id}>
                  <form action={updateVariant} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={variant.id} />
                    <span className="w-36">
                      {variant.color.name} / {variant.size.name} · {formatTry(product.basePrice + variant.priceDelta)}
                    </span>
                    <input name="stock" type="number" min={0} defaultValue={variant.stock} className="h-9 w-20 border border-ink px-2" />
                    <input name="priceDelta" type="number" step="0.01" defaultValue={(variant.priceDelta / 100).toFixed(2)} className="h-9 w-24 border border-ink px-2" />
                    <button className="h-9 border border-ink px-3">Stok ve fark</button>
                  </form>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
