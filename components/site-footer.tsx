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
  const columns = [
    { title: "Mağaza", links: nav.map((item) => ({ href: item.href, label: item.label })) },
    { title: "Popüler", links: seoLinks },
    {
      title: "Hesap",
      links: [
        { href: "/giris", label: "Giriş" },
        { href: "/kayit", label: "Kayıt ol" },
        { href: "/hesap", label: "Siparişlerim" },
        { href: "/sepet", label: "Sepet" },
        { href: "/tasarimci", label: "Tasarımcı ol" },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-foreground pb-[calc(3.5rem+env(safe-area-inset-bottom))] text-background md:pb-0">
      <div className="mx-auto max-w-site px-4 pt-10 pb-8 sm:px-6 sm:pt-14 sm:pb-10">
        <div className="mb-8 md:mb-12">
          <p className="font-display text-3xl font-bold sm:text-4xl">{brand.name}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-background/70">{brand.description}</p>
          <ul className="mt-5 flex flex-col gap-2 text-sm text-background/80 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
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

        {/* Mobil accordion */}
        <div className="border-t border-background/15 sm:hidden">
          {columns.map((column, index) => (
            <details key={column.title} className="group border-b border-background/15" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-xs font-semibold tracking-widest text-background/50 uppercase [&::-webkit-details-marker]:hidden">
                {column.title}
                <span className="grid size-7 place-items-center rounded-full border border-background/20 text-background/70 transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <ul className="space-y-2.5 pb-4 text-sm">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="link-underline text-background/85 hover:text-background">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        {/* Tablet / masaüstü ızgara */}
        <div className="hidden gap-8 sm:grid sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold tracking-widest text-background/50 uppercase">{column.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="link-underline text-background/85 hover:text-background">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-background/15 pt-5 text-xs text-background/60 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <p>
            © {year} {brand.name}. Tüm hakları saklıdır.
          </p>
          {brand.email ? (
            <a href={`mailto:${brand.email}`} className="link-underline break-all">
              {brand.email}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
