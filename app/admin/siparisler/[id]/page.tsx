import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { OrderTimeline } from "@/components/order-timeline";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/labels";
import { sideLabel } from "@/features/design-editor/model";
import { describePrint } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { refundOrder, setOrderStatus } from "@/server/actions/admin";
import { formatTry } from "@/utils/money";

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, user: true, returns: true },
  });
  if (!order) notFound();

  return (
    <div>
      <h1>{order.number}</h1>
      <p className="mt-2 text-sm">
        {order.user.email} · {orderStatusLabel[order.status]}
        {order.payment ? ` · Ödeme ${paymentStatusLabel[order.payment.status]}` : ""}
      </p>
      <p className="mt-2 text-sm">
        {order.recipientName}, {order.line1}, {order.district}/{order.city} {order.postalCode}
      </p>
      <div className="mt-6 rounded-card border border-border bg-card p-5">
        <OrderTimeline status={order.status} />
      </div>
      <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
        {order.items.map((item) => {
          const snap = item.designSnapshot as {
            printWidthCm?: number;
            printHeightCm?: number;
            widthCm?: number;
            heightCm?: number;
            previewUrl?: string | null;
            neckJson?: unknown;
            printFiles?: { side: "front" | "back" | "neck"; url: string; dpi: number }[];
          } | null;
          const hasNeck =
            Array.isArray(snap?.neckJson) ? snap.neckJson.length > 0 : Boolean(snap?.printFiles?.some((f) => f.side === "neck"));
          const measure = snap?.printWidthCm
            ? `${snap.printWidthCm}×${snap.printHeightCm} cm`
            : snap?.widthCm
              ? `${snap.widthCm}×${snap.heightCm} cm`
              : "—";
          return (
            <li key={item.id} className="grid gap-2 py-3">
              <p>
                {item.productName} · {item.colorName} · {item.sizeName} · {item.quantity} adet · {formatTry(item.unitPrice)}
              </p>
              <p>
                {describePrint(item.printSide, hasNeck)} · Baskı {formatTry(item.printFee)} · Ölçü {measure}
              </p>
              {snap?.printFiles?.length ? (
                <div className="flex flex-wrap gap-2">
                  {snap.printFiles.map((file) => (
                    <a key={file.url} href={file.url} download className="inline-flex h-9 items-center gap-1.5 rounded-control border border-input px-3 text-xs font-semibold hover:border-foreground/50">
                      <Download size={14} /> {sideLabel[file.side] ?? file.side} baskı dosyası · {file.dpi} DPI
                    </a>
                  ))}
                </div>
              ) : item.printFileUrl ? (
                <a href={item.printFileUrl} download className="inline-flex h-9 w-fit items-center gap-1.5 rounded-control border border-input px-3 text-xs font-semibold">
                  <Download size={14} /> Dosyayı indir
                </a>
              ) : null}
              <div className="flex flex-wrap gap-3">
                {snap?.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={snap.previewUrl} alt="Ürün önizlemesi" className="h-40 rounded-control border border-border bg-muted object-contain" />
                ) : null}
                {snap?.printFiles?.map((file) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={file.url} src={file.url} alt={`${file.side === "front" ? "Ön" : "Arka"} baskı`} className="checker h-40 rounded-control border border-border object-contain" />
                ))}
                {!snap?.previewUrl && !snap?.printFiles?.length && item.printFileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.printFileUrl} alt="Baskı" className="checker h-40 rounded-control border border-border object-contain" />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <form action={setOrderStatus}>
          <input type="hidden" name="id" value={order.id} />
          <input type="hidden" name="status" value="IN_PRODUCTION" />
          <button className="h-11 bg-ink px-4 text-sm text-paper">Üretime al</button>
        </form>
        <form action={setOrderStatus}>
          <input type="hidden" name="id" value={order.id} />
          <input type="hidden" name="status" value="SHIPPED" />
          <button className="h-11 border border-ink px-4 text-sm">Kargoya ver</button>
        </form>
        <form action={setOrderStatus}>
          <input type="hidden" name="id" value={order.id} />
          <input type="hidden" name="status" value="DELIVERED" />
          <button className="h-11 border border-ink px-4 text-sm">Teslim edildi</button>
        </form>
      </div>
      <form action={refundOrder} className="mt-6 grid max-w-md gap-2">
        <input type="hidden" name="id" value={order.id} />
        <input name="reason" required minLength={3} placeholder="İade nedeni" className="h-11 border border-ink px-3" />
        <button className="h-11 border border-ink text-sm">İade kaydı oluştur</button>
      </form>
      {order.returns.length > 0 ? (
        <ul className="mt-4 text-sm">
          {order.returns.map((row) => (
            <li key={row.id}>
              {row.status}: {row.reason}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
