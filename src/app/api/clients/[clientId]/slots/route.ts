import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BookingSlot from "@/models/BookingSlot";
import { requireAuth } from "@/lib/api-auth";

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

    /* ================= PARAM VALIDATION ================= */
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 },
      );
    }

    /* ================= FETCH ================= */
    const slots = await BookingSlot.find({ clientId }).sort({ date: 1 });

    return NextResponse.json({ success: true, data: slots }, { status: 200 });
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
 * Create slots for a date range
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

    /* ================= PARAM VALIDATION ================= */
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { startDate, days, times } = body;

    /* ================= BODY VALIDATION ================= */
    if (
      !startDate ||
      typeof days !== "number" ||
      days <= 0 ||
      !Array.isArray(times) ||
      times.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid input data" },
        { status: 400 },
      );
    }

    if (days > 60) {
      return NextResponse.json(
        {
          success: false,
          message: "Slots can only be created for up to 60 days",
        },
        { status: 400 },
      );
    }

    /* ================= TIME VALIDATION ================= */
    const uniqueTimes = Array.from(new Set(times)).filter(
      (t) => typeof t === "string" && t.trim().length > 0,
    );

    if (uniqueTimes.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid slot times" },
        { status: 400 },
      );
    }

    /* ================= CREATE SLOTS ================= */
    const createdSlots = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid start date" },
          { status: 400 },
        );
      }

      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      // Prevent duplicate slots for same date
      const existing = await BookingSlot.findOne({
        clientId,
        date: dateStr,
      });

      if (existing) continue;

      const slot = await BookingSlot.create({
        clientId,
        date: dateStr,
        times: uniqueTimes.map((time: string) => ({
          time,
          isBooked: false,
          bookingId: null,
        })),
      });

      createdSlots.push(slot);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Slots created successfully",
        data: createdSlots,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST slots error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create slots" },
      { status: 500 },
    );
  }
}
