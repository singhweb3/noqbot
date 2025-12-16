import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signJwt } from "@/lib/jwt-node";

export async function POST(req: NextRequest) {
  await connectDB();

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password required" },
      { status: 400 },
    );
  }

  const user = await User.findOne({ email }).select("+passwordHash").lean();

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }

  if (!user.isActive) {
    return NextResponse.json(
      { success: false, message: "Account disabled" },
      { status: 403 },
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }

  const token = signJwt({
    userId: user._id.toString(),
    role: user.role,
    clientId: user.clientId?.toString() || null,
  });

  const res = NextResponse.json({
    success: true,
    data: {
      id: user._id.toString(),
      role: user.role,
    },
  });

  res.cookies.set("noqbot_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
