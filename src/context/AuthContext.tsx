"use client";

import React, { createContext, useContext } from "react";
import { useWsr } from "@/utils/wsr";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "client_admin" | "staff";
  clientId?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, loading } = useWsr<{ data: AuthUser }>("/api/auth/me");

  const user = data?.data ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
