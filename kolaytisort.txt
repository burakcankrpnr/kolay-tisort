# Kişiye Özel Baskı & Tasarım E-Ticaret Platformu — MASTER DEVELOPMENT PROMPT

Sen kıdemli bir **Full Stack Engineer, UI/UX Designer, E-commerce Architect ve SEO/GEO uzmanısın.**

Türkiye'de kişiye özel baskı ürünleri satan, kullanıcıların kendi tasarımlarını oluşturabildiği ve DTF baskı siparişi verebildiği modern bir e-ticaret platformu geliştiriyoruz.

Platform; kişiye özel tişört, oversize tişört, sweatshirt, hoodie, çocuk ürünleri, kupa, çanta, şapka, forma ve benzeri ürünleri desteklemeli.

Referans alınacak iş modelleri:

* KolayTişört
* Tisho
* Baskı Tasarla
* T-ShirtBastir
* Tişörthane
* Tişört Tasarla

Ancak hiçbir sitenin tasarımını, metinlerini, görsellerini veya kodunu birebir kopyalama. Amaç; bu platformların güçlü özelliklerini analiz edip **daha modern, hızlı, profesyonel ve ölçeklenebilir özgün bir ürün** ortaya çıkarmaktır.

---

# 1. ANA HEDEF

Platform aşağıdaki dört ana gelir kanalını desteklemeli:

1. Kendi ürününü tasarla
2. Hazır tasarımlardan ürün satın al
3. DTF baskı siparişi ver
4. Kurumsal/toplu baskı siparişi oluştur

Ek olarak:

5. Tasarımcıların tasarımlarını satabildiği marketplace
6. Tasarla & Sat sistemi
7. AI destekli tasarım araçları
8. Profesyonel üretim ve sipariş yönetimi

---

# 2. TEKNOLOJİ STACK

Modern ve production-ready bir mimari kullan.

Frontend:

* Next.js
* TypeScript
* React
* Tailwind CSS
* shadcn/ui
* Framer Motion

Backend:

* Next.js server actions / API
* TypeScript
* PostgreSQL
* Prisma ORM

Authentication:

* Email/password
* Google Login
* Apple Login altyapısı hazır olacak şekilde architecture oluştur
* JWT/session güvenliği
* Role-based authorization

Roller:

* CUSTOMER
* DESIGNER
* BUSINESS
* ADMIN
* SUPER_ADMIN

Dosya:

* Cloudinary veya S3 uyumlu storage
* Görsel optimizasyonu
* WebP/AVIF
* Upload validation

Ödeme:

* iyzico
* PayTR architecture
* Webhook desteği

Kargo:

* Aras
* Yurtiçi
* MNG
* Sürat

Kargo provider abstraction oluştur.

---

# 3. ANA SAYFA

Ana sayfa premium bir Türk e-ticaret markası görünümünde olmalı.

Hero:

"Kendi Tasarımını Giy."

Alt açıklama:

"Tasarımını yükle, ürününü seç, baskını oluştur. Biz üretelim, kapına gönderelim."

CTA:

"Ürününü Tasarla"

İkinci CTA:

"DTF Baskı Oluştur"

Ana sayfada:

* Kategori kartları
* Popüler ürünler
* Yeni tasarımlar
* Çok satanlar
* Kampanyalar
* Hazır tasarımlar
* Tasarımcılar
* DTF baskı hizmeti
* Kurumsal çözümler
* Müşteri yorumları
* Nasıl çalışır?
* SSS
* SEO içerik alanları

---

# 4. ÜRÜN KATEGORİLERİ

Başlangıçta:

* Tişört
* Oversize Tişört
* Sweatshirt
* Hoodie
* Çocuk Tişörtü
* Forma
* Şapka
* Çanta
* Kupa
* Mousepad
* Poster
* Sticker

Architecture yeni ürün tiplerinin kolay eklenebileceği şekilde hazırlanmalı.

---

# 5. ÜRÜN DETAY SAYFASI

Her ürün:

* Ürün fotoğrafları
* 360/mockup görünümü
* Renk seçimi
* Beden seçimi
* Beden tablosu
* Baskı alanı
* Ön baskı
* Arka baskı
* Ön + arka
* Tasarım yükleme
* Tasarım editörüne gönder
* Fiyat
* Adet
* Tahmini üretim süresi
* Kargo tahmini
* Stok durumu
* Favorilere ekle
* Sepete ekle

