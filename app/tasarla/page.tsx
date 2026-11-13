import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers, MousePointer2, Sparkles, Type, UploadCloud, Wand2 } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { Garment } from "@/components/garment";
import { PageHeader } from "@/components/page-header";
import { listProducts } from "@/server/catalog";
import { formatTry } from "@/utils/money";

export const metadata: Metadata = {
  title: "Kendi Tişörtünü Tasarla",
  description: "Online tasarım stüdyosu: ürünü seç, görsel yükle, metin ve grafik ekle, fiyatı canlı gör. Tişört, oversize, hoodie ve sweatshirt.",
  alternates: { canonical: "/tasarla" },
};

const features = [
  { icon: UploadCloud, title: "Görsel yükle", text: "Sürükle-bırak, yapıştır; 300 DPI kontrolü." },
  { icon: Type, title: "17 Türkçe font", text: "Kavisli yazı, kontur, gölge." },
  { icon: Wand2, title: "Hazır şablonlar", text: "Kolej, takım, doğum günü ve fazlası." },
  { icon: Sparkles, title: "Grafik kütüphanesi", text: "Vektör ikonlar, şekiller." },
  { icon: Layers, title: "Katmanlar", text: "Kilitle, gizle, sırala, hizala." },
  { icon: MousePointer2, title: "Gerçekçi önizleme", text: "Kumaş gölgesiyle son hâli gör." },
];

export default async function DesignIndexPage() {
  const products = (await listProducts({})).filter((product) => product.slug !== "dtf-tabaka");
  return (
    <div className="mx-auto max-w-site px-4 pb-20 sm:px-6">
      <PageHeader
        eyebrow="Tasarım stüdyosu"
        title="Bir ürün seç, tasarlamaya başla."
        lede="Baskı alanı 35×40 cm. Ön ve arka yüzü ayrı tasarlayabilir, fiyatı her adımda canlı görebilirsin."
        crumbs={[{ href: "/", label: "Ana sayfa" }, { label: "Kendin tasarla" }]}
      />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <Reveal as="li" key={product.id} stagger={index % 4}>
            <Link
              href={`/tasarla/${product.slug}`}
              data-tilt=""
              data-cursor="Tasarla"
              className="fx-card group flex h-full flex-col overflow-hidden rounded-card border border-border bg-card"
            >
              <div className="relative flex aspect-square items-center justify-center bg-gradient-to-b from-muted/40 to-muted">
                <Garment kind={product.silhouette} color={product.colors[0]?.hex ?? "#161616"} className="w-[62%] transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute right-3 bottom-3 z-[3] flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  Tasarla <ArrowRight size={13} />
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{product.category.name}</p>
                <h2 className="font-display text-lg leading-tight">{product.name}</h2>
                <p className="mt-auto pt-2 text-sm">
                  <span className="text-muted-foreground">başlayan </span>
                  <span className="font-semibold">{formatTry(product.basePrice)}</span>
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>

      <section className="mt-20" aria-labelledby="studyo">
        <h2 id="studyo" className="text-h2">
          Stüdyoda neler var?
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }, index) => (
            <Reveal as="li" key={title} stagger={index % 3} className="fx-spot flex gap-4 rounded-card border border-border bg-card p-5">
              <Icon size={22} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}
