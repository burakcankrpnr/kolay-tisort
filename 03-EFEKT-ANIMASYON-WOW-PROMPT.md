# EFEKT, ANİMASYON ve "WOW" KATMANI — MASTER PROMPT (v3)

> Bu dosya `01-MASTER` (özellikler) ve `02-GORUNUM-UIUX-SEO-PERFORMANS` dosyalarının **üzerine** eklenir.
> Görev: Siteyi **asil, modern, yeni nesil ve ilk saniyede dikkat çeken** bir deneyime dönüştürmek.
> Çakışma kuralı: Efekt kararlarında bu dosya geçerli; **hız, erişilebilirlik ve SEO kuralları (02 numaralı dosya) her zaman efektlerden önce gelir.**

---

## 0. ALTIN KURAL: "ŞOV VAR AMA SİTE HIZLI"

Efektler **süs değil, satış aracıdır.** Her efekt şu üç sorudan geçmeli:

1. Ürünü veya tasarlama deneyimini daha çekici yapıyor mu?
2. LCP/CLS/INP hedeflerini bozmuyor mu? (LCP < 2.5 sn, CLS < 0.1, INP < 200 ms)
3. Mobilde ve zayıf cihazda sorunsuz çalışıyor mu, ya da zarifçe kapanıyor mu?

Üçüne "evet" diyemeyen efekt eklenmez.

Zorunlu güvenlik ağları:

- `prefers-reduced-motion: reduce` → tüm hareketli efektler kapanır, statik ve şık hâl kalır.
- Düşük güçlü cihaz / `saveData` / yavaş bağlantı algılanınca ağır efektler (3D, parçacık, video) otomatik devre dışı.
- Dokunmatik cihazda imleç efektleri, hover efektleri yerine dokunma geri bildirimi kullanılır.
- Animasyonlar sadece `transform` ve `opacity` üzerinden yapılır (GPU). `width/height/top/left` animasyonu yok.
- LCP öğesi (hero ana görsel/başlık) **animasyonla gizlenmez**; içerik her zaman HTML'de görünür başlar.
- Efekt kütüphaneleri **dynamic import** ile, sadece o bölüm ekrana yaklaşınca yüklenir.

### 0.1 Panelden "Efekt Yoğunluğu" ayarı (zorunlu)
`/admin/appearance/effects` altında tek ana anahtar:

| Seviye | Ne yapar |
|---|---|
| **Kapalı** | Sadece temel geçişler |
| **Hafif** | Fade/slide, hover, mikro etkileşimler |
| **Normal** (varsayılan) | + Scroll animasyonları, kart tilt, marquee, text reveal |
| **Şov** | + 3D ürün, imleç efektleri, parçacıklar, parallax, sayfa geçişleri |

Her efekt ayrıca tek tek açılıp kapatılabilir (aşağıdaki listedeki her madde bir ayar anahtarıdır). Değişiklik kod gerektirmeden yayınlanır.

---

## 1. GENEL HİSSİYAT (ART DIRECTION)

- **Dil:** "Quiet luxury × streetwear." Sakin, geniş, güven veren; ama hareket ve ritmiyle canlı.
- **Kullanılacak modern trendler:** Bento grid düzenleri, kinetik tipografi, büyük (oversized) başlıklar, ince grain/noise dokusu, yumuşak mesh gradient, cam (glass) yüzeyler, ince çizgili kartlar, yatay kayan şeritler, sticky storytelling, 3D ürün.
- **Vurgu rengi tek** kalır; efektler renkle değil **hareket, ışık ve derinlikle** çarpıcı olur.
- Işık ve gölge: imleci/fareyi takip eden hafif "spotlight" parıltısı, kart kenarlarında ince gradient border.

---

## 2. KÜTÜPHANE ve TEKNİK ALTYAPI

Gerçekten gerekenleri kullan, gereksiz bağımlılık ekleme. Mevcut `package.json`'ı kontrol et.

