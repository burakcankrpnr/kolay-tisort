import { dtfSheets } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { formatTry } from "@/utils/money";

export const revalidate = 3600;

/** Yapay zekâ asistanları için özet site tanımı (llms.txt). Marka bilgisi panelden gelir. */
export async function GET() {
  const base = siteUrl();
  const [{ brand }, categories, products] = await Promise.all([
    getSettings(),
    prisma.category.findMany({ where: { deletedAt: null }, select: { name: true, slug: true } }),
    prisma.product.findMany({
      where: { deletedAt: null, slug: { not: "dtf-tabaka" } },
      select: { name: true, slug: true, basePrice: true, productionDays: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const body = [
    `# ${brand.name}`,
    "",
    `> ${brand.description}`,
    "",
    "## Hizmetler",
    "- Kişiye özel tişört, oversize tişört, sweatshirt ve hoodie baskısı (DTF tekniği).",
    `- DTF baskı tabakası: ${dtfSheets.map((s) => `${s.widthCm}×${s.heightCm} cm ${formatTry(s.price)}`).join(", ")}.`,
    "- Toplu sipariş indirimi: 10+ adet %5, 20+ adet %10, 50+ adet %15 (sepette otomatik).",
    "- Üretim süresi: çoğu üründe 3 iş günü, hoodie'de 4 iş günü. Kargo: Aras, Yurtiçi, MNG, Sürat.",
    "- Ödeme: iyzico / PayTR, 3D Secure.",
    "",
    "## Ana sayfalar",
    `- [Ürünler](${base}/urunler)`,
    `- [Kendin tasarla](${base}/tasarla)`,
    `- [DTF baskı](${base}/dtf-baski)`,
    `- [Hazır tasarımlar](${base}/hazir-tasarimlar)`,
    `- [Kurumsal](${base}/kurumsal)`,
    `- [Blog](${base}/blog)`,
    "",
    "## Kategoriler",
    ...categories.map((c) => `- [${c.name}](${base}/urunler?kategori=${c.slug})`),
    "",
    "## Ürünler",
    ...products.map((p) => `- [${p.name}](${base}/urun/${p.slug}): ${formatTry(p.basePrice)}'den başlayan fiyat, ${p.productionDays} iş günü üretim`),
    "",
    "## İletişim",
    brand.email ? `- E-posta: ${brand.email}` : "",
    `- Web: ${brand.domain}`,
  ]
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
