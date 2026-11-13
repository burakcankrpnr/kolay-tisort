"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { Silhouette } from "@prisma/client";
import { ShoppingBag } from "lucide-react";
import { Garment } from "@/components/garment";
import { cn } from "@/lib/utils";
import { formatTry } from "@/utils/money";

type Variant = { id: string; colorId: string; colorName: string; hex: string; sizeId: string; sizeName: string; stock: number; priceDelta: number };

function Submit({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="btn-fill flex h-13 w-full items-center justify-center gap-2 rounded-control bg-foreground text-[15px] font-semibold text-background hover:text-primary-foreground disabled:opacity-40"
    >
      <ShoppingBag size={18} /> {pending ? "Sepete ekleniyor…" : label}
    </button>
  );
}

/** Hazır tasarım: ürün üzerinde canlı önizleme + renk/beden seçimi. */
export function ListingPurchase({
  action,
  imageUrl,
  title,
  silhouette,
  basePrice,
  designPrice,
  variants,
}: {
  action: (formData: FormData) => void | Promise<void>;
  imageUrl: string;
  title: string;
  silhouette: Silhouette;
  basePrice: number;
  designPrice: number;
  variants: Variant[];
}) {
  const colors = Array.from(new Map(variants.map((v) => [v.colorId, { id: v.colorId, name: v.colorName, hex: v.hex }])).values());
  const sizes = Array.from(new Map(variants.map((v) => [v.sizeId, { id: v.sizeId, name: v.sizeName }])).values());
  const [colorId, setColorId] = useState(colors[0]?.id ?? "");
  const [sizeId, setSizeId] = useState(sizes.find((s) => variants.some((v) => v.colorId === colors[0]?.id && v.sizeId === s.id && v.stock > 0))?.id ?? sizes[0]?.id ?? "");
  const variant = variants.find((v) => v.colorId === colorId && v.sizeId === sizeId);
  const color = colors.find((c) => c.id === colorId);
  const price = basePrice + (variant?.priceDelta ?? 0) + designPrice;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-card border border-border bg-gradient-to-b from-muted/30 to-muted">
          <div className="relative w-[72%]">
            <Garment key={colorId} kind={silhouette} color={color?.hex ?? "#161616"} print={false} className="color-reveal w-full drop-shadow-2xl" />
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={`${title} tasarımı ürün üzerinde`} className="absolute top-[30%] left-1/2 w-[38%] -translate-x-1/2 object-contain mix-blend-normal" />
            ) : null}
          </div>
        </div>
        {imageUrl ? (
          <div className="checker mt-3 overflow-hidden rounded-card border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={title} className="mx-auto max-h-80 object-contain" />
          </div>
        ) : null}
      </div>
      <form action={action} className="space-y-6">
        <input type="hidden" name="variantId" value={variant?.id ?? ""} />
        <p className="flex items-baseline gap-3">
          <span key={price} className="price-tick font-display text-4xl font-bold tabular-nums">
            {formatTry(price)}
          </span>
          <span className="text-sm text-muted-foreground">ürün + tasarım + baskı</span>
        </p>
        <fieldset>
          <legend className="text-sm font-semibold">
            Renk: <span className="font-normal text-muted-foreground">{color?.name}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2.5" role="radiogroup">
            {colors.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={item.id === colorId}
                aria-label={item.name}
                onClick={() => setColorId(item.id)}
                className={cn("size-10 rounded-full border border-foreground/15", item.id === colorId && "ring-2 ring-foreground ring-offset-2 ring-offset-background")}
                style={{ background: item.hex }}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-semibold">Beden</legend>
          <div className="mt-3 grid grid-cols-5 gap-2" role="radiogroup">
            {sizes.map((item) => {
              const row = variants.find((v) => v.colorId === colorId && v.sizeId === item.id);
              const empty = !row || row.stock < 1;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={item.id === sizeId}
                  disabled={empty}
                  onClick={() => setSizeId(item.id)}
                  className={cn(
                    "h-12 rounded-control border text-sm font-semibold disabled:line-through disabled:opacity-35",
                    item.id === sizeId ? "border-foreground bg-foreground text-background" : "border-input bg-card hover:border-foreground/50",
                  )}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </fieldset>
        <Submit disabled={!variant || variant.stock < 1} label="Sepete ekle" />
      </form>
    </div>
  );
}
