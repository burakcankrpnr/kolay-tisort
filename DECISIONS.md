# Kararlar

Bu dosya, `02-GORUNUM-UIUX-SEO-PERFORMANS` ve `03-EFEKT-ANIMASYON-WOW` katmanlarını uygularken verilen teknik ve tasarım kararlarını kayıt altına alır. En yeni karar en üstte.

## 2026-11-13 — Tüm sayfalar + Tasarım Stüdyosu (2. tur)

### Tasarım stüdyosu (`features/design-editor/`)
- **Modüler yapı**: `model.ts` (veri modeli, cm↔px, DPI), `canvas.tsx` (Konva tuvali), `panels.tsx` (sol araçlar), `properties.tsx` (sağ özellikler), `assets.tsx` (şablonlar, ikonlar, şekiller), `fonts.ts` (17 self-host font), `export.ts` (baskı dosyası), `editor.tsx` (durum ve düzen).
- **Tam ekran stüdyo**: Editör `fixed inset-0` katmanında açılır; site header/footer'ı arkada kalır. Masaüstü: araç rayı + panel + tuval + özellikler/sipariş. Mobil: alt araç çubuğu, sürüklenebilir alt sayfalar, seçili öğe için bağlamsal çubuk, iki parmakla zoom.
- **Koordinat sistemi**: Mantıksal sahne 600×690, baskı alanı 240 px = 35 cm. Tuval görüntü ölçeği ResizeObserver ile hesaplanır; veri ölçekten bağımsızdır. Eski kayıtlar `normalizePieces` ile eksik alanları varsayılanla tamamlanarak açılır.
- **Şekiller tek tip**: Tüm şekiller (kare, daire, yıldız, kalp, rozet, çizgi) yerel kutuda `Konva.Path` ile çizilir; çevirme/boyutlandırma her şekilde aynı çalışır.
- **İkonlar**: Lucide ikonlarının vektör verisi (`__iconNode`) doğrudan SVG'ye çevrilir; React kökü açılmaz, renk ve çizgi kalınlığı değiştirilebilir, her boyutta keskin.
- **Fontlar**: `next/font` ile self-host, `latin-ext` (Türkçe), `preload: false`. Canvas'a çizmeden önce `document.fonts.load` beklenir; yüklenince tuval yeniden ölçülür.
- **Geçmiş**: 60 adım geri al/yinele. Slider sürüklemeleri aynı anahtar altında birleşir (her piksel ayrı adım olmaz).
- **Otomatik taslak**: `localStorage` (`studio-draft-v2`), ürün değişse de taslak korunur; sepete eklenince temizlenir. Hesaptaki tasarımlar `?tasarim=<id>` ile stüdyoda açılır.
- **Baskı dosyası (üretim için kritik)**: Sepete eklerken her dolu yüz için ekrandaki tuvalden bağımsız, görünmez bir Konva sahnesinde **35×40 cm @ 300 DPI (4133×4719 px) şeffaf PNG** üretilir, `/api/uploads`'a yüklenir ve `DesignLayer(kind="print-file")` olarak saklanır. Sipariş anında `designSnapshot.printFiles` içine kopyalanır; yönetimde "Ön/Arka baskı dosyası" olarak indirilir. Önceden siparişe ürün önizlemesi (mockup) gidiyordu.
- **Sunucu aksiyonuna base64 gönderilmez**: Önizleme ve baskı dosyaları multipart yükleme ile gider (server action 1 MB sınırı). Sunucu yalnızca kendi yükleme yolumuzdaki URL'leri kabul eder.
- **Yerel "AI"**: Uzak AI anahtarı yokken üretim yerel SVG kompozisyonudur ve arayüz bunu açıkça söyler.

### Ticari mantık düzeltmeleri
- **Toplu indirim gerçekten uygulanıyor**: `bulkDiscount` tanımlıydı ama ödeme akışı uygulamıyordu; sitede "otomatik toplu indirim" yazdığı için `pricedCart` artık DTF hariç tekstil satırlarının toplam adedine göre indirimi hesaplıyor, kupon indirim sonrası tutara uygulanıyor. Sepet, ödeme özeti ve sipariş toplamı aynı kuralı kullanır.
- **Satır başına adet sınırı 10 → 500** (`MAX_LINE_QUANTITY`): 10/20/50 adet indirim basamakları 10 adet sınırıyla ulaşılamazdı. Stok kontrolü değişmedi.
- **Kurumsal teklif fiyatı sunucuda**: Teklif aksiyonu birim fiyatı formdan (istemciden) alıyordu. Artık seçilen ürünün taban fiyatı + baskı ücretinden sunucuda hesaplanır.

