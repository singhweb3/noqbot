import { NextRequest, NextResponse } from "next/server";
import { verifyJwtEdge } from "@/lib/jwt-edge";
import { canAccessPath } from "@/lib/role-access";

const PUBLIC_PATHS = ["/signin", "/api/auth/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("noqbot_token")?.value;

  if (!token) {
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    const user = await verifyJwtEdge(token);

    // block signin for logged-in users
    if (pathname === "/signin") {
      return redirectAfterLogin(user.role, req);
    }

    // admin panel (everyone logged-in can enter, UI decides permissions)
    if (pathname.startsWith("/admin")) {
      return NextResponse.next();
    }

    // root feature routes
    if (!canAccessPath(user.role, pathname)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
}

function redirectAfterLogin(role: string, req: NextRequest) {
  if (role === "super_admin") {
    return NextResponse.redirect(new URL("/admin/clients", req.url));
  }
  return NextResponse.redirect(new URL("/bookings", req.url));
}

export const config = {
  matcher: ["/signin", "/admin/:path*", "/bookings/:path*", "/slots/:path*"],
};
