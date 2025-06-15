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
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    let where = {};
    if (productId) {
      where.productId = productId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: { name: true },
          },
          product: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Jika ada userId, cek apakah user sudah pernah beli dan delivered
    let canReview = false;
    let hasReviewed = false;

    if (userId && productId) {
      // Cek apakah user sudah pernah review produk ini
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          productId,
        },
      });
      hasReviewed = !!existingReview;

      // Cek apakah user pernah membeli produk ini dan sudah delivered
      const deliveredOrder = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId,
            status: "DELIVERED",
            paymentStatus: "PAID",
          },
        },
      });
      canReview = !!deliveredOrder && !hasReviewed;
    }

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      canReview,
      hasReviewed,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data ulasan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    // Log untuk debugging
    console.log("Reviews POST API called");

    const user = await getUserFromToken(request);
    console.log("User authenticated:", user.userId);

    // Parse request body dengan error handling
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", body);
      if (!body.productId) {
        console.error("[API/REVIEWS] productId tidak ditemukan di body:", body);
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { productId, rating, comment } = body;

    // Validasi input
    if (!productId || !rating) {
      return NextResponse.json(
        { error: "Product ID dan rating wajib diisi" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating harus antara 1-5" },
        { status: 400 }
      );
    }

    console.log(
      "Checking existing review for user:",
      user.userId,
      "product:",
      productId
    );

    // Cek apakah user sudah pernah review produk ini
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.userId,
        productId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Anda sudah memberikan ulasan untuk produk ini" },
        { status: 400 }
      );
    }

    console.log("Checking if user bought and received product");

    // Cek apakah user pernah membeli produk ini dan sudah delivered
    const deliveredOrder = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.userId,
          status: "DELIVERED",
          paymentStatus: "PAID",
        },
      },
    });

    if (!deliveredOrder) {
      return NextResponse.json(
        {
          error:
            "Anda hanya bisa memberikan ulasan untuk produk yang sudah dibeli dan diterima",
        },
        { status: 400 }
      );
    }

    console.log("Creating review");

    const review = await prisma.review.create({
      data: {
        userId: user.userId,
        productId,
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    console.log("Review created successfully:", review.id);

    return NextResponse.json(
      {
        success: true,
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Gagal membuat ulasan", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
