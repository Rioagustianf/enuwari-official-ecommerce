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
    const active = searchParams.get("active");
    const code = searchParams.get("code");

    let where = {};

    if (active === "true") {
      where = {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      };
    }

    if (code) {
      where.code = code;
    }

    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data promosi" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromToken(request);

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Tidak memiliki akses admin" },
        { status: 403 }
      );
    }

    const {
      name,
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
    } = await request.json();

    if (!name || !code || !type || !value || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Data promosi tidak lengkap" },
        { status: 400 }
      );
    }

    // Cek apakah kode promosi sudah ada
    const existingPromo = await prisma.promotion.findUnique({
      where: { code },
    });

    if (existingPromo) {
      return NextResponse.json(
        { error: "Kode promosi sudah digunakan" },
        { status: 400 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        name,
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json(
      { error: "Gagal membuat promosi" },
      { status: 500 }
    );
  }
}