| İhtiyaç | Araç |
|---|---|
| UI animasyonu, sayfa geçişleri, layout animasyonu | Framer Motion (`motion`) |
| Scroll'a bağlı sahneler, pin, timeline | GSAP + ScrollTrigger **veya** CSS `animation-timeline: scroll()` (destekleyen tarayıcıda, fallback ile) |
| Yumuşak kaydırma | Lenis (panelden kapatılabilir; editör ve modal içinde devre dışı) |
| 3D ürün/tişört | React Three Fiber + drei **veya** `<model-viewer>` (sadece "Şov" seviyesinde, lazy) |
| Sayfa geçişi | View Transitions API (destek yoksa Framer fade) |
| Konfeti/kutlama | Çok hafif canvas konfeti (sadece olay anında yüklenir) |
| Lottie | Sadece küçük ikon animasyonları, lazy |

Kural: Her efekt bileşeni `components/effects/` altında **izole, ayarla kontrol edilen ve boş bırakıldığında hiçbir şey yüklemeyen** bir wrapper olmalı (`<Effect name="tilt-card" fallback={children}>`).

---

## 3. İLK İZLENİM: AÇILIŞ ve HERO

1. **Hero kinetik tipografi:** "Kendi Tasarımını Giy." kelime kelime maskeden yukarı kayarak (text reveal) açılır. Metin SEO için HTML'de tam durur; animasyon sadece CSS/transform.
2. **Canlı ürün sahnesi:** Hero'da dönen/hafifçe sallanan 3D (veya yüksek kaliteli çok açılı görsel) tişört/hoodie. Fare hareketine göre hafif parallax + ışık değişimi. Altında renk noktaları: tıklayınca ürün rengi **akıcı geçişle** değişir (dolgu efekti, circular reveal).
3. **Arka plan:** Çok yavaş hareket eden mesh gradient + ince grain katmanı. Video arka plan gerekirse sıkıştırılmış, poster'lı, gecikmeli yükleme.
4. **Alt kısımda kayan şerit (marquee):** "DTF BASKI · KİŞİYE ÖZEL · OVERSIZE · HOODIE · KURUMSAL" ters yönlü iki sıra; hover'da yavaşlar.
5. **Scroll göstergesi:** İnce animasyonlu ok/çizgi.
6. **İlk yükleme (opsiyonel, kısa):** Maksimum 600 ms marka açılışı. **İçeriği geciktirmez**, ilk ziyarette bir kez; panelden kapatılabilir.

---

## 4. SCROLL DENEYİMİ (SAYFA AKIŞI)

- **Sticky hikâye bölümü "Nasıl çalışır?":** Kullanıcı kaydırdıkça solda 4 adım yazısı sırayla vurgulanır, sağda sabit cihaz/ürün görseli adıma göre değişir (yükle → yerleştir → önizle → sipariş).
- **Sayfa ilerleme çubuğu:** Üstte ince, marka renginde okuma/scroll ilerlemesi (blog ve uzun sayfalarda).
- **Bölüm girişleri:** Fade-up + hafif ölçek; liste/kartlarda **stagger** (60–80 ms arayla). Aynı animasyon tekrar tekrar oynamaz (`once: true`).
- **Parallax:** Sadece dekoratif görsellerde, düşük genlikli (±40 px). Metinde parallax yok.
- **Yatay scroll vitrin:** "Çok satanlar" bölümünde sayfa dikey kaydırılırken ürünler yatay akar (sticky pin), mobilde normal swipe carousel.
- **Sayı sayaçları:** "12.000+ baskı", "4.9 puan" gibi değerler görünür olunca sayarak artar (değerler panelden).
- **Kıyaslama slider'ı:** "Önce / Sonra" — düz görsel → baskılı ürün, sürüklenebilir ayırıcı.
- **Yumuşak kaydırma (Lenis):** Hafif, hızlı; anchor linkleri ve erişilebilirliği bozmaz.

---

