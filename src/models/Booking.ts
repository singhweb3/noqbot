import mongoose, { Schema, model, models } from "mongoose";

const BookingSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "BookingSlot", required: true },

    date: { type: String, required: true },
    userPhone: { type: String, required: true },
    userName: { type: String },
    selectedTime: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    source: { type: String, enum: ["whatsapp", "manual"], default: "whatsapp" },
  },
  { timestamps: true }
);

export default models.Booking || model("Booking", BookingSchema);
