import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Silhouette } from "@prisma/client";
import { KineticTitle } from "@/components/effects/kinetic-title";
import { Marquee } from "@/components/effects/marquee";
import { HeroScene } from "@/components/hero-scene";
import { Button } from "@/components/ui/button";

const marqueeTop = ["DTF BASKI", "KİŞİYE ÖZEL", "OVERSIZE", "HOODIE", "SWEATSHIRT", "KURUMSAL"];
const marqueeBottom = ["300 DPI KONTROL", "3 GÜNDE ÜRETİM", "TOPLU İNDİRİM", "GÜVENLİ ÖDEME", "TÜRKİYE GENELİ KARGO"];

export function Hero({
  title = "Kendi Tasarımını Giy.",
  lede = "Tasarımını yükle, ürününü seç, fiyatını anında gör. Atölyemiz üretsin, kapına gelsin.",
  swatches,
  kinds,
}: {
  title?: string;
  lede?: string;
  swatches: { name: string; hex: string }[];
  kinds: Silhouette[];
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="mesh -z-10" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 pt-10 pb-12 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pt-16 md:pb-20 lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Premium streetwear atölyesi
          </p>
          <KineticTitle text={title} className="text-display mt-5 max-w-[12ch] font-bold" />
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">{lede}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="cta" size="lg">
              <Link href="/tasarla" data-magnetic="">
                Ürününü Tasarla <ArrowRight className="btn-arrow size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dtf-baski">DTF Baskı Oluştur</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
            <div>
              <dt className="text-muted-foreground">Üretim</dt>
              <dd className="mt-1 font-semibold">3 iş günü</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Baskı</dt>
              <dd className="mt-1 font-semibold">DTF · 300 DPI</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ödeme</dt>
              <dd className="mt-1 font-semibold">3D Secure</dd>
            </div>
          </dl>
        </div>
        <HeroScene swatches={swatches} kinds={kinds} />
      </div>
      <div className="flex justify-center pb-6" aria-hidden="true">
        <span className="scroll-cue block h-10 text-foreground/40" />
      </div>
      <div className="space-y-3 border-t border-border bg-foreground py-4 font-display text-xl font-semibold tracking-tight text-background md:text-2xl">
        <Marquee items={marqueeTop} />
        <Marquee items={marqueeBottom} reverse className="text-background/60" />
      </div>
    </section>
  );
}
