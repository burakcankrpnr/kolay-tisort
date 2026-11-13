import type { Metadata } from "next";
import type { Role } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, LogOut, MapPin, Package, PenTool, Sparkles, User } from "lucide-react";
import { auth } from "@/auth";
import { Garment } from "@/components/garment";
import { OrderTimeline } from "@/components/order-timeline";
import { orderStatusLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/server/actions/auth";
import { formatDate, formatTry } from "@/utils/money";

export const metadata: Metadata = { title: "Hesabım", robots: { index: false } };

const roleLabel: Record<Role, string> = {
  CUSTOMER: "Müşteri",
  DESIGNER: "Tasarımcı",
  BUSINESS: "Kurumsal",
  ADMIN: "Yönetici",
  SUPER_ADMIN: "Süper yönetici",
};

const sections = [
  { id: "siparisler", label: "Siparişlerim", icon: Package },
  { id: "tasarimlar", label: "Tasarımlarım", icon: PenTool },
  { id: "favoriler", label: "Favoriler", icon: Heart },
  { id: "adresler", label: "Adresler", icon: MapPin },
  { id: "profil", label: "Profil", icon: User },
];

const statusTone: Record<string, string> = {
  PENDING_PAYMENT: "bg-warning/15 text-warning",
  PAID: "bg-primary/15 text-primary",
  IN_PRODUCTION: "bg-primary/15 text-primary",
  SHIPPED: "bg-primary/15 text-primary",
  DELIVERED: "bg-success/15 text-success",
  CANCELLED: "bg-destructive/15 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/hesap");

  const [user, orders, designs, favorites, addresses] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.order.findMany({ where: { userId: session.user.id }, include: { items: true, payment: true }, orderBy: { createdAt: "desc" } }),
    prisma.design.findMany({
      where: { userId: session.user.id, deletedAt: null },
      include: { product: { select: { slug: true, name: true, silhouette: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.favorite.findMany({ where: { userId: session.user.id }, include: { product: { include: { colors: true } } } }),
    prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!user) redirect("/giris");

  const lastDesign = designs[0];
  const activeOrders = orders.filter((order) => ["PAID", "IN_PRODUCTION", "SHIPPED"].includes(order.status)).length;
  const firstName = user.firstName || user.name?.split(" ")[0] || "";

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-8 pb-20 sm:px-6 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold tracking-widest text-primary uppercase">{roleLabel[user.role]}</p>
          <h1 className="text-h1 mt-2">Tekrar hoş geldin{firstName ? `, ${firstName}` : ""}.</h1>
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="flex h-11 items-center gap-2 rounded-control border border-input px-4 text-sm font-medium hover:border-foreground/50">
            <LogOut size={16} /> Çıkış yap
          </button>
        </form>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Toplam sipariş", value: orders.length },
          { label: "Devam eden", value: activeOrders },
          { label: "Kayıtlı tasarım", value: designs.length },
          { label: "Favori", value: favorites.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-card border border-border bg-card p-4">
            <dd className="font-display text-3xl font-bold tabular-nums">{stat.value}</dd>
            <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>

      {lastDesign?.product ? (
        <Link
          href={`/tasarla/${lastDesign.product.slug}?tasarim=${lastDesign.id}`}
          className="fx-spot group mt-4 flex items-center gap-4 overflow-hidden rounded-card bg-foreground p-5 text-background"
        >
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-control bg-background/10">
            {lastDesign.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lastDesign.previewUrl} alt="" className="size-full object-contain" />
            ) : (
              <Sparkles size={22} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-background/70">Kaldığın yerden devam et</span>
            <span className="block truncate font-display text-xl">{lastDesign.name}</span>
          </span>
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform group-hover:translate-x-1">Stüdyoda aç</span>
        </Link>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Hesap bölümleri" className="flex gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:self-start">
          {sections.map(({ id, label, icon: Icon }) => (
            <a key={id} href={`#${id}`} className="flex shrink-0 items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium hover:bg-muted">
              <Icon size={17} className="text-muted-foreground" /> {label}
            </a>
          ))}
        </nav>

        <div className="space-y-14">
          <section id="siparisler" className="scroll-mt-24">
            <h2 className="text-h2">Siparişlerim</h2>
            {orders.length === 0 ? (
              <Empty icon={Package} text="Henüz siparişin yok." href="/urunler" cta="Ürünlere bak" />
            ) : (
              <ul className="mt-6 space-y-3">
                {orders.map((order) => (
                  <li key={order.id} className="rounded-card border border-border bg-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{order.number}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusTone[order.status])}>{orderStatusLabel[order.status]}</span>
                      <p className="font-display text-xl font-bold tabular-nums">{formatTry(order.total)}</p>
                    </div>
                    <div className="mt-5">
                      <OrderTimeline status={order.status} compact />
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {order.items.map((item) => {
                        const snap = item.designSnapshot as { previewUrl?: string | null } | null;
                        const preview = snap?.previewUrl ?? item.printFileUrl;
                        return (
                          <li key={item.id} className="flex items-center gap-2 rounded-control bg-muted/60 py-1.5 pr-3 pl-1.5 text-xs">
                            <span className="grid size-9 place-items-center overflow-hidden rounded-[8px] bg-card">
                              {preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={preview} alt="" className="size-full object-contain" />
                              ) : (
                                <Package size={14} />
                              )}
                            </span>
                            {item.productName} · {item.sizeName} × {item.quantity}
                          </li>
                        );
                      })}
                    </ul>
                    <Link href={`/odeme/tamamlandi?siparis=${order.number}`} className="mt-4 inline-block text-sm font-semibold underline">
                      Sipariş ayrıntıları
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="tasarimlar" className="scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-h2">Tasarımlarım</h2>
              <Link href="/tasarla" className="flex items-center gap-1.5 text-sm font-semibold underline">
                <PenTool size={14} /> Yeni tasarım
              </Link>
            </div>
            {designs.length === 0 ? (
              <Empty icon={PenTool} text="Kayıtlı tasarımın yok. Stüdyoda “Kaydet” ile buraya eklenir." href="/tasarla" cta="Tasarlamaya başla" />
            ) : (
              <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
                {designs.map((design) => (
                  <li key={design.id} className="group overflow-hidden rounded-card border border-border bg-card">
                    <div className="grid aspect-square place-items-center bg-muted">
                      {design.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={design.previewUrl} alt={design.name} className="size-full object-contain transition-transform duration-500 group-hover:scale-105" />
                      ) : design.product ? (
                        <Garment kind={design.product.silhouette} color="#161616" className="w-1/2" />
                      ) : null}
                    </div>
                    <div className="p-4">
                      <p className="truncate font-semibold">{design.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {design.product?.name ?? "Ürün"} · {formatDate(design.updatedAt)}
                      </p>
                      {design.product ? (
                        <Link href={`/tasarla/${design.product.slug}?tasarim=${design.id}`} className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-control bg-foreground text-xs font-semibold text-background">
                          <PenTool size={13} /> Stüdyoda düzenle
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="favoriler" className="scroll-mt-24">
            <h2 className="text-h2">Favoriler</h2>
            {favorites.length === 0 ? (
              <Empty icon={Heart} text="Favori ürünün yok. Ürün sayfasındaki kalple ekleyebilirsin." href="/urunler" cta="Ürünlere bak" />
            ) : (
              <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {favorites.map((favorite) => (
                  <li key={favorite.id}>
                    <Link href={`/urun/${favorite.product.slug}`} className="group block overflow-hidden rounded-card border border-border bg-card">
                      <div className="grid aspect-square place-items-center bg-muted">
                        <Garment kind={favorite.product.silhouette} color={favorite.product.colors[0]?.hex ?? "#161616"} className="w-3/5 transition-transform group-hover:scale-105" />
                      </div>
                      <p className="truncate px-3 pt-3 text-sm font-semibold">{favorite.product.name}</p>
                      <p className="px-3 pb-3 text-sm text-muted-foreground">{formatTry(favorite.product.basePrice)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="adresler" className="scroll-mt-24">
            <h2 className="text-h2">Adresler</h2>
            {addresses.length === 0 ? (
              <Empty icon={MapPin} text="Kayıtlı adres yok. İlk siparişinde girdiğin adres burada saklanır." />
            ) : (
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {addresses.map((address) => (
                  <li key={address.id} className="rounded-card border border-border bg-card p-5 text-sm">
                    <p className="flex items-center justify-between font-semibold">
                      {address.fullName}
                      {address.isDefault ? <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">Varsayılan</span> : null}
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      {address.line1}
                      <br />
                      {address.district} / {address.city} {address.postalCode}
                      <br />
                      {address.phone}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="profil" className="scroll-mt-24">
            <h2 className="text-h2">Profil</h2>
            <dl className="mt-6 grid gap-3 rounded-card border border-border bg-card p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Ad soyad</dt>
                <dd className="mt-1 font-medium">{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">E-posta</dt>
                <dd className="mt-1 font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Telefon</dt>
                <dd className="mt-1 font-medium">{user.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Şifre</dt>
                <dd className="mt-1">
                  <Link href="/sifremi-unuttum" className="font-medium underline">
                    Şifre sıfırlama bağlantısı gönder
                  </Link>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function Empty({ icon: Icon, text, href, cta }: { icon: typeof Package; text: string; href?: string; cta?: string }) {
  return (
    <div className="mt-6 rounded-card border border-dashed border-border px-6 py-10 text-center">
      <Icon size={30} className="mx-auto text-muted-foreground" aria-hidden="true" />
      <p className="mx-auto mt-3 max-w-sm text-muted-foreground">{text}</p>
      {href ? (
        <Link href={href} className="mt-4 inline-flex h-10 items-center rounded-control bg-foreground px-5 text-sm font-semibold text-background">
          {cta}
        </Link>
      ) : null}
    </div>
  );
}
