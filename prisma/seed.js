const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai seeding user...");

  // Hapus user lama
  await prisma.user.deleteMany();

  // Buat user admin
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "Admin Enuwari",
      email: "admin@enuwari.com",
      password: hashedPassword,
      phone: "081234567890",
      role: "ADMIN",
    },
  });

  // Hash password customer di luar array
  const customer1Password = await bcrypt.hash("password123", 12);
  const customer2Password = await bcrypt.hash("password123", 12);
  const customer3Password = await bcrypt.hash("password123", 12);

  // Buat beberapa user customer
  await prisma.user.createMany({
    data: [
      {
        name: "Budi Santoso",
        email: "budi@example.com",
        password: customer1Password,
        phone: "081234567891",
        role: "CUSTOMER",
      },
      {
        name: "Siti Nurhaliza",
        email: "siti@example.com",
        password: customer2Password,
        phone: "081234567892",
        role: "CUSTOMER",
      },
      {
        name: "Ahmad Rahman",
        email: "ahmad@example.com",
        password: customer3Password,
        phone: "081234567893",
        role: "CUSTOMER",
      },
    ],
  });

  console.log("User admin dan customer berhasil dibuat!");
  console.log("📧 Admin email: admin@enuwari.com");
  console.log("🔑 Admin password: admin123");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
