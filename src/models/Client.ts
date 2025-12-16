import mongoose, { Schema, model, models } from "mongoose";

const ClientSchema = new Schema(
  {
    /** Basic Business Info */
    name: { type: String, required: true },

    businessType: {
      type: String,
      enum: [
        "clinic",
        "hospital",
        "salon",
        "spa",
        "restaurant",
        "diagnostic",
        "other",
      ],
      default: "clinic",
    },

    /** Contact */
    whatsappNumber: { type: String },
    whatsappToken: { type: String },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    /** MVP Address (single field) */
    address: {
      type: String,
      trim: true,
      default: "",
    },

    /** Branding */
    theme: {
      primaryColor: { type: String, default: "#4F46E5" },
      secondaryColor: { type: String, default: "#6366F1" },
      logoUrl: { type: String, default: "" },
    },

    /** WhatsApp Flow */
    activeFlowId: {
      type: Schema.Types.ObjectId,
      ref: "Flow",
      default: null,
    },

    /** Status */
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default models.Client || model("Client", ClientSchema);