## 5. KART, BUTON ve MİKRO ETKİLEŞİMLER

**Ürün/tasarım kartı**
- Hover: ikinci görsel çapraz geçişle gelir, kart 4–6 px yükselir, ince gradient kenarlık parlar, "Hızlı bak" butonu alttan kayar.
- Fareyle **3D tilt** (maks. 6°) + parıltı (glare) — sadece masaüstü, "Normal" ve üstü.
- Renk noktalarının üstüne gelince görsel o renge geçer.
- Favori kalbi: tıklayınca küçük "pop" + parçacık patlaması.

**Butonlar**
- Primary CTA: hover'da dolgu içeriden dışa genişler, ok ikonu kayar; **magnetic** etkisi (imleç yaklaşınca hafif çekilir, masaüstü).
- Basınca (`active`) hafif küçülme, yüklemede şık spinner/ilerleme.
- "Sepete ekle": tıklayınca ürünün küçük görseli sepet ikonuna **uçar**, sepet rozeti "zıplar", mini-cart açılır, küçük kutlama.

**Genel**
- Spotlight efekti: Fare konumunu takip eden yumuşak ışık (bento kartları, fiyat tablosu).
- Linklerde çizgi animasyonu (alt çizgi soldan sağa açılır).
- Input odak: kenarlık parlaması + etiket yukarı kayar (floating label).
- Toast'lar yaylı (spring) animasyonla girer.
- Skeleton'lar shimmer ile; **yükleme hissi daha hızlı algılanır**.
- Özel imleç (sadece "Şov", masaüstü): Normalde küçük nokta + halka; ürün kartında "Gör", sürüklenebilir alanda "Sürükle" yazar. Metin/form alanlarında normal imleç döner.

---

## 6. BENTO GRID ve GÖRSEL DOKU

- Kategoriler ve özellikler **bento grid** (farklı boyutlu kartlar) ile sunulur; her kartın içinde küçük hareketli detay (dönen tişört, kayan renk paleti, mini editör önizlemesi).
- Kartlarda hafif cam efekti (`backdrop-filter`) yalnızca birkaç yerde (performans için sınırlı).
- Grain/noise katmanı: tek küçük tekrarlayan dosya, `pointer-events: none`, düşük opaklık.
- Bölüm geçişleri: eğri/dalga kesitleri yerine **ince çizgi, büyük sayı numaraları (01, 02…)** ve editoryal düzen.
- Tipografide dev ghost-text (arka planda çok silik dev kelime: "TASARLA") parallax ile hafif kayar.

---

## 7. ÜRÜN SAYFASI EFEKTLERİ

- Galeri: akıcı swipe, çift dokunma/çift tıklama zoom, büyüteç (lens) modu masaüstünde.
- **Renk değişiminde mockup geçişi:** Kumaş rengi circular-reveal ile değişir, tasarım katmanı sabit kalır.
- **360° döndürme:** Sürükleyerek veya 3D model ile (varsa); yoksa 8–12 karelik sprite.
- Fiyat değişince rakamlar **yukarı/aşağı kayarak** güncellenir (odometer efekti).
- Beden tablosu ve toplu indirim tablosu görününce satırlar sırayla belirir; kullanıcının adedine denk gelen basamak vurgulanır.
- Alt sabit CTA çubuğu (mobil): kaydırma yönüne göre akıllı gizlenir/gösterilir.
- "Şu an X kişi bu ürüne bakıyor / Son 24 saatte Y adet satıldı" gibi **sadece gerçek veriye dayalı** sosyal kanıt (sahte sayaç yok), panelden aç/kapa.

---

## 8. TASARIM EDİTÖRÜ — "PROFESYONEL STÜDYO" HİSSİ

Editör; Canva/Figma kalitesinde akıcı hissettirmeli ama **60 fps'den ödün vermez**.

