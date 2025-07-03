import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function getUserFromToken(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Token tidak valid");
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromToken(request);

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Tidak memiliki akses admin" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "sales";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = {
        createdAt: {
          gte: start,
          lte: end,
        },
      };
    }

    let reportData = {};

    switch (type) {
      case "sales":
        reportData = await getSalesReport(dateFilter);
        reportData = convertBigInt(reportData);
        break;
      case "products":
        reportData = await getProductsReport(dateFilter);
        reportData = convertBigInt(reportData);
        break;
      case "customers":
        reportData = await getCustomersReport(dateFilter);
        reportData = convertBigInt(reportData);
        break;
      default:
        reportData = await getSalesReport(dateFilter);
        reportData = convertBigInt(reportData);
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Gagal membuat laporan" },
      { status: 500 }
    );
  }
}

async function getSalesReport(dateFilter) {
  // DEBUG: print dateFilter
  console.log("[REPORT DEBUG] dateFilter:", JSON.stringify(dateFilter));

  // DEBUG: print semua order PAID
  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: "PAID" },
    select: { id: true, orderNumber: true, createdAt: true, status: true },
    orderBy: { createdAt: "desc" },
  });
  console.log("[REPORT DEBUG] paidOrders:", paidOrders);

  const [
    totalSales,
    totalOrders,
    averageOrderValue,
    salesByStatus,
    dailySales,
  ] = await Promise.all([
    // Total sales
    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        ...dateFilter,
      },
      _sum: { total: true },
    }),

    // Total orders
    prisma.order.count({
      where: dateFilter,
    }),

    // Average order value
    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        ...dateFilter,
      },
      _avg: { total: true },
    }),

    // Sales by status
    prisma.order.groupBy({
      by: ["status"],
      where: dateFilter,
      _count: { status: true },
      _sum: { total: true },
    }),

    // Daily sales
    (() => {
      if (
        dateFilter.createdAt &&
        dateFilter.createdAt.gte &&
        dateFilter.createdAt.lte
      ) {
        return prisma.$queryRaw`
          SELECT 
            DATE(createdAt) as date,
            COUNT(*) as orderCount,
            SUM(total) as revenue
          FROM orders 
          WHERE paymentStatus = 'PAID'
            AND createdAt >= ${dateFilter.createdAt.gte}
            AND createdAt <= ${dateFilter.createdAt.lte}
          GROUP BY DATE(createdAt)
          ORDER BY date ASC
        `;
      } else {
        return prisma.$queryRaw`
          SELECT 
            DATE(createdAt) as date,
            COUNT(*) as orderCount,
            SUM(total) as revenue
          FROM orders 
          WHERE paymentStatus = 'PAID'
          GROUP BY DATE(createdAt)
          ORDER BY date ASC
        `;
      }
    })(),
  ]);

  // DEBUG LOG
  console.log("[REPORT DEBUG] totalSales:", totalSales);
  console.log("[REPORT DEBUG] totalOrders:", totalOrders);
  console.log("[REPORT DEBUG] averageOrderValue:", averageOrderValue);
  console.log("[REPORT DEBUG] salesByStatus:", salesByStatus);
  console.log("[REPORT DEBUG] dailySales:", dailySales);

  return {
    totalSales: totalSales._sum.total || 0,
    totalOrders,
    averageOrderValue: averageOrderValue._avg.total || 0,
    salesByStatus,
    dailySales,
  };
}

async function getProductsReport(dateFilter) {
  const [topSellingProducts, lowStockProducts, categoryPerformance] =
    await Promise.all([
      // Top selling products
      prisma.orderItem
        .groupBy({
          by: ["productId"],
          _sum: { quantity: true },
          _sum: { price: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 10,
        })
        .then(async (items) => {
          const productIds = items.map((item) => item.productId);
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, images: true, category: true },
          });

          return items.map((item) => ({
            ...products.find((p) => p.id === item.productId),
            totalSold: item._sum.quantity,
            totalRevenue: item._sum.price,
          }));
        }),

      // Low stock products
      prisma.product.findMany({
        where: {
          stock: { lte: 10 },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          stock: true,
          images: true,
        },
        orderBy: { stock: "asc" },
      }),

      // Category performance
      prisma.category
        .findMany({
          include: {
            products: {
              include: {
                orderItems: {
                  select: {
                    quantity: true,
                    price: true,
                  },
                },
              },
            },
          },
        })
        .then((categories) =>
          categories.map((category) => ({
            id: category.id,
            name: category.name,
            totalProducts: category.products.length,
            totalSold: category.products.reduce(
              (sum, product) =>
                sum +
                product.orderItems.reduce(
                  (itemSum, item) => itemSum + item.quantity,
                  0
                ),
              0
            ),
            totalRevenue: category.products.reduce(
              (sum, product) =>
                sum +
                product.orderItems.reduce(
                  (itemSum, item) => itemSum + item.price,
                  0
                ),
              0
            ),
          }))
        ),
    ]);

  return {
    topSellingProducts,
    lowStockProducts,
    categoryPerformance,
  };
}

async function getCustomersReport(dateFilter) {
  const [totalCustomers, newCustomers, topCustomers, customerGrowth] =
    await Promise.all([
      // Total customers
      prisma.user.count({
        where: { role: "CUSTOMER" },
      }),

      // New customers
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          ...dateFilter,
        },
      }),

      // Top customers by orders
      prisma.user
        .findMany({
          where: { role: "CUSTOMER" },
          include: {
            orders: {
              where: { paymentStatus: "PAID" },
              select: { total: true },
            },
          },
        })
        .then((users) =>
          users
            .map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              totalOrders: user.orders.length,
              totalSpent: user.orders.reduce(
                (sum, order) => sum + order.total,
                0
              ),
            }))
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10)
        ),

      // Customer growth
      prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as newCustomers
      FROM users 
      WHERE role = 'CUSTOMER'
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `,
    ]);

  return {
    totalCustomers,
    newCustomers,
    topCustomers,
    customerGrowth,
  };
}

function convertBigInt(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertBigInt);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        newObj[key] = Number(obj[key]);
      } else if (typeof obj[key] === "object") {
        newObj[key] = convertBigInt(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  return obj;
}
