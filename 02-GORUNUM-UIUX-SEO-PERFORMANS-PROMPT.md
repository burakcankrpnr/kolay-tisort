# GÖRÜNÜM, UI/UX, SEO, HIZ ve PANELDEN YÖNETİM — MASTER PROMPT (v2)

> **Bu dosya, mevcut "MASTER DEVELOPMENT PROMPT" dosyasının YERİNE DEĞİL, ÜZERİNE gelen ikinci katmandır.**
> Eski dosya "ne yapılacak" sorusunu cevaplar (özellikler, veritabanı, akışlar).
> Bu dosya "nasıl görünecek, nasıl hissettirecek, nasıl hızlı ve görünür olacak, nasıl panelden yönetilecek" sorusunu cevaplar.
> İki dosya çakışırsa: **özellik/veri kararlarında eski dosya, görsel/UX/SEO/performans kararlarında bu dosya geçerlidir.**

---

## 0. ROL VE ÇALIŞMA KURALLARI

Sen şu rollerin birleşimisin: **Art Director, Senior Product Designer, Design Systems Engineer, Senior Frontend Engineer, CRO (dönüşüm optimizasyonu) uzmanı ve Teknik SEO/GEO uzmanı.**

Hedef: Türkiye'de kişiye özel baskı (tişört, oversize, sweatshirt, hoodie, DTF, kurumsal) alanında **dünyadaki en iyi web-to-print sitelerinin (Custom Ink, Printful, Spreadshirt, Zazzle, Vistaprint, Gelato, Printify mağaza deneyimleri ve Türkiye'deki KolayTişört, Tisho, Baskı Tasarla vb.) üzerinde bir görsel kalite, hız ve kullanım kolaylığı** yakalamak.

Kurallar:

1. Hiçbir sitenin tasarımını, metnini, görselini veya kodunu kopyalama. Sadece güçlü UX **prensiplerini** al, görsel kimliği tamamen özgün üret.
2. Bana "yapayım mı?" diye sorma. Mantıklı kararı kendin ver, nedenini kısa bir `DECISIONS.md` dosyasına yaz.
3. Her ekran **gerçek, çalışan, bağlı** olmalı. Statik mockup, lorem ipsum, "yakında" yazısı, boş placeholder yok.
4. Mevcut çalışan kodu gereksiz silme. Çakışan tasarım yapıları varsa refactor et.
5. Her aşama sonunda: TypeScript, ESLint, build, Lighthouse, responsive (360 / 390 / 768 / 1024 / 1280 / 1536 / 1920), erişilebilirlik kontrolü yap. Hata varsa düzelt, sonra devam et.
6. Türkçe karakterleri (ç ğ ı ö ş ü İ) doğru kullan, tüm metinler doğal ve akıcı Türkçe olsun. Fiyatlar `1.299,00 ₺` biçiminde (`Intl.NumberFormat('tr-TR')`).

---

## 1. İLK İŞ: REKABET ANALİZİ ve KARAR DOKÜMANI

Kod yazmadan önce `docs/design-research.md` oluştur ve şunları yaz:

- İncelenen siteler: Custom Ink, Printful, Spreadshirt, Zazzle, Vistaprint, Gelato, Printify, KolayTişört, Tisho, Baskı Tasarla, Tişörthane, T-ShirtBastir.
- Her site için: güçlü yan, zayıf yan, editöre giriş süresi (kaç tıkta tasarıma başlanıyor), ürün sayfası yapısı, mobil deneyim, fiyat gösterimi, güven unsurları.
- Ortak başarılı kalıplar (özellikle): ürün sayfasından editöre **en az sürtünmeyle** geçiş, canlı mockup, net fiyat, minimum teslim süresi görünürlüğü, toplu sipariş indirimi görünürlüğü, güven rozetleri.
- Ortak hatalar: karmaşık editör, belirsiz baskı alanı, geç gösterilen kargo/üretim süresi, mobilde sıkışık araç çubuğu, düşük kaliteli stok görseller.
- Sonuç: "Bizim farkımız" bölümü — bu projede hangi 10 noktada rakiplerden iyi olacağız.

Not: Güncel UX bulgularını ve rakip özelliklerini tarayıp **kendi gözlemlerinle** doğrula. Sadece bu dosyadaki varsayımlara güvenme.

---

## 2. MARKA KİMLİĞİ ve GÖRSEL YÖN

**Konsept: "Premium Streetwear Atölyesi"** — butik bir moda markası ile profesyonel bir baskı atölyesinin birleşimi. Şablon e-ticaret görünümü kesinlikle olmayacak.

