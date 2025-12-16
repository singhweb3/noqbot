import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Clears auth cookie
 */
export async function POST() {
  const res = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 },
  );

  // 🔐 Clear JWT cookie
  res.cookies.set("noqbot_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // 👈 immediately expire
  });

  return res;
}
