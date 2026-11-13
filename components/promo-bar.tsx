import Link from "next/link";
import type { Promo } from "@/lib/settings-schema";

/** Panelden yönetilen üst duyuru çubuğu. Tarih kontrolü çağıran tarafta yapılır. */
export function PromoBar({ promo }: { promo: Promo }) {
  const content = <span className="truncate">{promo.text}</span>;
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex h-9 max-w-site items-center justify-center px-4 text-center text-xs font-medium tracking-wide sm:text-sm">
        {promo.href ? (
          <Link href={promo.href} className="link-underline truncate">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
