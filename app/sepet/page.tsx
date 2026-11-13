import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Truck } from "lucide-react";
import { auth } from "@/auth";
import { CartItems } from "@/components/cart-items";
import { PageHeader } from "@/components/page-header";
import { bulkDiscount, printSideLabel, quantityTierPercent, unitPrice } from "@/lib/pricing";
import { shippingOptions } from "@/lib/shipping";
import { readCart } from "@/server/cart";
import { formatTry } from "@/utils/money";

export const metadata: Metadata = { title: "Sepet", robots: { index: false } };

export default async function CartPage() {
  const [session, cart] = await Promise.all([auth(), readCart()]);
  const lines =
    cart?.items.map((item) => ({
      id: item.id,
      name: item.dtfSheet ? `DTF tabaka ${item.dtfSheet.widthCm}×${item.dtfSheet.heightCm} cm` : item.product.name,
      slug: item.product.slug,
      color: item.variant.color.name,
      hex: item.variant.color.hex,
      size: item.variant.size.name,
      quantity: item.quantity,
      unitPrice: unitPrice(item.product.basePrice, item.variant.priceDelta, item.printFee),
      silhouette: item.product.silhouette,
      note: item.printSide === "NONE" ? "" : printSideLabel[item.printSide],
      previewUrl: item.design?.previewUrl ?? null,
      designId: item.designId,
      isDtf: Boolean(item.dtfSheetId),
    })) ?? [];
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const garments = lines.filter((line) => !line.isDtf);
  const garmentQty = garments.reduce((sum, line) => sum + line.quantity, 0);
  const bulk = bulkDiscount(garments.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0), garmentQty);
  const bulkPct = quantityTierPercent(garmentQty);
  const nextTier = [10, 20, 50].find((tier) => tier > garmentQty);
  const cheapestShipping = Math.min(...shippingOptions.map((option) => option.fee));
  const checkoutHref = session?.user ? "/odeme" : "/giris?callbackUrl=/odeme";

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
      <PageHeader title="Sepetin" lede={lines.length ? `${lines.reduce((s, l) => s + l.quantity, 0)} ürün` : undefined} crumbs={[{ href: "/", label: "Ana sayfa" }, { label: "Sepet" }]} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <CartItems lines={lines} />
        {lines.length > 0 ? (
          <aside className="h-fit rounded-card border border-border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl">Sipariş özeti</h2>
            {nextTier && garmentQty > 0 ? (
              <div className="mt-4 rounded-control bg-primary/10 p-3 text-sm">
                <p>
                  <strong>{nextTier - garmentQty} adet</strong> daha ekle, <strong>%{quantityTierPercent(nextTier)}</strong> toplu indirim kazan.
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background" aria-hidden="true">
                  <div className="h-full origin-left rounded-full bg-primary transition-transform duration-700" style={{ transform: `scaleX(${garmentQty / nextTier})` }} />
                </div>
              </div>
            ) : null}
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ara toplam</dt>
                <dd className="tabular-nums">{formatTry(subtotal)}</dd>
              </div>
              {bulk ? (
                <div className="flex justify-between text-success">
                  <dt>Toplu indirim (%{bulkPct})</dt>
                  <dd className="tabular-nums">−{formatTry(bulk)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Kargo</dt>
                <dd className="text-muted-foreground">{formatTry(cheapestShipping)}’den, ödemede seçilir</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="font-semibold">Toplam (kargo hariç)</dt>
                <dd className="font-display text-2xl font-bold tabular-nums">{formatTry(subtotal - bulk)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">Kupon kodunu ödeme adımında girebilirsin.</p>
            <Link
              href={checkoutHref}
              className="btn-fill mt-5 flex h-13 items-center justify-center gap-2 rounded-control bg-foreground text-[15px] font-semibold text-background hover:text-primary-foreground"
            >
              <Lock size={16} /> Güvenli ödemeye geç <ArrowRight size={16} className="btn-arrow" />
            </Link>
            {!session?.user ? <p className="mt-2 text-center text-xs text-muted-foreground">Ödeme için giriş yapman istenecek; sepetin korunur.</p> : null}
            <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-primary" aria-hidden="true" /> iyzico / PayTR ile 3D Secure ödeme
              </li>
              <li className="flex items-center gap-2">
                <Truck size={15} className="text-primary" aria-hidden="true" /> Aras, Yurtiçi, MNG, Sürat
              </li>
            </ul>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
