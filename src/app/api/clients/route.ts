import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import { requireAuth } from "@/lib/api-auth";

/**
 * GET /api/clients
 * List all clients (Super Admin)
 */
export async function GET() {
  try {
    await connectDB();

    const clients = await Client.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: clients,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/clients error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch clients",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/clients
 * Create a new client (Super Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    /* ================= AUTH ================= */
    const auth = await requireAuth(req, ["super_admin"]);
    if (!auth.ok) return auth.response;

    await connectDB();

    const body = await req.json();
    const { name, whatsappNumber, email, businessType, address } = body;

    /* ================= BASIC VALIDATION ================= */

    if (!name || !whatsappNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Client name and WhatsApp number are required",
        },
        { status: 400 },
      );
    }

    /* ================= WHATSAPP VALIDATION ================= */

    const phone = String(whatsappNumber).trim();
    if (phone.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid WhatsApp number",
        },
        { status: 400 },
      );
    }

    /* ================= EMAIL VALIDATION ================= */

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid email address",
          },
          { status: 400 },
        );
      }
    }

    /* ================= BUSINESS TYPE ================= */

    const allowedBusinessTypes = [
      "clinic",
      "hospital",
      "salon",
      "spa",
      "restaurant",
      "diagnostic",
      "other",
    ];

    const safeBusinessType = allowedBusinessTypes.includes(businessType)
      ? businessType
      : "clinic";

    /* ================= DUPLICATE CHECK ================= */

    const existingClient = await Client.findOne({
      whatsappNumber: phone,
    });

    if (existingClient) {
      return NextResponse.json(
        {
          success: false,
          message: "Client with this WhatsApp number already exists",
        },
        { status: 409 },
      );
    }

    /* ================= CREATE CLIENT ================= */

    const client = await Client.create({
      name: name.trim(),
      whatsappNumber: phone,
      email: email || undefined,
      businessType: safeBusinessType,
      address: address?.trim() || "",
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: client,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/clients error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create client",
      },
      { status: 500 },
    );
  }
}
