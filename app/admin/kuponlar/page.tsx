import { prisma } from "@/lib/prisma";
import { saveCoupon } from "@/server/actions/admin";

export default async function AdminCoupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
  return (
    <div>
      <h1 className="font-display text-5xl">Kuponlar</h1>
      <form action={saveCoupon} className="mt-6 flex max-w-lg gap-2">
        <input name="code" required placeholder="KOD" className="h-11 flex-1 border border-ink px-3" />
        <input name="percentOff" type="number" min={1} max={80} required placeholder="%" className="h-11 w-24 border border-ink px-3" />
        <button className="h-11 bg-ink px-4 text-paper">Kaydet</button>
      </form>
      <ul className="mt-6 text-sm">
        {coupons.map((coupon) => (
          <li key={coupon.id} className="border-b border-line py-2">
            {coupon.code} · %{coupon.percentOff ?? 0} · {coupon.active ? "açık" : "kapalı"}
          </li>
        ))}
      </ul>
    </div>
  );
}
