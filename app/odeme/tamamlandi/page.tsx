import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { orderStatusLabel } from "@/lib/labels";
import { getShipping } from "@/lib/shipping";
import { prisma } from "@/lib/prisma";
import { formatTry } from "@/utils/money";

export const metadata: Metadata = { title: "Sipariş" };

export default async function OrderDonePage({
  searchParams,
}: {
  searchParams: Promise<{ siparis?: string; uyari?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  const { siparis, uyari } = await searchParams;
  if (!siparis) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-5xl">Sipariş numarası yok</h1>
        <Link href="/hesap" className="mt-6 inline-block underline">
          Hesaba dön
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

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm">{order.number}</p>
      <h1 className="mt-2 font-display text-5xl leading-none md:text-7xl">
        {order.status === "PAID" ? "Siparişin atölyeye alındı" : orderStatusLabel[order.status]}
      </h1>
      {uyari ? <p className="mt-4 max-w-xl text-sm">{uyari}</p> : null}
      {order.status === "PENDING_PAYMENT" ? (
        <p className="mt-4 max-w-xl text-sm leading-relaxed">
          Ödeme henüz alınmadı. Kart bilgisi istenmedi ve saklanmadı.
          {order.payment ? ` Sağlayıcı: ${order.payment.provider}.` : ""}
        </p>
      ) : null}
      <ul className="mt-8 divide-y divide-line border-y border-line text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-3">
            <span>
              {item.productName}
              <span className="block text-ink/60">
                {item.colorName} / {item.sizeName} · {item.quantity} adet
              </span>
            </span>
            <span>{formatTry(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">Kargo: {shipping?.name ?? order.shippingProvider}</p>
      <p className="mt-1 text-sm">
        {order.line1}, {order.district} / {order.city} {order.postalCode}
      </p>
      <p className="mt-4 font-display text-4xl">{formatTry(order.total)}</p>
      <Link href="/hesap" className="mt-8 inline-block text-sm underline">
        Siparişlerime git
      </Link>
    </article>
  );
}
