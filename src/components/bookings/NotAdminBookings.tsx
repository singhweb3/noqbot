"use client";

import BookingList from "@/components/bookings/BookingList";
import { useAuth } from "@/context/AuthContext";

export default function NoAdminBookings() {
  const { user, loading } = useAuth();
  if (loading) {
    return <p>Loading...</p>;
  }
  return <BookingList clientId={user?.clientId || ""} />;
}
