import Link from "next/link";
import { orderStatusLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTry } from "@/utils/money";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div>
      <h1 className="font-display text-5xl">Siparişler</h1>
      <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
        {orders.map((order) => (
          <li key={order.id} className="grid gap-2 py-3 sm:grid-cols-[140px_1fr_auto_auto]">
            <Link href={`/admin/siparisler/${order.id}`}>{order.number}</Link>
            <span>{order.user.email}</span>
            <span>{orderStatusLabel[order.status]}</span>
            <span>
              {formatTry(order.total)} · {formatDate(order.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
