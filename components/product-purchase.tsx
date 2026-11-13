"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Silhouette } from "@prisma/client";
import { Minus, PenTool, Plus, ShieldCheck, ShoppingBag, Star, Truck, Upload } from "lucide-react";
import { Garment } from "@/components/garment";
import { GarmentFlip } from "@/components/garment-flip";
import { printFees, quantityTierPercent } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { addToCart } from "@/server/actions/cart";
import { formatTry } from "@/utils/money";

type Color = { id: string; name: string; hex: string };
type Size = { id: string; name: string };
type Variant = { id: string; colorId: string; sizeId: string; stock: number; priceDelta: number };

const tiers = [
  { min: 1, max: 9, pct: 0 },
  { min: 10, max: 19, pct: 5 },
  { min: 20, max: 49, pct: 10 },
  { min: 50, max: Infinity, pct: 15 },
];

/**
 * Ürün detayının etkileşimli kısmı: galeri (renk değişiminde circular reveal),
 * renk/beden/adet, canlı fiyat, toplu indirim tablosu, teslim tarihi ve mobil sabit CTA.
 */
export function ProductPurchase({
  slug,
  name,
  category,
  description,
  basePrice,
  productionDays,
  silhouette,
  colors,
  sizes,
  variants,
  rating,
  reviewCount,
  delivery,
  favorite,
  sizeChart,
}: {
  slug: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  productionDays: number;
  silhouette: Silhouette;
  colors: Color[];
  sizes: Size[];
  variants: Variant[];
  rating: number | null;
  reviewCount: number;
  delivery: { earliest: string; latest: string };
  favorite: ReactNode;
  sizeChart: ReactNode;
}) {
  const router = useRouter();
  const firstAvailable = sizes.find((size) => variants.some((v) => v.sizeId === size.id && v.colorId === colors[0]?.id && v.stock > 0));
  const [colorId, setColorId] = useState(colors[0]?.id ?? "");
  const [previousColor, setPreviousColor] = useState<string | null>(null);
  const [sizeId, setSizeId] = useState(firstAvailable?.id ?? sizes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<"front" | "back">("front");
  const [error, setError] = useState<string | null>(null);
  const [chartOpen, setChartOpen] = useState(false);
  const [pending, start] = useTransition();

  const variant = useMemo(() => variants.find((item) => item.colorId === colorId && item.sizeId === sizeId), [variants, colorId, sizeId]);
  const color = colors.find((item) => item.id === colorId);
  const unit = basePrice + (variant?.priceDelta ?? 0);
  const pct = quantityTierPercent(quantity);
  const total = Math.round(unit * quantity * (1 - pct / 100));
  const stock = variant?.stock ?? 0;

  function pickColor(id: string) {
    if (id === colorId) return;
    setPreviousColor(color?.hex ?? null);
    setColorId(id);
    const stillOk = variants.some((v) => v.colorId === id && v.sizeId === sizeId && v.stock > 0);
    if (!stillOk) {
      const alt = sizes.find((size) => variants.some((v) => v.colorId === id && v.sizeId === size.id && v.stock > 0));
      if (alt) setSizeId(alt.id);
    }
  }

  function submit() {
    if (!variant) {
      setError("Bu renk ve beden kombinasyonu yok.");
      return;
    }
    if (stock < quantity) {
      setError(stock ? `Bu bedende en fazla ${stock} adet var.` : "Bu beden şu an stokta yok.");
      return;
    }
    setError(null);
    start(async () => {
      const result = await addToCart({ variantId: variant.id, quantity });
      if (result.error) {
        setError(result.error);
        return;
      }
      void import("@/components/effects/confetti").then((m) => m.burst({ count: 60, y: 0.3 }));
      router.push("/sepet");
    });
  }

  return (
    <>
      <div className="grid gap-8 overflow-x-clip lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        {/* Galeri — Ön/Arka 3D dönüş; overflow-clip yatay scroll üretmesin */}
        <div className="min-w-0 overflow-x-clip lg:sticky lg:top-24 lg:self-start">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card border border-border bg-gradient-to-b from-muted/30 to-muted">
            <GarmentFlip side={view} className="relative w-[68%] max-w-full">
              {(face) => (
                <div className="relative w-full">
                  {previousColor && face === "front" ? (
                    <Garment kind={silhouette} color={previousColor} side={face} print className="absolute inset-0 w-full drop-shadow-2xl" />
                  ) : null}
                  <Garment
                    key={`${colorId}-${face}`}
                    kind={silhouette}
                    color={color?.hex ?? "#161616"}
                    side={face}
                    print
                    className={cn("relative w-full drop-shadow-2xl", previousColor && face === "front" && "color-reveal")}
                  />
                </div>
              )}
            </GarmentFlip>
            <div className="absolute top-4 left-4 flex rounded-full border border-border bg-card/90 p-1 text-xs font-medium backdrop-blur" role="tablist" aria-label="Görünüm">
              {(["front", "back"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={view === value}
                  onClick={() => {
                    setPreviousColor(null);
                    setView(value);
                  }}
                  className={cn("h-8 rounded-full px-3", view === value ? "bg-foreground text-background" : "text-muted-foreground")}
                >
                  {value === "front" ? "Ön" : "Arka"}
                </button>
              ))}
            </div>
            <span className="absolute right-4 bottom-4 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium backdrop-blur">
              Baskı alanı 35 × 40 cm
            </span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {colors.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickColor(item.id)}
                aria-label={`${item.name} önizleme`}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-control border bg-muted/50 transition-colors",
                  item.id === colorId ? "border-foreground" : "border-border hover:border-foreground/40",
                )}
              >
                <Garment kind={silhouette} color={item.hex} print={false} className="w-3/5" />
              </button>
            ))}
          </div>
        </div>

        {/* Satın alma paneli */}
        <div>
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{category}</p>
          <h1 className="text-h1 mt-2">{name}</h1>
          {reviewCount ? (
            <a href="#yorumlar" className="mt-3 inline-flex items-center gap-1.5 text-sm">
              <span className="flex text-primary" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={15} className={i <= Math.round(rating ?? 0) ? "fill-current" : "opacity-30"} />
                ))}
              </span>
              <span className="font-semibold">{rating?.toFixed(1)}</span>
              <span className="text-muted-foreground underline">({reviewCount} yorum)</span>
            </a>
          ) : null}
          <p className="mt-5 flex items-baseline gap-3">
            <span key={unit} className="price-tick font-display text-4xl font-bold tabular-nums">
              {formatTry(unit)}
            </span>
            <span className="text-sm text-muted-foreground">+ baskı {formatTry(printFees.FRONT)}’den</span>
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">{description}</p>

          <fieldset className="mt-7">
            <legend className="text-sm font-semibold">
              Renk: <span className="font-normal text-muted-foreground">{color?.name}</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2.5" role="radiogroup">
              {colors.map((item) => {
                const any = variants.some((v) => v.colorId === item.id && v.stock > 0);
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={item.id === colorId}
                    aria-label={`${item.name}${any ? "" : " (tükendi)"}`}
                    title={item.name}
                    onClick={() => pickColor(item.id)}
                    className={cn(
                      "relative size-10 rounded-full border border-foreground/15 transition-shadow",
                      item.id === colorId && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                      !any && "opacity-40 after:absolute after:inset-0 after:m-auto after:h-px after:w-full after:rotate-45 after:bg-foreground",
                    )}
                    style={{ background: item.hex }}
                  />
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <div className="flex items-center justify-between">
              <legend className="text-sm font-semibold">Beden</legend>
              <button type="button" onClick={() => setChartOpen(true)} className="text-sm underline">
                Beden tablosu
              </button>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2" role="radiogroup">
              {sizes.map((item) => {
                const row = variants.find((v) => v.colorId === colorId && v.sizeId === item.id);
                const empty = !row || row.stock < 1;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    disabled={empty}
                    aria-checked={item.id === sizeId}
                    onClick={() => setSizeId(item.id)}
                    className={cn(
                      "h-12 rounded-control border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-35",
                      item.id === sizeId ? "border-foreground bg-foreground text-background" : "border-input bg-card hover:border-foreground/50",
                    )}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
            <p className={cn("mt-2 text-sm", stock > 0 && stock < 8 ? "text-warning" : "text-muted-foreground")}>
              {stock > 0 ? (stock < 8 ? `Son ${stock} adet` : "Stokta") : "Bu beden tükendi"}
            </p>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center rounded-control border border-input bg-card">
              <button type="button" aria-label="Azalt" className="grid size-12 place-items-center disabled:opacity-30" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Minus size={16} />
              </button>
              <input
                aria-label="Adet"
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Math.min(500, Number(event.target.value) || 1)))}
                className="w-12 bg-transparent text-center font-semibold tabular-nums outline-none"
              />
              <button type="button" aria-label="Artır" className="grid size-12 place-items-center" onClick={() => setQuantity((q) => Math.min(500, q + 1))}>
                <Plus size={16} />
              </button>
            </div>
            <p className="text-sm">
              Toplam <span key={total} className="price-tick font-semibold tabular-nums">{formatTry(total)}</span>
              {pct ? <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">%{pct} indirim</span> : null}
            </p>
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-[1fr_auto]">
            <Link
              href={`/tasarla/${slug}`}
              data-magnetic=""
              className="btn-fill flex h-13 items-center justify-center gap-2 rounded-control bg-foreground px-6 text-[15px] font-semibold text-background hover:text-primary-foreground"
            >
              <PenTool size={18} /> Bu ürünü tasarla
            </Link>
            {favorite}
            <button
              type="button"
              onClick={submit}
              disabled={pending || stock < 1}
              className="flex h-12 items-center justify-center gap-2 rounded-control border border-foreground/80 px-6 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background disabled:opacity-40 sm:col-span-2"
            >
              <ShoppingBag size={17} /> {pending ? "Ekleniyor…" : "Baskısız sepete ekle"}
            </button>
            <Link href={`/tasarla/${slug}`} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground underline sm:col-span-2">
              <Upload size={14} /> Dosyan hazır mı? Stüdyoda yükle
            </Link>
          </div>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="mt-7 rounded-card border border-border bg-card p-4">
            <p className="flex items-start gap-3 text-sm">
              <Truck size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                Bugün sipariş verirsen en erken <strong>{delivery.earliest}</strong>, en geç <strong>{delivery.latest}</strong> kapında.
                <span className="block text-xs text-muted-foreground">Üretim {productionDays} iş günü + seçtiğin kargo süresi.</span>
              </span>
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-card border border-border">
            <table className="w-full text-sm">
              <caption className="bg-muted/60 px-4 py-2.5 text-left font-semibold">Toplu alım indirimi</caption>
              <tbody>
                {tiers.map((tier) => {
                  const active = quantity >= tier.min && quantity <= tier.max;
                  return (
                    <tr key={tier.min} className={cn("border-t border-border transition-colors", active && "bg-primary/10 font-semibold")}>
                      <td className="px-4 py-2">{tier.max === Infinity ? `${tier.min}+ adet` : `${tier.min}–${tier.max} adet`}</td>
                      <td className="px-4 py-2 text-right">{tier.pct ? `%${tier.pct}` : "—"}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatTry(Math.round(unit * (1 - tier.pct / 100)))} / adet</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
            <li className="rounded-control bg-muted/60 px-2 py-3">
              <ShieldCheck size={18} className="mx-auto mb-1 text-primary" aria-hidden="true" />
              3D Secure ödeme
            </li>
            <li className="rounded-control bg-muted/60 px-2 py-3">
              <Star size={18} className="mx-auto mb-1 text-primary" aria-hidden="true" />
              300 DPI kontrol
            </li>
            <li className="rounded-control bg-muted/60 px-2 py-3">
              <Truck size={18} className="mx-auto mb-1 text-primary" aria-hidden="true" />
              4 kargo firması
            </li>
          </ul>
        </div>
      </div>

      {/* Mobil sabit çubuk */}
      <div className="fixed inset-x-0 bottom-14 z-30 flex items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">
            {color?.name} · {sizes.find((s) => s.id === sizeId)?.name}
          </p>
          <p className="font-semibold tabular-nums">{formatTry(unit)}</p>
        </div>
        <Link href={`/tasarla/${slug}`} className="ml-auto flex h-11 items-center gap-2 rounded-control bg-foreground px-5 text-sm font-semibold text-background">
          <PenTool size={16} /> Tasarla
        </Link>
      </div>

      {/* Beden tablosu */}
      {chartOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-end bg-foreground/30 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Beden tablosu" onClick={() => setChartOpen(false)}>
          <div className="toast-in w-full max-w-lg rounded-t-[20px] bg-card p-6 shadow-2xl sm:rounded-card" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Beden tablosu</h2>
              <button type="button" onClick={() => setChartOpen(false)} className="h-9 rounded-control px-3 text-sm underline">
                Kapat
              </button>
            </div>
            {sizeChart}
          </div>
        </div>
      ) : null}
    </>
  );
}
