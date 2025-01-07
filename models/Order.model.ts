import { Schema, model, models, Document } from "mongoose";

// Define the Order interface
interface IOrder {
  userId: Schema.Types.ObjectId; // References the User model
  productId: Schema.Types.ObjectId; // References the Product model
  variant: "SQUARE" | "WIDE" | "PORTRAIT";
  price: number;
  license: "PERSONAL" | "COMMERCIAL";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  dowloadUrl?: string; // Optional field
  previewUrl?: string; // Optional field
  createdAt?: Date; // Automatically added by Mongoose
  updatedAt?: Date; // Automatically added by Mongoose
}

// Extend Mongoose's Document for the Order model
interface IOrderDocument extends IOrder, Document {}

// Define the Order schema
const orderSchema = new Schema<IOrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: String,
      required: true,
      enum: ["SQUARE", "WIDE", "PORTRAIT"],
    },
    price: {
      type: Number,
      required: true,
    },
    license: {
      type: String,
      required: true,
      enum: ["PERSONAL", "COMMERCIAL"],
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    dowloadUrl: {
      type: String,
    },
    previewUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

// Create or reuse the Order model
const Order = models?.Order || model<IOrderDocument>("Order", orderSchema);

export default Order;
