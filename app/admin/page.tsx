import Link from "next/link";
import { AlertTriangle, ArrowRight, Bell, Building2, Clock, Factory, Palette, ShoppingCart } from "lucide-react";
import { orderStatusLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTry } from "@/utils/money";

const paidStatuses = ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] as const;

async function revenueSince(from: Date) {
  const result = await prisma.order.aggregate({
    where: { createdAt: { gte: from }, status: { in: [...paidStatuses] } },
    _sum: { total: true },
    _count: true,
  });
  return { total: result._sum.total ?? 0, count: result._count };
}

function startOfDay(offsetDays: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - offsetDays);
  return date;
}

export default async function AdminHome() {
  const today = startOfDay(0);
  const week = startOfDay(7);
  const month = startOfDay(30);
  const chartFrom = startOfDay(13);

  const [todayRow, weekly, monthly, notices, recentOrders, statusGroups, pendingListings, openRequests, lowStock, chartOrders] = await Promise.all([
    revenueSince(today),
    revenueSince(week),
    revenueSince(month),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { email: true } } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, number: true, total: true, status: true, createdAt: true, recipientName: true } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.businessRequest.count(),
    prisma.productVariant.findMany({
      where: { stock: { lte: 3 }, product: { deletedAt: null, slug: { not: "dtf-tabaka" } } },
      include: { product: { select: { name: true } }, color: true, size: true },
      take: 6,
      orderBy: { stock: "asc" },
    }),
    prisma.order.findMany({ where: { createdAt: { gte: chartFrom }, status: { in: [...paidStatuses] } }, select: { total: true, createdAt: true } }),
  ]);

  const count = (status: string) => statusGroups.find((row) => row.status === status)?._count ?? 0;
  const days = Array.from({ length: 14 }, (_, i) => startOfDay(13 - i));
  const series = days.map((day) => {
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    return {
      day,
      total: chartOrders.filter((order) => order.createdAt >= day && order.createdAt < next).reduce((sum, order) => sum + order.total, 0),
    };
  });
  const max = Math.max(1, ...series.map((point) => point.total));
  const dayLabel = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });

  const cards = [
    { label: "Bugün", row: todayRow },
    { label: "Son 7 gün", row: weekly },
    { label: "Son 30 gün", row: monthly },
  ];
  const queues = [
    { label: "Ödeme bekleyen", value: count("PENDING_PAYMENT"), href: "/admin/siparisler", icon: Clock },
    { label: "Üretime alınacak", value: count("PAID"), href: "/admin/siparisler", icon: ShoppingCart },
    { label: "Üretimde", value: count("IN_PRODUCTION"), href: "/admin/siparisler", icon: Factory },
    { label: "Onay bekleyen ilan", value: pendingListings, href: "/admin/ilanlar", icon: Palette },
    { label: "Kurumsal talep", value: openRequests, href: "/admin/kurumsal", icon: Building2 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1>Özet</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ödenmiş siparişler üzerinden ciro (ödeme bekleyen ve iptaller hariç).</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {cards.map(({ label, row }) => (
          <li key={label} className="rounded-card border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums">{formatTry(row.total)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{row.count} sipariş</p>
          </li>
        ))}
      </ul>

      <section className="rounded-card border border-border bg-card p-5" aria-labelledby="ciro-grafik">
        <h2 id="ciro-grafik" className="font-display text-xl">
          Son 14 gün ciro
        </h2>
        <div className="mt-6 flex h-40 items-end gap-1.5" role="img" aria-label="Günlük ciro grafiği">
          {series.map((point) => (
            <div key={point.day.toISOString()} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className="min-h-[2px] rounded-t-[4px] bg-foreground/80 transition-colors group-hover:bg-primary"
                style={{ height: `${(point.total / max) * 100}%` }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] whitespace-nowrap text-background group-hover:block">
                {formatTry(point.total)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{dayLabel.format(series[0]!.day)}</span>
          <span>{dayLabel.format(series[series.length - 1]!.day)}</span>
        </div>
      </section>

      <section aria-labelledby="kuyruk">
        <h2 id="kuyruk" className="font-display text-xl">
          İş kuyruğu
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          {queues.map(({ label, value, href, icon: Icon }) => (
            <li key={label}>
              <Link href={href} className="block rounded-card border border-border bg-card p-4 transition-colors hover:border-foreground/40">
                <Icon size={18} className="text-primary" aria-hidden="true" />
                <p className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-card border border-border bg-card p-5" aria-labelledby="son-siparis">
          <div className="flex items-center justify-between">
            <h2 id="son-siparis" className="font-display text-xl">
              Son siparişler
            </h2>
            <Link href="/admin/siparisler" className="flex items-center gap-1 text-sm font-semibold">
              Tümü <ArrowRight size={14} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Henüz sipariş yok.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/siparisler/${order.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary">
                    <span>
                      <span className="font-semibold">{order.number}</span>
                      <span className="block text-xs text-muted-foreground">
                        {order.recipientName} · {formatDate(order.createdAt)}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-semibold tabular-nums">{formatTry(order.total)}</span>
                      <span className="text-xs text-muted-foreground">{orderStatusLabel[order.status]}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-card border border-border bg-card p-5" aria-labelledby="dusuk-stok">
            <h2 id="dusuk-stok" className="flex items-center gap-2 font-display text-xl">
              <AlertTriangle size={18} className="text-warning" aria-hidden="true" /> Düşük stok
            </h2>
            {lowStock.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Stok seviyeleri yeterli.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {lowStock.map((variant) => (
                  <li key={variant.id} className="flex justify-between gap-3">
                    <span>
                      {variant.product.name} · {variant.color.name} / {variant.size.name}
                    </span>
                    <span className={variant.stock === 0 ? "font-semibold text-destructive" : "font-semibold text-warning"}>{variant.stock} adet</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-card border border-border bg-card p-5" aria-labelledby="bildirim">
            <h2 id="bildirim" className="flex items-center gap-2 font-display text-xl">
              <Bell size={18} className="text-primary" aria-hidden="true" /> Bildirimler
            </h2>
            {notices.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Yeni bildirim yok.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border text-sm">
                {notices.map((notice) => (
                  <li key={notice.id} className="py-2.5">
                    <p className="font-medium">{notice.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notice.body} · {notice.user.email}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
