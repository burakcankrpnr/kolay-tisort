import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { auth } from "@/auth";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/config/site";
import { cartCount, readCart } from "@/server/cart";
import "./globals.css";

const sans = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
  display: "swap",
});

const display = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cart = await readCart();

  return (
    <html lang="tr" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper text-ink">
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30 focus:bg-paper focus:px-3 focus:py-2"
        >
          İçeriğe geç
        </a>
        <SiteHeader cartCount={cartCount(cart)} signedIn={Boolean(session?.user)} />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
