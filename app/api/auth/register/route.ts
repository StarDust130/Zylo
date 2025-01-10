import { connectToDatabase } from "@/lib/db";
import User from "@/models/User.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1) Get email and password from request body
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2) Connect to the database
    await connectToDatabase();

    const existinguser = await User.findOne({ email });

    if (existinguser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // 3) Create a new user
    const user = new User({ email, password });
    await user.save();

    return NextResponse.json({ message: "User created successfully 🥳" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: `Something went wrong 😛: ${error}` },
      { status: 500 }
    );
  }
}
