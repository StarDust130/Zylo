import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Product, { IProduct } from "@/models/Product.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

//! GET /api/products - Get all products ☑️
export async function GET() {
  try {
    await connectToDatabase();
    // 1) Fetch all products from the database
    const products = await Product.find({}).lean();

    if (!products || products.length === 0) {
      return NextResponse.json(
        { message: "No products found" },
        { status: 404 }
      );
    }

    // 2) Return the products 💲
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to connect to database: ${error}`);
  }
}

//! POST /api/products - Create a new product ☑️
export async function POST(req: NextRequest) {
  try {
    // 1) Get the session
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized 🐊" }, { status: 401 });
    }

    await connectToDatabase();

    // 2) Get data from the request
    const body: IProduct = await req.json();

    if (
      !body.name ||
      !body.imageUrl ||
      !body.description ||
      body.variants.length === 0
    ) {
      return NextResponse.json(
        { message: "Please provide all the required fields" },
        { status: 400 }
      );
    }
    // 3) Create a new product
    const product = await Product.create(body);

    // 4) Return the newly created product 🎉
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to connect to database: ${error}`);
  }
}
