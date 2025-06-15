import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  try {
    const { orderId, customerDetails, itemDetails, shippingCost } =
      await request.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    const grossAmount = order.total;

    const parameter = {
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: parseInt(grossAmount),
      },
      customer_details: customerDetails,
      item_details: [
        ...itemDetails,
        {
          id: "shipping",
          price: parseInt(shippingCost),
          quantity: 1,
          name: "Ongkos Kirim",
        },
      ],
      credit_card: {
        secure: true,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Midtrans error:", error);
    return NextResponse.json(
      { error: "Gagal membuat transaksi pembayaran" },
      { status: 500 }
    );
  }
}
