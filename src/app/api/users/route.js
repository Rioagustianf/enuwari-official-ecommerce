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
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const skip = (page - 1) * limit;

    let where = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate total spent for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalSpent = await prisma.order.aggregate({
          where: {
            userId: user.id,
            paymentStatus: "PAID",
          },
          _sum: { total: true },
        });

        return {
          ...user,
          totalSpent: totalSpent._sum.total || 0,
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getUserFromToken(request);
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Tidak memiliki akses admin" },
        { status: 403 }
      );
    }
    const body = await request.json();
    const updateData = {};
    if (body.name) updateData.name = body.name;
    // Ganti password
    if (body.password) {
      if (!body.oldPassword) {
        return NextResponse.json(
          { error: "Password lama wajib diisi" },
          { status: 400 }
        );
      }
      // Cek password lama
      const dbUser = await prisma.user.findUnique({
        where: { id: user.userId },
      });
      if (!dbUser) {
        return NextResponse.json(
          { error: "User tidak ditemukan" },
          { status: 404 }
        );
      }
      // Cek password lama (hash compare)
      const bcrypt = require("bcryptjs");
      const match = await bcrypt.compare(body.oldPassword, dbUser.password);
      if (!match) {
        return NextResponse.json(
          { error: "Password lama salah" },
          { status: 400 }
        );
      }
      // Hash password baru
      const hashed = await bcrypt.hash(body.password, 10);
      updateData.password = hashed;
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data yang diupdate" },
        { status: 400 }
      );
    }
    await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
    });
    return NextResponse.json({ message: "Update admin berhasil" });
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json({ error: "Gagal update admin" }, { status: 500 });
  }
}
