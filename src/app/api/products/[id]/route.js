import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        productSizes: true,
        reviews: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hitung rating rata-rata
    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;

    return NextResponse.json({
      ...product,
      averageRating,
      reviewCount: product.reviews.length,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    // Mapping data update
    const updateData = {
      name: data.name,
      description: data.description || null,
      price: data.price ? parseFloat(data.price) : null,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      sku: data.sku,
      stock: data.stock ? parseInt(data.stock) : 0,
      weight: data.weight ? parseInt(data.weight) : null,
      dimensions: data.dimensions || null,
      images: data.images,
      isActive:
        typeof data.isActive === "boolean"
          ? data.isActive
          : data.isActive === "true",
      isFeatured:
        typeof data.isFeatured === "boolean"
          ? data.isFeatured
          : data.isFeatured === "true",
      slug: data.name
        ? data.name.toLowerCase().replace(/\s+/g, "-")
        : undefined,
    };
    if (data.categoryId) {
      updateData.category = { connect: { id: data.categoryId } };
    }

    // Update produk dan ukuran dalam transaction
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: updateData,
      });
      if (data.sizes && Array.isArray(data.sizes)) {
        // Hapus semua ukuran lama
        await tx.productSize.deleteMany({ where: { productId: id } });
        // Insert ulang ukuran baru
        if (data.sizes.length > 0) {
          await tx.productSize.createMany({
            data: data.sizes.map((size) => ({
              productId: id,
              size: size.size,
              stock: parseInt(size.stock) || 0,
            })),
          });
        }
      }
      return product;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate produk" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
