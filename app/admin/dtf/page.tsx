import { prisma } from "@/lib/prisma";
import { formatTry } from "@/utils/money";

export default async function AdminDtf() {
  const orders = await prisma.dTFOrder.findMany({
    include: { user: true, sheets: { include: { designs: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="font-display text-5xl">DTF</h1>
      <ul className="mt-6 space-y-3 text-sm">
        {orders.map((order) => (
          <li key={order.id} className="border border-line p-4">
            <p>
              {order.user.email} · {order.status} · {formatTry(order.total)}
            </p>
            {order.sheets.map((sheet) => (
              <p key={sheet.id}>
                {sheet.widthCm}×{sheet.heightCm} cm · {sheet.quantity} adet · {sheet.designs.length} parça
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
