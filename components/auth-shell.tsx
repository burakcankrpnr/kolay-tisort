import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Garment } from "@/components/garment";

/** Giriş / kayıt / şifre sayfaları için iki sütunlu düzen. */
export function AuthShell({ title, lede, children }: { title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-10rem)] max-w-site gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
      <aside className="relative hidden h-full min-h-[560px] overflow-hidden rounded-card bg-foreground p-10 text-background lg:flex lg:flex-col">
        <div className="mesh opacity-40" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <p className="relative font-display text-sm font-semibold tracking-widest text-primary uppercase">Atölyeye hoş geldin</p>
        <p className="relative mt-4 max-w-sm font-display text-4xl leading-tight">Tasarımların, siparişlerin ve favorilerin tek yerde.</p>
        <ul className="relative mt-8 space-y-3 text-sm text-background/80">
          {["Tasarımlarını kaydet, istediğin zaman stüdyoda aç", "Siparişini adım adım takip et", "Adreslerin bir sonraki siparişte hazır"].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /> {item}
            </li>
          ))}
        </ul>
        <Garment kind="HOODIE" color="#2A2A28" className="float-soft absolute -right-10 -bottom-10 w-[62%] opacity-90" />
      </aside>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-h1">{title}</h1>
        {lede ? <div className="mt-3 text-muted-foreground">{lede}</div> : null}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
