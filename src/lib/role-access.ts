import { UserRole } from "@/models/User";

/**
 * Empty string "" means root "/"
 * "*" means all routes
 */
export const ROLE_ACCESS: Record<UserRole, string[]> = {
  super_admin: ["*"],

  client_admin: ["/dashboard", "/bookings", "/slots"],

  staff: ["/dashboard", "/bookings"],
};

export function canAccessPath(role: UserRole, pathname: string): boolean {
  const allowedPaths = ROLE_ACCESS[role];

  // Super admin → everything
  if (allowedPaths.includes("*")) return true;

  return allowedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );
}
