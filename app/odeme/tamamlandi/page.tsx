import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, MapPin, Truck } from "lucide-react";
import { auth } from "@/auth";
import { Celebrate } from "@/components/effects/celebrate";
import { OrderTimeline } from "@/components/order-timeline";
import { orderStatusLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { getShipping } from "@/lib/shipping";
import { formatTry } from "@/utils/money";

export const metadata: Metadata = { title: "Sipariş", robots: { index: false } };

export default async function OrderDonePage({ searchParams }: { searchParams: Promise<{ siparis?: string; uyari?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  const { siparis, uyari } = await searchParams;
  if (!siparis) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-h1">Sipariş numarası bulunamadı</h1>
        <Link href="/hesap" className="mt-6 inline-block font-semibold underline">
          Siparişlerime git
        </Link>
      </div>
    );
  }

  const order = await prisma.order.findFirst({
    where: { number: siparis, userId: session.user.id },
    include: { items: true, payment: true },
  });
  if (!order) notFound();
  const shipping = getShipping(order.shippingProvider);
  const paid = order.status !== "PENDING_PAYMENT" && order.status !== "CANCELLED";

  return (
    <article className="mx-auto max-w-3xl px-4 pt-12 pb-24 sm:px-6 md:pt-20">
      {paid ? <Celebrate once={order.number} /> : null}
      <div className="text-center">
        {paid ? (
          <svg viewBox="0 0 64 64" className="mx-auto size-20 text-success" aria-hidden="true">
            <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="3" className="draw-circle" />
            <path d="M19 33 L28 42 L46 23" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="draw-check" />
          </svg>
        ) : (
          <AlertTriangle size={56} className="mx-auto text-warning" aria-hidden="true" />
        )}
        <p className="mt-6 text-sm font-medium text-muted-foreground">Sipariş no: {order.number}</p>
        <h1 className="text-h1 mt-2">{paid ? "Teşekkürler, siparişin atölyede!" : orderStatusLabel[order.status]}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {paid
            ? "Onay e-postası yolda. Üretim başladığında ve kargoya verildiğinde haber vereceğiz."
            : "Ödeme henüz alınmadı. Kart bilgisi istenmedi ve saklanmadı."}
        </p>
        {uyari ? <p className="mx-auto mt-4 max-w-md rounded-control bg-warning/10 px-4 py-3 text-sm text-warning">{uyari}</p> : null}
      </div>

      <section className="mt-12 rounded-card border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-5 font-display text-xl">Siparişin yolda</h2>
        <OrderTimeline status={order.status} />
      </section>

      <section className="mt-4 rounded-card border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl">Ürünler</h2>
        <ul className="mt-4 divide-y divide-border">
          {order.items.map((item) => {
            const snapshot = item.designSnapshot as { previewUrl?: string | null } | null;
            const preview = snapshot?.previewUrl ?? item.printFileUrl;
            return (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-control bg-muted">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="size-full object-contain" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block font-semibold">{item.productName}</span>
                  <span className="text-muted-foreground">
                    {item.colorName} / {item.sizeName} · {item.quantity} adet
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{formatTry(item.unitPrice * item.quantity)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Ara toplam</dt>
            <dd className="tabular-nums">{formatTry(order.subtotal)}</dd>
          </div>
          {order.discount ? (
            <div className="flex justify-between text-success">
              <dt>İndirim</dt>
              <dd className="tabular-nums">−{formatTry(order.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Kargo</dt>
            <dd className="tabular-nums">{formatTry(order.shippingFee)}</dd>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <dt className="font-semibold">Toplam</dt>
            <dd className="font-display text-2xl font-bold tabular-nums">{formatTry(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <MapPin size={16} className="text-primary" aria-hidden="true" /> Teslimat adresi
          </p>
          <p className="mt-2 text-muted-foreground">
            {order.recipientName}
            <br />
            {order.line1}
            <br />
            {order.district} / {order.city} {order.postalCode}
          </p>
        </div>
        <div className="rounded-card border border-border bg-card p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <Truck size={16} className="text-primary" aria-hidden="true" /> Kargo
          </p>
          <p className="mt-2 text-muted-foreground">
            {shipping?.name ?? order.shippingProvider}
            {shipping ? ` · ${shipping.eta}` : ""}
          </p>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/hesap" className="flex h-12 items-center gap-2 rounded-control bg-foreground px-6 text-sm font-semibold text-background">
          Siparişlerime git <ArrowRight size={16} />
        </Link>
        <Link href="/tasarla" className="flex h-12 items-center rounded-control border border-input px-6 text-sm font-semibold">
          Yeni tasarım yap
        </Link>
      </div>
    </article>
  );
}
