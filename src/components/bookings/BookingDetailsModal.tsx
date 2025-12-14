"use client";

import { useState } from "react";
import { useWsr, wsr } from "@/utils/wsr";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

interface Booking {
  _id: string;
  userName: string;
  userPhone: string;
  date: string;
  selectedTime: string;
  status: "confirmed" | "cancelled" | "pending";
  source: "manual" | "whatsapp";
}

const statusConfig: Record<
  Booking["status"],
  { label: string; color: "success" | "error" | "warning" }
> = {
  confirmed: { label: "Confirmed", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
  pending: { label: "Pending", color: "warning" },
};

export default function BookingDetailsModal({
  isOpen,
  bookingId,
  clientId,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  bookingId: string | null;
  clientId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const shouldFetch = isOpen && bookingId && clientId;

  const { data, loading, error, refetch } = useWsr<{ data: Booking }>(
    shouldFetch ? `/api/clients/${clientId}/bookings/${bookingId}` : null,
  );

  const booking = data?.data;

  const [actionLoading, setActionLoading] = useState<
    "cancel" | "reschedule" | null
  >(null);

  const isCancelled = booking?.status === "cancelled";

  /* ================= CANCEL ================= */

  const handleCancelBooking = async () => {
    if (!bookingId || !clientId) return;

    try {
      setActionLoading("cancel");

      await wsr(`/api/clients/${clientId}/bookings/${bookingId}/cancel`, {
        method: "PUT",
      });

      await refetch();
      onSuccess();
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= RENDER ================= */

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[480px] p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        Booking Details
      </h3>

      {loading && <p className="mt-4">Loading...</p>}

      {error && (
        <p className="text-error-500 mt-4">Failed to load booking details</p>
      )}

      {booking && (
        <>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>Name:</strong> {booking.userName}
            </p>
            <p>
              <strong>Phone:</strong> {booking.userPhone}
            </p>
            <p>
              <strong>Date:</strong> {booking.date}
            </p>
            <p>
              <strong>Time:</strong> {booking.selectedTime}
            </p>

            <div className="flex items-center gap-2">
              <strong>Status:</strong>
              <Badge
                variant="light"
                color={statusConfig[booking.status].color}
                size="sm"
              >
                {statusConfig[booking.status].label}
              </Badge>
            </div>

            <p>
              <strong>Source:</strong>{" "}
              {booking.source === "manual" ? "Admin" : "WhatsApp"}
            </p>
          </div>

          {/* ================= ACTIONS ================= */}
          <div className="mt-6 flex justify-end gap-2">
            {!isCancelled && (
              <>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleCancelBooking}
                  disabled={actionLoading === "cancel"}
                >
                  {actionLoading === "cancel"
                    ? "Cancelling..."
                    : "Cancel Booking"}
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
