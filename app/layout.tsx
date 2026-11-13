import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Bricolage_Grotesque, Inter, Space_Grotesk } from "next/font/google";
import { auth } from "@/auth";
import { EffectsProvider } from "@/components/effects/effects-provider";
import { JsonLd } from "@/components/json-ld";
import { PromoBar } from "@/components/promo-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { siteUrl } from "@/lib/seo";
import { isEffectEnabled } from "@/lib/settings-schema";
import { getSettings, isPromoActive } from "@/lib/settings";
import { themeBootScript, themeCss } from "@/lib/theme";
import { cartCount, readCart } from "@/server/cart";
import "./globals.css";

// Başlık fontları (panelden seçilir). Varsayılan dışındakiler önceden yüklenmez;
// tarayıcı yalnızca CSS'te gerçekten kullanılan dosyayı indirir.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-bricolage-display",
  display: "swap",
});
const space = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-space-display",
  display: "swap",
  preload: false,
});
const barlowDisplay = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-display",
  display: "swap",
  preload: false,
});
// Gövde fontları
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter-body",
  display: "swap",
});
const barlowBody = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow-body",
  display: "swap",
  preload: false,
});

const fontVars = [bricolage, space, barlowDisplay, inter, barlowBody].map((font) => font.variable).join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${brand.name} · Kişiye Özel Tişört ve DTF Baskı`, template: `%s · ${brand.name}` },
    description: brand.description,
    applicationName: brand.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: brand.name,
      title: brand.name,
      description: brand.description,
    },
    twitter: { card: "summary_large_image", title: brand.name, description: brand.description },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E0D" },
  ],
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, cart, settings] = await Promise.all([auth(), readCart(), getSettings()]);
  const { brand, theme, effects, promo } = settings;
  const url = siteUrl();
  const showPromo = isPromoActive(promo);
  // Saf CSS ilk-boyama efekti sunucuda açılır (reduced-motion CSS'te ayrıca kapatılır).
  const kinetic = isEffectEnabled(effects, "kineticTitle") ? "on" : "off";

  return (
    <html lang="tr" className={fontVars} data-fx-kinetic={kinetic} suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Düz script: next/script + antivirüs enjeksiyonu (Kaspersky vb.) hydration uyarısı üretmesin. */}
        <script
          dangerouslySetInnerHTML={{ __html: themeBootScript(theme.mode) }}
          suppressHydrationWarning
        />
        <style dangerouslySetInnerHTML={{ __html: themeCss(theme, effects) }} />
      </head>
      <body className="flex min-h-screen flex-col bg-background pb-14 text-foreground md:pb-0" suppressHydrationWarning>
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded-control focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
        >
          İçeriğe geç
        </a>
        <EffectsProvider effects={effects}>
          {showPromo ? <PromoBar promo={promo} /> : null}
          <SiteHeader brandName={brand.name} cartCount={cartCount(cart)} signedIn={Boolean(session?.user)} />
          <main id="icerik" className="flex-1">
            {children}
          </main>
          <SiteFooter brand={brand} />
          <WhatsAppButton phone={brand.whatsapp} />
        </EffectsProvider>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: brand.name,
              url,
              logo: `${url}/icon.svg`,
              description: brand.description,
              email: brand.email || undefined,
              sameAs: brand.instagram ? [brand.instagram] : undefined,
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: brand.name,
              url,
              inLanguage: "tr-TR",
              potentialAction: {
                "@type": "SearchAction",
                target: `${url}/urunler?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ]}
        />
      </body>
    </html>
  );
}
