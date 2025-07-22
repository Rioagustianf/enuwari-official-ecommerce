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

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            images: true,
            stock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data keranjang" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromToken(request);
    const { productId, quantity, size } = await request.json();

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Product ID dan quantity wajib diisi" },
        { status: 400 }
      );
    }

    // Cek stok produk
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Stok tidak mencukupi" },
        { status: 400 }
      );
    }

    // Cek apakah item sudah ada di cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size: {
          userId: user.userId,
          productId,
          size: size || "",
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              salePrice: true,
              images: true,
              stock: true,
            },
          },
        },
      });
    } else {
      // Buat cart item baru
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.userId,
          productId,
          quantity,
          size: size || "",
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              salePrice: true,
              images: true,
              stock: true,
            },
          },
        },
      });
    }

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan ke keranjang" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getUserFromToken(request);
    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || !quantity) {
      return NextResponse.json(
        { error: "Cart item ID dan quantity wajib diisi" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      // Hapus item jika quantity 0 atau negatif
      await prisma.cartItem.delete({
        where: {
          id: cartItemId,
          userId: user.userId,
        },
      });

      return NextResponse.json({ message: "Item dihapus dari keranjang" });
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        id: cartItemId,
        userId: user.userId,
      },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            images: true,
            stock: true,
          },
        },
      },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate keranjang" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getUserFromToken(request);
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get("id");

    if (cartItemId) {
      // Hapus item tertentu
      try {
        await prisma.cartItem.delete({
          where: {
            id: cartItemId,
            userId: user.userId,
          },
        });
      } catch (err) {
        // Jika error P2025 (record not found), anggap sukses (idempotent)
        if (err.code !== "P2025") throw err;
      }
    } else {
      // Hapus semua item di cart
      await prisma.cartItem.deleteMany({
        where: { userId: user.userId },
      });
    }

    return NextResponse.json({
      message: "Item berhasil dihapus dari keranjang",
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json(
      { error: "Gagal menghapus item dari keranjang" },
      { status: 500 }
    );
  }
}
