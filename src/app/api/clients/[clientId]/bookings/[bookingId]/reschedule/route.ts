import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import BookingSlot from "@/models/BookingSlot";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; bookingId: string }> }
) {
  try {
    await connectDB();
    const { clientId, bookingId } = await params;

    const body = await req.json();
    const { date, time } = body;

    if (!date || !time) {
      return NextResponse.json(
        { success: false, message: "date and time are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Find existing booking
    const booking = await Booking.findOne({
      _id: bookingId,
      clientId,
      status: "confirmed",
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Lock NEW slot atomically
    const newSlot = await BookingSlot.findOneAndUpdate(
      {
        clientId,
        date,
        times: {
          $elemMatch: {
            time,
            isBooked: false,
          },
        },
      },
      {
        $set: {
          "times.$.isBooked": true,
        },
      },
      { new: true }
    );

    if (!newSlot) {
      return NextResponse.json(
        { success: false, message: "New slot not available" },
        { status: 409 }
      );
    }

    // 3️⃣ Free OLD slot
    await BookingSlot.findOneAndUpdate(
      {
        _id: booking.slotId,
        "times.time": booking.selectedTime,
      },
      {
        $set: {
          "times.$.isBooked": false,
        },
      }
    );

    // 4️⃣ Update booking
    booking.slotId = newSlot._id;
    booking.selectedTime = time;
    booking.status = "confirmed";
    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Booking rescheduled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Reschedule booking error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reschedule booking" },
      { status: 500 }
    );
  }
}
