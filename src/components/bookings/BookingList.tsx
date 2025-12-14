"use client";

import { useState } from "react";
import { useWsr, wsr } from "@/utils/wsr";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import BookingDetailsModal from "@/components/bookings/BookingDetailsModal";

/* ================= TYPES ================= */

interface Booking {
  _id: string;
  userName: string;
  userPhone: string;
  date: string;
  selectedTime: string;
  status: "confirmed" | "cancelled";
  source: "whatsapp" | "manual";
}

/* ================= COMPONENT ================= */

export default function BookingList({ clientId }: { clientId: string }) {
  const { data, loading, refetch } = useWsr<{ data: Booking[] }>(
    `/api/clients/${clientId}/bookings`,
  );

  const bookings = data?.data || [];

  const cancelModal = useModal();
  const detailsModal = useModal();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [processing, setProcessing] = useState(false);

  /* ================= HANDLERS ================= */

  const openDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    detailsModal.openModal();
  };

  const openCancelConfirm = (booking: Booking) => {
    setBookingToCancel(booking);
    cancelModal.openModal();
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      setProcessing(true);

      await wsr(
        `/api/clients/${clientId}/bookings/${bookingToCancel._id}/cancel`,
        { method: "POST" },
      );

      refetch();
    } finally {
      setProcessing(false);
      setBookingToCancel(null);
      cancelModal.closeModal();
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      <ComponentCard title="Bookings">
        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Date</th>
                <th className="py-2">Time</th>
                <th className="py-2">Patient</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Status</th>
                <th className="py-2">Source</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b">
                  <td className="py-2">{booking.date}</td>
                  <td className="py-2">{booking.selectedTime}</td>
                  <td className="py-2 font-medium">{booking.userName}</td>
                  <td className="py-2">{booking.userPhone}</td>

                  <td className="py-2">
                    <Badge
                      size="sm"
                      variant="light"
                      color={
                        booking.status === "confirmed" ? "success" : "error"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </td>

                  <td className="py-2">
                    <Badge size="sm" variant="light" color="info">
                      {booking.source}
                    </Badge>
                  </td>

                  <td className="space-x-2 py-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetails(booking)}
                    >
                      View
                    </Button>

                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => openCancelConfirm(booking)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ComponentCard>

      {/* ================= BOOKING DETAILS ================= */}

      {selectedBooking && (
        <BookingDetailsModal
          isOpen={detailsModal.isOpen}
          bookingId={selectedBooking._id}
          clientId={clientId}
          onClose={() => {
            detailsModal.closeModal();
            setSelectedBooking(null);
          }}
          onSuccess={refetch}
        />
      )}

      {/* ================= CANCEL CONFIRM ================= */}

      <Modal
        isOpen={cancelModal.isOpen}
        onClose={cancelModal.closeModal}
        className="max-w-[460px] p-6"
        showCloseButton={false}
      >
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
          Cancel Booking
        </h4>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to cancel booking for{" "}
          <strong>{bookingToCancel?.userName}</strong> on{" "}
          <strong>
            {bookingToCancel?.date} at {bookingToCancel?.selectedTime}
          </strong>
          ?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={cancelModal.closeModal}>
            Close
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={confirmCancel}
            disabled={processing}
          >
            {processing ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