Dinamik fiyat:

Base product
+
Print area
+
Print type
+
Additional side
+
Quantity
+
Product variant

---

# 6. GELİŞMİŞ TASARIM EDİTÖRÜ

Platformun en önemli özelliği burası.

Canva benzeri fakat ürün baskısına özel bir editör oluştur.

Canvas teknolojisi:

* Fabric.js veya Konva.js

Kullanıcı:

* Görsel yükleyebilmeli
* PNG/JPG/WebP/SVG desteklenmeli
* Yazı ekleyebilmeli
* Font seçebilmeli
* Font boyutu değiştirebilmeli
* Renk değiştirebilmeli
* Bold/italic
* Letter spacing
* Alignment
* Rotate
* Scale
* Crop
* Duplicate
* Delete
* Undo
* Redo

Görsel:

* Sürükle bırak
* Boyutlandır
* Döndür
* Hizala
* Katman yönetimi

Layers panel oluştur.

---

# 7. TASARIM ALANI

Kullanıcının tasarımı baskı alanının dışına çıkmamalı.

Örneğin:

PRINT AREA:

35cm x 40cm

Canvas üzerinde baskı alanını göster.

Kullanıcıya:

"Bu alanın dışına taşan tasarım baskıya dahil edilmeyecektir."

uyarısı göster.

---

# 8. ÖN / ARKA TASARIM

Editör:

[ ÖN ] [ ARKA ]

olmalı.

Kullanıcı ön ve arka tasarımları ayrı düzenleyebilmeli.

Aynı ürün içerisinde:

FrontDesign
BackDesign

verileri ayrı tutulmalı.

---

# 9. CANLI MOCKUP

Kullanıcı tasarımını ürün üzerinde gerçek zamanlı görmeli.

Ürün rengi değiştiğinde mockup değişmeli.

Örneğin:

Siyah tişört
Beyaz tişört
Kırmızı tişört

tasarımla birlikte gerçek zamanlı gösterilmeli.

Mümkünse ürün başına:

* Front mockup
* Back mockup
* Flat view

desteklenmeli.

---

# 10. AI TASARIM

İleriye dönük AI architecture oluştur.

Kullanıcı:

"Cyberpunk kedi, neon, siyah arka plan"

yazdığında AI tasarım oluşturabilecek.

AI araçları:

* Generate design
* Remove background
* Upscale image
* Improve quality
* Generate typography
* Generate variations

AI özelliği provider abstraction ile oluşturulmalı.

Provider daha sonra değiştirilebilir olmalı.

---

# 11. GÖRSEL KALİTE KONTROLÜ

Kullanıcı düşük çözünürlüklü görsel yüklediğinde:

"Bu görsel baskı için düşük çözünürlüklü."

uyarısı göster.

DPI hesapla.

Öner:

* 150 DPI minimum
* 300 DPI ideal

Görselin baskı boyutunu gerçek cm üzerinden hesapla.

---

# 12. DTF BASKI SİSTEMİ

Ayrı bir:

/dtf-baski

sayfası oluştur.

Kullanıcı:

1. Tasarım yükler
2. Baskı ölçüsünü seçer
3. Adet belirler
4. DTF tabakası oluşturur
5. Tasarımları yerleştirir
6. Fiyatı görür
7. Sipariş verir

---

# 13. DTF TABAKA OLUŞTURUCU

Bu sistem profesyonel olmalı.

Kullanıcı birden fazla tasarım yükleyebilmeli.

Örnek:

Logo A
Logo B
Karakter
Yazı

Sistem:

* Otomatik yerleştirme
* Rotate
* Scale
* Duplicate
* Snap
* Grid
* Margin
* Collision detection

desteklemeli.

Tabaka:

30x40
40x50
50x70
60x90

gibi ölçülerde oluşturulabilmeli.

Otomatik fiyat hesapla.

---

# 14. OTOMATİK YERLEŞTİRME

DTF tabakasında mümkün olduğunca az boşluk kalacak şekilde tasarımları otomatik yerleştir.

Packing algorithm architecture oluştur.

Kullanıcı:

"AUTOFIT"

butonuna bastığında sistem tasarımları optimize etmeli.

---

# 15. HAZIR TASARIM MARKETPLACE

Kategori sistemi:

