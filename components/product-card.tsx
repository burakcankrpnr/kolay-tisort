import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Silhouette } from "@prisma/client";
import { Garment } from "@/components/garment";
import { formatTry } from "@/utils/money";

/**
 * Ürün kartı: mobilde sıkı 2 sütun; masaüstünde hover yükselme, renk geçişi ve tilt.
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
      className="fx-card group flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card"
    >
      <div className="relative flex aspect-[4/5] items-center justify-center bg-gradient-to-b from-muted/40 to-muted px-3 sm:px-6">
        {badge ? (
          <span className="absolute top-2 left-2 z-[3] rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
            {badge}
          </span>
        ) : null}
        <Garment
          kind={silhouette}
          color={color}
          className="w-[70%] transition-[transform,opacity] duration-500 sm:w-[62%] group-hover:scale-[1.04] group-hover:opacity-0"
        />
        <Garment
          kind={silhouette}
          color={alt ?? color}
          className="absolute w-[70%] scale-[0.98] opacity-0 transition-[transform,opacity] duration-500 sm:w-[62%] group-hover:scale-[1.04] group-hover:opacity-100"
        />
        <span className="absolute right-2 bottom-2 z-[3] flex items-center gap-0.5 rounded-full bg-background/90 px-2 py-1 text-[10px] font-semibold shadow-sm backdrop-blur sm:right-3 sm:bottom-3 sm:translate-y-3 sm:gap-1 sm:px-3 sm:py-1.5 sm:text-xs sm:opacity-0 sm:transition-all sm:duration-300 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100">
          İncele <ArrowUpRight size={12} aria-hidden="true" />
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-2.5 py-3 sm:gap-1 sm:px-4 sm:py-4">
        <p className="truncate text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:text-xs">{category}</p>
        <h3 className="line-clamp-2 font-display text-[0.95rem] leading-snug sm:text-xl sm:leading-tight">{name}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 sm:pt-3">
          <p className="min-w-0 truncate text-xs sm:text-sm">
            <span className="font-semibold tabular-nums">{formatTry(price)}</span>
            <span className="text-muted-foreground">’den</span>
          </p>
          {colors && colors.length > 1 ? (
            <span className="flex shrink-0 -space-x-1" aria-label={`${colors.length} renk`}>
              {colors.slice(0, 4).map((hex) => (
                <span key={hex} className="size-3 rounded-full border border-background sm:size-3.5" style={{ background: hex }} />
              ))}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
