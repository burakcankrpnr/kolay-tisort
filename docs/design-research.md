# Tasarım araştırması ve "bizim farkımız"

> **Durum:** Bu belge, web-to-print sektöründe yaygın bilinen UX kalıplarından derlenmiş **ilk taslaktır**. Prompt'un istediği canlı tarama (her sitede editöre kaç tıkta girildiği, mobil ölçümler) bu turda yapılmadı. Tablodaki gözlemler genel sektör bilgisine dayanır ve yayından önce sitelere tek tek girilerek doğrulanmalıdır. Hiçbir sitenin metni, görseli veya kodu kullanılmadı.

## İncelenecek siteler

Custom Ink, Printful, Spreadshirt, Zazzle, Vistaprint, Gelato, Printify, KolayTişört, Tisho, Baskı Tasarla, Tişörthane, T-ShirtBastir.

## Sektörde tekrar eden güçlü kalıplar

| Kalıp | Neden işe yarıyor | Bizde |
|---|---|---|
| Ürün sayfasından editöre tek tık | Karar yükünü azaltır | "Bu ürünü tasarla" birincil CTA, hero'da "Ürününü Tasarla" |
| Canlı mockup | Sonucu hayal etmeyi kolaylaştırır | Hero ve kartlarda gölgeli/ışıklı vektör mockup, renk değişiminde circular reveal |
| Fiyatın erken ve net gösterimi | Sürpriz maliyet terk oranını artırır | Kartlarda "başlayan" fiyat, ana sayfada DTF tabaka fiyat listesi |
| Toplu indirim tablosunun görünür olması | Kurumsal/takım siparişini teşvik eder | Ana sayfada basamak tablosu, SSS'de açık oranlar |
| Üretim/teslim süresinin erken gösterimi | Güven ve planlama | Duyuru çubuğu, hero altı bilgi şeridi, güven şeridi |
| Güven rozetleri | Ödeme kaygısını azaltır | 3D Secure, iyzico/PayTR, DPI kontrolü |

## Sık görülen hatalar

- Karmaşık, masaüstü odaklı editör; mobilde sıkışık araç çubuğu.
- Baskı alanının ölçüsüz/belirsiz gösterilmesi.
- Kargo ve üretim süresinin ancak ödeme adımında ortaya çıkması.
- Düşük kaliteli stok görseller, şablon e-ticaret görünümü.
- Ağır efekt/carousel kütüphaneleri yüzünden yavaş mobil açılış.

## Bizim farkımız (10 nokta)

1. **Editöre sıfır sürtünme**: Ana sayfa, ürün kartı ve ürün sayfasından tek tıkla editör.
2. **Fiyat şeffaflığı**: "başlayan" fiyat her kartta, DTF tabaka fiyatları ana sayfada, toplu indirim oranları açık.
3. **Süre şeffaflığı**: Üretim süresi ilk ekranda (duyuru çubuğu + hero).
4. **DPI güvencesi**: 300 DPI altı yüklemelerde uyarı; vaat ana sayfada açık.
5. **Mobil birinci sınıf**: Alt gezinme çubuğu, tam ekran menü, 44 px dokunma hedefleri.
6. **Hız**: Efektlerin çoğu saf CSS; ana sayfada animasyon kütüphanesi yüklenmiyor, CLS 0.
7. **Erişilebilir hareket**: `prefers-reduced-motion` ve zayıf cihazda efektler otomatik kapanır; içerik hiçbir zaman animasyona bağlı değil.
8. **Koyu mod**: Tüm token'lar açık/koyu uyumlu, manuel anahtar.
9. **Kod gerektirmeyen yönetim**: Marka, renk, font, köşe, efekt yoğunluğu, duyuru panelden; taslak/önizleme/geri alma ile.
10. **Dürüst sosyal kanıt**: Sahte sayaç/yorum yok; yalnızca doğrulanabilir değerler ve gerçek yorumlar.

## Yapılacak doğrulama

- Her site için: editöre giriş tık sayısı, mobil ürün sayfası yapısı, fiyat gösterim biçimi, kargo/üretim süresinin göründüğü adım.
- Sonuçlar bu tabloya işlenmeli ve "Bizim farkımız" listesi gerekirse güncellenmeli.
