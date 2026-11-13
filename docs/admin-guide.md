# Yönetim paneli rehberi — Görünüm ve efektler

Adres: **Yönetim → Görünüm** (`/admin/gorunum`). Yalnızca admin rolü erişir.

## Nasıl çalışır?

Her bölümün (Marka, Tema, Efektler, Duyuru çubuğu) altında üç düğme vardır:

1. **Taslak kaydet** — Değişikliği saklar, ziyaretçiler görmez.
2. **Yayınla** — Taslağı herkes için canlıya alır. Sayfa yenilenmesi beklemeden yansır.
3. **Taslağı sil** — Yayınlamadan vazgeçer.

**Sürüm geçmişi**: Her yayın bir sürüm olarak saklanır. "Bu sürüme dön" eski değeri yeni bir sürüm olarak yayına alır.

**Canlı önizleme**: Sağdaki çerçeve siteyi masaüstü / tablet / mobil genişlikte gösterir. "Taslakları önizle" kutusunu işaretlersen yalnızca *senin* tarayıcında taslaklar görünür (1 saat). Ziyaretçiler her zaman yayındaki hâli görür.

**Denetim kaydı**: Sayfanın altında kim neyi ne zaman kaydetti/yayınladı listelenir.

## Marka

Marka adı, alan adı, slogan, açıklama (arama motoru açıklaması ve footer'da kullanılır), destek e-postası, WhatsApp numarası (boş bırakılırsa sağ alttaki WhatsApp butonu gizlenir), Instagram adresi.

## Tema

- **Vurgu rengi**: Butonlar ve vurgular. Tek renk kullanın.
- **Zemin / Metin / Çizgi**: Açık ve koyu tema için ayrı.
- Kontrast satırı yeşilse renk WCAG AA'ya uygundur; turuncu uyarı görürseniz metin okunması zor demektir.
- **Başlık / gövde fontu**, **köşe stili** (keskin, yumuşak, yuvarlak), **varsayılan tema** (sistem, açık, koyu). Ziyaretçi header'daki ay/güneş düğmesiyle kendi tercihini seçebilir.

## Efektler

- **Efekt yoğunluğu**: Kapalı · Hafif · Normal (önerilen) · Şov.
- **Mobil için yoğunluk**: Telefonda farklı seviye isterseniz.
- **Animasyon hızı**: Yavaş / Normal / Hızlı.
- **Tek tek efektler**: "Otomatik" seviyeye uyar; "Açık"/"Kapalı" seviyeden bağımsız zorlar.
- **Sayaçlar**: Ana sayfadaki rakamlar. Yalnızca doğru ve kanıtlanabilir değerler girin.

Hareketi azaltmayı seçmiş ziyaretçilerde, yavaş bağlantıda ve zayıf cihazlarda ağır efektler kendiliğinden kapanır; bunun için bir şey yapmanız gerekmez.

## Duyuru çubuğu

Aç/kapa, metin (en fazla 160 karakter), bağlantı, başlangıç ve bitiş tarihi. Tarih aralığı dışında çubuk kendiliğinden gizlenir.

## Diğer içerik

Hero başlığı/metni ve SSS: **Yönetim → İçerik**.

---

# Tasarım stüdyosu (müşteri tarafı)

Adres: **Kendin Tasarla → ürün seç** (`/tasarla/<ürün>`).

| Araç | Ne yapar |
|---|---|
| Yükle | PNG/JPG/WebP/SVG yükleme, sürükle-bırak, Ctrl+V ile yapıştırma, son yüklenenler |
| Metin | Hazır yazı stilleri (başlık, el yazısı, kavisli, konturlu, gölgeli) |
| Şablon | 8 hazır kompozisyon (kolej, takım forması, doğum günü, kurumsal logo…) |
| Grafik | 36 vektör ikon + onaylı tasarımcı işleri |
| Şekil | Kare, daire, üçgen, yıldız, kalp, rozet, çizgi |
| AI | Kısa fikirden kompozisyon (uzak AI anahtarı yoksa yerel önizleme) |
| Katman | Sıralama (sürükle), gizle, kilitle, yeniden adlandır, DPI uyarısı |
| Ürün | Kumaş rengi, ürün değiştirme (tasarım korunur) |

Sağ panel: yazı/font (17 Türkçe destekli font), boyut, harf/satır aralığı, kavis, renk, kontur, gölge; görselde DPI rozeti, beyaz arka plan temizleme, siyah-beyaz/parlaklık/kontrast; konum ve boyut **cm** cinsinden; baskı alanına hizalama; öne/arkaya; yatay/dikey çevirme; kilit; opaklık.

Tuval: pembe hizalama kılavuzları (snap), 5 cm ızgara, cm cetvel, baskı alanı dışı soluk gösterim, gerçekçi önizleme (kumaş gölgesi), zoom ve mobilde iki parmakla yakınlaştırma. Taslak her değişiklikte tarayıcıya otomatik kaydedilir.

**Sepete eklerken** her dolu yüz için 35×40 cm, 300 DPI, şeffaf PNG baskı dosyası otomatik üretilir. Yönetimde **Siparişler → sipariş detayı** sayfasında "Ön/Arka baskı dosyası" düğmeleriyle indirilir; üretime doğrudan bu dosyalar gönderilir.

Kısayollar: Ctrl+Z/Y geri al/yinele · Ctrl+D kopyala · Delete sil · oklar 1 px (Shift 10 px) · ] / [ öne/arkaya · + / − / 0 zoom · Ctrl+S hesaba kaydet · ? kısayol listesi.
