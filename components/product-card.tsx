import Link from "next/link";
import type { Silhouette } from "@prisma/client";
import { Garment } from "@/components/garment";
import { formatTry } from "@/utils/money";

export function ProductCard({
  href,
  name,
  price,
  category,
  color,
  silhouette,
}: {
  href: string;
  name: string;
  price: number;
  category: string;
  color: string;
  silhouette: Silhouette;
}) {
  return (
    <Link href={href} className="group flex flex-col border border-line bg-paper">
      <div className="flex aspect-[4/5] items-center justify-center border-b border-line px-6">
        <Garment kind={silhouette} color={color} className="w-40 transition-transform duration-300 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4 py-4">
        <p className="text-sm text-ink/60">{category}</p>
        <h3 className="font-display text-2xl leading-none">{name}</h3>
        <p className="mt-auto pt-3 text-sm">{formatTry(price)}</p>
      </div>
    </Link>
  );
}
