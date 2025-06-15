const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai seeding database...");

  // Hapus data yang sudah ada
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.promotion.deleteMany();

  console.log("Data lama berhasil dihapus");

  // Buat kategori
  const categories = await prisma.category.createMany({
    data: [
      {
        name: "Kaos & T-Shirt",
        slug: "kaos-t-shirt",
        description: "Koleksi kaos dan t-shirt berkualitas tinggi",
        image: "/uploads/category-kaos.jpg",
        isActive: true,
      },
      {
        name: "Kemeja",
        slug: "kemeja",
        description: "Kemeja formal dan kasual untuk berbagai acara",
        image: "/uploads/category-kemeja.jpg",
        isActive: true,
      },
      {
        name: "Jaket & Hoodie",
        slug: "jaket-hoodie",
        description: "Jaket dan hoodie untuk gaya kasual",
        image: "/uploads/category-jaket.jpg",
        isActive: true,
      },
      {
        name: "Celana",
        slug: "celana",
        description: "Celana panjang dan pendek untuk pria dan wanita",
        image: "/uploads/category-celana.jpg",
        isActive: true,
      },
      {
        name: "Dress & Rok",
        slug: "dress-rok",
        description: "Dress dan rok untuk wanita",
        image: "/uploads/category-dress.jpg",
        isActive: true,
      },
      {
        name: "Seragam",
        slug: "seragam",
        description: "Seragam sekolah, kantor, dan organisasi",
        image: "/uploads/category-seragam.jpg",
        isActive: true,
      },
    ],
  });

  console.log("Kategori berhasil dibuat");

  // Ambil kategori yang sudah dibuat
  const categoryList = await prisma.category.findMany();

  // Buat user admin
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin Enuwari",
      email: "admin@enuwari.com",
      password: hashedPassword,
      phone: "081234567890",
      role: "ADMIN",
    },
  });

  // Buat beberapa user customer
  const customers = await prisma.user.createMany({
    data: [
      {
        name: "Budi Santoso",
        email: "budi@example.com",
        password: await bcrypt.hash("password123", 12),
        phone: "081234567891",
        role: "CUSTOMER",
      },
      {
        name: "Siti Nurhaliza",
        email: "siti@example.com",
        password: await bcrypt.hash("password123", 12),
        phone: "081234567892",
        role: "CUSTOMER",
      },
      {
        name: "Ahmad Rahman",
        email: "ahmad@example.com",
        password: await bcrypt.hash("password123", 12),
        phone: "081234567893",
        role: "CUSTOMER",
      },
    ],
  });

  console.log("User berhasil dibuat");

  // Buat produk contoh
  const products = [
    // Kaos & T-Shirt
    {
      name: "Kaos Polos Cotton Combed 30s",
      slug: "kaos-polos-cotton-combed-30s",
      description:
        "Kaos polos berbahan cotton combed 30s yang nyaman dan berkualitas tinggi. Cocok untuk kaos seragam, merchandise, atau penggunaan sehari-hari.",
      price: 45000,
      salePrice: 35000,
      sku: "KPC30S-001",
      stock: 150,
      weight: 200,
      dimensions: "70x50x2",
      categoryId: categoryList[0].id,
      images: JSON.stringify([
        "/uploads/kaos-polos-putih.jpg",
        "/uploads/kaos-polos-hitam.jpg",
        "/uploads/kaos-polos-navy.jpg",
      ]),
      isActive: true,
      isFeatured: true,
    },
    {
      name: "T-Shirt Premium Cotton 24s",
      slug: "t-shirt-premium-cotton-24s",
      description:
        "T-shirt premium dengan bahan cotton 24s yang lebih tebal dan berkualitas. Ideal untuk sablon dan bordir.",
      price: 65000,
      sku: "TPC24S-001",
      stock: 100,
      weight: 250,
      categoryId: categoryList[0].id,
      images: JSON.stringify([
        "/uploads/tshirt-premium-putih.jpg",
        "/uploads/tshirt-premium-abu.jpg",
      ]),
      isActive: true,
      isFeatured: true,
    },

    // Kemeja
    {
      name: "Kemeja Formal Pria Lengan Panjang",
      slug: "kemeja-formal-pria-lengan-panjang",
      description:
        "Kemeja formal pria lengan panjang berbahan katun berkualitas. Cocok untuk acara formal dan kantor.",
      price: 120000,
      salePrice: 95000,
      sku: "KFP-LP-001",
      stock: 75,
      weight: 300,
      categoryId: categoryList[1].id,
      images: JSON.stringify([
        "/uploads/kemeja-formal-putih.jpg",
        "/uploads/kemeja-formal-biru.jpg",
      ]),
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Kemeja Batik Wanita Modern",
      slug: "kemeja-batik-wanita-modern",
      description:
        "Kemeja batik wanita dengan desain modern dan motif tradisional. Nyaman dipakai untuk berbagai acara.",
      price: 150000,
      sku: "KBW-MOD-001",
      stock: 50,
      weight: 280,
      categoryId: categoryList[1].id,
      images: JSON.stringify([
        "/uploads/kemeja-batik-wanita-1.jpg",
        "/uploads/kemeja-batik-wanita-2.jpg",
      ]),
      isActive: true,
    },

    // Jaket & Hoodie
    {
      name: "Hoodie Fleece Premium",
      slug: "hoodie-fleece-premium",
      description:
        "Hoodie berbahan fleece premium yang hangat dan nyaman. Cocok untuk cuaca dingin dan gaya kasual.",
      price: 180000,
      salePrice: 150000,
      sku: "HFP-001",
      stock: 60,
      weight: 500,
      categoryId: categoryList[2].id,
      images: JSON.stringify([
        "/uploads/hoodie-hitam.jpg",
        "/uploads/hoodie-abu.jpg",
        "/uploads/hoodie-navy.jpg",
      ]),
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Jaket Bomber Unisex",
      slug: "jaket-bomber-unisex",
      description:
        "Jaket bomber unisex dengan desain trendy dan bahan berkualitas. Cocok untuk pria dan wanita.",
      price: 200000,
      sku: "JBU-001",
      stock: 40,
      weight: 450,
      categoryId: categoryList[2].id,
      images: JSON.stringify([
        "/uploads/jaket-bomber-hitam.jpg",
        "/uploads/jaket-bomber-olive.jpg",
      ]),
      isActive: true,
    },

    // Celana
    {
      name: "Celana Chino Pria",
      slug: "celana-chino-pria",
      description:
        "Celana chino pria dengan bahan cotton twill yang nyaman dan tahan lama. Cocok untuk gaya kasual dan semi formal.",
      price: 135000,
      salePrice: 110000,
      sku: "CCP-001",
      stock: 80,
      weight: 400,
      categoryId: categoryList[3].id,
      images: JSON.stringify([
        "/uploads/celana-chino-khaki.jpg",
        "/uploads/celana-chino-navy.jpg",
      ]),
      isActive: true,
    },
    {
      name: "Celana Kulot Wanita",
      slug: "celana-kulot-wanita",
      description:
        "Celana kulot wanita dengan model yang trendy dan nyaman dipakai. Cocok untuk berbagai acara.",
      price: 95000,
      sku: "CKW-001",
      stock: 65,
      weight: 300,
      categoryId: categoryList[3].id,
      images: JSON.stringify([
        "/uploads/celana-kulot-hitam.jpg",
        "/uploads/celana-kulot-cream.jpg",
      ]),
      isActive: true,
    },

    // Dress & Rok
    {
      name: "Dress Midi Casual",
      slug: "dress-midi-casual",
      description:
        "Dress midi dengan desain casual yang elegan. Cocok untuk acara santai maupun semi formal.",
      price: 125000,
      sku: "DMC-001",
      stock: 45,
      weight: 350,
      categoryId: categoryList[4].id,
      images: JSON.stringify([
        "/uploads/dress-midi-floral.jpg",
        "/uploads/dress-midi-polos.jpg",
      ]),
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Rok Plisket A-Line",
      slug: "rok-plisket-a-line",
      description:
        "Rok plisket dengan model A-line yang feminin dan elegan. Cocok untuk berbagai acara formal.",
      price: 85000,
      sku: "RPA-001",
      stock: 55,
      weight: 250,
      categoryId: categoryList[4].id,
      images: JSON.stringify([
        "/uploads/rok-plisket-navy.jpg",
        "/uploads/rok-plisket-hitam.jpg",
      ]),
      isActive: true,
    },

    // Seragam
    {
      name: "Seragam Sekolah SMP/SMA",
      slug: "seragam-sekolah-smp-sma",
      description:
        "Seragam sekolah untuk SMP/SMA dengan bahan berkualitas dan jahitan rapi. Tersedia berbagai ukuran.",
      price: 160000,
      salePrice: 140000,
      sku: "SSS-001",
      stock: 120,
      weight: 400,
      categoryId: categoryList[5].id,
      images: JSON.stringify([
        "/uploads/seragam-smp-putih.jpg",
        "/uploads/seragam-sma-abu.jpg",
      ]),
      isActive: true,
    },
    {
      name: "Seragam Kantor Formal",
      slug: "seragam-kantor-formal",
      description:
        "Seragam kantor formal dengan desain profesional. Cocok untuk berbagai jenis pekerjaan kantor.",
      price: 200000,
      sku: "SKF-001",
      stock: 70,
      weight: 450,
      categoryId: categoryList[5].id,
      images: JSON.stringify([
        "/uploads/seragam-kantor-navy.jpg",
        "/uploads/seragam-kantor-abu.jpg",
      ]),
      isActive: true,
    },
  ];

  // Insert produk satu per satu untuk mendapatkan ID
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Tambahkan ukuran untuk setiap produk
    const sizes = ["S", "M", "L", "XL", "XXL"];
    const productSizes = sizes.map((size) => ({
      productId: product.id,
      size: size,
      stock: Math.floor(Math.random() * 20) + 5, // Random stock 5-25
    }));

    await prisma.productSize.createMany({
      data: productSizes,
    });
  }

  console.log("Produk dan ukuran berhasil dibuat");

  // Buat banner
  await prisma.banner.createMany({
    data: [
      {
        title: "Koleksi Terbaru Enuwari",
        subtitle:
          "Dapatkan produk konveksi berkualitas dengan harga terjangkau",
        image: "/uploads/banner-1.jpg",
        link: "/products",
        isActive: true,
        order: 1,
      },
      {
        title: "Promo Spesial Akhir Tahun",
        subtitle: "Diskon hingga 50% untuk semua kategori produk",
        image: "/uploads/banner-2.jpg",
        link: "/products?sale=true",
        isActive: true,
        order: 2,
      },
      {
        title: "Custom Order Tersedia",
        subtitle: "Pesan seragam dan merchandise sesuai kebutuhan Anda",
        image: "/uploads/banner-3.jpg",
        link: "/contact",
        isActive: true,
        order: 3,
      },
    ],
  });

  console.log("Banner berhasil dibuat");

  // Buat promosi
  await prisma.promotion.createMany({
    data: [
      {
        name: "Diskon Akhir Tahun",
        code: "AKHIRTAHUN2025",
        type: "PERCENTAGE",
        value: 25,
        minPurchase: 200000,
        maxDiscount: 100000,
        startDate: new Date("2025-12-01"),
        endDate: new Date("2025-12-31"),
        isActive: true,
        usageLimit: 100,
        usageCount: 0,
      },
      {
        name: "Gratis Ongkir",
        code: "GRATISONGKIR",
        type: "FIXED_AMOUNT",
        value: 15000,
        minPurchase: 150000,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        isActive: true,
        usageLimit: 500,
        usageCount: 0,
      },
      {
        name: "Member Baru",
        code: "NEWMEMBER",
        type: "PERCENTAGE",
        value: 15,
        minPurchase: 100000,
        maxDiscount: 50000,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        isActive: true,
        usageLimit: 1000,
        usageCount: 0,
      },
    ],
  });

  console.log("Promosi berhasil dibuat");

  console.log("🌱 Seeding selesai!");
  console.log("📧 Admin email: admin@enuwari.com");
  console.log("🔑 Admin password: admin123");
  console.log(`📦 Total produk: ${products.length}`);
  console.log(`📂 Total kategori: ${categoryList.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
