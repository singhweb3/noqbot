import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import { requireAuth } from "@/lib/api-auth";

/**
 * GET /api/clients/[clientId]
 * View client (Super Admin + Client Admin)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    const auth = await requireAuth(req, ["super_admin", "client_admin"]);
    if (!auth.ok) return auth.response;

    await connectDB();
    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 },
      );
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: client }, { status: 200 });
  } catch (error) {
    console.error("GET client error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch client" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/clients/[clientId]
 * Safe partial update (Super Admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    const auth = await requireAuth(req, ["super_admin"]);
    if (!auth.ok) return auth.response;

    await connectDB();
    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 },
      );
    }

    const body = await req.json();

    /* ================= ALLOWED FIELDS ================= */
    const allowedFields = [
      "name",
      "whatsappNumber",
      "email",
      "businessType",
      "address",
      "isActive",
    ];

    const updateData: Record<string, any> = {};

    for (const key in body) {
      if (key === "theme" && typeof body.theme === "object") {
        for (const themeKey in body.theme) {
          updateData[`theme.${themeKey}`] = body.theme[themeKey];
        }
      } else if (allowedFields.includes(key)) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedClient) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: updatedClient },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT client error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update client" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/clients/[clientId]
 * Soft delete (Super Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    const auth = await requireAuth(req, ["super_admin"]);
    if (!auth.ok) return auth.response;

    await connectDB();
    const { clientId } = await params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid client ID" },
        { status: 400 },
      );
    }

    const client = await Client.findByIdAndUpdate(
      clientId,
      { isActive: false },
      { new: true },
    );

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Client deactivated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE client error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete client" },
      { status: 500 },
    );
  }
}
