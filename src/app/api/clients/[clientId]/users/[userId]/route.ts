import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/api-auth";

/**
 * PUT /api/clients/:clientId/users/:userId
 * Super Admin only – update user email and/or password
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; userId: string }> },
) {
  try {
    const auth = await requireAuth(req, ["super_admin"]);
    if (!auth.ok) return auth.response;

    await connectDB();

    /* ================= PARAMS ================= */
    const { clientId, userId } = await params;
    const body = await req.json();
    const { email, password } = body;

    /* ================= VALIDATION ================= */
    if (!email && !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or password is required",
        },
        { status: 400 },
      );
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: "Invalid email address" },
          { status: 400 },
        );
      }
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    /* ================= USER LOOKUP ================= */
    const user = await User.findOne({
      _id: userId,
      clientId,
      role: { $in: ["client_admin", "staff"] },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    /* ================= DUPLICATE EMAIL CHECK ================= */
    if (email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email already in use" },
          { status: 409 },
        );
      }

      user.email = email;
    }

    /* ================= PASSWORD UPDATE ================= */
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: user._id,
          email: user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT /clients/:id/users/:id error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 },
    );
  }
}
