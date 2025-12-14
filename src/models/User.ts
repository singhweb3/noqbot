import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["super-admin", "admin", "sub-admin"],
      default: "admin",
    },

    clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