* Anime
* Gaming
* Gothic
* Streetwear
* Minimal
* Vintage
* Couple
* Funny
* Meme
* Music
* Sport
* Kids
* Trending

Tasarımlar:

* Tasarımcı
* Görsel
* Başlık
* Kategori
* Etiket
* Fiyat
* Satış sayısı
* Favori sayısı
* Rating

içermeli.

---

# 16. TASARLA & SAT

Tasarımcı kullanıcı:

* Tasarım yükleyebilir
* Ürün seçebilir
* Mockup oluşturabilir
* Fiyat belirleyebilir
* Ürün yayınlayabilir
* Satışlarını görebilir
* Kazancını görebilir

Admin onay sistemi:

PENDING
APPROVED
REJECTED

olmalı.

---

# 17. TASARIMCI PANELİ

Dashboard:

* Toplam satış
* Toplam kazanç
* Bekleyen ödeme
* Ürünler
* Tasarımlar
* Siparişler
* Analytics
* Favoriler
* En çok satan tasarımlar

Komisyon sistemi oluştur.

Örneğin:

Platform komisyonu:
20%

Designer:
80%

Bu oran admin panelinden değiştirilebilir olmalı.

---

# 18. KURUMSAL SİPARİŞ

Ayrı landing page:

/kurumsal-baski

Form:

* Firma
* Yetkili
* Telefon
* Email
* Ürün
* Adet
* Tasarım
* Baskı türü
* Teslim tarihi
* Not

Toplu siparişlerde otomatik teklif sistemi oluştur.

---

# 19. SEPET

Sepet birden fazla ürün desteklemeli.

Örnek:

Ürün 1:
Siyah Oversize
XL
Ön baskı
2 adet

Ürün 2:
Beyaz Tişört
M
Ön + arka
1 adet

DTF ürünü de sepete eklenebilmeli.

---

# 20. CHECKOUT

Checkout:

1. Adres
2. Kargo
3. Ödeme
4. Sipariş özeti
5. Sipariş tamamlandı

Kupon:

WELCOME10

gibi kuponlar desteklenmeli.

---

# 21. ÖDEME

Ödeme sistemi güvenli olmalı.

iyzico integration architecture.

PayTR integration architecture.

Webhook:

payment_success
payment_failed
payment_pending
refund

durumlarını desteklemeli.

Kart bilgilerini asla database'de tutma.

---

# 22. SİPARİŞ SİSTEMİ

Order status:

PENDING
PAID
DESIGN_REVIEW
IN_PRODUCTION
PRINTING
QUALITY_CONTROL
PACKAGING
SHIPPED
DELIVERED
CANCELLED
REFUNDED

olmalı.

---

# 23. ÜRETİM PANELİ

Admin siparişi açtığında:

Ürün:
Oversize Tişört

Renk:
Siyah

Beden:
XL

Adet:
2

Baskı:
Ön

Baskı ölçüsü:
32 x 40cm

Tasarım dosyası:
Download

Mockup:
Preview

olmalı.

"Üretime Al"

butonu.

---

# 24. ADMIN PANEL

Admin dashboard:

* Günlük satış
* Haftalık satış
* Aylık satış
* Siparişler
* Ürünler
* Kategoriler
* Tasarımlar
* Kullanıcılar
* Tasarımcılar
* DTF siparişleri
* Kurumsal teklifler
* Kuponlar
* Kampanyalar
* Ödemeler
* İadeler
* Kargo
* CMS
* SEO
* Analytics

---

# 25. ÜRÜN YÖNETİMİ

Admin:

* Ürün oluştur
* Ürün düzenle
* Varyant
* Renk
* Beden
* Stok
* Fiyat
* İndirim
* Baskı fiyatı
* Mockup
* SEO title
* SEO description
* Slug

yönetebilmeli.

---

# 26. FİYAT MOTORU

Fiyatlar hardcoded olmamalı.

Örneğin:

Product base price
+
Print price
+
Back print
+
Special color
+
Quantity discount

hesaplanmalı.

Admin:

Tişört:
299 TL

Ön baskı:
+100 TL

Arka baskı:
+100 TL

Ön + arka:
+180 TL

gibi kurallar belirleyebilmeli.

---

# 27. TOPLU SİPARİŞ İNDİRİMİ

Örneğin:

1-4:
normal

5-9:
%5

10-24:
%10

25-49:
%15

50+:
%20

