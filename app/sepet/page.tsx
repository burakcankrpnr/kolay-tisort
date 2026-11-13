import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { CartItems } from "@/components/cart-items";
import { unitPrice } from "@/lib/pricing";
import { readCart } from "@/server/cart";
import { formatTry } from "@/utils/money";

export const metadata: Metadata = { title: "Sepet" };

export default async function CartPage() {
  const [session, cart] = await Promise.all([auth(), readCart()]);
  const lines =
    cart?.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      color: item.variant.color.name,
      hex: item.variant.color.hex,
      size: item.variant.size.name,
      quantity: item.quantity,
      unitPrice: unitPrice(item.product.basePrice, item.variant.priceDelta),
      silhouette: item.product.silhouette,
    })) ?? [];
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const checkoutHref = session?.user ? "/odeme" : "/giris?callbackUrl=/odeme";

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <h1 className="font-display text-5xl md:text-7xl">Sepet</h1>
        <div className="mt-8">
          <CartItems lines={lines} />
        </div>
      </div>
      <aside className="h-fit border border-line p-4">
        <p className="flex justify-between text-sm">
          <span>Ara toplam</span>
          <span>{formatTry(subtotal)}</span>
        </p>
        <p className="mt-2 text-sm text-ink/70">Kargo ödemede seçilir.</p>
        {lines.length > 0 ? (
          <Link href={checkoutHref} className="mt-5 flex h-11 items-center justify-center bg-ink text-sm text-paper">
            Ödemeye geç
          </Link>
        ) : null}
      </aside>
    </div>
  );
}
