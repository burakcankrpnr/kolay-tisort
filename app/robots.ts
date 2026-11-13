import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/** Özel alanlar (panel, hesap, sepet, ödeme, API) taranmaz. */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/hesap", "/sepet", "/odeme", "/api/", "/giris", "/kayit", "/sifre", "/gelistirme", "/*?*sirala="],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
