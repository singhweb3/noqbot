import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client"; 
import Booking from "@/models/Booking";
import BookingSlot from "@/models/BookingSlot";

/**
 * GET /api/clients/[clientId]/bookings
 * List all bookings (Admin)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    await connectDB();
    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 }
      );
    }

    const bookings = await Booking.find({ clientId })
  .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("GET bookings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients/[clientId]/bookings
 * Robust booking with clear error handling
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    await connectDB();
    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 }
      );
    }

    // 1️⃣ Validate client exists
    const clientExists = await Client.exists({ _id: clientId });
    if (!clientExists) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { date, time, userPhone, userName, source = "whatsapp" } = body;

    // 2️⃣ Validate payload
    if (!date || !time || !userPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "date, time and userPhone are required",
        },
        { status: 400 }
      );
    }

    // 3️⃣ Check slot exists for date
    const slotForDate = await BookingSlot.findOne({ clientId, date });
    if (!slotForDate) {
      return NextResponse.json(
        {
          success: false,
          message: "No slots available for this date",
        },
        { status: 404 }
      );
    }

    // 4️⃣ Check time exists
    const timeEntry = slotForDate.times.find(
      (t: { time: string; isBooked: boolean }) => t.time === time
    );
    if (!timeEntry) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected time does not exist for this date",
        },
        { status: 400 }
      );
    }

    // 5️⃣ Check if already booked
    if (timeEntry.isBooked) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected time is already booked",
        },
        { status: 409 }
      );
    }

    // 6️⃣ ATOMIC LOCK (final safety)
    const lockedSlot = await BookingSlot.findOneAndUpdate(
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

    if (!lockedSlot) {
      return NextResponse.json(
        {
          success: false,
          message: "Slot just got booked, please try another time",
        },
        { status: 409 }
      );
    }

    // 7️⃣ Create booking
    const booking = await Booking.create({
      clientId,
      slotId: lockedSlot._id,
      date,
      selectedTime: time,
      userPhone,
      userName,
      source,
      status: "confirmed",
    });

    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST booking error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create booking" },
      { status: 500 }
    );
  }
}
