"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Silhouette } from "@prisma/client";
import { Garment } from "@/components/garment";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/server/actions/cart";
import { formatTry } from "@/utils/money";

type Color = { id: string; name: string; hex: string };
type Size = { id: string; name: string };
type Variant = { id: string; colorId: string; sizeId: string; stock: number; priceDelta: number };

export function ProductPurchase({
  name,
  basePrice,
  productionDays,
  silhouette,
  colors,
  sizes,
  variants,
}: {
  name: string;
  basePrice: number;
  productionDays: number;
  silhouette: Silhouette;
  colors: Color[];
  sizes: Size[];
  variants: Variant[];
}) {
  const router = useRouter();
  const [colorId, setColorId] = useState(colors[0]?.id ?? "");
  const [sizeId, setSizeId] = useState(sizes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const variant = useMemo(
    () => variants.find((item) => item.colorId === colorId && item.sizeId === sizeId),
    [variants, colorId, sizeId],
  );
  const color = colors.find((item) => item.id === colorId);
  const price = basePrice + (variant?.priceDelta ?? 0);
  const stock = variant?.stock ?? 0;

  function submit() {
    if (!variant) {
      setError("Bu renk ve beden kombinasyonu yok.");
      return;
    }
    if (stock < quantity) {
      setError("Bu beden şu an stokta yok.");
      return;
    }
    setError(null);
    start(async () => {
      const result = await addToCart({ variantId: variant.id, quantity });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/sepet");
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
      <div className="flex aspect-[4/5] items-center justify-center border border-line">
        <Garment kind={silhouette} color={color?.hex ?? "#161616"} className="w-64" />
      </div>
      <div>
        <p className="font-display text-5xl leading-none">{formatTry(price)}</p>
        <p className="mt-2 text-sm text-ink/70">
          Baskı kalemleri editörle birlikte eklenecek. Şu an ödediğin tutar ürün bedeli.
        </p>
        <fieldset className="mt-6">
          <legend className="text-sm">Renk</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === colorId}
                onClick={() => setColorId(item.id)}
                className={`flex items-center gap-2 border px-3 py-2 text-sm ${item.id === colorId ? "border-ink" : "border-line"}`}
              >
                <span className="size-4 border border-ink" style={{ background: item.hex }} />
                {item.name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="text-sm">Beden</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((item) => {
              const row = variants.find((variantRow) => variantRow.colorId === colorId && variantRow.sizeId === item.id);
              const empty = !row || row.stock < 1;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={empty}
                  aria-pressed={item.id === sizeId}
                  onClick={() => setSizeId(item.id)}
                  className={`h-11 min-w-11 border px-3 text-sm disabled:opacity-30 ${item.id === sizeId ? "border-ink bg-ink text-paper" : "border-line"}`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="mt-5 block text-sm" htmlFor="adet">
          Adet
        </label>
        <input
          id="adet"
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="mt-2 h-11 w-24 border border-ink bg-white px-3"
        />
        <p className="mt-4 text-sm">
          {stock > 0 ? (stock < 8 ? `Son ${stock} adet` : "Stokta") : "Tükendi"}
        </p>
        <p className="mt-1 text-sm text-ink/70">Tahmini üretim {productionDays} iş günü.</p>
        <p className="text-sm text-ink/70">Kargo, seçtiğin firmaya göre 1-5 iş günü.</p>
        {error ? (
          <p role="alert" className="mt-4 text-sm">
            {error}
          </p>
        ) : null}
        <Button className="mt-6" type="button" onClick={submit} disabled={pending || stock < 1}>
          {pending ? "Ekleniyor" : "Sepete ekle"}
        </Button>
        <p className="mt-3 text-sm text-ink/60">{name}</p>
      </div>
    </div>
  );
}
