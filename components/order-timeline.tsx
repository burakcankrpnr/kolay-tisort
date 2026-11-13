import type { OrderStatus } from "@prisma/client";
import { Check, CreditCard, Factory, PackageCheck, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const flow: { status: OrderStatus; label: string; icon: typeof Check }[] = [
  { status: "PAID", label: "Ödeme alındı", icon: CreditCard },
  { status: "IN_PRODUCTION", label: "Üretimde", icon: Factory },
  { status: "SHIPPED", label: "Kargoda", icon: Truck },
  { status: "DELIVERED", label: "Teslim edildi", icon: PackageCheck },
];

const rank: Record<OrderStatus, number> = {
  PENDING_PAYMENT: -1,
  PAID: 0,
  IN_PRODUCTION: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -2,
  REFUNDED: -2,
};

/** Sipariş durum çizgisi: tamamlanan adımlar dolar, kargo ikonu ilerler. */
export function OrderTimeline({ status, compact = false }: { status: OrderStatus; compact?: boolean }) {
  if (rank[status] === -2) {
    return (
      <p className="flex items-center gap-2 rounded-control bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <XCircle size={16} aria-hidden="true" /> {status === "CANCELLED" ? "Sipariş iptal edildi" : "Sipariş iade edildi"}
      </p>
    );
  }
  const current = rank[status];
  const progress = Math.max(0, current) / (flow.length - 1);
  return (
    <div className={cn("relative", compact ? "pt-1" : "pt-2")} aria-label="Sipariş durumu">
      <div className="absolute top-[calc(1rem+2px)] right-[12.5%] left-[12.5%] h-0.5 bg-border" aria-hidden="true">
        <div className="h-full origin-left bg-primary transition-transform duration-1000 [transition-timing-function:var(--ease-out-expo)]" style={{ transform: `scaleX(${current < 0 ? 0 : progress})` }} />
      </div>
      <ol className="relative grid grid-cols-4">
        {flow.map((step, index) => {
          const done = current >= index;
          const active = current === index;
          const Icon = step.icon;
          return (
            <li key={step.status} className="flex flex-col items-center gap-2 text-center" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full border-2 bg-background transition-colors",
                  done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                  active && "ring-4 ring-primary/20",
                )}
              >
                {done && !active ? <Check size={15} /> : <Icon size={15} />}
              </span>
              {compact ? null : <span className={cn("text-xs", done ? "font-semibold text-foreground" : "text-muted-foreground")}>{step.label}</span>}
            </li>
          );
        })}
      </ol>
      {current === -1 && !compact ? <p className="mt-3 text-center text-sm text-warning">Ödeme bekleniyor; onaylanınca üretime alınır.</p> : null}
    </div>
  );
}
