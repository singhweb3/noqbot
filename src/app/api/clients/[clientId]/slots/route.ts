import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BookingSlot from "@/models/BookingSlot";

/**
 * GET /api/clients/[clientId]/slots
 * List all slots for a client
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    await connectDB();
    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 },
      );
    }

    const slots = await BookingSlot.find({ clientId }).sort({ date: 1 });

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    console.error("GET slots error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch slots" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/clients/[clientId]/slots
 * Create slots for a date
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    await connectDB();
    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { startDate, days, times } = body;

    if (!startDate || !days || !Array.isArray(times) || times.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid input data" },
        { status: 400 },
      );
    }

    const createdSlots = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const dateStr = date.toISOString().split("T")[0];

      // Prevent duplicate slot for same date
      const existing = await BookingSlot.findOne({
        clientId,
        date: dateStr,
      });

      if (existing) continue;

      const slot = await BookingSlot.create({
        clientId,
        date: dateStr,
        times: times.map((time: string) => ({
          time,
          isBooked: false,
          bookingId: null,
        })),
      });

      createdSlots.push(slot);
    }

    return NextResponse.json({
      success: true,
      message: "Slots created successfully",
      data: createdSlots,
    });
  } catch (error) {
    console.error("POST slots error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create slots" },
      { status: 500 },
    );
  }
}
