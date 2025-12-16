import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BookingSlot from "@/models/BookingSlot";
import { requireAuth } from "@/lib/api-auth";

/**
 * GET single slot (Public – Bot Safe)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; slotId: string }> },
) {
  try {
    await connectDB();
    const { clientId, slotId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(clientId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid client or slot ID" },
        { status: 400 },
      );
    }

    const slot = await BookingSlot.findOne({ _id: slotId, clientId });

    if (!slot) {
      return NextResponse.json(
        { success: false, message: "Slot not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: slot }, { status: 200 });
  } catch (error) {
    console.error("GET slot error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch slot" },
      { status: 500 },
    );
  }
}

/**
 * PUT update slot times (Admin only – Safe)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; slotId: string }> },
) {
  try {
    /* ================= AUTH ================= */
    const auth = await requireAuth(req, ["super_admin", "client_admin"]);
    if (!auth.ok) return auth.response;

    await connectDB();
    const { clientId, slotId } = await params;

    /* ================= PARAM VALIDATION ================= */
    if (
      !mongoose.Types.ObjectId.isValid(clientId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid client or slot ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { times } = body;

    /* ================= BODY VALIDATION ================= */
    if (!Array.isArray(times) || times.length === 0) {
      return NextResponse.json(
        { success: false, message: "Times are required" },
        { status: 400 },
      );
    }

    const uniqueTimes = Array.from(
      new Set(times.filter((t) => typeof t === "string" && t.trim())),
    );

    if (uniqueTimes.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid slot times" },
        { status: 400 },
      );
    }

    /* ================= FETCH SLOT ================= */
    const slot = await BookingSlot.findOne({ _id: slotId, clientId });

    if (!slot) {
      return NextResponse.json(
        { success: false, message: "Slot not found" },
        { status: 404 },
      );
    }

    /* ================= SAFETY CHECK ================= */
    const hasBookedTimes = slot.times.some((t: any) => t.isBooked);

    if (hasBookedTimes) {
      return NextResponse.json(
        {
          success: false,
          message: "This slot has active bookings and cannot be modified",
        },
        { status: 409 },
      );
    }

    /* ================= UPDATE ================= */
    slot.times = uniqueTimes.map((time: string) => ({
      time,
      isBooked: false,
      bookingId: null,
    }));

    await slot.save();

    return NextResponse.json({ success: true, data: slot }, { status: 200 });
  } catch (error) {
    console.error("PUT slot error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update slot" },
      { status: 500 },
    );
  }
}

/**
 * DELETE slot (Admin only – Safe)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; slotId: string }> },
) {
  try {
    /* ================= AUTH ================= */
    const auth = await requireAuth(req, ["super_admin", "client_admin"]);
    if (!auth.ok) return auth.response;

    await connectDB();
    const { clientId, slotId } = await params;

    /* ================= PARAM VALIDATION ================= */
    if (
      !mongoose.Types.ObjectId.isValid(clientId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid client or slot ID" },
        { status: 400 },
      );
    }

    /* ================= FETCH ================= */
    const slot = await BookingSlot.findOne({ _id: slotId, clientId });

    if (!slot) {
      return NextResponse.json(
        { success: false, message: "Slot not found" },
        { status: 404 },
      );
    }

    /* ================= SAFETY CHECK ================= */
    const hasBookedTimes = slot.times.some((t: any) => t.isBooked);

    if (hasBookedTimes) {
      return NextResponse.json(
        {
          success: false,
          message: "This slot has active bookings and cannot be deleted",
        },
        { status: 409 },
      );
    }

    await slot.deleteOne();

    return NextResponse.json(
      { success: true, message: "Slot deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE slot error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete slot" },
      { status: 500 },
    );
  }
}
