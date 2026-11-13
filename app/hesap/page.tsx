import type { Metadata } from "next";
import type { Role } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  PenTool,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
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
  { id: "siparisler", label: "Siparişler", icon: Package },
  { id: "tasarimlar", label: "Tasarımlar", icon: PenTool },
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
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="mx-auto max-w-site overflow-x-clip px-4 pt-6 pb-28 sm:px-6 md:pt-10 md:pb-20">
      {/* Üst kart */}
      <section className="overflow-hidden rounded-card border border-border bg-card">
        <div className="relative bg-gradient-to-br from-foreground via-foreground to-foreground/90 px-5 py-6 text-background sm:px-7 sm:py-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">{roleLabel[user.role]}</p>
              <h1 className="mt-1 font-display text-3xl leading-none font-bold sm:text-5xl">
                Merhaba{firstName ? `, ${firstName}` : ""}
              </h1>
              <p className="mt-2 truncate text-sm text-background/65">{user.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="grid size-10 place-items-center rounded-full bg-background/10 text-background hover:bg-background/20"
                  aria-label="Yönetim paneli"
                >
                  <LayoutDashboard size={18} />
                </Link>
              ) : null}
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="grid size-10 place-items-center rounded-full bg-background/10 text-background hover:bg-background/20"
                  aria-label="Çıkış yap"
                >
                  <LogOut size={18} />
                </button>
              </form>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              { label: "Sipariş", value: orders.length },
              { label: "Devam eden", value: activeOrders },
              { label: "Tasarım", value: designs.length },
              { label: "Favori", value: favorites.length },
            ].map((stat) => (
              <div key={stat.label} className="rounded-control bg-background/10 px-3 py-3 backdrop-blur-sm">
                <dd className="font-display text-2xl font-bold tabular-nums sm:text-3xl">{stat.value}</dd>
                <dt className="mt-0.5 text-[11px] text-background/60 sm:text-xs">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {lastDesign?.product ? (
          <Link
            href={`/tasarla/${lastDesign.product.slug}?tasarim=${lastDesign.id}`}
            className="flex items-center gap-3 border-t border-border px-4 py-4 sm:gap-4 sm:px-6"
          >
            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-control bg-muted sm:size-16">
              {lastDesign.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lastDesign.previewUrl} alt="" className="size-full object-contain" />
              ) : (
                <Sparkles size={20} className="text-primary" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground sm:text-sm">Kaldığın yerden devam et</span>
              <span className="block truncate font-display text-lg sm:text-xl">{lastDesign.name}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-foreground px-3 py-2 text-xs font-semibold text-background sm:px-4 sm:text-sm">
              Aç <ArrowRight size={14} />
            </span>
          </Link>
        ) : null}
      </section>

      {/* Mobil bölüm chip’leri */}
      <nav aria-label="Hesap bölümleri" className="chip-scroll chip-scroll-fade sticky top-16 z-20 -mx-4 mt-5 bg-background/95 px-4 py-2 backdrop-blur-xl lg:hidden">
        {sections.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium"
          >
            <Icon size={15} className="text-muted-foreground" /> {label}
          </a>
        ))}
      </nav>

      <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
        <nav aria-label="Hesap menüsü" className="hidden lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-1 lg:self-start">
          {sections.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon size={17} /> {label}
            </a>
          ))}
          {isAdmin ? (
            <Link href="/admin" className="mt-2 flex items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10">
              <Settings size={17} /> Yönetim
            </Link>
          ) : null}
        </nav>

        <div className="min-w-0 space-y-10 sm:space-y-14">
          <section id="siparisler" className="scroll-mt-28">
            <h2 className="text-h2">Siparişlerim</h2>
            {orders.length === 0 ? (
              <Empty icon={Package} text="Henüz siparişin yok." href="/urunler" cta="Ürünlere bak" />
            ) : (
              <ul className="mt-5 space-y-3">
                {orders.map((order) => (
                  <li key={order.id} className="overflow-hidden rounded-card border border-border bg-card">
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-3.5 sm:px-5">
                      <div className="min-w-0">
                        <p className="font-semibold">{order.number}</p>
                        <p className="text-xs text-muted-foreground sm:text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs", statusTone[order.status])}>
                          {orderStatusLabel[order.status]}
                        </span>
                        <p className="font-display text-lg font-bold tabular-nums sm:text-xl">{formatTry(order.total)}</p>
                      </div>
                    </div>
                    <div className="px-4 py-4 sm:px-5">
                      <OrderTimeline status={order.status} compact />
                      <ul className="mt-4 flex gap-2 overflow-x-auto pb-1">
                        {order.items.map((item) => {
                          const snap = item.designSnapshot as { previewUrl?: string | null } | null;
                          const preview = snap?.previewUrl ?? item.printFileUrl;
                          return (
                            <li key={item.id} className="flex shrink-0 items-center gap-2 rounded-control bg-muted/60 py-1.5 pr-3 pl-1.5 text-xs">
                              <span className="grid size-9 place-items-center overflow-hidden rounded-[8px] bg-card">
                                {preview ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={preview} alt="" className="size-full object-contain" />
                                ) : (
                                  <Package size={14} />
                                )}
                              </span>
                              <span className="max-w-[10rem] truncate">
                                {item.productName} · {item.sizeName} × {item.quantity}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <Link href={`/odeme/tamamlandi?siparis=${order.number}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold underline">
                        Ayrıntılar <ArrowRight size={14} />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="tasarimlar" className="scroll-mt-28">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-h2">Tasarımlarım</h2>
              <Link href="/tasarla" className="flex items-center gap-1 text-sm font-semibold underline">
                <PenTool size={14} /> Yeni
              </Link>
            </div>
            {designs.length === 0 ? (
              <Empty icon={PenTool} text="Kayıtlı tasarımın yok. Stüdyoda “Kaydet” ile buraya eklenir." href="/tasarla" cta="Tasarlamaya başla" />
            ) : (
              <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3">
                {designs.map((design) => (
                  <li key={design.id} className="group min-w-0 overflow-hidden rounded-card border border-border bg-card">
                    <div className="grid aspect-square place-items-center bg-muted">
                      {design.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={design.previewUrl} alt={design.name} className="size-full object-contain transition-transform duration-500 group-hover:scale-105" />
                      ) : design.product ? (
                        <Garment kind={design.product.silhouette} color="#161616" className="w-1/2" />
                      ) : null}
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className="truncate text-sm font-semibold sm:text-base">{design.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                        {design.product?.name ?? "Ürün"} · {formatDate(design.updatedAt)}
                      </p>
                      {design.product ? (
                        <Link
                          href={`/tasarla/${design.product.slug}?tasarim=${design.id}`}
                          className="mt-2.5 flex h-9 items-center justify-center gap-1.5 rounded-control bg-foreground text-xs font-semibold text-background"
                        >
                          <PenTool size={13} /> Düzenle
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="favoriler" className="scroll-mt-28">
            <h2 className="text-h2">Favoriler</h2>
            {favorites.length === 0 ? (
              <Empty icon={Heart} text="Favori ürünün yok. Ürün sayfasındaki kalple ekleyebilirsin." href="/urunler" cta="Ürünlere bak" />
            ) : (
              <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
                {favorites.map((favorite) => (
                  <li key={favorite.id} className="min-w-0">
                    <Link href={`/urun/${favorite.product.slug}`} className="group block overflow-hidden rounded-card border border-border bg-card">
                      <div className="grid aspect-square place-items-center bg-muted">
                        <Garment kind={favorite.product.silhouette} color={favorite.product.colors[0]?.hex ?? "#161616"} className="w-3/5 transition-transform group-hover:scale-105" />
                      </div>
                      <p className="truncate px-2.5 pt-2.5 text-sm font-semibold sm:px-3 sm:pt-3">{favorite.product.name}</p>
                      <p className="px-2.5 pb-3 text-xs text-muted-foreground sm:px-3 sm:text-sm">{formatTry(favorite.product.basePrice)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="adresler" className="scroll-mt-28">
            <h2 className="text-h2">Adresler</h2>
            {addresses.length === 0 ? (
              <Empty icon={MapPin} text="Kayıtlı adres yok. İlk siparişinde girdiğin adres burada saklanır." />
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => (
                  <li key={address.id} className="rounded-card border border-border bg-card p-4 text-sm sm:p-5">
                    <p className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                      {address.fullName}
                      {address.isDefault ? <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">Varsayılan</span> : null}
                    </p>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
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

          <section id="profil" className="scroll-mt-28">
            <h2 className="text-h2">Profil</h2>
            <dl className="mt-5 grid gap-0 overflow-hidden rounded-card border border-border bg-card text-sm sm:grid-cols-2">
              {[
                { label: "Ad soyad", value: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "—" },
                { label: "E-posta", value: user.email ?? "—" },
                { label: "Telefon", value: user.phone || "—" },
              ].map((row) => (
                <div key={row.label} className="border-b border-border px-4 py-4 last:border-b-0 sm:border-r sm:odd:border-r sm:even:border-r-0">
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="mt-1 break-all font-medium">{row.value}</dd>
                </div>
              ))}
              <div className="px-4 py-4">
                <dt className="text-xs text-muted-foreground">Şifre</dt>
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
    <div className="mt-5 rounded-card border border-dashed border-border px-4 py-10 text-center sm:px-6">
      <Icon size={28} className="mx-auto text-muted-foreground" aria-hidden="true" />
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground sm:text-base">{text}</p>
      {href ? (
        <Link href={href} className="mt-4 inline-flex h-10 items-center rounded-control bg-foreground px-5 text-sm font-semibold text-background">
          {cta}
        </Link>
      ) : null}
    </div>
  );
}
