import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt-node";
import { UserRole } from "@/models/User";
import type { AppJwtPayload } from "@/lib/jwt-node";

type AuthResult =
  | { ok: true; user: AppJwtPayload }
  | { ok: false; response: NextResponse };

export async function requireAuth(
  req: NextRequest,
  roles?: UserRole[],
): Promise<AuthResult> {
  const token = req.cookies.get("noqbot_token")?.value;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  try {
    const user = await verifyJwt(token);

    if (roles && !roles.includes(user.role)) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 },
        ),
      };
    }

    return { ok: true, user };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }
}
