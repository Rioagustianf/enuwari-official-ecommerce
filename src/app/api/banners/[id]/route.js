import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { title, subtitle, image, link, order, isActive } =
      await request.json();
    if (!title || !image) {
      return NextResponse.json(
        { error: "Title dan image wajib diisi" },
        { status: 400 }
      );
    }
    const banner = await prisma.banner.update({
      where: { id },
      data: { title, subtitle, image, link, order, isActive },
    });
    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json({ error: "Gagal update banner" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ message: "Banner berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Gagal hapus banner" }, { status: 500 });
  }
}
