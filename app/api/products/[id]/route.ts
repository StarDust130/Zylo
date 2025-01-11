import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product.model";

export async function GET(props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    await connectToDatabase();

    // 1) Find the product by id 🥱
    const product = await Product.findById(id).lean();

    if (!product) {
      return {
        status: 404,
        json: { message: "Product not found" },
      };
    }

    // 2) Return the product 🚀
    return {
      status: 200,
      json: product,
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to Fetch Product  ${error}`);
  }
}
