import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";

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
 * Create a new client (Super Admin)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, whatsappNumber, email } = body;

    if (!name || !whatsappNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Client name and WhatsApp number are required",
        },
        { status: 400 },
      );
    }

    const client = await Client.create({
      name,
      whatsappNumber,
      email: email || undefined,
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
