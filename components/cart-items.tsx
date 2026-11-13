"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Minus, PenTool, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { Silhouette } from "@prisma/client";
import { Garment } from "@/components/garment";
import { removeCartItem, updateCartItem } from "@/server/actions/cart";
import { formatTry } from "@/utils/money";

export type CartLine = {
  id: string;
  name: string;
  slug: string;
  color: string;
  hex: string;
  size: string;
  quantity: number;
  unitPrice: number;
  silhouette: Silhouette;
  note?: string;
  previewUrl?: string | null;
  designId?: string | null;
  isDtf?: boolean;
};

export function CartItems({ lines }: { lines: CartLine[] }) {
  const [pending, start] = useTransition();

  if (lines.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border px-6 py-16 text-center">
        <ShoppingBag size={40} className="mx-auto text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl">Sepetin boş</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">Bir ürün seç, stüdyoda tasarla ya da hazır tasarımlara göz at.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/tasarla" className="flex h-11 items-center gap-2 rounded-control bg-foreground px-5 text-sm font-semibold text-background">
            <PenTool size={16} /> Tasarlamaya başla
          </Link>
          <Link href="/urunler" className="flex h-11 items-center rounded-control border border-input px-5 text-sm font-semibold">
            Ürünlere bak
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className={`space-y-3 transition-opacity ${pending ? "opacity-60" : ""}`} aria-busy={pending}>
      {lines.map((line) => (
        <li key={line.id} className="grid grid-cols-[96px_1fr] gap-4 rounded-card border border-border bg-card p-3 sm:grid-cols-[128px_1fr_auto] sm:p-4">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-control bg-muted">
            {line.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={line.previewUrl} alt={`${line.name} tasarım önizlemesi`} className="size-full object-contain" />
            ) : (
              <Garment kind={line.silhouette} color={line.hex} print={false} className="w-3/4" />
            )}
          </div>
          <div className="min-w-0">
            {line.isDtf ? (
              <h2 className="font-display text-xl leading-tight">{line.name}</h2>
            ) : (
              <Link href={`/urun/${line.slug}`} className="font-display text-xl leading-tight hover:underline">
                {line.name}
              </Link>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {line.isDtf ? "DTF tabaka" : `${line.color} · ${line.size}`}
              {line.note ? ` · ${line.note}` : ""}
            </p>
            <p className="mt-1 text-sm tabular-nums">{formatTry(line.unitPrice)} / adet</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex h-10 items-center rounded-control border border-input">
                <button
                  type="button"
                  className="grid size-10 place-items-center disabled:opacity-30"
                  aria-label="Adedi azalt"
                  disabled={pending}
                  onClick={() => start(() => void updateCartItem(line.id, line.quantity - 1))}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  className="grid size-10 place-items-center disabled:opacity-30"
                  aria-label="Adedi artır"
                  disabled={pending}
                  onClick={() => start(() => void updateCartItem(line.id, line.quantity + 1))}
                >
                  <Plus size={14} />
                </button>
              </div>
              {line.designId && !line.isDtf ? (
                <Link href={`/tasarla/${line.slug}?tasarim=${line.designId}`} className="flex h-10 items-center gap-1.5 rounded-control px-3 text-sm hover:bg-muted">
                  <PenTool size={14} /> Tasarımı düzenle
                </Link>
              ) : null}
              <button
                type="button"
                className="flex h-10 items-center gap-1.5 rounded-control px-3 text-sm text-muted-foreground hover:bg-muted hover:text-destructive"
                disabled={pending}
                onClick={() => start(() => void removeCartItem(line.id))}
              >
                <Trash2 size={14} /> Çıkar
              </button>
            </div>
          </div>
          <p className="col-span-2 text-right font-semibold tabular-nums sm:col-span-1">{formatTry(line.unitPrice * line.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}