### 2.1 His
Premium · Minimal · Cesur tipografi · Bol beyaz boşluk · Editoryal fotoğraf · Net CTA · Güven veren · Hızlı

### 2.2 Marka alanı (panelden değiştirilebilir — bkz. Bölüm 14)
Marka adı, logo (açık/koyu), favicon, slogan ve renkler **koda gömülmez**. `SiteSettings` + `ThemeSettings` tablolarından gelir. Varsayılan marka: **StylingPark** (www.stylingpark.com).

### 2.3 Renk sistemi (design token — CSS değişkeni)
Tüm renkler HSL CSS değişkeni olarak tanımlanır ve panelden değiştirilir:

```
--background, --foreground
--card, --card-foreground
--primary, --primary-foreground      (marka ana rengi, CTA)
--secondary, --accent
--muted, --muted-foreground
--border, --input, --ring
--success, --warning, --destructive
--surface-elevated                    (editör paneli, modal)
```

Varsayılan palet önerisi:
- Nötr: sıcak kırık beyaz zemin (`#FAFAF8`), koyu mürekkep metin (`#111111`), ince gri çizgi (`#E8E6E1`)
- Primary: tek bir cesur vurgu rengi (örn. elektrik mavisi, safran veya canlı kırmızı — panelden seçilebilir)
- Maksimum 1 vurgu rengi + nötrler. Gradient kullanımı minimum.
- **Light + Dark mode** (sistem tercihi + manuel anahtar). Kontrast **WCAG AA** (metin 4.5:1, büyük metin 3:1).

### 2.4 Tipografi
- Başlık: güçlü, karakterli bir grotesk/display font (örn. *Bricolage Grotesque*, *Space Grotesk*, *Sora* veya *Clash Display* benzeri). Türkçe karakter desteği **zorunlu**.
- Gövde: *Inter* veya *Geist*.
- Hepsi `next/font` ile self-host, `display: swap`, subset `latin` + `latin-ext`, sadece kullanılan ağırlıklar.
- Akışkan tipografi: `clamp()` ile ölçek.

```
display:  clamp(2.5rem, 6vw + 1rem, 5.5rem)   / satır 1.02 / harf aralığı -0.03em
h1:       clamp(2rem, 4vw + 1rem, 3.5rem)
h2:       clamp(1.5rem, 2.5vw + 1rem, 2.5rem)
body:     1rem (16px) / 1.6
small:    0.875rem
```
- Panelden font ailesi seçilebilir (önceden onaylı 6–8 font listesinden).

### 2.5 Boşluk, ızgara, köşe
- 4 px baz ızgara. Ana container max `1280px`, geniş bölümler `1440px`.
- Bölümler arası dikey boşluk: mobil `64px`, masaüstü `112–144px`.
- Köşe yarıçapı: kartlar `16px`, buton/input `12px`, rozet tam yuvarlak. Panelden "köşe stili" (keskin / yumuşak / yuvarlak) seçilebilir.
- Gölge: çok hafif ve katmanlı; kartlar çoğunlukla **border + hover'da hafif yükselme**.

### 2.6 Hareket (Framer Motion)
- Süreler 150–300 ms, ease-out. Sayfa girişinde hafif fade-up. Hover'da kart yükselmesi ve görsel zoom (1.03).
- **`prefers-reduced-motion` desteklenmeli.**
- LCP öğesine animasyon verme. Kaydırma ile tetiklenen animasyonlar sadece ekran altı bölümlerde.
- Skeleton loading: tüm liste/kart/editör yüklemelerinde.

### 2.7 İkon ve görsel dili
- Tek bir ikon seti (Lucide), tutarlı çizgi kalınlığı.
- Fotoğraf: gerçek model/ürün fotoğrafı + yüksek kaliteli mockup. Stok görsel hissi yok. Görsel yoksa şık bir tipografik/mockup placeholder.
- Tüm görseller `next/image`, AVIF/WebP, doğru `sizes`, blur placeholder.

---

## 3. TASARIM SİSTEMİ (BİLEŞEN KÜTÜPHANESİ)

`components/ui/` ve `components/shared/` altında shadcn/ui tabanlı, token'lara bağlı bileşenler. Her bileşende **default / hover / focus-visible / active / disabled / loading / error** durumları olmalı. Storybook veya `/dev/design-system` sayfası ile hepsi görülebilir olmalı.

Zorunlu bileşenler:

