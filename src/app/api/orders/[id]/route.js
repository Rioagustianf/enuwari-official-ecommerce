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

export async function GET(request, { params }) {
  try {
    const user = await getUserFromToken(request);
    const { id } = await params;

    let where = { id };

    if (user.role === "CUSTOMER") {
      where.userId = user.userId;
    }

    const order = await prisma.order.findUnique({
      where,
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        orderItems: {
          include: {
            product: {
              select: { name: true, images: true, sku: true },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromToken(request);
    const { id } = await params;
    const { status, paymentStatus, trackingNumber } = await request.json();

    // Hanya admin yang bisa update order
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus,
        trackingNumber,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
