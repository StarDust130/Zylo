import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order.model";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // 1) Get the request body
    const body = await req.text();

    // 2) Get the signature from the headers
    const signature = req.headers.get("x-razorpay-signature");

    // 3) Verify the signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return new Response("Invalid Signature", { status: 400 });
    }

    // 4) Parse the event
    const event = JSON.parse(body);

    await connectToDatabase();

    // 5) Handle the event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      // Update the order
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
        // Send an email to the user
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

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
