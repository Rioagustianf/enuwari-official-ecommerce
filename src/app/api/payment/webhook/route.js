import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();

    // Verifikasi signature dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const orderId = body.order_id;
    const statusCode = body.status_code;
    const grossAmount = body.gross_amount;

    const signatureKey = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");

    if (signatureKey !== body.signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Cari order berdasarkan order number
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let paymentStatus = "PENDING";
    let orderStatus = order.status;

    // Update status berdasarkan transaction status
    switch (body.transaction_status) {
      case "capture":
      case "settlement":
        paymentStatus = "PAID";
        orderStatus = "CONFIRMED";
        break;
      case "pending":
        paymentStatus = "PENDING";
        break;
      case "deny":
      case "cancel":
      case "expire":
        paymentStatus = "FAILED";
        orderStatus = "CANCELLED";
        break;
      case "failure":
        paymentStatus = "FAILED";
        break;
    }

    // Update order dan buat/update payment record
    await prisma.$transaction(async (tx) => {
      // Update order
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus,
          status: orderStatus,
        },
      });

      // Buat atau update payment record
      await tx.payment.upsert({
        where: {
          orderId_transactionId: {
            orderId: order.id,
            transactionId: body.transaction_id,
          },
        },
        update: {
          status: paymentStatus,
          amount: parseFloat(grossAmount),
        },
        create: {
          orderId: order.id,
          transactionId: body.transaction_id,
          amount: parseFloat(grossAmount),
          method: body.payment_type || "unknown",
          status: paymentStatus,
        },
      });
    });

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
