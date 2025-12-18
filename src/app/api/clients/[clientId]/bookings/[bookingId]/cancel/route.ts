import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import BookingSlot from "@/models/BookingSlot";
import { requireAuth } from "@/lib/api-auth";

/**
 * PUT /api/clients/[clientId]/bookings/[bookingId]
 * Cancel booking
 * ✅ super_admin + client_admin only
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; bookingId: string }> },
) {
  try {
    /* ================= AUTH ================= */
    const auth = await requireAuth(req, [
      "super_admin",
      "client_admin",
      "staff",
    ]);
    if (!auth.ok) return auth.response;

    await connectDB();
    const { clientId, bookingId } = await params;

    // ✅ Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(clientId) ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );
    }

    // 1️⃣ Find booking (not already cancelled)
    const booking = await Booking.findOne({
      _id: bookingId,
      clientId,
      status: { $ne: "cancelled" },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 },
      );
    }

    // 2️⃣ Free slot time
    await BookingSlot.findOneAndUpdate(
      {
        _id: booking.slotId,
        "times.time": booking.selectedTime,
      },
      {
        $set: {
          "times.$.isBooked": false,
          "times.$.bookingId": null,
        },
      },
    );

    // 3️⃣ Cancel booking
    booking.status = "cancelled";
    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel booking" },
      { status: 500 },
    );
  }
}