Admin panelinden değiştirilebilir.

---

# 28. FAVORİLER

Kullanıcı:

* Ürün
* Tasarım
* Tasarımcı

favorileyebilmeli.

---

# 29. YORUMLAR

Ürün yorumları:

* Rating
* Yorum
* Fotoğraf
* Verified purchase

desteklemeli.

---

# 30. ARAMA

Global search.

Arama:

"anime"
"oversize siyah"
"hoodie"
"dtf"
"gaming"

gibi sorguları desteklemeli.

Filtre:

* Kategori
* Fiyat
* Renk
* Beden
* Baskı türü
* Rating
* Yeni
* Popüler

---

# 31. SEO

SEO platformun temel parçası olmalı.

Her ürün:

/urun/siyah-oversize-tisort

Her kategori:

/kategori/oversize-tisort

Her hazır tasarım:

/tasarim/anime-xxx

DTF:

/dtf-baski

Kurumsal:

/kurumsal-baski

Dinamik metadata.

Canonical.

OpenGraph.

Twitter/X card.

Schema.org.

Product schema.

Breadcrumb schema.

FAQ schema.

Organization schema.

WebSite schema.

---

# 32. GEO / AI SEARCH OPTIMIZATION

Platform Google dışında AI aramalarına da optimize edilmeli.

ChatGPT / Gemini / Claude / Perplexity gibi sistemlerin markayı ve ürünleri anlayabileceği şekilde:

* semantic HTML
* açık ürün bilgileri
* FAQ
* structured data
* entity consistency
* Organization schema
* Product schema
* Review schema
* FAQ schema

kullan.

Her kategori için açıklayıcı içerik oluştur.

Örneğin:

"Kişiye Özel Tişört Baskısı"
"Kendi Tişörtünü Tasarla"
"DTF Baskı"
"Toplu Tişört Baskı"
"Kurumsal Tişört Baskısı"

landing page'leri oluştur.

---

# 33. SEO BLOG

Blog sistemi.

Kategori:

* Tişört Tasarım
* DTF Baskı
* Baskı Teknikleri
* Moda
* Streetwear
* Gaming
* Anime
* Kurumsal Baskı

Admin CMS üzerinden yazı oluşturabilmeli.

---

# 34. PROGRAMMATIC SEO

SEO architecture şu şekilde oluşturulmalı:

/kendi-tisortunu-tasarla
/oversize-tisort-tasarla
/hoodie-tasarla
/sweatshirt-tasarla
/cocuk-tisortu-tasarla
/dtf-baski
/dtf-baski-fiyatlari
/kurumsal-tisort-baski
/toplu-tisort-baski
/kisiye-ozel-tisort
/online-tisort-tasarimi

Her landing page unique content taşımalı.

Duplicate content oluşturma.

---

# 35. PERFORMANS

Core Web Vitals optimize et.

Hedef:

LCP < 2.5 sec
CLS < 0.1
INP < 200ms

Next.js:

* Image optimization
* Dynamic import
* Lazy loading
* Server components
* Streaming
* caching

kullan.

Tasarım editörünü lazy-load et.

---

# 36. MOBİL

Mobile-first.

Editör mobilde de kullanılabilir olmalı.

Mobile toolbar:

Upload
Text
Elements
Layers
Undo
Redo
Front
Back

şeklinde optimize edilmeli.

---

# 37. TASARIM

Genel tasarım:

Premium
Minimal
Modern
Streetwear
E-commerce

hissi vermeli.

Ucuz template görünümü kesinlikle olmasın.

Whitespace kullan.

Tipografi güçlü olsun.

Kartlar sade.

CTA'lar net.

Animasyonlar abartılı olmayacak.

---

# 38. HEADER

Desktop:

Logo

Ürünler
Kendin Tasarla
DTF Baskı
Hazır Tasarımlar
Kurumsal
Blog

Arama

Favoriler
Hesabım
Sepet

Mobile:

Logo
Search
Cart
Menu

---

# 39. USER ACCOUNT

/account

* Profil
* Siparişlerim
* Tasarımlarım
* Favorilerim
* Adreslerim
* Kuponlarım
* Tasarımcı Paneli
* Ayarlar

---

# 40. TASARIMLARIM

Kullanıcı daha önce oluşturduğu tasarımları görebilmeli.

* Düzenle
* Kopyala
* Sil
* Üründe kullan
* Favori

