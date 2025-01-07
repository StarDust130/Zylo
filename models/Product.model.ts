import { Schema, model, models, Document } from "mongoose";

// Define the interface for ImageVariant
interface IImageVariant {
  price: number;
  type: "SQUARE" | "WIDE" | "PORTRAIT";
  license: "PERSONAL" | "COMMERCIAL";
}

// Define the interface for Product
interface IProduct {
  name: string;
  description?: string;
  imageUrl: string;
  variants: IImageVariant[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend Mongoose's Document for Product
interface IProductDocument extends IProduct, Document {}

// Define ImageVariant Schema
const imageVariantSchema = new Schema<IImageVariant>({
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["SQUARE", "WIDE", "PORTRAIT"],
  },
  license: {
    type: String,
    required: true,
    enum: ["PERSONAL", "COMMERCIAL"],
  },
});

// Define Product Schema
const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    variants: [imageVariantSchema], // Use the ImageVariant schema for the array
  },
  { timestamps: true }
);

// Export the Product model
const Product =
  models?.Product || model<IProductDocument>("Product", productSchema);

export default Product;
