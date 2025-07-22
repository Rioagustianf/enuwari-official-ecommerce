import { NextResponse } from "next/server";
import axios from "axios";

// Ganti base URL ke sandbox untuk development gratis
const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1";

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

    if (!process.env.RAJAONGKIR_API_KEY) {
      return NextResponse.json(
        { error: "RajaOngkir API key tidak ditemukan" },
        { status: 500 }
      );
    }

    // Komerce API V2: gunakan /calculate/district/domestic-cost
    const params = new URLSearchParams();
    params.append("origin", origin.toString());
    params.append("destination", destination.toString());
    params.append("weight", weight.toString());
    params.append("courier", courier);
    params.append("price", "lowest");

    const response = await axios.post(
      `${RAJAONGKIR_BASE_URL}/calculate/district/domestic-cost`,
      params,
      {
        headers: {
          key: process.env.RAJAONGKIR_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    const komerceError = error.response?.data || error.message;
    console.error("RajaOngkir error:", komerceError);
    return NextResponse.json({ error: komerceError }, { status: 500 });
  }
}

// API untuk mendapatkan daftar provinsi/kota
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    // Komerce API pakai province_id
    const provinceId = searchParams.get("province_id");

    if (!process.env.RAJAONGKIR_API_KEY) {
      return NextResponse.json(
        { error: "RajaOngkir API key tidak ditemukan" },
        { status: 500 }
      );
    }

    let url = "";
    if (type === "province") {
      url = `${RAJAONGKIR_BASE_URL}/destination/province`;
    } else if (type === "city" && provinceId) {
      url = `${RAJAONGKIR_BASE_URL}/destination/city/${provinceId}`;
    } else {
      return NextResponse.json(
        { error: "Parameter tidak valid" },
        { status: 400 }
      );
    }

    try {
      const response = await axios.get(url, {
        headers: {
          key: process.env.RAJAONGKIR_API_KEY,
        },
        timeout: 10000,
      });
      return NextResponse.json(response.data);
    } catch (error) {
      const komerceError = error.response?.data || error.message;
      console.error("RajaOngkir GET error:", komerceError);
      return NextResponse.json({ error: komerceError }, { status: 500 });
    }
  } catch (error) {
    // Kirim error detail dari Komerce ke frontend
    const komerceError = error.response?.data || error.message;
    console.error("RajaOngkir GET error:", komerceError);
    return NextResponse.json({ error: komerceError }, { status: 500 });
  }
}