- Panel ve araç geçişleri: spring animasyon, bottom sheet'lerde sürükleyerek açılma/kapanma.
- Nesne seçildiğinde: kontrol tutamaçları nazikçe belirir; hizalama kılavuzlarında **mıknatıs hissi** (snap anında kısa titreşim/haptic mobilde).
- Baskı alanı: kesikli çerçeve hafifçe "nefes alır"; kullanıcı alan dışına taşırsa taşan kısım soluklaşır ve uyarı yumuşakça çıkar.
- Görsel yüklenince: ilerleme halkası → görsel canvas'a **yumuşak ölçek animasyonuyla** düşer, DPI rozeti belirir (yeşil/sarı/kırmızı).
- Arka plan kaldırma / AI üretimi: **shimmer + ilerleme** animasyonu, sonuç "sihirli" bir geçişle (wipe) açılır.
- Geri al/ileri al: nesneler anında değil kısa geçişle yerine döner.
- "Tasarım tamam" anı: ürün mockup'ına kamera yakınlaşması hissi + küçük kutlama, ardından fiyat ve "Sepete ekle" öne çıkar.
- Gerçekçi önizleme: kumaş dokusu, hafif kıvrım gölgesi ve ışık katmanı (multiply/overlay) ile baskı kumaşa oturmuş görünür.

---

## 9. DTF ve KURUMSAL SAYFALARI

- DTF tabaka: **AUTOFIT** basılınca tasarımlar rastgele uçuşmaz; hedef konuma akıcı spring ile yerleşir, doluluk yüzdesi sayarak yükselir (%62 → %91).
- Çakışma uyarısı: kırmızı yumuşak titreşim; geçerli yerleşimde yeşil çerçeve.
- Fiyat tablosu ve toplu indirim basamakları: kullanıcı adedi değiştirdikçe "indirim kazandın" rozeti animasyonla belirir.
- Kurumsal teklif formu: adım adım (stepper), her adım geçişi akıcı; gönderince başarılı durumda çizilen onay (check-draw) animasyonu.

---

## 10. SEPET, ÖDEME, SİPARİŞ SONRASI

- Ücretsiz kargo çubuğu: dolarken akıcı ilerler, eşik geçilince kısa kutlama.
- Checkout adımları arasında kayma geçişi; hata olan alana yumuşak kaydırma + sallanma (shake).
- Sipariş tamamlandı: **konfeti + çizilen onay işareti**, tasarımın mockup'ı büyükçe gösterilir, "Siparişin yolda" zaman çizelgesi adım adım dolar.
- Sipariş takip: durum çizgisi hareketli ilerleme (kargo ikonu çizgi boyunca ilerler).

---

## 11. SAYFA GEÇİŞLERİ ve NAVİGASYON

- View Transitions: Ürün kartından ürün detayına geçerken **görsel kartın yerinden büyüyerek** detay galerisine dönüşür (shared element).
- Menü: mega menü yumuşak açılır, içerikler stagger ile gelir; mobil drawer sağdan/soldan akıcı kayar, arka plan blur.
- Arama paneli (⌘K): ekranın ortasında cam yüzey, sonuçlar yazdıkça canlı ve animasyonlu güncellenir.
- Geri/ileri tuşunda scroll konumu korunur.

---

## 12. SES ve TİTREŞİM (OPSİYONEL)

- Varsayılan **kapalı**. Panelden açılırsa: sepete ekleme ve sipariş tamamlama için çok kısa, rahatsız etmeyen ses; mobilde hafif haptic. Otomatik ses oynatma yok.

---

## 13. KİŞİSELLEŞTİRME ve "CANLILIK" HİSSİ

- Hoş geldin: giriş yapmış kullanıcıya "Tekrar hoş geldin, [Ad]" ve **son tasarımı kaldığı yerden devam et** kartı.
- Mevsim/kampanya temaları: panelden tarihli tema (Kara Cuma, yeni yıl, sevgililer günü) — renkler, hero metni, banner ve hafif efekt (kar, kalp) **tek tıkla** açılır, tarihi gelince kendiliğinden kapanır.
- Terk edilen tasarım hatırlatıcısı: "Tasarımın seni bekliyor" kartı (çerez onayına uygun).

