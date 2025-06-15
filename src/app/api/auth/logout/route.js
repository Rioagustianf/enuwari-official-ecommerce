import { NextResponse } from "next/server";

export async function POST(request) {
  const response = NextResponse.json({ message: "Logout berhasil" });

  // Hapus cookie token
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });

  return response;
}
