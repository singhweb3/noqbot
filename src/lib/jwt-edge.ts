// lib/jwt-edge.ts
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface AppJwtPayload {
  userId: string;
  role: "super_admin" | "client_admin" | "staff";
  clientId?: string | null;
}

export async function verifyJwtEdge(token: string): Promise<AppJwtPayload> {
  const { payload } = await jwtVerify(token, secret);

  if (typeof payload !== "object" || !payload.userId || !payload.role) {
    throw new Error("Invalid JWT payload");
  }

  return {
    userId: payload.userId as string,
    role: payload.role as AppJwtPayload["role"],
    clientId: (payload.clientId as string) || null,
  };
}
