import type { Metadata } from "next";
import type { Role } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { orderStatusLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/server/actions/auth";
import { formatDate, formatTry } from "@/utils/money";

export const metadata: Metadata = { title: "Hesabım" };

const roleLabel: Record<Role, string> = {
  CUSTOMER: "Müşteri",
  DESIGNER: "Tasarımcı",
  BUSINESS: "Kurumsal",
  ADMIN: "Yönetici",
  SUPER_ADMIN: "Süper yönetici",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/hesap");

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/giris");

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl md:text-7xl">Hesabım</h1>
          <p className="mt-3 text-sm">
            {user.firstName} {user.lastName} · {user.email}
          </p>
          <p className="text-sm text-ink/70">
            {roleLabel[user.role]}
            {user.phone ? ` · ${user.phone}` : ""}
          </p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="h-11 border border-ink px-4 text-sm">
            Çıkış yap
          </button>
        </form>
      </div>
      <section className="mt-12">
        <h2 className="font-display text-4xl">Siparişlerim</h2>
        {orders.length === 0 ? (
          <p className="mt-4">
            Henüz siparişin yok. <Link href="/urunler" className="underline">Ürünlere bak</Link>.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {orders.map((order) => (
              <li key={order.id} className="grid gap-2 py-4 sm:grid-cols-[140px_1fr_auto]">
                <div>
                  <p className="text-sm">{order.number}</p>
                  <p className="text-sm text-ink/60">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-sm">
                  <p>{orderStatusLabel[order.status]}</p>
                  <p className="text-ink/70">
                    {order.items.map((item) => `${item.productName} (${item.sizeName})`).join(", ")}
                  </p>
                </div>
                <p className="text-sm">{formatTry(order.total)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
