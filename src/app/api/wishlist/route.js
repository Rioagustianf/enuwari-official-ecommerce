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

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.userId },
      include: {
        product: {
          include: {
            category: true,
            reviews: {
              select: { rating: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const wishlistWithRating = wishlist.map((item) => ({
      ...item,
      product: {
        ...item.product,
        averageRating:
          item.product.reviews.length > 0
            ? item.product.reviews.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / item.product.reviews.length
            : 0,
        reviewCount: item.product.reviews.length,
      },
    }));

    return NextResponse.json(wishlistWithRating);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromToken(request);
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah produk sudah ada di wishlist
    const existingWishlist = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.userId,
          productId,
        },
      },
    });

    if (existingWishlist) {
      // Jika sudah ada, hapus dari wishlist
      await prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId: user.userId,
            productId,
          },
        },
      });

      return NextResponse.json({ message: "Produk dihapus dari wishlist" });
    } else {
      // Jika belum ada, tambah ke wishlist
      const wishlist = await prisma.wishlist.create({
        data: {
          userId: user.userId,
          productId,
        },
        include: {
          product: true,
        },
      });

      return NextResponse.json(
        { message: "Produk ditambahkan ke wishlist", wishlist },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error managing wishlist:", error);
    return NextResponse.json(
      { error: "Gagal mengelola wishlist" },
      { status: 500 }
    );
  }
}