---

# 41. AUTH

Register:

Ad
Soyad
Email
Telefon
Şifre

Login:

Email
Şifre

Social:

Google
Apple

Forgot password.

Email verification.

---

# 42. GÜVENLİK

* Rate limiting
* CSRF
* XSS protection
* SQL injection protection
* Input validation
* Zod
* Secure cookies
* RBAC
* File type validation
* File size validation
* Image malware/security validation
* API authorization

---

# 43. DATABASE

Prisma schema tasarla.

Minimum entity:

User
Role
Address
Product
ProductVariant
ProductColor
ProductSize
ProductImage
ProductMockup
Category
Design
DesignLayer
DesignTemplate
Designer
DesignerProfile
DesignerProduct
Order
OrderItem
Cart
CartItem
Payment
Shipment
Coupon
CouponUsage
Review
Favorite
DTFOrder
DTFSheet
DTFDesign
BusinessRequest
Commission
Payout
BlogPost
BlogCategory
Page
SeoMetadata
Notification

İlişkileri düzgün kur.

Soft delete gerekli yerlerde kullan.

createdAt / updatedAt zorunlu.

---

# 44. ADMIN CMS

Admin panelinden kod değiştirmeden:

* Homepage hero
* Banner
* Kampanyalar
* Kategoriler
* SEO
* Blog
* FAQ
* Footer
* Menüler
* Landing page
* Popup

yönetilebilmeli.

---

# 45. ANALYTICS

Admin dashboard:

Revenue
Orders
AOV
Conversion rate
Top products
Top designs
Top designers
Top categories
Abandoned carts
Traffic source

Google Analytics / GTM integration-ready.

Meta Pixel integration-ready.

---

# 46. EMAIL

Transactional email architecture.

Sipariş:

"Ödemeniz alındı"

"Üretime alındı"

"Kargoya verildi"

"Teslim edildi"

İade:

"İade talebiniz oluşturuldu"

Tasarımcı:

"Satış yaptınız"

gibi email event'leri oluştur.

---

# 47. KARGO

Shipment entity.

Tracking number.

Provider.

Tracking URL.

Order tracking page:

/siparis-takip

Kullanıcı sipariş numarası + email ile sorgulayabilsin.

---

# 48. İADE

Return request.

Return reason.

Admin approval.

Refund status.

---

# 49. KUPON

Admin:

Coupon code
Type
Percentage
Fixed
Min cart
Max discount
Start date
End date
Usage limit
User limit

tanımlayabilmeli.

---

# 50. E-TİCARET UX

Kullanıcı ürün satın alırken minimum sürtünme.

Hedef:

Landing
→ Product
→ Customize
→ Add Cart
→ Checkout
→ Payment

mümkün olduğunca kısa olmalı.

---

# 51. DOSYA YÖNETİMİ

Kullanıcı yüklediği tasarımları hesabında görebilmeli.

Her tasarım:

* original
* optimized
* print-ready
* preview
* mockup

dosyalarına sahip olabilir.

---

# 52. BASKI DOSYASI

Sipariş tamamlandığında production-ready çıktı oluştur.

Örneğin:

PNG
Transparent background
300 DPI
CM ölçüsünde

Admin üretim panelinden indirebilmeli.

---

# 53. MOCKUP GENERATION

Tasarım tamamlandığında otomatik mockup oluştur.

Mockup:

Front
Back
Product preview

olarak kaydedilmeli.

---

# 54. ÜRETİM İŞ AKIŞI

Sipariş:

PAID
↓
DESIGN_REVIEW
↓
APPROVED
↓
IN_PRODUCTION
↓
PRINTING
↓
QUALITY_CONTROL
↓
PACKAGING
↓
SHIPPED
↓
DELIVERED

Her status değişikliğini logla.

---

# 55. ADMIN ORDER DETAIL

Admin siparişte:

Customer
Order items
Design
Print file
Mockup
Payment
Shipping
Address
Timeline
Notes

görmeli.

Admin internal note ekleyebilmeli.

---

# 56. NOTIFICATION SYSTEM

User notifications.

Örneğin:

"Designınız onaylandı."

"Siparişiniz üretime alındı."

"Kargonuz yola çıktı."

---

# 57. RESPONSIVE DESIGN

Desktop
Tablet
Mobile

tam responsive.

Tasarım editörü özellikle mobile optimize edilmeli.

