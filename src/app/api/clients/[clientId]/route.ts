import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";

/**
 * GET /api/clients/[clientId]
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

    const client = await Client.findById(clientId);

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error("GET client error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/[clientId]
 * Safe partial update (prevents accidental deletes)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    await connectDB();

    const { clientId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Build safe update object
    const updateData: Record<string, any> = {};

    for (const key in body) {
      if (key === "theme" && typeof body.theme === "object") {
        // Convert theme updates to dot-notation
        for (const themeKey in body.theme) {
          updateData[`theme.${themeKey}`] = body.theme[themeKey];
        }
      } else {
        updateData[key] = body[key];
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedClient) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedClient,
    });
  } catch (error) {
    console.error("PUT /api/clients/[clientId] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update client" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[clientId]
 * Soft delete (deactivate client)
 */
export async function DELETE(
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

    const client = await Client.findByIdAndUpdate(
      clientId,
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Client deactivated successfully",
    });
  } catch (error) {
    console.error("DELETE client error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete client" },
      { status: 500 }
    );
  }
}
