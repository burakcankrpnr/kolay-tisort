import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { SheetEditor } from "@/features/dtf/loader";
import { dtfSheets } from "@/lib/pricing";
import { formatTry } from "@/utils/money";

export const metadata: Metadata = {
  title: "DTF Baskı Tabakası Oluştur",
  description: "DTF baskı filmi siparişi: tasarımlarını yükle, AUTOFIT ile tabakaya diz, fiyatı anında gör. 30×40 cm'den 60×90 cm'ye tabaka seçenekleri.",
  alternates: { canonical: "/dtf-baski" },
};

const faqs = [
  { q: "DTF baskı nedir?", a: "Tasarımın özel bir filme basılıp tutkal tozuyla kaplandığı, ardından ısı presiyle kumaşa aktarıldığı baskı tekniğidir. Pamuk, polyester ve karışımlarda kullanılabilir." },
  { q: "Tabakaya kaç tasarım koyabilirim?", a: "Tabaka ölçüsü elverdiği sürece istediğin kadar. İlk tasarım tabaka fiyatına dahil; her ek tasarım için küçük bir hazırlık ücreti eklenir." },
  { q: "Hangi dosya formatını yüklemeliyim?", a: "Şeffaf arka planlı PNG en iyi sonucu verir. Baskı boyutunda 300 DPI hedefle; editör her tasarımın DPI değerini gösterir." },
  { q: "Beyaz renk basılır mı?", a: "DTF beyaz mürekkep katmanı kullanır. Saf beyaz (#FFFFFF) alanların şeffaf sayılmasını istemiyorsan #FFFFFE kullan." },
];

export default function DtfPage() {
  return (
    <div className="mx-auto max-w-site px-4 pb-20 sm:px-6 xl:px-8">
      <PageHeader
        eyebrow="DTF baskı"
        title="Tabakanı diz, biz basalım."
        lede="Tasarımlarını yükle, AUTOFIT en az fireyle yerleştirsin. Doluluk oranını ve fiyatı anında gör; tabakayı kendi presinde uygula."
        crumbs={[{ href: "/", label: "Ana sayfa" }, { label: "DTF baskı" }]}
      />
      <div className="-mt-4 mb-8 flex gap-2 overflow-x-auto pb-1">
        {dtfSheets.map((sheet) => (
          <div key={sheet.id} className="shrink-0 rounded-card border border-border bg-card px-4 py-3">
            <p className="font-semibold">
              {sheet.widthCm}×{sheet.heightCm} cm
            </p>
            <p className="text-sm text-muted-foreground">{formatTry(sheet.price)}</p>
          </div>
        ))}
      </div>
      <SheetEditor />
      <section className="mx-auto mt-20 max-w-3xl" aria-labelledby="dtf-sss">
        <h2 id="dtf-sss" className="text-h2">
          DTF hakkında sık sorulanlar
        </h2>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {faqs.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
        }}
      />
    </div>
  );
}