---

## 14. PERFORMANS DOĞRULAMASI (EFEKT SONRASI ZORUNLU)

Her efekt fazı sonunda:

- Lighthouse mobil: Performans **90+** (hedef 95), CLS < 0.1, INP < 200 ms.
- Chrome Performance panelinde kaydırma ve editör etkileşimi **60 fps**, uzun görev (long task) yok.
- `Efekt Yoğunluğu = Şov` ve `Kapalı` modlarının ikisi de test edilir.
- Orta seviye Android cihaz profili (CPU 4× yavaşlatma) ile test.
- Paket boyutu: efekt kütüphaneleri ana pakete girmez; bundle analizi raporu `docs/performance-report.md`'ye eklenir.
- Efekt yüzünden bir metrik bozuluyorsa **efekt sadeleştirilir veya kaldırılır**, metrik değil.

---

## 15. PANELDEN YÖNETİM (EFEKT AYARLARI)

`/admin/appearance/effects` sayfasında:

- Genel **Efekt Yoğunluğu** (Kapalı / Hafif / Normal / Şov)
- Her efekt için aç/kapa: kinetik başlık, marquee, scroll animasyonları, 3D ürün, kart tilt, özel imleç, magnetic buton, parçacık/konfeti, sayfa geçişi, Lenis, grain, mesh gradient, ses
- Animasyon hızı (yavaş/normal/hızlı) ve yumuşaklık ayarı
- Mobil ve masaüstü için ayrı geçersiz kılma
- Sezonluk tema zamanlayıcı
- Canlı önizleme (masaüstü/tablet/mobil), **taslak → yayınla → geri al**
- Her değişiklik denetim kaydına yazılır, önbellek etiketleriyle anında yayınlanır

---

## 16. UYGULAMA SIRASI

1. **Efekt altyapısı:** `components/effects/` wrapper'ları, yoğunluk ayarı, reduced-motion ve cihaz algılama, panel ayarlarının DB'ye bağlanması.
2. **Hero + ana sayfa:** kinetik başlık, ürün sahnesi, marquee, sticky "Nasıl çalışır", bento grid, sayaçlar.
3. **Kart ve buton mikro etkileşimleri**, sepete uçan ürün, mini-cart.
4. **Ürün sayfası:** renk geçişi, 360°/3D, odometer fiyat.
5. **Editör ve DTF efektleri.**
6. **Checkout/sipariş tamamlama efektleri, sayfa geçişleri.**
7. **Sezon temaları, kişiselleştirme, performans denetimi ve cila.**

Her adımda çalışan kod bırak, Lighthouse + 60 fps kontrolü yap, sonra devam et. Bana "yapayım mı?" diye sorma; kararı kendin ver ve `DECISIONS.md`'ye yaz.

---

## 17. KABUL KRİTERLERİ

- [ ] İlk ekran (hero) ilk saniyede dikkat çekiyor, ama içerik anında okunuyor
- [ ] Ürün kartı, buton, sepete ekleme, renk değişimi, fiyat güncelleme etkileşimleri akıcı ve tutarlı
- [ ] Editör mobilde ve masaüstünde 60 fps, efektler akışı yavaşlatmıyor
- [ ] `prefers-reduced-motion` ve "Efekt Yoğunluğu: Kapalı" modunda site hâlâ şık ve tam işlevsel
- [ ] Tüm efektler panelden açılıp kapanıyor, kod gerekmiyor
- [ ] Lighthouse mobil Performans 90+, CLS < 0.1, INP < 200 ms (efektler açıkken)
- [ ] Efektler SEO'yu bozmuyor: içerik HTML'de, başlıklar gerçek metin, görseller `alt`'lı
- [ ] Hiçbir efekt erişilebilirliği (klavye, odak, kontrast) bozmuyor
