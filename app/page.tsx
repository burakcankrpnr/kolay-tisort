import Link from "next/link";
import { ArrowRight, BadgePercent, Building2, Layers, Palette, PenTool, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import type { Silhouette } from "@prisma/client";
import { CountUp } from "@/components/effects/count-up";
import { Reveal } from "@/components/effects/reveal";
import { Garment } from "@/components/garment";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { dtfSheets } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { listCategories, listPopularProducts } from "@/server/catalog";
import { formatTry } from "@/utils/money";

const defaultFaqs = [
  {
    q: "Baskı ne kadar sürede hazırlanır?",
    a: "Üretim çoğu üründe 3 iş günü, hoodie'de 4 iş günü sürer. Kargo süresi buna eklenir ve ödeme adımında görünür.",
  },
  {
    q: "Hangi kargo firmalarıyla gönderiyorsunuz?",
    a: "Aras, Yurtiçi, MNG ve Sürat. Ücreti ve tahmini süreyi ödeme adımında seçerek görürsün.",
  },
  {
    q: "Tasarımımı nasıl yüklerim?",
    a: "Ürün sayfasından veya Kendin Tasarla menüsünden editöre gir, görselini sürükle ve baskı alanına yerleştir. Çözünürlük düşükse editör seni uyarır.",
  },
  {
    q: "Toplu siparişte indirim var mı?",
    a: "Evet. 10 adetten itibaren %5, 20 adetten itibaren %10, 50 adetten itibaren %15 indirim sepette otomatik uygulanır.",
  },
];

const tiers = [
  { range: "1–9 adet", off: "—" },
  { range: "10–19 adet", off: "%5" },
  { range: "20–49 adet", off: "%10" },
  { range: "50+ adet", off: "%15" },
];

const trust = [
  { icon: Truck, title: "3 iş gününde üretim", body: "Ödeme onayından sonra" },
  { icon: ShieldCheck, title: "3D Secure ödeme", body: "Kart bilgin bizde saklanmaz" },
  { icon: Sparkles, title: "300 DPI kontrolü", body: "Düşük çözünürlükte uyarı" },
  { icon: BadgePercent, title: "Toplu indirim", body: "10 adetten itibaren otomatik" },
];

export default async function HomePage() {
  const [categories, products, hero, faqPage, reviews, settings] = await Promise.all([
    listCategories(),
    listPopularProducts(),
    prisma.page.findUnique({ where: { slug: "hero" } }),
    prisma.page.findUnique({ where: { slug: "faq" } }),
    prisma.review.findMany({
      where: { deletedAt: null, rating: { gte: 4 } },
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    getSettings(),
  ]);

  let faqs = defaultFaqs;
  if (faqPage?.body) {
    try {
      const parsed = JSON.parse(faqPage.body) as { q: string; a: string }[];
      if (Array.isArray(parsed) && parsed.length) faqs = parsed;
    } catch {
      // bozuk CMS verisi: varsayılan SSS
    }
  }

  // Hero sahnesi için gerçek ürün renkleri
  const swatches = Array.from(
    new Map(products.flatMap((product) => product.colors).map((color) => [color.hex.toLowerCase(), color])).values(),
  )
    .map((color) => ({ name: color.name, hex: color.hex }))
    // Koyu renk önce: açık zemin üzerinde ürün silüeti net okunur.
    .sort((a, b) => brightness(a.hex) - brightness(b.hex))
    .slice(0, 5);
  const kinds = Array.from(new Set(products.map((product) => product.silhouette))) as Silhouette[];
  const visibleCategories = categories.filter((category) => category._count.products > 0).slice(0, 5);
  const minSheet = dtfSheets[0];

  return (
    <>
      <Hero
        title={hero?.title || undefined}
        lede={hero?.body || undefined}
        swatches={swatches.length ? swatches : [{ name: "Siyah", hex: "#161616" }]}
        kinds={kinds.length ? kinds : ["TEE"]}
      />

      {/* Güven şeridi + sayaçlar */}
      <section aria-label="Neden biz" className="border-b border-border">
        <div className="mx-auto grid max-w-site grid-cols-2 gap-px bg-border px-0 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, body }, index) => (
            <Reveal key={title} stagger={index} className="flex items-start gap-3 bg-background px-4 py-6 sm:px-6">
              <Icon size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Hızlı başlat — bento */}
      <section className="mx-auto max-w-site px-4 py-16 sm:px-6 md:py-28" aria-labelledby="hizli-baslat">
        <SectionHead index="01" eyebrow="BAŞLA" id="hizli-baslat" title="Nereden başlamak istersin?" />
        <div className="mt-10 grid gap-4 md:grid-cols-6 md:grid-rows-[repeat(2,minmax(220px,auto))]">
          <Reveal className="md:col-span-3 md:row-span-2">
            <BentoLink
              href="/tasarla"
              icon={PenTool}
              title="Sıfırdan tasarla"
              body="Görselini yükle, yazını ekle, baskı alanına yerleştir. Fiyat canlı güncellenir."
              className="min-h-[320px] bg-foreground text-background md:h-full"
              cta="Editörü aç"
            >
              <Garment kind="TEE" color="#2A2A28" className="absolute -right-6 -bottom-8 w-[55%] rotate-[-8deg] opacity-90 transition-transform duration-700 group-hover:rotate-[-3deg] group-hover:scale-105" />
            </BentoLink>
          </Reveal>
          <Reveal stagger={1} className="md:col-span-3">
            <BentoLink
              href="/hazir-tasarimlar"
              icon={Palette}
              title="Hazır tasarım seç"
              body="Tasarımcıların onaylı işlerinden seç, ürününe uygula."
              cta="Tasarımlara göz at"
            >
              <div className="absolute -right-4 -bottom-4 flex gap-2 opacity-80" aria-hidden="true">
                {["#FF3B00", "#111111", "#F4C542", "#3B82F6"].map((hex, i) => (
                  <span
                    key={hex}
                    className="size-14 rounded-xl border border-border transition-transform duration-500 group-hover:-translate-y-2"
                    style={{ background: hex, transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
            </BentoLink>
          </Reveal>
          <Reveal stagger={2} className="md:col-span-2">
            <BentoLink href="/dtf-baski" icon={Layers} title="DTF tabaka oluştur" body={`${minSheet.widthCm}×${minSheet.heightCm} cm tabaka ${formatTry(minSheet.price)}'den.`} cta="Tabaka oluştur" />
          </Reveal>
          <Reveal stagger={3} className="md:col-span-1">
            <BentoLink href="/kurumsal" icon={Building2} title="Kurumsal" body="Teklif al." compact />
          </Reveal>
        </div>
      </section>

      {/* Kategoriler */}
      {visibleCategories.length ? (
        <section className="border-y border-border bg-muted/40" aria-labelledby="kategoriler">
          <div className="mx-auto max-w-site px-4 py-16 sm:px-6 md:py-24">
            <SectionHead index="02" eyebrow="KATEGORİLER" id="kategoriler" title="Ürününü seç." link={{ href: "/urunler", label: "Tüm ürünler" }} />
            <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
              {visibleCategories.map((category, index) => (
                <Reveal as="li" key={category.id} stagger={index} className={index === 0 ? "col-span-2 md:col-span-1" : ""}>
                  <Link
                    href={`/urunler?kategori=${category.slug}`}
                    className="fx-spot group flex h-full flex-col justify-between overflow-hidden rounded-card border border-border bg-card p-5 transition-colors hover:border-foreground/40"
                  >
                    <span className="font-display text-2xl leading-tight">{category.name}</span>
                    <span className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
                      {category._count.products} ürün
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Çok satanlar */}
      <section className="mx-auto max-w-site px-4 py-16 sm:px-6 md:py-28" aria-labelledby="cok-satanlar">
        <SectionHead index="03" eyebrow="ÇOK SATANLAR" id="cok-satanlar" title="Atölyenin favorileri." link={{ href: "/urunler", label: "Hepsini gör" }} />
        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.id} stagger={index % 3} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <ProductCard
                href={`/urun/${product.slug}`}
                name={product.name}
                price={product.basePrice}
                category={product.category.name}
                color={product.colors[0]?.hex ?? "#161616"}
                colors={product.colors.map((color) => color.hex)}
                silhouette={product.silhouette}
                badge={index === 0 ? "Çok satan" : undefined}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <HowItWorks />

      {/* Sayılar */}
      {settings.effects.stats.length ? (
        <section className="border-b border-border" aria-label="Rakamlarla">
          <dl className="mx-auto grid max-w-site grid-cols-2 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-4 md:py-20">
            {settings.effects.stats.map((stat, index) => (
              <Reveal key={stat.label} stagger={index} className="border-l border-border pl-5">
                <dd className="font-display text-5xl font-bold tracking-tight md:text-6xl">
                  <CountUp value={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
                </dd>
                <dt className="mt-2 text-sm text-muted-foreground">{stat.label}</dt>
              </Reveal>
            ))}
          </dl>
        </section>
      ) : null}

      {/* DTF + Kurumsal */}
      <section className="mx-auto grid max-w-site gap-4 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-28">
        <Reveal className="fx-spot relative overflow-hidden rounded-card bg-foreground p-8 text-background md:p-12">
          <p className="font-display text-sm font-semibold tracking-widest text-primary">05 — DTF BASKI</p>
          <h2 className="text-h1 mt-3 max-w-sm">Tabakanı diz, biz basalım.</h2>
          <p className="mt-4 max-w-sm text-background/70">
            AUTOFIT tasarımlarını tabakaya en az fireyle yerleştirir. Doluluk yüzdesini ve fiyatı anında görürsün.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-2 text-sm">
            {dtfSheets.map((sheet) => (
              <li key={sheet.id} className="flex justify-between rounded-control border border-background/15 px-3 py-2">
                <span>
                  {sheet.widthCm}×{sheet.heightCm} cm
                </span>
                <span className="font-semibold">{formatTry(sheet.price)}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="primary" className="mt-8">
            <Link href="/dtf-baski">
              DTF tabaka oluştur <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>
        <Reveal stagger={1} className="fx-spot relative overflow-hidden rounded-card border border-border bg-card p-8 md:p-12">
          <p className="font-display text-sm font-semibold tracking-widest text-primary">06 — KURUMSAL</p>
          <h2 className="text-h1 mt-3 max-w-sm">Ekibin, etkinliğin, markan.</h2>
          <p className="mt-4 max-w-sm text-muted-foreground">Adet arttıkça birim fiyat düşer. İndirim sepette otomatik uygulanır.</p>
          <table className="mt-8 w-full text-sm">
            <caption className="sr-only">Toplu sipariş indirim basamakları</caption>
            <thead>
              <tr className="text-left text-muted-foreground">
                <th scope="col" className="pb-2 font-medium">
                  Adet
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  İndirim
                </th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.range} className="border-t border-border">
                  <td className="py-2.5">{tier.range}</td>
                  <td className="py-2.5 text-right font-semibold">{tier.off}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/kurumsal">Teklif al</Link>
          </Button>
        </Reveal>
      </section>

      {/* Yorumlar (yalnızca gerçek yorum varsa) */}
      {reviews.length ? (
        <section className="border-y border-border bg-muted/40" aria-labelledby="yorumlar">
          <div className="mx-auto max-w-site px-4 py-16 sm:px-6 md:py-24">
            <SectionHead index="07" eyebrow="YORUMLAR" id="yorumlar" title="Giyenler anlatıyor." />
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {reviews.map((review, index) => (
                <Reveal as="li" key={review.id} stagger={index} className="rounded-card border border-border bg-card p-6">
                  <p className="flex gap-0.5 text-primary" aria-label={`5 üzerinden ${review.rating} puan`}>
                    {Array.from({ length: review.rating }, (_, i) => (
                      <Star key={i} size={16} fill="currentColor" aria-hidden="true" />
                    ))}
                  </p>
                  <blockquote className="mt-4 leading-relaxed">“{review.body}”</blockquote>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {review.user.name ?? "Müşteri"} · {review.product.name}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* SSS */}
      <section className="mx-auto grid max-w-site gap-10 px-4 py-16 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:py-28" aria-labelledby="sss">
        <SectionHead index="08" eyebrow="SSS" id="sss" title="Merak edilenler." />
        <div className="divide-y divide-border border-y border-border">
          {faqs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl md:text-2xl [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* SEO içerik bloğu */}
      <section className="border-t border-border" aria-labelledby="seo-baslik">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 id="seo-baslik" className="text-h2">
            Kişiye özel tişört ve DTF baskı
          </h2>
          <details className="group mt-4 text-muted-foreground">
            <summary className="cursor-pointer list-none leading-relaxed [&::-webkit-details-marker]:hidden">
              {settings.brand.name}, kendi tasarımını tişört, oversize tişört, sweatshirt ve hoodie üzerine bastırmanı sağlayan bir
              baskı atölyesidir. Tasarımını yükler, ürününü ve rengini seçer, fiyatı anında görürsün.{" "}
              <span className="font-medium text-foreground underline group-open:hidden">Devamını oku</span>
            </summary>
            <div className="mt-4 space-y-4 leading-relaxed">
              <p>
                Baskılarımızda DTF (direct-to-film) tekniğini kullanıyoruz. DTF, canlı renkleri ve ince detayları kumaşa yüksek
                yıkama dayanımıyla aktarır; pamuk ve pamuk karışımlı kumaşlarda esnek bir sonuç verir.
              </p>
              <p>
                Siparişler ödeme onayından sonra çoğu üründe 3 iş gününde üretilir ve Aras, Yurtiçi, MNG veya Sürat Kargo ile
                Türkiye geneline gönderilir. 10 adet ve üzerindeki siparişlerde toplu indirim sepette otomatik uygulanır.
              </p>
              <p>
                Sadece baskı filmi istiyorsan DTF tabaka oluşturucu ile tasarımlarını {minSheet.widthCm}×{minSheet.heightCm} cm’den
                başlayan tabakalara dizebilir, kendi presinde uygulayabilirsin.
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative isolate overflow-hidden bg-foreground text-background">
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-[0.2em] -z-10 text-center font-display text-[22vw] leading-none font-bold tracking-tighter text-background/[0.04] select-none"
        >
          TASARLA
        </p>
        <div className="mx-auto flex max-w-site flex-col items-start gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-end md:justify-between md:py-32">
          <h2 className="text-display max-w-[14ch]">Fikrin hazırsa, tişörtün de hazır.</h2>
          <Button asChild variant="primary" size="lg">
            <Link href="/tasarla" data-magnetic="">
              Tasarlamaya başla <ArrowRight className="btn-arrow size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
    </>
  );
}

function brightness(hex: string) {
  const v = hex.replace("#", "");
  return parseInt(v.slice(0, 2), 16) * 0.299 + parseInt(v.slice(2, 4), 16) * 0.587 + parseInt(v.slice(4, 6), 16) * 0.114;
}

function SectionHead({
  index,
  eyebrow,
  title,
  id,
  link,
}: {
  index: string;
  eyebrow: string;
  title: string;
  id: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-display text-sm font-semibold tracking-widest text-primary">
          {index} — {eyebrow}
        </p>
        <h2 id={id} className="text-h1 mt-3 max-w-xl">
          {title}
        </h2>
      </div>
      {link ? (
        <Link href={link.href} className="link-underline group flex items-center gap-1 text-sm font-semibold">
          {link.label} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

function BentoLink({
  href,
  icon: Icon,
  title,
  body,
  cta,
  className = "",
  compact = false,
  children,
}: {
  href: string;
  icon: typeof PenTool;
  title: string;
  body: string;
  cta?: string;
  className?: string;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`fx-spot group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-card border border-border p-6 transition-colors hover:border-foreground/40 md:p-8 ${className || "bg-card"}`}
    >
      <Icon size={compact ? 22 : 26} className="text-primary" aria-hidden="true" />
      <h3 className={`mt-auto font-display ${compact ? "text-2xl" : "text-3xl md:text-4xl"} relative z-[2] max-w-[12ch]`}>{title}</h3>
      <p className="relative z-[2] mt-2 max-w-xs text-sm opacity-75">{body}</p>
      {cta ? (
        <span className="relative z-[2] mt-4 flex items-center gap-1 text-sm font-semibold">
          {cta} <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      ) : null}
      {children}
    </Link>
  );
}
