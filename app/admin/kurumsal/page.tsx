import { prisma } from "@/lib/prisma";
import { formatTry } from "@/utils/money";

export default async function AdminCorporate() {
  const rows = await prisma.businessRequest.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-5xl">Kurumsal talepler</h1>
      <ul className="mt-6 space-y-3 text-sm">
        {rows.map((row) => (
          <li key={row.id} className="border border-line p-4">
            <p>
              {row.company} · {row.contactName} · {row.phone} · {row.email}
            </p>
            <p>
              {row.productName} · {row.quantity} adet · {row.printType} · {row.dueDate} · {formatTry(row.quoteAmount)}
            </p>
            <p>{row.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
