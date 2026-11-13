import type { Metadata } from "next";
import { Building2, CalendarClock, Palette, Shirt } from "lucide-react";
import { CorporateForm } from "@/components/corporate-form";
import { Reveal } from "@/components/effects/reveal";
import { PageHeader } from "@/components/page-header";
import { listProducts } from "@/server/catalog";

export const metadata: Metadata = {
  title: "Kurumsal Tişört ve Toplu Baskı",
  description: "Şirket, okul, etkinlik ve takımlar için toplu tişört, hoodie ve sweatshirt baskısı. 10 adetten itibaren %5, 20'den %10, 50'den %15 indirim.",
  alternates: { canonical: "/kurumsal" },
};

const tiers = [
  { range: "10–19", pct: 5 },
  { range: "20–49", pct: 10 },
  { range: "50+", pct: 15 },
];

const reasons = [
  { icon: Shirt, title: "Tek muhatap", text: "Ürün, renk ve beden dağılımı tek teklifte." },
  { icon: Palette, title: "Logo kontrolü", text: "Baskıdan önce dosyan çözünürlük ve renk açısından kontrol edilir." },
  { icon: CalendarClock, title: "Planlı termin", text: "İstediğin teslim tarihine göre üretim planı." },
  { icon: Building2, title: "Fatura", text: "Kurumsal fatura ile sipariş." },
];

export default async function CorporatePage() {
  const products = (await listProducts({})).filter((product) => product.slug !== "dtf-tabaka");
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
      <PageHeader
        eyebrow="Kurumsal"
        title="Ekibin, etkinliğin, markan."
        lede="Şirket tişörtleri, okul ve takım formaları, etkinlik ürünleri. Adet arttıkça birim fiyat otomatik düşer."
        crumbs={[{ href: "/", label: "Ana sayfa" }, { label: "Kurumsal" }]}
      />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <div className="grid grid-cols-3 gap-3">
            {tiers.map((tier, index) => (
              <Reveal key={tier.range} stagger={index} className="rounded-card border border-border bg-card p-5 text-center">
                <p className="font-display text-4xl font-bold text-primary">%{tier.pct}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tier.range} adet</p>
              </Reveal>
            ))}
          </div>
          <ul className="mt-8 space-y-3">
            {reasons.map(({ icon: Icon, title, text }, index) => (
              <Reveal as="li" key={title} stagger={index} className="flex gap-4 rounded-card border border-border bg-card p-5">
                <Icon size={22} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-h2 mb-6">Teklif iste</h2>
          <CorporateForm products={products.map((p) => ({ slug: p.slug, name: p.name, basePrice: p.basePrice }))} />
        </div>
      </div>
    </div>
  );
}
