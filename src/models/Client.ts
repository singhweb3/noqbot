import mongoose, { Schema, model, models } from "mongoose";

const ClientSchema = new Schema(
  {
    name: { type: String, required: true },
    whatsappNumber: { type: String },
    whatsappToken: { type: String },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    theme: {
      primaryColor: { type: String, default: "#4F46E5" },
      secondaryColor: { type: String, default: "#6366F1" },
      logoUrl: { type: String, default: "" },
    },

    activeFlowId: { type: Schema.Types.ObjectId, ref: "Flow", default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default models.Client || model("Client", ClientSchema);
