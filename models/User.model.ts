import { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser {
  email: string;
  username: string;
  role: "user" | "admin";
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend Mongoose's Document to include IUser and its methods
interface IUserDocument extends IUser, Document {
  isModified(path: string): boolean; // Add isModified method
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Export the model
const User = models?.User || model<IUserDocument>("User", userSchema);

export default User;
