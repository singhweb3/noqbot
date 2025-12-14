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

    const slots = await BookingSlot.find({ clientId }).sort({ date: 1 });

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    console.error("GET slots error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients/[clientId]/slots
 * Create slots for a date
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    await connectDB();
    const { clientId } = await params;

    const body = await req.json();
    const { date, times } = body;

    if (!date || !Array.isArray(times) || times.length === 0) {
      return NextResponse.json(
        { success: false, message: "Date and times are required" },
        { status: 400 }
      );
    }

    const slot = await BookingSlot.create({
      clientId,
      date,
      times: times.map((t: string) => ({ time: t }))
    });

    return NextResponse.json(
      { success: true, data: slot },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST slot error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create slot" },
      { status: 500 }
    );
  }
}
