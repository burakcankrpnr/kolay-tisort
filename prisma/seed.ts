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
  await prisma.designerProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.emailMessage.deleteMany();
  await prisma.businessRequest.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.dTFDesign.deleteMany();
  await prisma.dTFSheet.deleteMany();
  await prisma.dTFOrder.deleteMany();
  await prisma.designLayer.deleteMany();
  await prisma.design.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.page.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();

  const passwordHash = await bcrypt.hash("Katman123!", 12);
  const adminPasswordHash = await bcrypt.hash("123456", 12);

  const customer = await prisma.user.upsert({
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

  // Eski demo yöneticiyi müşteriye düşür (çakışma olmasın)
  await prisma.user.updateMany({
    where: { email: "admin@katman.test" },
    data: { role: "CUSTOMER" },
  });

  await prisma.user.upsert({
    where: { email: "stylingpark@gmail.com" },
    update: {
      passwordHash: adminPasswordHash,
      firstName: "Styling",
      lastName: "Park",
      name: "Styling Park",
      phone: "05322220000",
      role: "ADMIN",
    },
    create: {
      email: "stylingpark@gmail.com",
      passwordHash: adminPasswordHash,
      firstName: "Styling",
      lastName: "Park",
      name: "Styling Park",
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

  const stickerId = categoryIds.get("sticker");
  if (!stickerId) throw new Error("Sticker kategorisi yok.");
  const sheet = await prisma.product.create({
    data: {
      name: "DTF Tabaka",
      slug: "dtf-tabaka",
      description: "Tabaka baskı satırı. Vitrinde görünmez, DTF editörü sepete bunu yazar.",
      basePrice: 0,
      productionDays: 2,
      silhouette: "TEE",
      fit: "REGULAR",
      isPopular: false,
      categoryId: stickerId,
      colors: { create: { name: "Şeffaf", hex: "#F3F3F0" } },
      sizes: { create: { name: "Tabaka", sortOrder: 0 } },
    },
    include: { colors: true, sizes: true },
  });
  await prisma.productVariant.create({
    data: {
      productId: sheet.id,
      colorId: sheet.colors[0].id,
      sizeId: sheet.sizes[0].id,
      sku: "dtf-tabaka",
      stock: 500,
    },
  });

  const designer = await prisma.user.upsert({
    where: { email: "tasarimci@katman.test" },
    update: { passwordHash, firstName: "Ada", lastName: "Demir", name: "Ada Demir", role: "DESIGNER" },
    create: {
      email: "tasarimci@katman.test",
      passwordHash,
      firstName: "Ada",
      lastName: "Demir",
      name: "Ada Demir",
      role: "DESIGNER",
    },
  });
  await prisma.designerProfile.create({ data: { userId: designer.id, displayName: "Ada Demir" } });
  const anime = await prisma.product.findUniqueOrThrow({ where: { slug: "anime-tisort" } });
  const design = await prisma.design.create({
    data: {
      userId: designer.id,
      productId: anime.id,
      name: "Gece çizgisi",
      previewUrl: "/garments/tee.svg",
      frontJson: { pieces: [] },
    },
  });
  await prisma.listing.create({
    data: {
      userId: designer.id,
      productId: anime.id,
      designId: design.id,
      title: "Gece çizgisi",
      category: "ANIME",
      tags: "gece, çizgi",
      price: 7900,
      imageUrl: "/garments/tee.svg",
      status: "APPROVED",
      rating: 5,
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: "Deniz Yılmaz",
      phone: "05321110000",
      city: "İstanbul",
      district: "Kadıköy",
      line1: "Moda Caddesi 12 Daire 3",
      postalCode: "34710",
      isDefault: true,
    },
  });

  await prisma.page.create({
    data: {
      slug: "hero",
      kind: "hero",
      title: "Kendi Tasarımını Giy.",
      body: "Tasarımını yükle, ürününü seç, baskını oluştur. Biz üretelim, kapına gönderelim.",
    },
  });
  await prisma.page.create({
    data: {
      slug: "faq",
      kind: "faq",
      title: "Sık sorulanlar",
      body: JSON.stringify([
        { q: "Baskı ne kadar sürer?", a: "Üretim çoğu üründe 3 iş günü, hoodie’de 4 iş günü. Kargo buna eklenir." },
        { q: "Hangi kargoyu kullanıyorsunuz?", a: "Aras, Yurtiçi, MNG ve Sürat. Ücreti ve süreyi ödemede görürsün." },
        { q: "Tasarımımı şimdi yükleyebilir miyim?", a: "Evet. Ürün sayfasından veya Kendin Tasarla menüsünden editöre gir." },
      ]),
    },
  });

  await prisma.blogPost.createMany({
    data: [
      {
        title: "Baskı dosyası nasıl hazırlanır",
        slug: "baski-dosyasi-nasil-hazirlanir",
        excerpt: "Şeffaf zemin, yeterli çözünürlük ve taşmayan yerleşim.",
        body: "PNG ya da SVG kullan. Baskı alanı 35×40 santim. 300 DPI net bir baskı verir, 150 DPI altında uyarı çıkar.\nYazıyı kalın ve okunur tut. Açık zemini editörde temizleyebilirsin.",
      },
      {
        title: "DTF tabaka nasıl dizilir",
        slug: "dtf-tabaka-nasil-dizilir",
        excerpt: "Parçalar arasında pay bırak, AUTOFIT ile sıkıştır.",
        body: "Tabakayı 30×40 ile 60×90 arasında seç. Görselleri sürükle, gerekirse 90 derece döndür.\nAUTOFIT parçaları üst üste bindirmeden rafa dizer. Adet tabaka fiyatıyla çarpılır.",
      },
      {
        title: "Kurumsal siparişte adet indirimi",
        slug: "kurumsal-adet-indirimi",
        excerpt: "10, 20 ve 50 adette kademe değişir.",
        body: "10 adette yüzde 5, 20 adette yüzde 10, 50 adette yüzde 15 indirim uygulanır.\nFormu doldurunca teklif tutarı kayda geçer ve yönetim ekranında görünür.",
      },
    ],
  });
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
