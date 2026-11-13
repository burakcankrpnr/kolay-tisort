"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { nav } from "@/config/site";

export function SiteHeader({
  cartCount,
  signedIn,
}: {
  cartCount: number;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink text-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <Link href="/" className="font-display text-3xl leading-none tracking-tight">
          Katman
        </Link>
        <nav className="ml-4 hidden items-center gap-4 text-sm lg:flex" aria-label="Ana menü">
          {nav.map((item) => (
            <Link key={item.label} href={item.href} className="text-paper/80 hover:text-paper">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/urunler" className="ml-auto hidden md:block">
          <label htmlFor="q" className="sr-only">
            Ürün ara
          </label>
          <input
            id="q"
            name="q"
            placeholder="Ürün ara"
            className="h-9 w-44 border border-white/25 bg-transparent px-3 text-sm outline-none placeholder:text-paper/40"
          />
        </form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            className="grid size-10 place-items-center md:hidden"
            aria-label={searchOpen ? "Aramayı kapat" : "Ürün ara"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search size={18} />
          </button>
          <Link href={signedIn ? "/hesap" : "/giris"} className="hidden px-2 text-sm sm:inline">
            {signedIn ? "Hesabım" : "Giriş"}
          </Link>
          <Link href="/sepet" className="px-2 text-sm">
            Sepet {cartCount}
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center lg:hidden"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {searchOpen ? (
        <form action="/urunler" className="border-t border-white/10 px-5 py-3 md:hidden">
          <label htmlFor="q-mobile" className="sr-only">
            Ürün ara
          </label>
          <input
            id="q-mobile"
            name="q"
            placeholder="Ürün ara"
            className="h-11 w-full border border-white/25 bg-transparent px-3 text-base outline-none"
          />
        </form>
      ) : null}
      {open ? (
        <nav className="flex flex-col border-t border-white/10 px-5 py-3 lg:hidden" aria-label="Mobil menü">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="border-b border-white/10 py-3"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href={signedIn ? "/hesap" : "/giris"} className="py-3" onClick={() => setOpen(false)}>
            {signedIn ? "Hesabım" : "Giriş"}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
