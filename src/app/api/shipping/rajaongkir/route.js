import { NextResponse } from "next/server";
import axios from "axios";

const RAJAONGKIR_BASE_URL = "https://api.rajaongkir.com/starter";

export async function POST(request) {
  try {
    const { origin, destination, weight, courier } = await request.json();

    // Validasi input
    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json(
        { error: "Parameter tidak lengkap" },
        { status: 400 }
      );
    }

    // Validasi API key
    if (!process.env.RAJAONGKIR_API_KEY) {
      return NextResponse.json(
        { error: "RajaOngkir API key tidak ditemukan" },
        { status: 500 }
      );
    }

    console.log("RajaOngkir request:", {
      origin,
      destination,
      weight,
      courier,
    });

    const response = await axios.post(
      `${RAJAONGKIR_BASE_URL}/cost`,
      {
        origin: origin.toString(),
        destination: destination.toString(),
        weight: parseInt(weight),
        courier: courier,
      },
      {
        headers: {
          key: process.env.RAJAONGKIR_API_KEY,
          "content-type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );

    console.log("RajaOngkir response:", response.data);

    if (response.data.rajaongkir.status.code === 200) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json(
        { error: response.data.rajaongkir.status.description },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("RajaOngkir error:", error.response?.data || error.message);

    if (error.response?.status === 400) {
      return NextResponse.json(
        { error: "API key tidak valid atau parameter salah" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal mengambil data ongkir" },
      { status: 500 }
    );
  }
}

// API untuk mendapatkan daftar provinsi
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const provinceId = searchParams.get("province");

    if (!process.env.RAJAONGKIR_API_KEY) {
      return NextResponse.json(
        { error: "RajaOngkir API key tidak ditemukan" },
        { status: 500 }
      );
    }

    let url = `${RAJAONGKIR_BASE_URL}/province`;

    if (type === "city" && provinceId) {
      url = `${RAJAONGKIR_BASE_URL}/city?province=${provinceId}`;
    }

    const response = await axios.get(url, {
      headers: {
        key: process.env.RAJAONGKIR_API_KEY,
      },
      timeout: 10000,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(
      "RajaOngkir GET error:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      { error: "Gagal mengambil data wilayah" },
      { status: 500 }
    );
  }
}
