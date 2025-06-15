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
    console.log("Dashboard API called");

    const user = await getUserFromToken(request);
    console.log("User authenticated:", user.userId, user.role);

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Tidak memiliki akses admin" },
        { status: 403 }
      );
    }

    console.log("Starting dashboard data fetch...");

    // Fetch basic stats with error handling
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenueResult,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count().catch((error) => {
        console.error("Error counting orders:", error);
        return 0;
      }),
      prisma.product
        .count({
          where: { isActive: true },
        })
        .catch((error) => {
          console.error("Error counting products:", error);
          return 0;
        }),
      prisma.user
        .count({
          where: { role: "CUSTOMER" },
        })
        .catch((error) => {
          console.error("Error counting customers:", error);
          return 0;
        }),
      prisma.order
        .aggregate({
          where: { paymentStatus: "PAID" },
          _sum: { total: true },
        })
        .catch((error) => {
          console.error("Error aggregating revenue:", error);
          return { _sum: { total: 0 } };
        }),
      prisma.order
        .findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        })
        .catch((error) => {
          console.error("Error fetching recent orders:", error);
          return [];
        }),
    ]);

    console.log("Basic stats fetched successfully");

    // Fetch top products with proper error handling
    let topProducts = [];
    try {
      const topProductsRaw = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: {
          quantity: true,
          price: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      });

      console.log("Top products raw data:", topProductsRaw);

      if (topProductsRaw.length > 0) {
        const productIds = topProductsRaw.map((item) => item.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            images: true,
            category: {
              select: { name: true },
            },
          },
        });

        topProducts = topProductsRaw.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            id: product?.id || item.productId,
            name: product?.name || "Unknown Product",
            images: product?.images || null,
            category: product?.category || null,
            totalSold: item._sum.quantity || 0,
            totalRevenue: item._sum.price || 0,
          };
        });
      }
    } catch (error) {
      console.error("Error fetching top products:", error);
      topProducts = [];
    }

    console.log("Top products processed successfully");

    // Fetch monthly stats with error handling
    let monthlyStats = [];
    try {
      monthlyStats = await prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as orderCount,
          COALESCE(SUM(total), 0) as revenue
        FROM orders 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          AND paymentStatus = 'PAID'
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month ASC
      `;

      // Convert BigInt to Number for JSON serialization
      monthlyStats = monthlyStats.map((stat) => ({
        month: stat.month,
        orderCount: Number(stat.orderCount),
        revenue: Number(stat.revenue),
      }));
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      monthlyStats = [];
    }

    console.log("Monthly stats fetched successfully");

    const totalRevenue = totalRevenueResult._sum.total || 0;

    const dashboardData = {
      stats: {
        totalOrders: Number(totalOrders),
        totalProducts: Number(totalProducts),
        totalCustomers: Number(totalCustomers),
        totalRevenue: Number(totalRevenue),
      },
      recentOrders,
      topProducts,
      monthlyStats,
    };

    console.log("Dashboard data prepared successfully");

    return NextResponse.json({
      success: true,
      ...dashboardData,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        error: "Gagal mengambil data dashboard",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