Button (primary, secondary, ghost, outline, destructive, icon, loading) · Input · Textarea · Select · Combobox · Checkbox · Radio · Switch · Slider · Tabs · Accordion · Dialog · Drawer (mobil bottom sheet) · Popover · Tooltip · Toast · Badge · Avatar · Card (ProductCard, DesignCard, DesignerCard, ReviewCard, CategoryCard) · Breadcrumb · Pagination · Skeleton · EmptyState · ErrorState · Stepper · ColorSwatch · SizeSelector · PriceDisplay · QuantityStepper · RatingStars · TrustBadges · PromoBar · MegaMenu · SearchCommand (⌘K) · FileDropzone · ProgressBar.

Kural: Sayfa içinde tek seferlik stil yazma. Önce bileşen, sonra sayfa.

---

## 4. GLOBAL DÜZEN

### 4.1 Üst duyuru çubuğu (PromoBar)
Panelden açılıp kapanır, metin/renk/link/tarih aralığı yönetilir. Örn: "500 ₺ üzeri ücretsiz kargo · Üretim 2–3 iş günü".

### 4.2 Header
- Masaüstü: sol logo · orta mega menü (Ürünler, Kendin Tasarla, DTF Baskı, Hazır Tasarımlar, Kurumsal, Blog) · sağ arama, favoriler, hesap, sepet.
- Scroll'da sticky + küçülen header, blur arka plan.
- **Mega menü**: kategori görselleri, popüler ürünler, "Yeni" rozeti. İçeriği panelden yönetilir.
- Mobil: logo, arama, sepet, hamburger. Menü tam ekran drawer. Alt sabit gezinme çubuğu (Ana sayfa, Kategoriler, Tasarla, Sepet, Hesap).
- Sepet ikonu mini-cart drawer açar (ürün küçük görseli, düzenle/sil, ara toplam, ödemeye git).
- Arama: anlık öneri, son aramalar, popüler aramalar, ürün/tasarım/kategori sonuçları gruplu.

### 4.3 Footer
Kurumsal bilgiler, kategori linkleri, SEO landing linkleri, SSS, iade/teslimat/gizlilik/KVKK/mesafeli satış sözleşmesi, ödeme logoları (iyzico/PayTR), sosyal medya, bülten kaydı. Tüm sütunlar ve linkler panelden yönetilir.

### 4.4 Genel
- "Ana içeriğe geç" (skip link), tüm odaklanma halkaları görünür.
- Çerez onayı (KVKK uyumlu, kategori bazlı), Analytics/Pixel sadece onay sonrası yüklenir.
- 404, 500, bakım modu sayfaları markaya uygun ve özgün.
- WhatsApp sabit destek butonu (panelden numara/mesaj/konum).

---

## 5. ANA SAYFA (DÖNÜŞÜM ODAKLI)

