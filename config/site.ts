export const site = {
  name: "Katman",
  description:
    "Kişiye özel baskı. Ürünü seç, bedenini belirle, siparişin atölyeden kapına gelsin.",
};

export const nav = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/tasarla", label: "Kendin Tasarla" },
  { href: "/dtf-baski", label: "DTF Baskı" },
  { href: "/hazir-tasarimlar", label: "Hazır Tasarımlar" },
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/blog", label: "Blog" },
] as const;

export const demoAccounts = {
  customer: "musteri@katman.test",
  admin: "admin@katman.test",
  password: "Katman123!",
};
