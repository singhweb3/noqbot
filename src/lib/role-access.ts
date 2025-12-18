import { UserRole } from "@/models/User";

/**
 * Routes super_admin should NOT see in sidebar
 */
const SUPER_ADMIN_HIDDEN_PATHS = ["/bookings", "/slots"];

/**
 * Empty string "" means root "/"
 * "*" means all routes
 */
export const ROLE_ACCESS: Record<UserRole, string[]> = {
  super_admin: ["*"],

  client_admin: ["/dashboard", "/bookings", "/slots"],

  staff: ["/slots", "/bookings"],
};

export function canAccessPath(
  role: UserRole | undefined,
  pathname?: string,
): boolean {
  if (!role || !pathname) return false;

  // ✅ Super admin: allow everything EXCEPT specific paths
  if (role === "super_admin") {
    return !SUPER_ADMIN_HIDDEN_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
  }

  const allowedPaths = ROLE_ACCESS[role] ?? [];

  return allowedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );
}
