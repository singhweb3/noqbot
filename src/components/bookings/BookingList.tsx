"use client";

import { useState, useRef } from "react";
import { useWsr, wsr } from "@/utils/wsr";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import BookingDetailsModal from "@/components/bookings/BookingDetailsModal";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";
import { useWsrMutation } from "@/utils/useWsrMutation";

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
  /* ================= FILTER ================= */
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const [filterDate, setFilterDate] = useState(getToday);

  const { data, loading, refetch } = useWsr<{ data: Booking[] }>(
    filterDate
      ? `/api/clients/${clientId}/bookings?date=${filterDate}`
      : `/api/clients/${clientId}/bookings`,
  );

  const bookings = data?.data || [];

  const cancelModal = useModal();
  const detailsModal = useModal();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const { mutate, loading: processing, errorMsg } = useWsrMutation();

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

    const ok = await mutate(
      `/api/clients/${clientId}/bookings/${bookingToCancel._id}/cancel`,
      {
        method: "PUT",
      },
    );

    if (!ok) return;

    refetch();
    setBookingToCancel(null);
    cancelModal.closeModal();
  };

  /* ================= RENDER ================= */

  return (
    <>
      <ComponentCard title="Bookings">
        {/* ================= FILTER BAR ================= */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filterDate ? `Showing bookings for ${filterDate}` : "All bookings"}
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden date input */}
            <input
              ref={dateInputRef}
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="sr-only"
            />

            {/* Visible button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => dateInputRef.current?.showPicker()}
            >
              {filterDate || "Select Date"}
            </Button>

            {filterDate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilterDate("")}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* ================= TABLE ================= */}
        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found</p>
        ) : (
          <table className="w-full border-collapse text-gray-800 dark:text-gray-300">
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

                  <td className="py-2 text-right">
                    <BookingActions
                      booking={booking}
                      onView={openDetails}
                      onCancel={openCancelConfirm}
                    />
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
        {errorMsg && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            {errorMsg}
          </p>
        )}

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

/* ================= BOOKING ACTIONS ================= */

function BookingActions({
  booking,
  onView,
  onCancel,
}: {
  booking: Booking;
  onView: (b: Booking) => void;
  onCancel: (b: Booking) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button onClick={() => setIsOpen((v) => !v)} className="dropdown-toggle">
        <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-40 p-2"
      >
        <DropdownItem
          onItemClick={() => {
            onView(booking);
            setIsOpen(false);
          }}
        >
          View
        </DropdownItem>

        {booking.status === "confirmed" && (
          <DropdownItem
            onItemClick={() => {
              onCancel(booking);
              setIsOpen(false);
            }}
            className="text-red-600 hover:text-red-600 dark:text-red-600 dark:hover:text-red-600"
          >
            Cancel
          </DropdownItem>
        )}
      </Dropdown>
    </div>
  );
}
