import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { code, orderTotal } = await request.json();

    if (!code || !orderTotal) {
      return NextResponse.json(
        { error: "Kode promosi dan total pesanan wajib diisi" },
        { status: 400 }
      );
    }

    // Cari promosi berdasarkan kode
    const promotion = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: "Kode promosi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validasi promosi
    const now = new Date();

    if (!promotion.isActive) {
      return NextResponse.json(
        { error: "Promosi tidak aktif" },
        { status: 400 }
      );
    }

    if (now < promotion.startDate || now > promotion.endDate) {
      return NextResponse.json(
        { error: "Promosi sudah tidak berlaku" },
        { status: 400 }
      );
    }

    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return NextResponse.json(
        { error: "Batas penggunaan promosi sudah tercapai" },
        { status: 400 }
      );
    }

    if (promotion.minPurchase && orderTotal < promotion.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimal pembelian Rp ${promotion.minPurchase.toLocaleString(
            "id-ID"
          )}`,
        },
        { status: 400 }
      );
    }

    // Hitung diskon
    let discountAmount = 0;

    if (promotion.type === "PERCENTAGE") {
      discountAmount = (orderTotal * promotion.value) / 100;

      if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
        discountAmount = promotion.maxDiscount;
      }
    } else if (promotion.type === "FIXED_AMOUNT") {
      discountAmount = promotion.value;
    }

    // Pastikan diskon tidak melebihi total pesanan
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    return NextResponse.json({
      valid: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        value: promotion.value,
      },
      discountAmount,
      finalTotal: orderTotal - discountAmount,
    });
  } catch (error) {
    console.error("Error applying promotion:", error);
    return NextResponse.json(
      { error: "Gagal menerapkan promosi" },
      { status: 500 }
    );
  }
}
