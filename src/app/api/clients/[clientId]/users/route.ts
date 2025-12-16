import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/api-auth";
/**
 * GET /api/users
 * List users (Super Admin)
 * Optional filter: ?clientId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const query: any = {};
    if (clientId) {
      query.clientId = clientId;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: users,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/users
 * Create client_admin or staff (Super Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["super_admin"]);
    if (!auth.ok) return auth.response;

    await connectDB();
    /* ================= BODY ================= */
    const body = await req.json();
    const { name, email, password, role, clientId } = body;

    /* ================= BASIC VALIDATION ================= */
    if (!name || !password || !clientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, password and clientId are required",
        },
        { status: 400 },
      );
    }

    /* ================= ROLE VALIDATION ================= */
    if (!["client_admin", "staff"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user role",
        },
        { status: 400 },
      );
    }

    // 🚫 Never allow creating super_admin
    const safeRole: "client_admin" | "staff" = role;

    /* ================= ROLE-BASED RULES ================= */

    // Email required for client admin
    if (safeRole === "client_admin" && !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required for client admin",
        },
        { status: 400 },
      );
    }

    // Email format check
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

    // Password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    /* ================= MVP CONSTRAINT ================= */
    // Only one user per role per client

    const existingRoleUser = await User.findOne({
      clientId,
      role: safeRole,
    });

    if (existingRoleUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            safeRole === "client_admin"
              ? "Client admin already exists"
              : "Staff already exists",
        },
        { status: 409 },
      );
    }

    /* ================= DUPLICATE EMAIL ================= */
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            message: "User with this email already exists",
          },
          { status: 409 },
        );
      }
    }

    /* ================= CREATE ================= */
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email || undefined,
      passwordHash,
      role: safeRole,
      clientId,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          clientId: user.clientId,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
      },
      { status: 500 },
    );
  }
}
