import Link from "next/link";
import { CreditCard, ShieldCheck, Truck } from "lucide-react";
import { nav } from "@/config/site";
import type { Brand } from "@/lib/settings-schema";

const seoLinks = [
  { href: "/urunler?kategori=oversize-tisort", label: "Oversize tişört tasarla" },
  { href: "/urunler?kategori=hoodie", label: "Hoodie tasarla" },
  { href: "/dtf-baski", label: "DTF baskı fiyatları" },
  { href: "/kurumsal", label: "Kurumsal tişört baskı" },
  { href: "/hazir-tasarimlar", label: "Hazır tişört tasarımları" },
];

export function SiteFooter({ brand }: { brand: Brand }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-[1280px] px-4 pt-16 pb-10 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl font-bold">{brand.name}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/70">{brand.description}</p>
            <ul className="mt-6 space-y-2 text-sm text-background/80">
              <li className="flex items-center gap-2">
                <Truck size={16} aria-hidden="true" /> Türkiye geneli kargo
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} aria-hidden="true" /> 3D Secure güvenli ödeme
              </li>
              <li className="flex items-center gap-2">
                <CreditCard size={16} aria-hidden="true" /> iyzico · PayTR
              </li>
            </ul>
          </div>
          <FooterColumn title="Mağaza" links={nav.map((item) => ({ href: item.href, label: item.label }))} />
          <FooterColumn title="Popüler" links={seoLinks} />
          <FooterColumn
            title="Hesap"
            links={[
              { href: "/giris", label: "Giriş" },
              { href: "/kayit", label: "Kayıt ol" },
              { href: "/hesap", label: "Siparişlerim" },
              { href: "/sepet", label: "Sepet" },
              { href: "/tasarimci", label: "Tasarımcı ol" },
            ]}
          />
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-background/15 pt-6 text-xs text-background/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.name}. Tüm hakları saklıdır.
          </p>
          {brand.email ? (
            <a href={`mailto:${brand.email}`} className="link-underline">
              {brand.email}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-background/50 uppercase">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="link-underline text-background/85 hover:text-background">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
