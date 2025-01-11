import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    // 1) Check is user is login
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not Login 🐪" }, { status: 401 });
    }

    // 2)  Get the product id and variant from the request body
    const { productId, variant } = await req.json();
    if (!productId || !variant) {
      return NextResponse.json(
        { error: "Invalid Request 😛" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 3) Create a razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(variant.price * 100),
      currency: "INR",
      receipt: `recipt-${Date.now()}`,
      notes: {
        productId: productId.toString(),
        variantId: variant.id,
      },
    });

    const newOrder = await Order.create({
      userId: session.user.id,
      productId,
      variant,
      razorpayOrderId: order.id,
      status: "pending",
    });

    // 4) Return the order details
    return NextResponse.json({
      dbOrderID: newOrder._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong 😭" },
      { status: 500 }
    );
  }
}
