import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Booking from "@/models/Booking";
import BookingSlot from "@/models/BookingSlot";
import { requireAuth } from "@/lib/api-auth";

function isPastSlot(date: string, time: string) {
  const now = new Date();

  // slot datetime (local time)
  const [hours, minutes] = time.split(":").map(Number);
  const slotDateTime = new Date(date);
  slotDateTime.setHours(hours, minutes, 0, 0);

  return slotDateTime <= now;
}

/**
 * GET /api/clients/[clientId]/bookings
 * List all bookings
 * ✅ Any logged-in user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
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
    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 },
      );
    }

    /* ================= FILTER ================= */
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const query: any = { clientId };

    if (date) {
      query.date = date;
    }

    const bookings = await Booking.find(query).sort({
      date: 1,
      selectedTime: 1,
    });

    return NextResponse.json(
      { success: true, data: bookings },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET bookings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/clients/[clientId]/bookings
 * Create booking
 * ✅ super_admin + client_admin only
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
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
    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 },
      );
    }

    // 1️⃣ Validate client exists
    const clientExists = await Client.exists({ _id: clientId });
    if (!clientExists) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 },
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
        { status: 400 },
      );
    }

    // 2.5️⃣ ⛔ Time validation (NEW)
    if (isPastSlot(date, time)) {
      return NextResponse.json(
        { success: false, message: "Cannot book a past time slot" },
        { status: 400 },
      );
    }

    // 3️⃣ Check slot exists
    const slotForDate = await BookingSlot.findOne({ clientId, date });
    if (!slotForDate) {
      return NextResponse.json(
        { success: false, message: "No slots available for this date" },
        { status: 404 },
      );
    }

    // 4️⃣ Check time exists
    const timeEntry = slotForDate.times.find(
      (t: { time: string; isBooked: boolean }) => t.time === time,
    );
    if (!timeEntry) {
      return NextResponse.json(
        { success: false, message: "Selected time does not exist" },
        { status: 400 },
      );
    }

    // 5️⃣ Already booked?
    if (timeEntry.isBooked) {
      return NextResponse.json(
        { success: false, message: "Selected time is already booked" },
        { status: 409 },
      );
    }

    // 6️⃣ Atomic lock
    const lockedSlot = await BookingSlot.findOneAndUpdate(
      {
        clientId,
        date,
        times: { $elemMatch: { time, isBooked: false } },
      },
      {
        $set: {
          "times.$.isBooked": true,
          "times.$.bookingId": null,
        },
      },
      { new: true },
    );

    if (!lockedSlot) {
      return NextResponse.json(
        {
          success: false,
          message: "Slot just got booked, please try another time",
        },
        { status: 409 },
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

    // 8️⃣ Link bookingId
    await BookingSlot.updateOne(
      { _id: lockedSlot._id, "times.time": time },
      { $set: { "times.$.bookingId": booking._id } },
    );

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("POST booking error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create booking" },
      { status: 500 },
    );
  }
}
