import { PrismaClient, type Fit, type Silhouette } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sizes = ["S", "M", "L", "XL", "XXL"];

const categories = [
  ["Tişört", "tisort", "Regular kalıp baskılık tişörtler."],
  ["Oversize Tişört", "oversize-tisort", "Düşük omuz, geniş kalıp."],
  ["Sweatshirt", "sweatshirt", "İçi şardonlu sweatshirt."],
  ["Hoodie", "hoodie", "Kapüşonlu, kanguru cepli."],
  ["Çocuk Tişörtü", "cocuk-tisortu", "Çocuk bedenleri sıradaki partide."],
  ["Forma", "forma", "Takım ve etkinlik formaları."],
  ["Şapka", "sapka", "Nakış ve baskı şapka."],
  ["Çanta", "canta", "Bez ve sırt çantası."],
  ["Kupa", "kupa", "Seramik kupa baskı."],
  ["Mousepad", "mousepad", "Dikdörtgen mousepad."],
  ["Poster", "poster", "Mat ve parlak poster."],
  ["Sticker", "sticker", "Kesimli sticker."],
] as const;

type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  productionDays: number;
  silhouette: Silhouette;
  fit: Fit;
  colors: { name: string; hex: string }[];
};

const products: SeedProduct[] = [
  {
    name: "Siyah Oversize Tişört",
    slug: "siyah-oversize-tisort",
    category: "oversize-tisort",
    description:
      "240 g/m² penye, düşük omuz ve düşmüş kol. Göğüs baskı alanı 30×40 cm. Günlük kullanım için tok bir siyah.",
    basePrice: 64900,
    productionDays: 3,
    silhouette: "TEE",
    fit: "OVERSIZE",
    colors: [{ name: "Siyah", hex: "#161616" }],
  },
  {
    name: "Beyaz Oversize Tişört",
    slug: "beyaz-oversize-tisort",
    category: "oversize-tisort",
    description: "Aynı oversize kalıp, optik beyaz kumaş. Baskı bu zeminde daha net durur. 240 g/m².",
    basePrice: 64900,
    productionDays: 3,
    silhouette: "TEE",
    fit: "OVERSIZE",
    colors: [{ name: "Beyaz", hex: "#F4F4F1" }],
  },
  {
    name: "Siyah Hoodie",
    slug: "siyah-hoodie",
    category: "hoodie",
    description: "420 g/m² üç iplik, kapüşon ve kanguru cep. Göğüs ve sırt için geniş baskı alanı.",
    basePrice: 119000,
    productionDays: 4,
    silhouette: "HOODIE",
    fit: "HOODIE",
    colors: [{ name: "Siyah", hex: "#141414" }],
  },
  {
    name: "Beyaz Sweatshirt",
    slug: "beyaz-sweatshirt",
    category: "sweatshirt",
    description: "320 g/m² içi şardonlu sweatshirt. Bisiklet yaka, ribana etek. 3 iş günü üretim.",
    basePrice: 99000,
    productionDays: 3,
    silhouette: "SWEAT",
    fit: "SWEAT",
    colors: [{ name: "Beyaz", hex: "#F7F7F4" }],
  },
  {
    name: "Gaming Tişört",
    slug: "gaming-tisort",
    category: "tisort",
    description: "Regular kalıp, 180 g/m². Uzun oturum için düz kesim. Siyah ve mor.",
    basePrice: 54900,
    productionDays: 3,
    silhouette: "TEE",
    fit: "REGULAR",
    colors: [
      { name: "Siyah", hex: "#161616" },
      { name: "Mor", hex: "#3A235A" },
    ],
  },
  {
    name: "Anime Tişört",
    slug: "anime-tisort",
    category: "tisort",
    description: "Regular kalıp, 180 g/m². Büyük ön baskıya uygun göğüs alanı. Beyaz ve lacivert.",
    basePrice: 54900,
    productionDays: 3,
    silhouette: "TEE",
    fit: "REGULAR",
    colors: [
      { name: "Beyaz", hex: "#F7F7F4" },
      { name: "Lacivert", hex: "#1B2A4A" },
    ],
  },
];

async function main() {
  await prisma.couponUsage.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();

  const passwordHash = await bcrypt.hash("Katman123!", 12);

  await prisma.user.upsert({
    where: { email: "musteri@katman.test" },
    update: {
      passwordHash,
      firstName: "Deniz",
      lastName: "Yılmaz",
      name: "Deniz Yılmaz",
      phone: "05321110000",
      role: "CUSTOMER",
    },
    create: {
      email: "musteri@katman.test",
      passwordHash,
      firstName: "Deniz",
      lastName: "Yılmaz",
      name: "Deniz Yılmaz",
      phone: "05321110000",
      role: "CUSTOMER",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@katman.test" },
    update: {
      passwordHash,
      firstName: "Eda",
      lastName: "Kaya",
      name: "Eda Kaya",
      phone: "05322220000",
      role: "ADMIN",
    },
    create: {
      email: "admin@katman.test",
      passwordHash,
      firstName: "Eda",
      lastName: "Kaya",
      name: "Eda Kaya",
      phone: "05322220000",
      role: "ADMIN",
    },
  });

  await prisma.coupon.create({
    data: { code: "WELCOME10", percentOff: 10, active: true },
  });

  const categoryIds = new Map<string, string>();
  for (const [name, slug, description] of categories) {
    const category = await prisma.category.create({ data: { name, slug, description } });
    categoryIds.set(slug, category.id);
  }

  for (const product of products) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Kategori yok: ${product.category}`);

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        productionDays: product.productionDays,
        silhouette: product.silhouette,
        fit: product.fit,
        isPopular: true,
        categoryId,
        images: {
          create: product.colors.map((color, index) => ({
            url: `/garments/${product.silhouette.toLowerCase()}.svg`,
            alt: `${product.name}, ${color.name}`,
            sortOrder: index,
          })),
        },
        mockups: { create: [{ view: "front" }] },
        colors: { create: product.colors },
        sizes: { create: sizes.map((name, sortOrder) => ({ name, sortOrder })) },
      },
    });

    const saved = await prisma.product.findUniqueOrThrow({
      where: { slug: product.slug },
      include: { colors: true, sizes: true },
    });

    await prisma.productVariant.createMany({
      data: saved.colors.flatMap((color) =>
        saved.sizes.map((size) => ({
          productId: saved.id,
          colorId: color.id,
          sizeId: size.id,
          sku: `${product.slug}-${color.name}-${size.name}`.toLocaleLowerCase("tr"),
          stock: 24,
          priceDelta: 0,
        })),
      ),
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
