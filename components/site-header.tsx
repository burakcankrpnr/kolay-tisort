"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Menu, PenTool, Search, ShoppingBag, User, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { nav } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteHeader({
  brandName,
  cartCount,
  signedIn,
}: {
  brandName: string;
  cartCount: number;
  signedIn: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const previousCount = useRef(cartCount);

  // Rota değişince menüleri kapat
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setCompact(scrollY > 24);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // Sepet sayısı artınca rozet zıplar
  useEffect(() => {
    const badge = badgeRef.current;
    if (badge && cartCount > previousCount.current) {
      badge.classList.remove("bump");
      void badge.offsetWidth;
      badge.classList.add("bump");
    }
    previousCount.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300",
          compact ? "border-border bg-background/80 backdrop-blur-xl" : "border-transparent bg-background",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-site items-center gap-4 px-4 transition-[height] duration-300 sm:px-6",
            compact ? "h-14" : "h-16 md:h-20",
          )}
        >
          <Link href="/" className="font-display text-2xl leading-none font-bold tracking-tight md:text-[1.7rem]">
            {brandName}
          </Link>
          <nav className="ml-6 hidden items-center gap-5 text-sm font-medium whitespace-nowrap lg:flex xl:gap-7" aria-label="Ana menü">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "link-underline py-1 transition-colors",
                  isActive(item.href) ? "text-foreground [background-size:100%_1px]" : "text-foreground/70 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/urunler" role="search" className="ml-auto hidden md:block lg:hidden xl:block">
            <label htmlFor="q" className="sr-only">
              Ürün ara
            </label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <input
                id="q"
                name="q"
                type="search"
                placeholder="Ürün ara"
                className="h-10 w-48 rounded-control border border-border bg-card pr-3 pl-9 text-sm outline-none transition-[width,border-color] duration-300 placeholder:text-muted-foreground focus:w-64 focus:border-foreground"
              />
            </div>
          </form>
          <div className="ml-auto flex items-center gap-1 md:ml-0 lg:ml-auto xl:ml-0">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-control md:hidden"
              aria-label={searchOpen ? "Aramayı kapat" : "Ürün ara"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((value) => !value)}
            >
              <Search size={19} />
            </button>
            <ThemeToggle className="grid size-11 place-items-center rounded-control hover:bg-muted" />
            <Link
              href={signedIn ? "/hesap" : "/giris"}
              className="hidden size-11 place-items-center rounded-control hover:bg-muted sm:grid"
              aria-label={signedIn ? "Hesabım" : "Giriş yap"}
            >
              <User size={19} />
            </Link>
            <Link
              href="/sepet"
              data-cart-target=""
              className="relative grid size-11 place-items-center rounded-control hover:bg-muted"
              aria-label={`Sepet, ${cartCount} ürün`}
            >
              <ShoppingBag size={19} />
              <span
                ref={badgeRef}
                className={cn(
                  "absolute top-1 right-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] leading-5 font-semibold text-primary-foreground tabular-nums",
                  cartCount === 0 && "hidden",
                )}
              >
                {cartCount}
              </span>
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-control lg:hidden"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              aria-controls="mobil-menu"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {searchOpen ? (
          <form action="/urunler" role="search" className="border-t border-border px-4 py-3 md:hidden">
            <label htmlFor="q-mobile" className="sr-only">
              Ürün ara
            </label>
            <input
              id="q-mobile"
              name="q"
              type="search"
              autoFocus
              placeholder="Ne arıyorsun? Oversize, hoodie…"
              className="h-12 w-full rounded-control border border-border bg-card px-4 text-base outline-none focus:border-foreground"
            />
          </form>
        ) : null}
      </header>

      {/* Mobil tam ekran menü */}
      <div
        id="mobil-menu"
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          className={cn("absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
          onClick={() => setOpen(false)}
        />
        <nav
          aria-label="Mobil menü"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col bg-background px-6 pt-20 pb-8 shadow-2xl transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)]",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 grid size-11 place-items-center"
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
          {nav.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "border-b border-border py-4 font-display text-3xl transition-[opacity,transform] duration-500",
                open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
              )}
              style={{ transitionDelay: open ? `${80 + index * 50}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
          <Link href={signedIn ? "/hesap" : "/giris"} className="mt-auto py-3 text-lg">
            {signedIn ? "Hesabım" : "Giriş yap / Kayıt ol"}
          </Link>
        </nav>
      </div>

      {/* Mobil alt gezinme çubuğu */}
      <nav
        aria-label="Hızlı gezinme"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="grid grid-cols-5">
          {[
            { href: "/", label: "Ana sayfa", icon: Home },
            { href: "/urunler", label: "Ürünler", icon: LayoutGrid },
            { href: "/tasarla", label: "Tasarla", icon: PenTool },
            { href: "/sepet", label: "Sepet", icon: ShoppingBag },
            { href: signedIn ? "/hesap" : "/giris", label: "Hesap", icon: User },
          ].map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : isActive(href);
            return (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px]",
                    active ? "text-primary" : "text-foreground/70",
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