---

# 58. ERROR HANDLING

Her işlem:

* loading
* error
* empty
* success

state'lerine sahip olmalı.

Toast kullan.

Kullanıcıya teknik hata gösterme.

---

# 59. CODE QUALITY

TypeScript strict.

ESLint.

Prettier.

Reusable components.

Feature-based architecture.

No duplicated code.

No hardcoded business logic.

Environment variables.

Validation.

Unit tests.

Integration tests.

Critical flow için E2E tests.

---

# 60. PROJE KLASÖR YAPISI

Temiz ve ölçeklenebilir architecture kullan.

Örneğin:

app/
components/
features/
lib/
services/
server/
prisma/
types/
hooks/
utils/
config/

Design editor kodunu ayrı feature olarak izole et.

Örneğin:

features/design-editor/

---

# 61. ÖNEMLİ KURAL

Bütün sistemi tek seferde mockup olarak yapma.

Gerçek çalışan application oluştur.

Öncelik:

1. Authentication
2. Database
3. Product
4. Product detail
5. Cart
6. Checkout
7. Payment architecture
8. Design editor
9. DTF
10. Marketplace
11. Designer system
12. Admin
13. SEO/GEO
14. Analytics

---

# 62. GELİŞTİRME YÖNTEMİ

Her feature'ı tamamlamadan diğerine geçme.

Her aşamadan sonra:

* TypeScript errors
* ESLint
* Build
* Runtime
* Responsive
* API
* Database

kontrol et.

Hata varsa düzelt.

---

# 63. DEMO VERİLERİ

Development sırasında seed oluştur.

Ürünler:

* Siyah Oversize Tişört
* Beyaz Oversize Tişört
* Siyah Hoodie
* Beyaz Sweatshirt
* Gaming Tişört
* Anime Tişört

Kategoriler oluştur.

Demo tasarımlar oluştur.

Demo kullanıcı oluştur.

Demo admin oluştur.

---

# 64. ÖNCELİK

Önce çalışan MVP:

AUTH
PRODUCTS
CART
CHECKOUT
DESIGN EDITOR
ORDER

Sonra:

DTF
MARKETPLACE
DESIGNER
AI
CORPORATE
ADVANCED ADMIN

---

# 65. UI KALİTESİ

Her ekranı gerçek bir production e-commerce platformu gibi tasarla.

Generic dashboard template kullanma.

Placeholder lorem ipsum kullanma.

Gerçekçi Türkçe içerikler kullan.

Türkçe karakterleri doğru kullan.

TRY / TL fiyat formatı kullan.

Türkiye adres formatına uygun checkout oluştur.

---

# 66. SON HEDEF

Ortaya çıkan platform:

"Kullanıcı kendi tasarımını yükler → ürününü seçer → canlı olarak tasarlar → ön/arka baskısını oluşturur → fiyatı görür → ödeme yapar → sipariş üretime düşer → admin üretir → kargoya verir."

Aynı zamanda:

"Tasarımcı → tasarım yükler → ürün oluşturur → satışa çıkar → müşteri satın alır → platform üretir → tasarımcı komisyon kazanır."

Ve:

"Müşteri → DTF tabakası oluşturur → baskı alanını optimize eder → fiyatı görür → DTF siparişini verir."

akışlarının tamamı çalışmalıdır.

---

# 67. BAŞLANGIÇ TALİMATI

Önce mevcut repository'yi analiz et.

Mevcut:

* package.json
* source
* routes
* database
* components
* configs
* environment
* dependencies

incele.

Mevcut çalışan kodu gereksiz yere silme.

Önce architecture planını çıkar.

Sonra implementation'a geç.

Eksik dependency varsa kur.

Eksik dosyaları oluştur.

Mevcut kodla çakışan yapıları refactor et.

Her şeyi production-ready yaz.

**ÖNEMLİ:**

Bana sürekli "bunu yapayım mı?" diye sorma.

Mantıklı teknik kararları kendin ver.

Bir feature için gerekli alt özellikleri kendin çıkar.

Ancak geri dönüşü zor veya veri kaybına neden olabilecek işlemlerde dikkatli ol.

Her aşamada çalışan kod bırak.

İlk olarak repository analizini yap ve ardından **PHASE 1 — PROJECT FOUNDATION + DATABASE + AUTH + BASIC E-COMMERCE** geliştirmesine başla.
