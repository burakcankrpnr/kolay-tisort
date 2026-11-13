# SEO el kitabı

## Altyapı

| Dosya | Görev |
|---|---|
| `app/sitemap.ts` | Statik sayfalar + ürün, kategori, onaylı tasarım, blog; `lastModified` kayıttan |
| `app/robots.ts` | `/admin`, `/hesap`, `/sepet`, `/odeme`, `/api/`, giriş/kayıt/şifre engelli |
| `app/llms.txt/route.ts` | Yapay zekâ asistanları için marka, hizmet, fiyat, ürün özeti (marka bilgisi panelden) |
| `lib/seo.ts` | `siteUrl()` (`NEXT_PUBLIC_SITE_URL` → `AUTH_URL` → localhost), `clampText()` |
| `components/json-ld.tsx` | Güvenli JSON-LD basıcı |

**Üretimde** `NEXT_PUBLIC_SITE_URL=https://www.stylingpark.com` ayarlanmalı; canonical, sitemap ve şema mutlak adresleri buradan gelir.

## Yapılandırılmış veri

- Layout: `Organization`, `WebSite` + `SearchAction`
- Ana sayfa: `FAQPage` (görünen SSS ile birebir)
- Ürün: `Product` + `AggregateOffer` (varyant fiyat aralığı, stok), `AggregateRating` (yalnızca gerçek yorum varsa), `BreadcrumbList`
- Blog yazısı: `BlogPosting`

Kural: Şema, sayfada görünen içerikle birebir uyumlu olmalı. Sahte puan/yorum yok.

## Başlık ve açıklama

- Title ≤ 60, description ≤ 155 karakter (`clampText`). Şablon: `%s · {marka}`.
- Ürün: `{ürün adı} Tasarla ve Bastır`, açıklama + üretim süresi.
- Canonical: ürün ve blog sayfalarında ayarlı.

## İnce içerik kontrolü

- `/baski/[city]/[category]` şehir sayfaları benzersiz içerik eklenene kadar `noindex, follow` ve sitemap dışı.
- Filtreli liste URL'leri sitemap'e yalnızca kategori parametresiyle girer.

## Yayın kontrol listesi

- [ ] `NEXT_PUBLIC_SITE_URL` üretim adresine ayarlı
- [ ] `/sitemap.xml`, `/robots.txt`, `/llms.txt` açılıyor
- [ ] Google Rich Results Test ile ürün ve SSS şeması geçerli
- [ ] Her yeni ürünün açıklaması dolu ve benzersiz
- [ ] Marka adı, e-posta, açıklama panelde güncel (entity tutarlılığı)

## Yapılmayanlar (sonraki tur)

Dinamik OG görselleri, panelden sayfa bazlı SEO alanları ve toplu düzenleme, yönlendirme (301) yöneticisi, kırık link raporu, programatik landing sayfaları (`/oversize-tisort-tasarla` vb.), `hreflang` altyapısı.
