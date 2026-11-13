# Performans raporu

## 2026-11-13 — Görünüm/efekt katmanı sonrası

**Ortam:** `next build` + `next start` (yerel, port 3100), Windows, yerel PostgreSQL. Ölçümler tarayıcının Performance API'si ve build çıktısından alındı.

| Metrik | Değer | Hedef | Not |
|---|---|---|---|
| CLS (ana sayfa, mobil 375 px) | **0,0000** | < 0,05 | Sayaçlar `tabular-nums`, görseller SVG, reveal yalnızca ekran altında |
| TTFB (yerel) | 42 ms | < 600 ms | Yerel ölçüm; üretim ağı dahil değil |
| HTML (ana sayfa) | 45 KB | — | |
| İlk yükleme JS (ana sayfa, gzip) | **≈173 KB** | < 170 KB | 13 parça; Next/React çatısı dahil. Sınırda, aşağıya bakın |
| LCP | ölçülemedi | < 2,0 sn | Önizleme paneli arka planda olduğu için tarayıcı LCP kaydı üretmedi |

### Lighthouse

Bu oturumda **çalıştırılamadı** (lighthouse paketinin indirilmesine izin verilmedi). Çalıştırmak için:

```bash
npm run build && npx next start -p 3100
npx lighthouse http://localhost:3100/ --form-factor=mobile --only-categories=performance,accessibility,seo,best-practices --view
```

Prompt kabul kriteri (mobil Performans 90+/95+) **henüz doğrulanmadı**.

### Yapılan optimizasyonlar

- Ana sayfada animasyon kütüphanesi yüklenmiyor; hero artık Framer Motion kullanmıyor. Efektlerin çoğu saf CSS.
- Spotlight/tilt/magnetic için kart başına değil, belge başına tek `pointermove` dinleyicisi (rAF ile kısılmış).
- Tek `IntersectionObserver` ile tüm reveal'ler.
- Konfeti ve özel imleç yalnızca gerektiğinde dinamik import.
- Varsayılan olmayan fontlar `preload: false`.
- Hero başlığı ilk boyamadan itibaren görünür (opaklık animasyonu yok).

### Bütçe riski ve sonraki adımlar

- 173 KB'ın büyük kısmı framework. `@next/bundle-analyzer` eklenip ana sayfa parçaları incelenmeli; `lucide-react` ikonlarının ağaç-sallama durumu ve `next-auth` istemci kodu kontrol edilmeli.
- Lighthouse CI ve performans bütçesi CI'a eklenmeli.
- Gerçek kullanıcı ölçümü (web-vitals → analytics) ve admin'de Core Web Vitals kartı yapılmadı.
