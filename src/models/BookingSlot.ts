import mongoose, { Schema, model, models } from "mongoose";

const BookingSlotSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },

    date: { type: String, required: true },

    times: [
      {
        time: String,
        isBooked: { type: Boolean, default: false },
        bookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
      },
    ],
  },
  { timestamps: true }
);

export default models.BookingSlot || model("BookingSlot", BookingSlotSchema);
