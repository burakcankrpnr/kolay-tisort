"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Garment } from "@/components/garment";
import type { Silhouette } from "@prisma/client";
import { removeCartItem, updateCartItem } from "@/server/actions/cart";
import { formatTry } from "@/utils/money";

export type CartLine = {
  id: string;
  name: string;
  color: string;
  hex: string;
  size: string;
  quantity: number;
  unitPrice: number;
  silhouette: Silhouette;
};

export function CartItems({ lines }: { lines: CartLine[] }) {
  const [pending, start] = useTransition();

  if (lines.length === 0) {
    return (
      <div className="border border-line px-5 py-10">
        <p>Sepetin boş.</p>
        <Link href="/urunler" className="mt-4 inline-block text-sm underline">
          Ürünlere bak
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line border border-line">
      {lines.map((line) => (
        <li key={line.id} className="grid grid-cols-[88px_1fr] gap-4 px-4 py-4 sm:grid-cols-[120px_1fr_auto]">
          <Garment kind={line.silhouette} color={line.hex} className="w-full" />
          <div>
            <h2 className="font-display text-3xl leading-none">{line.name}</h2>
            <p className="mt-2 text-sm">
              {line.color} / {line.size}
            </p>
            <p className="mt-1 text-sm">{formatTry(line.unitPrice)}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="size-9 border border-ink"
                aria-label="Adedi azalt"
                disabled={pending}
                onClick={() => start(() => updateCartItem(line.id, line.quantity - 1))}
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{line.quantity}</span>
              <button
                type="button"
                className="size-9 border border-ink"
                aria-label="Adedi artır"
                disabled={pending || line.quantity >= 10}
                onClick={() => start(() => updateCartItem(line.id, line.quantity + 1))}
              >
                +
              </button>
              <button
                type="button"
                className="ml-2 text-sm underline"
                disabled={pending}
                onClick={() => start(() => removeCartItem(line.id))}
              >
                Çıkar
              </button>
            </div>
          </div>
          <p className="hidden text-sm sm:block">{formatTry(line.unitPrice * line.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}
