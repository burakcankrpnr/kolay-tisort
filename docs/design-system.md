# Tasarım sistemi

## Token'lar (`app/globals.css`)

Renkler HSL bileşeni olarak tanımlanır ve Tailwind sınıfına dönüşür:

| Token | Sınıf | Kullanım |
|---|---|---|
| `--background` / `--foreground` | `bg-background`, `text-foreground` | Zemin, metin |
| `--card` | `bg-card` | Kart, panel |
| `--primary` / `--primary-foreground` | `bg-primary`, `text-primary-foreground` | Tek vurgu rengi, CTA |
| `--muted` / `--muted-foreground` | `bg-muted`, `text-muted-foreground` | İkincil yüzey ve metin |
| `--border`, `--input`, `--ring` | `border-border`, `border-input` | Çizgiler, form |
| `--success`, `--warning`, `--destructive` | `text-success` … | Durumlar |
| `--surface-elevated` | `bg-surface-elevated` | Modal, editör paneli |

Panelden gelen değerler `lib/theme.ts` → `themeCss()` ile `:root`'a yazılır. Eski takma adlar: `ink`=foreground, `paper`=background, `press`=primary, `line`=border, `concrete`=input.

**Kural:** Yeni kodda takma adları değil, anlamsal token'ları kullan. Sabit hex yazma (tek istisna: kullanıcı/ürün rengi gibi veri).

## Tipografi

- `.text-display` — `clamp(2.5rem, 6vw + 1rem, 5.5rem)`, satır 1.02
- `.text-h1` — `clamp(2rem, 4vw + 1rem, 3.5rem)`
- `.text-h2` — `clamp(1.5rem, 2.5vw + 1rem, 2.5rem)`
- Başlıklar `font-display` (panelden seçilen başlık fontu), gövde `font-sans`.

## Köşe ve boşluk

- `rounded-card` (varsayılan 16px), `rounded-control` (12px). Panel "keskin / yumuşak / yuvarlak".
- Container `max-w-[1280px]`, yan boşluk `px-4 sm:px-6`. Bölümler `py-16 md:py-28`.

## Bileşenler

- `Button` (`components/ui/button.tsx`): `default`, `cta` (hover'da imleç noktasından marka rengiyle dolar), `primary`, `secondary`, `outline`, `ghost`, `destructive`; boyutlar `sm`, `default`, `lg`, `icon`; `loading` özelliği spinner gösterir ve `aria-busy` ekler.
- `ProductCard`: hover lift, gradient kenar, ikinci renk çapraz geçişi, "Hızlı bak" etiketi, renk noktaları, tilt + spotlight.
- `Garment`: vektör mockup; kumaş gölgesi ve ışık katmanı; açık renklerde baskı `multiply`.
- `PromoBar`, `ThemeToggle`, `WhatsAppButton`, `JsonLd`.

## Efekt bileşenleri (`components/effects/`)

| Bileşen | Ne yapar | Ayar anahtarı |
|---|---|---|
| `EffectsProvider`, `useFx(name)` | Seviye + cihaz koşullarından karar verir | — |
| `Effect` | Kapalıysa `fallback` render eder | herhangi |
| `KineticTitle` | Kelime kelime yükselen başlık (LCP güvenli) | `kineticTitle` |
| `Reveal` | Ekrana girince fade-up, `stagger` | `scrollReveal` |
| `Marquee` | CSS kayan şerit, hover'da yavaşlar | `marquee` |
| `CountUp` | Görünür olunca sayar | `counters` |
| `ScrollProgress` | Üst okuma çubuğu | `scrollProgress` |
| `Celebrate` | Bir kez konfeti | `confetti` |
| `CustomCursor` | Halka imleç, `data-cursor="Gör"` etiketi | `customCursor` |
| `PageTransition` | İstemci içi gezinmede fade-up | `pageTransitions` |

CSS yardımcıları: `.fx-card` (+`data-tilt`), `.fx-spot`, `.btn-fill`, `.link-underline`, `.mesh`, `.float-soft`, `.color-reveal`, `.skeleton`, `.bump`, `[data-magnetic]`.

**Kurallar:** Yalnızca `transform` ve `opacity` animasyonu. LCP öğesi gizlenmez. Her efekt `prefers-reduced-motion`'da kapanır. Yeni efekt eklerken `lib/settings-schema.ts` → `effectCatalog`'a ekle, panel otomatik gösterir.
