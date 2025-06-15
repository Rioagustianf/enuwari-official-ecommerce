import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "public/uploads");

    // Buat folder jika belum ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Hanya terima file gambar
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File harus berupa gambar"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const uploadMiddleware = promisify(upload.array("images", 5));

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada file yang diupload" },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (file.size === 0) continue;

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "File harus berupa gambar" },
          { status: 400 }
        );
      }

      // Validasi ukuran file (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Ukuran file tidak boleh lebih dari 5MB" },
          { status: 400 }
        );
      }

      // Generate nama file unik
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.name);
      const filename = `image-${uniqueSuffix}${extension}`;

      // Path untuk menyimpan file
      const uploadPath = path.join(process.cwd(), "public/uploads");

      // Buat folder jika belum ada
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const filepath = path.join(uploadPath, filename);

      // Simpan file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(filepath, buffer);

      // URL untuk akses file
      const fileUrl = `/uploads/${filename}`;
      uploadedFiles.push(fileUrl);
    }

    return NextResponse.json({
      message: "Upload berhasil",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengupload file" },
      { status: 500 }
    );
  }
}

// API untuk menghapus file
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "Nama file tidak ditemukan" },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), "public", filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return NextResponse.json({ message: "File berhasil dihapus" });
    } else {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus file" },
      { status: 500 }
    );
  }
}
