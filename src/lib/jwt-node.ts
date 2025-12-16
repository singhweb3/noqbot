// lib/jwt-node.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

export interface AppJwtPayload {
  userId: string;
  role: "super_admin" | "client_admin" | "staff";
  clientId?: string | null;
}

export function signJwt(payload: AppJwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyJwt(token: string): AppJwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    !("userId" in decoded) ||
    !("role" in decoded)
  ) {
    throw new Error("Invalid JWT payload");
  }

  return decoded as AppJwtPayload;
}
