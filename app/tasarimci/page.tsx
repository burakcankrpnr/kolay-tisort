import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ListingStatus } from "@prisma/client";
import { auth } from "@/auth";
import { DesignerForm } from "@/components/designer-form";
import { PageHeader } from "@/components/page-header";
import { listingCategoryLabel } from "@/lib/listing";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { formatTry } from "@/utils/money";

export const metadata: Metadata = { title: "Tasarımcı paneli", robots: { index: false } };

const statusLabel: Record<ListingStatus, { text: string; tone: string }> = {
  PENDING: { text: "İncelemede", tone: "bg-warning/15 text-warning" },
  APPROVED: { text: "Yayında", tone: "bg-success/15 text-success" },
  REJECTED: { text: "Reddedildi", tone: "bg-destructive/15 text-destructive" },
};

export default async function DesignerPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/tasarimci");
  const [products, listings] = await Promise.all([
    prisma.product.findMany({ where: { deletedAt: null, slug: { not: "dtf-tabaka" } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.listing.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }),
  ]);
  const sales = listings.reduce((sum, listing) => sum + listing.salesCount * listing.price, 0);
  const commission = Math.round(sales * 0.3);
  const earnings = sales - commission;

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
      <PageHeader
        eyebrow="Tasarımcı paneli"
        title="Tasarımını yükle, her satıştan kazan."
        lede="Yeni ilanlar incelemeden sonra yayınlanır. Tasarım ücretinin %30’u platform komisyonudur."
        crumbs={[{ href: "/", label: "Ana sayfa" }, { label: "Tasarımcı" }]}
      />
      <dl className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "İlan", value: String(listings.length) },
          { label: "Toplam satış", value: formatTry(sales) },
          { label: "Komisyon (%30)", value: formatTry(commission) },
          { label: "Kazancın", value: formatTry(earnings) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-card border border-border bg-card p-4">
            <dd className="font-display text-2xl font-bold tabular-nums">{stat.value}</dd>
            <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="yeni-ilan">
          <h2 id="yeni-ilan" className="text-h2 mb-6">
            Yeni ilan
          </h2>
          <DesignerForm products={products} />
        </section>
        <section aria-labelledby="ilanlarim">
          <h2 id="ilanlarim" className="text-h2 mb-6">
            İlanlarım
          </h2>
          {listings.length === 0 ? (
            <p className="rounded-card border border-dashed border-border p-8 text-center text-muted-foreground">Henüz ilanın yok.</p>
          ) : (
            <ul className="space-y-3">
              {listings.map((listing) => (
                <li key={listing.id} className="flex items-center gap-4 rounded-card border border-border bg-card p-3">
                  <span className="checker grid size-16 shrink-0 place-items-center overflow-hidden rounded-control">
                    {listing.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.imageUrl} alt="" className="size-full object-contain" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    {listing.status === "APPROVED" ? (
                      <Link href={`/hazir-tasarimlar/${listing.id}`} className="block truncate font-semibold hover:underline">
                        {listing.title}
                      </Link>
                    ) : (
                      <span className="block truncate font-semibold">{listing.title}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {listingCategoryLabel(listing.category)} · {formatTry(listing.price)} · {listing.salesCount} satış
                    </span>
                  </span>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusLabel[listing.status].tone)}>{statusLabel[listing.status].text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
