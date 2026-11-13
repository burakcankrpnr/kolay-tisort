import { listingCategoryLabel } from "@/lib/listing";
import { prisma } from "@/lib/prisma";
import { applyListingStatus } from "@/server/actions/marketplace";
import { formatTry } from "@/utils/money";

export default async function AdminListings() {
  const listings = await prisma.listing.findMany({ include: { user: true, product: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-5xl">İlanlar</h1>
      <ul className="mt-6 space-y-4 text-sm">
        {listings.map((listing) => (
          <li key={listing.id} className="border border-line p-4">
            <p className="font-display text-2xl">{listing.title}</p>
            <p>
              {listingCategoryLabel(listing.category)} · {listing.product.name} · {formatTry(listing.price)} · {listing.status} · {listing.user.email}
            </p>
            <div className="mt-3 flex gap-2">
              <form action={applyListingStatus.bind(null, listing.id, "APPROVED")}>
                <button className="h-10 bg-ink px-3 text-paper">Onayla</button>
              </form>
              <form action={applyListingStatus.bind(null, listing.id, "REJECTED")}>
                <button className="h-10 border border-ink px-3">Reddet</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
