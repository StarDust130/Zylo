import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1) login user check
    const session = await getServerSession(authOptions);
    if (!session) {
      return { status: 401, body: { message: "Unauthorized" } };
    }

    await connectToDatabase();

    // 2) get user orders
    const orders = await Order.find({ userId: session.user.id })
      .populate({
        path: "productId",
        select: "name imageUrl",
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders) {
      return NextResponse.json({
        status: 404,
        body: { message: "No orders found" },
      });
    }

    // 3) return orders
    return NextResponse.json({ status: 200, body: orders });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      status: 500,
      body: { message: "Something went wrong 🥐" },
    });
  }
}
