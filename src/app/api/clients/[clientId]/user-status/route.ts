import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

import mongoose from "mongoose";

type UserStatusItem = {
  exists: boolean;
  userId: mongoose.Types.ObjectId | null;
  email: string | null;
};

type UserStatusResponse = {
  clientAdmin: UserStatusItem;
  staff: UserStatusItem;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    await connectDB();
    const { clientId } = await params;

    const users = await User.find(
      {
        clientId,
        role: { $in: ["client_admin", "staff"] },
      },
      { role: 1, email: 1 },
    ).lean();

    const response: UserStatusResponse = {
      clientAdmin: {
        exists: false,
        userId: null,
        email: null,
      },
      staff: {
        exists: false,
        userId: null,
        email: null,
      },
    };

    for (const user of users) {
      if (user.role === "client_admin") {
        response.clientAdmin = {
          exists: true,
          userId: user._id,
          email: user.email || null,
        };
      }

      if (user.role === "staff") {
        response.staff = {
          exists: true,
          userId: user._id,
          email: user.email || null,
        };
      }
    }

    return NextResponse.json({ success: true, data: response });
  } catch (err) {
    console.error("user-status error", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user status" },
      { status: 500 },
    );
  }
}