### Yükleme güvenliği
- `public/` klasörü production'da yalnızca build anındaki dosyaları sunar; çalışma zamanında yüklenen görseller kırık görünüyordu. Yeni yüklemeler `/api/uploads/<uuid>.<uzantı>` route'undan sunulur: ad UUID desenine sıkı bağlı (dizin gezinmesi yok), `nosniff`, SVG'ler için `sandbox` CSP (yüklenen SVG içindeki betik çalışamaz), uzun önbellek. Eski `/uploads/...` yolları geçerli kalır.

### Sayfalar
- Ortak `PageHeader` (breadcrumb + BreadcrumbList şeması), `AuthShell`, `OrderTimeline` bileşenleri. Ürün listesinde sıralama (önerilen/yeni/fiyat), arama + kategori çipleri, boş durum; arama/sıralama varyasyonları `noindex`.
- Ürün detayı: renk değişiminde circular-reveal galeri, ön/arka görünüm, beden tablosu diyalogu, canlı toplam, toplu indirim tablosunda aktif basamak vurgusu, takvim tarihiyle teslim aralığı (`lib/delivery.ts`, hafta sonu atlanır), mobil sabit CTA, benzer ürünler.
- Ödeme: 4 adımlı stepper, kart tipi kargo/ödeme seçimi, TR telefon maskesi, 81 il önerisi, hatada sallanma, canlı fiyat özeti.
- Yasal metin sayfaları (KVKK, mesafeli satış sözleşmesi) projede olmadığı için formlarda bu belgelere atıf yapan onay metinleri kullanılmadı; yalnızca "bilgilerimin doğru olduğunu ve kişiye özel üründe cayma hakkı olmadığını biliyorum" onayı var. Bu sayfalar yayından önce eklenmelidir.
- Yönetim paneli: kenar menü, özet ekranında 14 günlük ciro grafiği, iş kuyruğu, düşük stok; eski formlar `.admin-ui` kapsam CSS'iyle (katmansız, utility'lerden güçlü) yeni tasarım diline çekildi.

## 2026-11-13 — Görünüm, efekt ve SEO katmanı (1. tur)

### Ayarlar ve panel
- **Tek tablo, anahtar başına JSON (`SiteSetting`)**: `brand`, `theme`, `effects`, `promo` anahtarları. Her biri Zod şemasıyla (`lib/settings-schema.ts`) doğrulanır; bozuk/eksik kayıt varsayılanlara düşer, site asla çökmez. Yeni ayar eklemek = şemaya alan eklemek, migrasyon gerekmez.
- **Taslak → yayınla → geri al**: `value` yayındaki, `draft` kaydedilmiş ama yayınlanmamış değer. Her yayın `SiteSettingVersion`'a yazılır; geri alma eski değeri *yeni sürüm* olarak yayınlar (geçmiş silinmez). Tüm işlemler `AuditLog`'a yazılır.
- **Önizleme**: Admin, `settings_preview` çerezini açınca (yalnızca kendi tarayıcısında, 1 saat) site taslakları gösterir. Ziyaretçiler etkilenmez. Panel içi iframe masaüstü/tablet/mobil genişliklerde gerçek siteyi gösterir.
- **Panel yolu `/admin/gorunum`**: Prompt `/admin/appearance/effects` diyor; projedeki tüm rotalar Türkçe olduğu için tutarlılık adına Türkçe yol seçildi. Efektler aynı sayfanın "Efektler" bölümünde.
- **Önbellek**: Kök layout zaten `force-dynamic` (oturum + sepet). Ayarlar istek başına tek sorguyla (`React.cache`) okunur; yayında `revalidatePath("/", "layout")` çağrılır. Ayrı bir Redis katmanına şimdilik gerek görülmedi.

### Marka
- Varsayılan marka adı prompt gereği **StylingPark**. Koda gömülü değil; panelden (Marka → Marka adı) değiştirilir. Eski "Katman" adı yalnızca demo hesap e-postalarında (`@katman.test`) kaldı.

### Tasarım token'ları
- Renkler `globals.css` içinde HSL bileşeni olarak (`--primary: 14 100% 50%`), Tailwind v4 `@theme inline` ile `bg-primary`, `text-muted-foreground` vb. sınıflara bağlandı. Eski sınıflar (`ink`, `paper`, `press`, `line`, `concrete`) token takma adı olarak korundu → mevcut sayfalar kırılmadan açık/koyu temaya uyar.
- Koyu mod: `html[data-theme="dark"]`. İlk boyamadan önce çalışan küçük betik (`next/script` `beforeInteractive`) tercihi uygular → FOUC yok. Manuel anahtar header'da.
- Fontlar: Başlık **Bricolage Grotesque** (varsayılan), Space Grotesk, Barlow Condensed; gövde **Inter** (varsayılan), Barlow. Hepsi `next/font` ile self-host, `latin-ext` (Türkçe). Varsayılan olmayanlar `preload: false`; tarayıcı yalnızca CSS'te kullanılanı indirir.
- Köşe stili (keskin/yumuşak/yuvarlak) `--r-card`/`--r-control` değişkenleriyle; Tailwind'de `rounded-card`, `rounded-control`.

