import Link from "next/link";
import { nav } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-4xl">Katman</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/70">
            Baskı atölyesi ve vitrin. Ürün seç, bedenini belirle, sipariş üretime düşsün.
          </p>
        </div>
        <div>
          <p className="text-sm text-paper/50">Mağaza</p>
          <ul className="mt-3 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm text-paper/50">Hesap</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/giris">Giriş</Link>
            </li>
            <li>
              <Link href="/kayit">Kayıt</Link>
            </li>
            <li>
              <Link href="/hesap">Siparişlerim</Link>
            </li>
            <li>
              <Link href="/sepet">Sepet</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
