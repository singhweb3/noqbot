import mongoose, { Schema, Document, Model, models } from "mongoose";

export type UserRole = "super_admin" | "client_admin" | "staff";

/**
 * ✅ Plain User shape (used for DTOs, lean queries)
 */
export interface IUser {
  clientId?: mongoose.Types.ObjectId | null;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ✅ Mongoose Document (has _id, save, etc.)
 */
export interface IUserDocument extends IUser, Document {}

/**
 * ================= SCHEMA =================
 */
const UserSchema = new Schema<IUserDocument>(
  {
    /** 🔑 Which client this user belongs to */
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null, // super_admin only
      index: true,
    },

    /** 👤 Identity */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    /** 🔐 Auth */
    passwordHash: {
      type: String,
      select: false, // NEVER return by default
    },

    role: {
      type: String,
      enum: ["super_admin", "client_admin", "staff"],
      required: true,
      index: true,
    },

    /** 🛑 Soft disable */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /** 📊 Audit */
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * ================= MODEL =================
 * ✅ Prevent overwrite in dev (Next.js hot reload)
 */
const User: Model<IUserDocument> =
  models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
