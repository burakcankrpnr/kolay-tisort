"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/server/actions/marketplace";
import { cn } from "@/lib/utils";

/** Favori kalbi: iyimser güncelleme + tıklamada küçük "pop". */
export function FavoriteButton({ productId, saved, compact = false }: { productId: string; saved: boolean; compact?: boolean }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved);
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-control border border-input bg-card px-4 text-sm font-medium transition-colors hover:border-foreground/50",
        compact && "w-12 px-0",
      )}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleFavorite(productId);
        })
      }
    >
      <Heart
        size={18}
        className={cn("transition-transform", optimistic ? "bump fill-primary text-primary" : "")}
        key={String(optimistic)}
        aria-hidden="true"
      />
      {compact ? null : optimistic ? "Favorilerde" : "Favorilere ekle"}
    </button>
  );
}
