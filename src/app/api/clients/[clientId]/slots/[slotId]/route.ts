import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BookingSlot from "@/models/BookingSlot";

/**
 * GET single slot
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; slotId: string }> }
) {
  try {
    await connectDB();
    const { clientId, slotId } = await params;

    const slot = await BookingSlot.findOne({ _id: slotId, clientId });

    if (!slot) {
      return NextResponse.json(
        { success: false, message: "Slot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: slot });
  } catch (error) {
    console.error("GET slot error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch slot" },
      { status: 500 }
    );
  }
}

/**
 * PUT update slot times (safe)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; slotId: string }> }
) {
  try {
    await connectDB();
    const { clientId, slotId } = await params;

    const body = await req.json();

    const updatedSlot = await BookingSlot.findOneAndUpdate(
      { _id: slotId, clientId },
      { $set: body },
      { new: true }
    );

    if (!updatedSlot) {
      return NextResponse.json(
        { success: false, message: "Slot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedSlot });
  } catch (error) {
    console.error("PUT slot error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update slot" },
      { status: 500 }
    );
  }
}

/**
 * DELETE slot (date)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; slotId: string }> }
) {
  try {
    await connectDB();
    const { clientId, slotId } = await params;

    const deleted = await BookingSlot.findOneAndDelete({
      _id: slotId,
      clientId
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Slot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slot deleted successfully"
    });
  } catch (error) {
    console.error("DELETE slot error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete slot" },
      { status: 500 }
    );
  }
}
