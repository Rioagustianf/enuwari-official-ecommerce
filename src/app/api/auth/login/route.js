import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    console.log("Login API called");

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", {
        email: body.email,
        password: "***",
      });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      console.log("Missing credentials:", {
        email: !!email,
        password: !!password,
      });
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email);
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    console.log("Looking for user with email:", email);

    // Cari user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    console.log("User found:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log("Invalid password for user:", user.email);
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    console.log("Password verified, creating token");

    // Buat JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Token created successfully");

    // Buat response
    const responseData = {
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    };

    const response = NextResponse.json(responseData);

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    console.log("Login successful for user:", user.email);
    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
