import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const cities = [
  { slug: "istanbul", name: "İstanbul" },
  { slug: "ankara", name: "Ankara" },
  { slug: "izmir", name: "İzmir" },
] as const;

const categories = [
  { slug: "tisort", name: "Tişört" },
  { slug: "hoodie", name: "Hoodie" },
  { slug: "sweatshirt", name: "Sweatshirt" },
] as const;

export function generateStaticParams() {
  return cities.flatMap((city) => categories.map((category) => ({ city: city.slug, category: category.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}): Promise<Metadata> {
  const { city, category } = await params;
  const cityName = cities.find((item) => item.slug === city)?.name;
  const categoryName = categories.find((item) => item.slug === category)?.name;
  if (!cityName || !categoryName) return { title: "Baskı" };
  return {
    title: `${cityName} ${categoryName} baskı`,
    description: `${cityName} için ${categoryName.toLocaleLowerCase("tr")} baskı. Tasarımını yükle, atölye üretsin.`,
    // Şehir varyasyonları henüz benzersiz içerik taşımıyor: ince sayfa olarak indekslenmez.
    robots: { index: false, follow: true },
  };
}

export default async function SeoPage({ params }: { params: Promise<{ city: string; category: string }> }) {
  const { city, category } = await params;
  const cityName = cities.find((item) => item.slug === city)?.name;
  const categoryName = categories.find((item) => item.slug === category)?.name;
  if (!cityName || !categoryName) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <p className="font-display text-sm font-semibold tracking-widest text-primary uppercase">{cityName}</p>
      <h1 className="text-h1 mt-2">
        {cityName} {categoryName} baskı
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
        {cityName} adresine {categoryName.toLocaleLowerCase("tr")} baskısı gönderiyoruz. Ürünü seç, tasarımını yerleştir, üretim atölyede tamamlansın.
      </p>
      <Link href={`/urunler?kategori=${category}`} className="mt-8 inline-flex h-12 items-center rounded-control bg-foreground px-6 text-sm font-semibold text-background">
        {categoryName} ürünlerine bak
      </Link>
    </div>
  );
}