### Efekt mimarisi
- **Tek sağlayıcı, sıfır kütüphane**: `components/effects/effects-provider.tsx` panel ayarını + cihaz koşullarını (reduced-motion, saveData/yavaş ağ, zayıf CPU/RAM, dokunmatik, mobil) birleştirip her efekt için açık/kapalı kararı verir ve `html[data-fx-*]` özniteliklerini yazar. Efektlerin çoğu bu özniteliklere bakan **saf CSS**'tir (marquee, mesh gradient, grain, kart parıltısı, buton dolgusu).
- **Olay delegasyonu**: Spotlight, 3D tilt (maks. 6°) ve magnetic buton, belgeye bağlı tek bir `pointermove` dinleyicisiyle (rAF kısıtlı) çalışır. Kartlar sunucu bileşeni olarak kalır, kart başına JS yoktur.
- **Scroll reveal**: Tek `IntersectionObserver` + yeni eklenen düğümler için `MutationObserver`. İlk taramada ekranda olan içerik *asla* gizlenmez (titreme yok); sadece ekran altı öğeler canlanır, `once` davranışı.
- **Kinetik başlık ve LCP**: Prompt "maskeden yukarı kayan" metin istiyor, 02 numaralı dosya ise "LCP öğesi animasyonla gizlenmez" diyor. Çakışmada performans kuralı geçerli olduğu için maske/kırpma kaldırıldı: kelimeler görünür hâlde, yalnızca `transform` ile 0.45em aşağıdan yerine oturur. Öznitelik sunucuda basılır; animasyon ilk boyamada başlar.
- **Kullanılmayanlar ve nedenleri**:
  - *Lenis (yumuşak kaydırma)*: Klavye/anchor/ekran okuyucu davranışını bozma riski ve ek ~10 KB. Yerine native kaydırma. Panelde anahtarı yok.
  - *GSAP/ScrollTrigger*: Sticky "Nasıl çalışır" `position: sticky` + `IntersectionObserver` ile yapıldı; pin/scrub gerektiren sahne yok.
  - *React Three Fiber / 3D model*: Gerçek 3D model dosyası yok; ~150 KB+ kütüphane ana sayfa bütçesini aşar. Hero'da vektör mockup + fare parallax'ı + ışık kayması + circular-reveal renk değişimi kullanıldı. Gerçek GLB modeller hazır olduğunda `<Effect name="heroParallax">` arkasında lazy yüklenebilir.
  - *View Transitions API*: Next 16 istemci gezinmesinde güvenilir değil; `app/template.tsx` ile yalnızca istemci içi gezinmede kısa fade-up (ilk yüklemede asla).
- **Konfeti**: 2 KB'lık kendi canvas kodu, yalnızca kutlama anında dinamik import (`components/effects/confetti.ts`). Sipariş "ödendi" sayfasında bir kez (sessionStorage) patlar.
- **Ses**: Şemada var, varsayılan ve "Otomatik" modda kapalı; henüz ses dosyası bağlanmadı.

### İçerik dürüstlüğü
- Ana sayfa sayaçları uydurma rakam içermez. Varsayılanlar mevcut kod/iş kurallarından türetildi: 3 iş günü üretim, 300 DPI kontrol, %15'e kadar toplu indirim (`lib/pricing.ts`), 4 kargo firması. Panelden değiştirilebilir; panel "doğrulanabilir değer girin" uyarısı gösterir.
- Yorumlar bölümü yalnızca veritabanında gerçek 4+ yıldızlı yorum varsa görünür. `aggregateRating` şeması yalnızca gerçek yorum varsa basılır.
- Duyuru çubuğu varsayılanı "ücretsiz kargo" iddiası içermez (kodda ücretsiz kargo eşiği yok).

### SEO
- `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts` eklendi. Panel, hesap, sepet, ödeme, API ve giriş sayfaları `robots.txt`'te engelli.
- Şehir varyasyon sayfaları (`/baski/[city]/[category]`) şu an benzersiz içerik taşımadığı için `noindex, follow` ve sitemap dışı.
- JSON-LD: Organization + WebSite(SearchAction) (layout), FAQPage (ana sayfa), Product + AggregateOffer + BreadcrumbList (ürün), BlogPosting (blog).

### Bilinçli olarak sonraya bırakılanlar
- Rekabet analizi canlı tarama ile doğrulanmadı (bkz. `docs/design-research.md`).
- Lighthouse CI kurulmadı; bu oturumda Lighthouse çalıştırılamadı (bkz. `docs/performance-report.md`).
- Bölüm oluşturucu (sürükle-bırak ana sayfa), mega menü, ⌘K arama, mini-cart drawer, sepete uçan ürün animasyonu, editör/DTF efektleri, sezon temaları: sonraki turlar.