Sıra ve bölümler **panelden sürükle-bırak ile yeniden sıralanabilir, açılıp kapatılabilir** (Bölüm 14'teki "Bölüm Oluşturucu").

1. **Hero** — Büyük tipografi, "Kendi Tasarımını Giy." Alt metin, 2 CTA ("Ürününü Tasarla", "DTF Baskı Oluştur"). Sağda/arkada canlı mockup döngüsü (renk değiştiren tişört, hafif parallax). Panelden: başlık, alt metin, CTA metin/link, görsel/video, düzen (sol/ortalı).
2. **Güven şeridi** — Hızlı üretim, güvenli ödeme, ücretsiz kargo eşiği, 300 DPI baskı garantisi, yıkamaya dayanıklı baskı, müşteri puanı.
3. **Hızlı başlat** — 3 kart: "Sıfırdan tasarla", "Hazır tasarım seç", "DTF tabaka oluştur". Her biri tek tıkla ilgili akışa gider.
4. **Kategori kartları** — Büyük görselli, hover'da ikinci görsel.
5. **Çok satanlar / Yeni gelenler** — Yatay kaydırmalı carousel (mobilde swipe), hızlı bakış (quick view) modal.
6. **Nasıl çalışır?** — 4 adım, sade ikon + kısa metin: Ürünü seç → Tasarla → Fiyatı gör → Biz üretelim, kapına gelsin.
7. **Hazır tasarımlar / trend** — Masonry grid, kategori çipleri (Anime, Gaming, Gothic, Streetwear…).
8. **Tasarımcılar** — Öne çıkan tasarımcı kartları, satış/tasarım sayısı.
9. **DTF baskı bloğu** — Tabaka örnek görseli, "m² / tabaka" başlangıç fiyatı, CTA.
10. **Kurumsal çözümler** — Toplu indirim tablosu özeti, "Teklif Al" CTA.
11. **Müşteri yorumları** — Doğrulanmış alışveriş rozeti, fotoğraflı yorumlar.
12. **Instagram / sosyal kanıt** — Müşteri fotoğrafları (UGC) grid.
13. **SSS** — Accordion + FAQ schema.
14. **SEO içerik bloğu** — Tek parça, okunabilir, "devamını oku" ile katlanabilir. **Gizli metin / keyword stuffing yok.**
15. **Bülten + final CTA**.

---

## 6. KATEGORİ / LİSTELEME SAYFASI

- Üstte breadcrumb + H1 + 2–3 cümlelik tanıtım metni (panelden), altta SEO içerik bloğu.
- Filtre: kategori, fiyat aralığı, renk (swatch), beden, baskı türü, rating, yeni, popüler. **Masaüstünde sol sidebar, mobilde bottom-sheet.**
- Aktif filtreler çip olarak üstte, tek tıkla temizle. Filtre durumu URL'de (paylaşılabilir). Filtre sayfaları `noindex` veya canonical ile kontrol edilir (index şişmesini önle).
- Sıralama: önerilen, en yeni, en çok satan, fiyat artan/azalan.
- Sonsuz kaydırma yerine **"Daha fazla göster" + sayfalama** (SEO ve performans için); ilk sayfa SSR.
- Kart: 2 görsel (hover'da değişir), renk swatch önizleme, "Yeni / Çok satan / İndirim" rozeti, fiyat ("₺299'dan başlayan"), favori kalbi, hızlı bakış.
- Boş sonuç: öneri ve popüler kategoriler.

---

## 7. ÜRÜN DETAY SAYFASI + EDİTÖRE GEÇİŞ (EN KRİTİK AKIŞ)

Amaç: **Ürün → Özelleştir → Sepet** akışında minimum karar ve minimum tıklama. Kullanıcı editöre girmeden önce çok az seçim yapmalı (renk + ürün yeterli), diğer ayarlar editör içinde yapılabilmeli.

Düzen (masaüstü): sol büyük galeri (sticky), sağ satın alma paneli.

- Galeri: ön/arka mockup, model fotoğrafı, detay, kumaş; zoom; mobilde swipe + nokta göstergesi.
- Başlık, rating, kısa özellik listesi, **fiyat net** ("299 ₺ + baskı"), dinamik güncellenir.
- Renk swatch (stoğu yoksa üstü çizili), beden seçici + **beden tablosu modalı** (cm cinsinden, "Bana uygun bedeni bul" yardımcısı).
- Baskı seçeneği: Ön / Arka / Ön + Arka (fiyat farkı şeffaf).
- İki ana CTA: **"Tasarla"** (editöre git) ve **"Hazır tasarımla devam et"**. Dosyası hazır olanlar için **"Dosya yükle"**.
- Toplu alım indirimi tablosu (1–4, 5–9, 10–24…), panelden gelir.
- Tahmini üretim ve kargo tarihi (takvim tarihi olarak: "En erken 18 Kasım Çarşamba kapında").
- Güven: güvenli ödeme, iade koşulları, baskı kalitesi garantisi.
- Sekmeler/accordion: Ürün bilgisi, Kumaş ve bakım, Baskı bilgisi, Teslimat ve iade, Yorumlar, SSS.
- "Bunu da beğenebilirsin" ve "Bu tasarımla başka ürünler" önerileri.
- **Mobil**: Altta sabit "Tasarla" / "Sepete ekle" çubuğu.

---

## 8. TASARIM EDİTÖRÜ — GÖRSEL ve UX STANDARDI

Editör, sitenin vitrinidir ve **ayrı kod parçası olarak lazy-load** edilir (`features/design-editor/`).

### 8.1 Masaüstü düzeni
- Sol dar ikon rayı: Yükle · Metin · Hazır tasarım · Şekil/ikon · Katmanlar · AI · Şablonlar.
- Sol genişleyen panel (seçilen araca göre).
- Orta: canvas — ürün mockup'ı arkada, **baskı alanı kesikli çizgiyle** işaretli, ölçü cm olarak etiketli, hizalama kılavuzları (snap).
- Sağ: seçili nesne özellikleri (renk, font, boyut, hizalama, opaklık, döndürme).
- Üst: Ön/Arka sekmesi, Geri al/İleri al, yakınlaştır, ürün/renk değiştir, **fiyat canlı**, "Sepete Ekle".
- Alt/üst bilgi: "Baskı alanı 35 × 40 cm" ve baskı alanı dışına çıkan bölge için görünür uyarı.

### 8.2 Mobil düzeni (zorunlu ve birinci sınıf)
- Canvas üstte tam genişlik; **alt toolbar** (Yükle, Metin, Katmanlar, Geri, İleri, Ön/Arka) ve seçili nesne için **kayan bağlamsal toolbar**.
- Paneller **bottom sheet** (yarım/tam yükseklik, sürüklenebilir).
- İki parmakla zoom/döndür/ölçekle. Dokunma hedefi min 44×44 px.
- Sayfa kaydırma ile canvas hareketi çakışmamalı.

### 8.3 Kalite ve güven
- DPI göstergesi: yeşil (300+), sarı (150–299), kırmızı (150 altı) rozet + anlaşılır mesaj.
- Otomatik kaydet (taslak), sekme kapanırsa kurtarma.
- Klavye kısayolları (Ctrl+Z, Ctrl+D, Delete, ok tuşları, Ctrl+C/V).
- Yüklemede ilerleme, hata, başarı durumları. Teknik hata gösterme.
- İlk kullanım için 3 adımlık hafif tur (atlanabilir).
- Önizleme: "Gerçekçi önizleme" modu (kumaş dokusu/gölge katmanı ile).

---

## 9. DTF TABAKA OLUŞTURUCU — GÖRSEL STANDART

- `/dtf-baski` sayfasında üstte net fiyat tablosu ve kısa açıklama, altında oluşturucu.
- Oluşturucu: sol tasarım listesi (yüklenenler, adet, ölçü), orta tabaka (cm ızgara, cetvel, snap, çakışma kırmızı vurgu), sağ özet (tabaka boyutu, doluluk %, fiyat, adet).
- **AUTOFIT** butonu belirgin; sonuçta doluluk yüzdesi gösterilir.
- Tabaka ölçüsü paneldeki fiyat listesinden gelir. Yeni ölçü eklemek için kod gerekmez.
- Beyaz tasarım notu: panelden yönetilen bilgi kutusu (örn. makine saf beyazı basmıyorsa `#FFFFFE` kullanım ipucu) ve yükleme sırasında şeffaf arka plan/çözünürlük kontrolü.
- Mobilde: tabaka yatay kaydırılabilir/zoomlanabilir, araçlar bottom sheet.

---

## 10. SEPET, ÖDEME, HESAP — SÜRTÜNMESİZ AKIŞ

- **Mini-cart drawer** + tam sepet sayfası. Her kalemde tasarım önizlemesi (ön/arka), renk, beden, adet, düzenle (editöre geri dön).
- Sepette: kupon alanı, ücretsiz kargo ilerleme çubuğu, tahmini teslim tarihi, güven rozetleri.
- **Checkout tek sayfa, adım göstergeli**: iletişim → adres (il/ilçe/mahalle seçimi, Türkiye adres formatı, telefon maskesi, TCKN/vergi no sadece gerektiğinde) → kargo → ödeme → özet.
- Misafir ödeme açık, hesap sonradan oluşturulabilir. Adres otomatik doldurma, hata mesajları alan bazında Türkçe.
- Ödeme sayfasında iyzico/PayTR logoları, 3D Secure bilgisi, "kart bilgilerin bizde saklanmaz" notu.
- Sipariş tamamlandı: özet, tahmini teslim, tasarım önizlemesi, sipariş takip linki.
- Hesap (`/account`): sipariş zaman çizelgesi (durum adımları görsel), yeniden sipariş, tasarımlarım grid'i, favoriler, adresler, kuponlar.

---

## 11. SEO — TEKNİK ve İÇERİK (ÜST SEVİYE)

### 11.1 Teknik altyapı
- Tüm içerik sayfaları **SSR/SSG/ISR** ile; kritik içerik JS'ye bağlı olmadan HTML'de bulunur.
- `generateMetadata` ile her sayfada: title (≤60 karakter), description (≤155), canonical, robots, OpenGraph, Twitter card, alternatif dil (ileride).
- `sitemap.xml` (ürün, kategori, tasarım, blog, landing ayrı parçalar; `lastmod` doğru), `robots.txt` (admin, hesap, sepet, checkout, filtre parametreleri engelli/noindex).
- Temiz URL: `/urun/siyah-oversize-tisort`, `/kategori/oversize-tisort`, `/tasarim/anime-xxx`. Slug değişirse otomatik **301 yönlendirme** (panelde Yönlendirme Yöneticisi).
- Tek H1, mantıklı H2–H3 hiyerarşisi, semantik HTML (`header/nav/main/section/article/footer`).
- Görsellerde anlamlı `alt`, dosya adı, `width/height` (CLS sıfır).
- İç linkleme: breadcrumb, ilgili ürün/kategori/blog, footer SEO linkleri; "ilgili içerik" blokları otomatik.
- 404/soft-404 yönetimi, sayfalama için canonical stratejisi, filtre sayfalarında index kontrolü.
- OG görselleri dinamik üretilir (ürün adı + mockup + fiyat).
- Uluslararasılaşmaya hazır yapı (`hreflang` altyapısı), şimdilik `tr-TR`.

### 11.2 Schema.org (JSON-LD, panelden alan bazlı kontrol)
Organization · WebSite (SearchAction) · BreadcrumbList · Product (offers, aggregateRating, review, availability, brand) · FAQPage · Article/BlogPosting · CollectionPage · LocalBusiness (varsa) · HowTo (nasıl çalışır / DTF rehberi) · VideoObject (varsa).
Schema, sayfadaki **görünür içerikle birebir uyumlu** olmalı (sahte yorum/puan yok).

### 11.3 GEO (yapay zekâ aramaları)
- Her ürün/kategori sayfasında özet, net, olgusal paragraf (ne, kimin için, malzeme, baskı tekniği, üretim/teslim süresi, fiyat aralığı, iade).
- `llms.txt` ve açıklayıcı "Hakkımızda / Baskı Teknikleri / Fiyatlandırma / Teslimat" sayfaları. Marka adı, adres, iletişim ve açıklama **her yerde tutarlı** (entity consistency).
- SSS blokları gerçek kullanıcı sorularıyla; kısa, doğrudan cevaplar.
- `robots.txt`'te yapay zekâ tarayıcıları için panelden izin/engel ayarı.

### 11.4 Programmatic SEO (kaliteli, tekrarsız)
Aşağıdaki sayfalar şablondan üretilir ama **her biri benzersiz içerik, benzersiz SSS, benzersiz örnek ve iç link** taşır:
`/kendi-tisortunu-tasarla`, `/oversize-tisort-tasarla`, `/hoodie-tasarla`, `/sweatshirt-tasarla`, `/cocuk-tisortu-tasarla`, `/dtf-baski`, `/dtf-baski-fiyatlari`, `/kurumsal-tisort-baski`, `/toplu-tisort-baski`, `/kisiye-ozel-tisort`, `/online-tisort-tasarimi`.
- Şehir/sektör varyasyonları (örn. "Antalya kurumsal tişört baskı", "okul/takım forması") sadece **gerçek ve faydalı içerik** varsa üretilir; ince/duplicate sayfalar `noindex`.
- Her sayfada: H1, giriş, fayda listesi, fiyat/üretim bilgisi, karşılaştırma tablosu, SSS, CTA, ilgili linkler, schema.

### 11.5 Blog
Kategoriler: Tişört Tasarım, DTF Baskı, Baskı Teknikleri, Moda, Streetwear, Gaming, Anime, Kurumsal Baskı. Yazar kutusu, güncelleme tarihi, içindekiler, okuma süresi, ilgili yazılar, yazıdan ürüne CTA. Yayın takvimi ve taslak/onay akışı panelde.

### 11.6 Panelden SEO yönetimi
Her sayfa/ürün/kategori/blog için: title, description, canonical, robots, OG görseli, schema aç/kapa, slug, yönlendirme. **Toplu düzenleme** tablosu, şablon değişkenleri (`{urun_adi} | {marka}`), SEO skor/uyarı göstergesi (başlık uzunluğu, eksik alt, boş açıklama), kırık link raporu.

---

## 12. PERFORMANS BÜTÇESİ (BAŞARI KRİTERİ)

Hedefler (mobil, 4G/orta cihaz, Lighthouse + gerçek kullanıcı verisi):

| Metrik | Hedef |
|---|---|
| LCP | < 2.0 sn (üst sınır 2.5) |
| CLS | < 0.05 (üst sınır 0.1) |
| INP | < 150 ms (üst sınır 200) |
| TTFB | < 600 ms |
| Lighthouse (Perf / A11y / SEO / BP) | 95+ / 100 / 100 / 100 |
| İlk yükleme JS (sayfa başına, gzip) | < 170 KB (editör hariç) |

Uygulama:

- Server Components öncelikli; `"use client"` yalnızca gereken yerde.
- Editör (Fabric/Konva), DTF oluşturucu, chart, rich-text **dynamic import + etkileşimde yükleme** (`next/dynamic`, `ssr:false`), prefetch yalnızca niyet (hover/focus) olunca.
- Hero görseli `priority`, `fetchpriority="high"`; geri kalan her şey lazy. Hero'da video yerine poster + gecikmeli video.
- ISR/`revalidateTag`: ürün, kategori, ana sayfa önbellekli; panelde değişiklik olunca ilgili etiketler anında yenilenir (**kullanıcı bekletmeden**).
- Veritabanı: doğru indeksler, N+1 yok, sayfalama, `select` ile sadece gereken alanlar; pahalı sorgular önbellekte (Redis/Upstash uyumlu).
- CDN ve görsel önbelleği: uzun `Cache-Control`, içerik hash'li dosya adı.
- Üçüncü taraf script'ler (Analytics, Pixel, sohbet) `afterInteractive/lazyOnload`, onay sonrası; Partytown veya benzeri değerlendirilebilir.
- Font: self-host, preload sadece kritik ağırlık.
- Paket analizi (`@next/bundle-analyzer`), CI'da **performans bütçesi aşılırsa build uyarısı/hatası**.
- Gerçek kullanıcı ölçümü (web-vitals → analytics), admin panelde Core Web Vitals kartı.

---

## 13. ERİŞİLEBİLİRLİK ve KALİTE

- WCAG 2.2 AA: klavye ile tam kullanım, görünür odak, ARIA doğru kullanımı, form etiketleri, hata mesajları `aria-live`, renk tek başına anlam taşımaz.
- Editörde klavye ve ekran okuyucu için alternatif (en azından katman listesi ve özellik paneli erişilebilir).
- Her sayfada 4 durum: **loading, empty, error, success**.
- Test: Vitest/Jest (birim), Playwright (kritik akış: tasarla → sepet → ödeme → sipariş; mobil + masaüstü), axe-core (erişilebilirlik), Lighthouse CI.
- Görsel regresyon testi (Playwright screenshot) temel sayfalarda.

---

## 14. HER ŞEY PANELDEN YÖNETİLEBİLİR (NO-CODE ADMIN CMS)

**Altın kural: Marka, görünüm, içerik, fiyat, SEO ve bölüm sıralaması için kod değiştirmek gerekmemeli.**

### 14.1 Tema ve marka (`/admin/appearance`)
- Logo (açık/koyu), favicon, marka adı, slogan
- Renk token'ları (renk seçici + kontrast uyarısı), light/dark varsayılanı
- Font ailesi (başlık/gövde), köşe stili, buton stili
- Canlı önizleme (masaüstü/tablet/mobil), **taslak → yayınla** ve **geri al (sürüm geçmişi)**

### 14.2 Sayfa/Bölüm oluşturucu (`/admin/pages`)
- Blok tabanlı: Hero, Kategori ızgarası, Ürün carousel, Banner, Özellik kartları, Nasıl çalışır, Yorumlar, SSS, Metin+görsel, Video, CTA, Bülten, DTF tanıtım, Kurumsal teklif formu, HTML/SEO metin bloğu.
- Sürükle-bırak sıralama, her blok için ayar paneli (metin, görsel, link, renk, boşluk, mobil/masaüstü görünürlük).
- Yeni landing sayfası oluşturma: slug, SEO alanları, şablon seç, yayınla/zamanla.
- A/B testi altyapısı (hero başlık/CTA varyantı).

### 14.3 Menü, banner, duyuru, popup
- Header/footer menüleri, mega menü içeriği, duyuru çubuğu, kampanya banner'ları, çıkış-niyeti/zamanlı popup (tarih aralığı, sayfa hedefleme, sıklık sınırı).

### 14.4 Katalog ve fiyat
- Ürün, varyant (renk/beden), stok, mockup şablonu, baskı alanı ölçüsü (cm), galeri.
- **Fiyat motoru**: baz fiyat, baskı fiyatı (ön/arka/ön+arka), özel renk, DTF tabaka fiyat listesi, toplu indirim basamakları, kupon, komisyon oranı — hepsi tablodan düzenlenir, **hardcoded değer yok**.
- Kargo ücreti kuralları, ücretsiz kargo eşiği, üretim süresi, tatil/kapalı günler (tahmini teslim tarihi buna göre hesaplanır).

### 14.5 İçerik
- Blog, SSS, hakkımızda, yasal sayfalar, e-posta şablonları (görsel editör + değişkenler), bildirim metinleri.
- Medya kütüphanesi: yükle, klasörle, otomatik WebP/AVIF, alt metin zorunluluğu uyarısı.

### 14.6 Entegrasyon ve ayarlar
- Analytics/GTM/Meta Pixel ID, ödeme anahtarları (şifreli saklama), kargo sağlayıcıları, e-posta, AI sağlayıcı seçimi, bakım modu, çerez metinleri, WhatsApp numarası, sosyal linkler, `robots.txt`/`llms.txt` düzenleyici.

### 14.7 Teknik kurallar
- Tüm ayarlar tipli şema (Zod) ile doğrulanır, DB'de saklanır, **önbellek etiketleriyle anında yayınlanır**.
- Rol bazlı yetki (içerik editörü, ürün yöneticisi, üretim, admin) ve **denetim kaydı** (kim neyi ne zaman değiştirdi).
- Taslak/yayın/zamanlama, sürüm geçmişi ve tek tıkla geri alma.
- Panel kendisi de hızlı ve modern olmalı: tablo (arama, filtre, toplu işlem, CSV dışa aktarım), klavye dostu, mobilde de kullanılabilir.

---

## 15. DOKÜMAN ve TESLİM

Her aşama sonunda şunları güncelle:

- `README.md` (kurulum, env, komutlar)
- `docs/design-system.md` (token'lar, bileşenler, kullanım kuralları)
- `docs/seo-playbook.md` (şablonlar, schema, yönlendirme, yayın kontrol listesi)
- `docs/admin-guide.md` (panelden neyi nasıl değiştiririm — Türkçe, ekran görüntüsüz bile anlaşılır)
- `docs/performance-report.md` (Lighthouse sonuçları, bütçe, yapılan optimizasyonlar)
- `DECISIONS.md` (verdiğin teknik/tasarım kararlar ve nedenleri)

---

## 16. UYGULAMA SIRASI (EKLENTİ FAZLARI)

Eski dosyadaki fazlara paralel çalış; görünüm işleri şu sırayla yapılır:

1. **Faz A — Temel:** Rekabet analizi dokümanı, design token'lar, tipografi, bileşen kütüphanesi, tema ayarlarının DB'ye bağlanması, header/footer/PromoBar.
2. **Faz B — Vitrin:** Ana sayfa (Bölüm Oluşturucu ile), kategori sayfası, ürün detay, arama, mini-cart.
3. **Faz C — Dönüşüm:** Editör UI (masaüstü + mobil), canlı mockup, sepet, checkout, hesap.
4. **Faz D — Büyüme:** SEO/GEO altyapısı, schema, sitemap, landing sayfaları, blog, yönlendirme yöneticisi.
5. **Faz E — Özel akışlar:** DTF oluşturucu UI, marketplace, tasarımcı paneli, kurumsal teklif.
6. **Faz F — Cila:** Performans bütçesi, erişilebilirlik denetimi, görsel regresyon, A/B test, admin deneyimi.

Her fazın sonunda: çalışan kod, geçen testler, Lighthouse raporu ve kısa değişiklik özeti bırak.

---

## 17. KABUL KRİTERLERİ (BİTTİ DEMEK İÇİN)

- [ ] 360 px ile 1920 px arasında hiçbir ekranda taşma, kayma, okunmaz metin yok
- [ ] Mobilde ürün → editör → sepet → ödeme akışı sorunsuz tamamlanıyor
- [ ] Lighthouse mobil: Performans 95+, Erişilebilirlik 100, SEO 100
- [ ] Core Web Vitals hedefleri tutuyor (LCP < 2.5 sn, CLS < 0.1, INP < 200 ms)
- [ ] Hero, bölümler, menü, renk, font, fiyat, SEO ve landing sayfaları **panelden kod yazmadan** değiştirilebiliyor
- [ ] Tüm ürün/kategori/tasarım/blog sayfalarında benzersiz title/description, canonical, schema, OG
- [ ] Sitemap, robots, llms.txt, yönlendirme yöneticisi çalışıyor
- [ ] Tüm sayfalarda loading/empty/error/success durumu var, teknik hata kullanıcıya gösterilmiyor
- [ ] Lorem ipsum, placeholder, kırık görsel, İngilizce kalıntı metin yok
- [ ] Light/Dark mod ve tüm token'lar tutarlı
- [ ] Demo veri (ürün, kategori, tasarım, kullanıcı, admin) ile site dolu ve gerçekçi görünüyor

---

## 18. BAŞLANGIÇ TALİMATI

1. Mevcut repository'yi ve önceki master prompt çıktısını analiz et (`package.json`, route'lar, bileşenler, Prisma şeması, stil dosyaları).
2. `docs/design-research.md` ve `DECISIONS.md` dosyalarını oluştur.
3. **Faz A'dan başla.** Soru sorma; mantıklı kararı kendin ver, geri dönüşü zor veya veri kaybı yaratacak işlemlerde (şema silme, toplu veri değişimi) dikkatli ol ve yedek al.
4. Her adımda çalışan, derlenen, test edilen kod bırak ve bir sonraki faza geç.
