import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    let where = {};
    if (active === "true") {
      where.isActive = true;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data banner" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { title, subtitle, image, link, order } = await request.json();

    if (!title || !image) {
      return NextResponse.json(
        { error: "Title dan image wajib diisi" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        image,
        link,
        order: order || 0,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Gagal membuat banner" },
      { status: 500 }
    );
  }
}
