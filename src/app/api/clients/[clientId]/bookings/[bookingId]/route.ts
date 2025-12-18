import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/api-auth";

/**
 * GET /api/bookings/:bookingId
 * Fetch single booking details
 * ✅ Any logged-in user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    /* ================= AUTH ================= */
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;

    await connectDB();

    const { bookingId } = await params;

    // 1️⃣ Validate bookingId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID" },
        { status: 400 },
      );
    }

    // 2️⃣ Fetch booking
    const booking = await Booking.findById(bookingId)
      .select(
        "_id clientId slotId date selectedTime userName userPhone status source createdAt",
      )
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 },
      );
    }

    // 3️⃣ Return booking
    return NextResponse.json(
      {
        success: true,
        data: booking,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET booking error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}
