import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper function untuk mendapatkan user dari token
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    let where = {};

    if (user.role === "CUSTOMER") {
      where.userId = user.userId;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true },
          },
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true, images: true },
              },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromToken(request);
    const { items, shippingAddress, shippingCost, courier, service } =
      await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Item pesanan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Hitung subtotal
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const total = subtotal + shippingCost;

    // Buat order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.userId,
        shippingAddress,
        shippingCost,
        subtotal,
        total,
        courier,
        status: "PENDING",
        paymentStatus: "PENDING",
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update stok produk
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}
