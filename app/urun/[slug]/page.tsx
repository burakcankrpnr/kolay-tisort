import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Star } from "lucide-react";
import { auth } from "@/auth";
import { Reveal } from "@/components/effects/reveal";
import { FavoriteButton } from "@/components/favorite-button";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { ReviewForm } from "@/components/review-form";
import { sizeChartRows } from "@/config/size-chart";
import { deliveryWindow } from "@/lib/delivery";
import { neckFee, printFees } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { clampText, siteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { shippingOptions } from "@/lib/shipping";
import { getProduct } from "@/server/catalog";
import { formatTry } from "@/utils/money";

const reviewDate = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Ürün bulunamadı", robots: { index: false } };
  const title = clampText(`${product.name} Tasarla ve Bastır`, 60);
  const description = clampText(`${product.description} ${product.productionDays} iş gününde üretim, toplu siparişte indirim.`, 155);
  return {
    title,
    description,
    alternates: { canonical: `/urun/${product.slug}` },
    openGraph: { type: "website", title, description, url: `/urun/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const session = await auth();
  const [reviews, favorite, related, { brand }] = await Promise.all([
    prisma.review.findMany({
      where: { productId: product.id, deletedAt: null },
      include: { user: { select: { firstName: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    session?.user
      ? prisma.favorite.findUnique({ where: { userId_productId: { userId: session.user.id, productId: product.id } } })
      : null,
    prisma.product.findMany({
      where: { deletedAt: null, id: { not: product.id }, slug: { not: "dtf-tabaka" } },
      include: { category: true, colors: { orderBy: { name: "asc" } } },
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
      take: 4,
    }),
    getSettings(),
  ]);
  const chart = sizeChartRows[product.fit];
  const base = siteUrl();
  const prices = product.variants.map((variant) => product.basePrice + variant.priceDelta);
  const minPrice = prices.length ? Math.min(...prices) : product.basePrice;
  const maxPrice = prices.length ? Math.max(...prices) : product.basePrice;
  const inStock = product.variants.some((variant) => variant.stock > 0);
  const rating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
  const delivery = deliveryWindow(product.productionDays);

  const sizeTable = (
    <table className="mt-4 w-full text-left text-sm">
      <caption className="sr-only">Ölçüler santimetre</caption>
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th scope="col" className="py-2.5 font-medium">
            Beden
          </th>
          <th scope="col" className="py-2.5 font-medium">
            Göğüs (cm)
          </th>
          <th scope="col" className="py-2.5 font-medium">
            Boy (cm)
          </th>
        </tr>
      </thead>
      <tbody>
        {chart.map((row) => (
          <tr key={row.size} className="border-b border-border last:border-0">
            <td className="py-2.5 font-semibold">{row.size}</td>
            <td className="py-2.5 tabular-nums">{row.chest}</td>
            <td className="py-2.5 tabular-nums">{row.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const details: { title: string; body: React.ReactNode }[] = [
    {
      title: "Ürün bilgisi",
      body: (
        <ul className="list-disc space-y-1.5 pl-5">
          <li>{product.description}</li>
          <li>Kategori: {product.category.name}</li>
          <li>Renk seçenekleri: {product.colors.map((c) => c.name).join(", ")}</li>
          <li>Bedenler: {product.sizes.map((s) => s.name).join(", ")}</li>
        </ul>
      ),
    },
    {
      title: "Beden tablosu",
      body: (
        <>
          <p>Ölçüler düz zeminde yatırılmış üründen alınmıştır; ±1 cm tolerans olabilir.</p>
          {sizeTable}
        </>
      ),
    },
    {
      title: "Baskı bilgisi",
      body: (
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Teknik: DTF (direct-to-film) — canlı renk, ince detay, esnek tutuş.</li>
          <li>Baskı alanı: ön ve arka için 35 × 40 cm’ye kadar; ense etiketi 6 × 6 cm.</li>
          <li>
            Baskı ücreti: tek yüz {formatTry(printFees.FRONT)}, ön + arka {formatTry(printFees.BOTH)}, ense etiketi +{formatTry(neckFee)}.
          </li>
          <li>En iyi sonuç için 300 DPI veya üzeri, şeffaf arka planlı PNG yükle.</li>
        </ul>
      ),
    },
    {
      title: "Bakım",
      body: (
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Ters çevirerek 30 °C’de yıka.</li>
          <li>Baskının üzerine doğrudan ütü yapma.</li>
          <li>Kurutma makinesinde yüksek ısı kullanma.</li>
        </ul>
      ),
    },
    {
      title: "Teslimat ve iade",
      body: (
        <>
          <p>
            Üretim {product.productionDays} iş günü sürer. Kargo seçenekleri ödemede seçilir:
          </p>
          <ul className="mt-2 space-y-1">
            {shippingOptions.map((option) => (
              <li key={option.id} className="flex justify-between gap-3">
                <span>{option.name}</span>
                <span className="text-muted-foreground">
                  {option.eta} · {formatTry(option.fee)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2">Kişiye özel üretilen ürünlerde cayma hakkı, üretim hatası dışında kullanılamaz.</p>
        </>
      ),
    },
  ];

  return (
    <article className="mx-auto max-w-site px-4 pt-6 pb-28 sm:px-6 xl:px-8 md:pb-20">
      <nav aria-label="Konum" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="link-underline hover:text-foreground">
              Ana sayfa
            </Link>
          </li>
          <ChevronRight size={14} aria-hidden="true" />
          <li>
            <Link href={`/urunler?kategori=${product.category.slug}`} className="link-underline hover:text-foreground">
              {product.category.name}
            </Link>
          </li>
          <ChevronRight size={14} aria-hidden="true" />
          <li aria-current="page" className="text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductPurchase
        slug={product.slug}
        name={product.name}
        category={product.category.name}
        description={product.description}
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
        rating={rating}
        reviewCount={reviews.length}
        delivery={delivery}
        favorite={<FavoriteButton productId={product.id} saved={Boolean(favorite)} compact />}
        sizeChart={sizeTable}
      />

      <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14" aria-label="Ürün ayrıntıları">
        <div className="divide-y divide-border border-y border-border">
          {details.map((item, index) => (
            <details key={item.title} className="group py-1" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-display text-xl [&::-webkit-details-marker]:hidden">
                {item.title}
                <span className="grid size-8 place-items-center rounded-full border border-border transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{item.body}</div>
            </details>
          ))}
        </div>

        <div id="yorumlar" className="scroll-mt-24">
          <h2 className="text-h2">Yorumlar</h2>
          {rating !== null ? (
            <div className="mt-4 flex items-center gap-4 rounded-card border border-border bg-card p-5">
              <p className="font-display text-5xl font-bold">{rating.toFixed(1)}</p>
              <div>
                <p className="flex text-primary" aria-label={`5 üzerinden ${rating.toFixed(1)}`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={18} className={i <= Math.round(rating) ? "fill-current" : "opacity-30"} aria-hidden="true" />
                  ))}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{reviews.length} doğrulanmış yorum</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-muted-foreground">Henüz yorum yok. İlk yorumu sen yaz.</p>
          )}
          <ul className="mt-4 space-y-3">
            {reviews.slice(0, 6).map((review) => (
              <li key={review.id} className="rounded-card border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex text-primary" aria-label={`5 üzerinden ${review.rating} puan`}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className={i <= review.rating ? "fill-current" : "opacity-30"} aria-hidden="true" />
                    ))}
                  </p>
                  <time className="text-xs text-muted-foreground" dateTime={review.createdAt.toISOString()}>
                    {reviewDate.format(review.createdAt)}
                  </time>
                </div>
                <p className="mt-3 leading-relaxed">{review.body}</p>
                <p className="mt-2 text-sm text-muted-foreground">{review.user.firstName || review.user.name || "Müşteri"}</p>
              </li>
            ))}
          </ul>
          {session?.user ? (
            <ReviewForm productId={product.id} />
          ) : (
            <p className="mt-6 text-sm">
              Yorum yazmak için{" "}
              <Link href={`/giris?callbackUrl=/urun/${product.slug}`} className="font-semibold underline">
                giriş yap
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      {related.length ? (
        <section className="mt-20" aria-labelledby="benzer">
          <h2 id="benzer" className="text-h2">
            Bunları da beğenebilirsin
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal key={item.id} stagger={index}>
                <ProductCard
                  href={`/urun/${item.slug}`}
                  name={item.name}
                  price={item.basePrice}
                  category={item.category.name}
                  color={item.colors[0]?.hex ?? "#161616"}
                  colors={item.colors.map((c) => c.hex)}
                  silhouette={item.silhouette}
                />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            sku: product.slug,
            brand: { "@type": "Brand", name: brand.name },
            category: product.category.name,
            url: `${base}/urun/${product.slug}`,
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "TRY",
              lowPrice: (minPrice / 100).toFixed(2),
              highPrice: (maxPrice / 100).toFixed(2),
              offerCount: product.variants.length,
              availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
            ...(rating !== null
              ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.toFixed(1), reviewCount: reviews.length } }
              : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Ana sayfa", item: `${base}/` },
              { "@type": "ListItem", position: 2, name: product.category.name, item: `${base}/urunler?kategori=${product.category.slug}` },
              { "@type": "ListItem", position: 3, name: product.name },
            ],
          },
        ]}
      />
    </article>
  );
}
