import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Silhouette } from "@prisma/client";
import { Garment } from "@/components/garment";
import { formatTry } from "@/utils/money";

/**
 * Ürün kartı: hover'da kart yükselir, gradient kenar parlar, ikinci renk çapraz geçişle
 * gelir; masaüstünde 3D tilt + spotlight (EffectsProvider olay delegasyonu ile, ek JS yok).
 */
export function ProductCard({
  href,
  name,
  price,
  category,
  color,
  colors,
  silhouette,
  badge,
}: {
  href: string;
  name: string;
  price: number;
  category: string;
  color: string;
  colors?: string[];
  silhouette: Silhouette;
  badge?: string;
}) {
  const alt = colors?.find((hex) => hex.toLowerCase() !== color.toLowerCase());
  return (
    <Link
      href={href}
      data-tilt=""
      data-cursor="Gör"
      className="fx-card group flex flex-col overflow-hidden rounded-card border border-border bg-card"
    >
      <div className="relative flex aspect-[4/5] items-center justify-center bg-gradient-to-b from-muted/40 to-muted px-6">
        {badge ? (
          <span className="absolute top-3 left-3 z-[3] rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background">
            {badge}
          </span>
        ) : null}
        <Garment
          kind={silhouette}
          color={color}
          className="w-[62%] transition-[transform,opacity] duration-500 group-hover:scale-[1.04] group-hover:opacity-0"
        />
        <Garment
          kind={silhouette}
          color={alt ?? color}
          className="absolute w-[62%] scale-[0.98] opacity-0 transition-[transform,opacity] duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
        />
        <span className="absolute right-3 bottom-3 z-[3] flex translate-y-3 items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          Hızlı bak <ArrowUpRight size={14} aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4 py-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{category}</p>
        <h3 className="font-display text-xl leading-tight">{name}</h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="text-sm">
            <span className="text-muted-foreground">başlayan </span>
            <span className="font-semibold">{formatTry(price)}</span>
          </p>
          {colors && colors.length > 1 ? (
            <span className="flex -space-x-1" aria-label={`${colors.length} renk`}>
              {colors.slice(0, 4).map((hex) => (
                <span key={hex} className="size-3.5 rounded-full border border-background" style={{ background: hex }} />
              ))}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
