import Link from "next/link";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { listCategories, listPopularProducts } from "@/server/catalog";

const steps = [
  {
    title: "Ürünü seç",
    body: "Oversize, hoodie veya sweatshirt. Rengini vitrinden seç.",
  },
  {
    title: "Bedenini belirle",
    body: "Beden tablosu santimetre cinsinden. Adedi sepete yaz.",
  },
  {
    title: "Atölyeye bırak",
    body: "Ödeme düşünce sipariş üretime geçer. Kargo firmasını sen seçersin.",
  },
];

const faqs = [
  {
    q: "Baskı ne kadar sürer?",
    a: "Üretim çoğu üründe 3 iş günü, hoodie’de 4 iş günü. Kargo buna eklenir.",
  },
  {
    q: "Hangi kargoyu kullanıyorsunuz?",
    a: "Aras, Yurtiçi, MNG ve Sürat. Ücreti ve süreyi ödemede görürsün.",
  },
  {
    q: "Tasarımımı şimdi yükleyebilir miyim?",
    a: "Tasarım editörü sıradaki aşamada. Şimdilik ürünü, rengi ve bedeni seçip sipariş bırakabilirsin.",
  },
];

export default async function HomePage() {
  const [categories, products] = await Promise.all([listCategories(), listPopularProducts()]);

  return (
    <div className="mx-auto max-w-6xl px-5">
      <Hero />
      <section className="border-b border-line py-12">
        <h2 className="font-display text-4xl">Ürünler</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/urunler?kategori=${category.slug}`}
                className="flex items-baseline justify-between gap-4 py-3"
              >
                <span className="font-display text-2xl">{category.name}</span>
                <span className="text-sm text-ink/60">{category._count.products} ürün</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="border-b border-line py-12">
        <h2 className="font-display text-4xl">Popüler ürünler</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
      <section className="border-b border-line py-12">
        <h2 className="font-display text-4xl">Nasıl çalışır</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-ink pt-4">
              <p className="text-sm">{index + 1}</p>
              <h3 className="mt-2 font-display text-3xl">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-xl text-sm text-ink/70">
          Tasarım editörü sıradaki aşamada. Şimdilik ürünü, rengi ve bedeni seçip siparişi atölyeye bırakıyorsun.
        </p>
      </section>
      <section className="py-12">
        <h2 className="font-display text-4xl">Sık sorulanlar</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {faqs.map((item) => (
            <details key={item.q} className="py-4">
              <summary className="cursor-pointer font-display text-2xl">{item.q}</summary>
              <p className="mt-2 max-w-xl text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
