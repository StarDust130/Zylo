import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order.model";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const signature = req.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return new Response("Invalid Signature", { status: 400 });
    }

    const event = JSON.parse(body);

    await connectToDatabase();

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          razorpayPaymentId: payment.id,
          status: "completed",
        }
      ).populate([
        { path: "productId", select: "name" },
        { path: "userId", select: "email" },
      ]);

      if (order) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST!,
          port: parseInt(process.env.SMTP_PORT!),
          auth: {
            user: process.env.SMTP_USER!,
            pass: process.env.SMTP_PASSWORD!,
          },
        });

        await transporter.sendMail({
          from: "update@zylo.com",
          to: order.userId.email,
          subject: "Order Completed 😚",
          text: `Your order for ${order.productId.name} has been completed. You can download your image from the following link: ${order.downloadUrl}`,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
}
