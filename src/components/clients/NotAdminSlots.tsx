"use client";

import ViewSlots from "@/components/clients/ViewSlots";
import { useAuth } from "@/context/AuthContext";

export default function NoAdminSlots() {
  const { user, loading } = useAuth();
  if (loading) {
    return <p>Loading...</p>;
  }
  return <ViewSlots clientId={user?.clientId || ""} />;
}
