"use client";

import { useState, useMemo } from "react";
import { useWsr, wsr } from "@/utils/wsr";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { SlotForm } from "@/components/clients/SlotForm";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import BookingModal from "@/components/bookings/BookingModal";
import BookingDetailsModal from "@/components/bookings/BookingDetailsModal";

/* ================= TYPES ================= */

interface Slot {
  _id: string;
  date: string;
  times: {
    _id: string;
    bookingId: string;
    time: string;
    isBooked: boolean;
  }[];
}

/* ================= COMPONENT ================= */

export default function ViewSlots({ clientId }: { clientId: string }) {
  const { data, loading, refetch } = useWsr<{ data: Slot[] }>(
    `/api/clients/${clientId}/slots`,
  );

  const slots = data?.data || [];

  const createModal = useModal();
  const bookingModal = useModal();
  const deleteModal = useModal();

  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);

  const bookingDetailsModal = useModal();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );

  const [selectedSlot, setSelectedSlot] = useState<{
    slotId: string;
    date: string;
    time: string;
  } | null>(null);

  /* ================= HELPERS ================= */

  const hasBookedSlots = useMemo(() => {
    return slotToDelete?.times?.some((t) => t.isBooked) ?? false;
  }, [slotToDelete]);

  /* ================= HANDLERS ================= */

  const handleEditSlot = (slot: Slot) => {
    setEditingSlot(slot);
    setShowSlotForm(true);
  };

  const handleDeleteSlot = (slot: Slot) => {
    setSlotToDelete(slot);
    deleteModal.openModal();
  };

  const confirmDeleteSlot = async () => {
    if (!slotToDelete) return;

    try {
      await wsr(`/api/clients/${clientId}/slots/${slotToDelete._id}`, {
        method: "DELETE",
      });
      refetch();
    } finally {
      setSlotToDelete(null);
      deleteModal.closeModal();
    }
  };

  const openBookingDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    bookingDetailsModal.openModal();
  };

  /* ================= RENDER ================= */

  return (
    <>
      <ComponentCard
        title="Booking Slots"
        action={
          <Button size="sm" onClick={createModal.openModal}>
            Add Slots
          </Button>
        }
      >
        {loading ? (
          <p>Loading...</p>
        ) : slots.length === 0 ? (
          <p className="text-base text-gray-800 dark:text-white/90">
            No slots created yet
          </p>
        ) : (
          <div className="space-y-4">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className="rounded-lg border p-4 dark:border-gray-800"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-base font-medium text-gray-800 dark:text-white/90">
                    {slot.date}
                  </p>

                  <SlotActions
                    onEdit={() => handleEditSlot(slot)}
                    onDelete={() => handleDeleteSlot(slot)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {slot.times.map((t) => {
                    const isBooked = t.isBooked;

                    return (
                      <Badge
                        key={t._id}
                        variant="light"
                        color={isBooked ? "error" : "success"}
                        size="sm"
                      >
                        <span
                          onClick={() => {
                            if (isBooked) {
                              if (!t.bookingId) return;
                              openBookingDetails(t.bookingId);
                            } else {
                              setSelectedSlot({
                                slotId: slot._id,
                                date: slot.date,
                                time: t.time,
                              });
                              bookingModal.openModal();
                            }
                          }}
                          className={`select-none ${
                            isBooked
                              ? "cursor-pointer opacity-80 hover:opacity-100"
                              : "cursor-pointer hover:opacity-90"
                          }`}
                          title={
                            isBooked ? "View booking details" : "Create booking"
                          }
                        >
                          {t.time}
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ComponentCard>

      {/* ================= CREATE / EDIT SLOT MODAL ================= */}

      <Modal
        isOpen={createModal.isOpen || showSlotForm}
        onClose={() => {
          createModal.closeModal();
          setShowSlotForm(false);
          setEditingSlot(null);
        }}
        className="max-w-[520px] p-6"
        showCloseButton={false}
      >
        <SlotForm
          clientId={clientId}
          slot={editingSlot}
          onClose={() => {
            createModal.closeModal();
            setShowSlotForm(false);
            setEditingSlot(null);
          }}
          onSuccess={() => {
            createModal.closeModal();
            setShowSlotForm(false);
            setEditingSlot(null);
            refetch();
          }}
        />
      </Modal>

      {/* ================= BOOKING MODAL ================= */}

      {selectedSlot && (
        <BookingModal
          isOpen={bookingModal.isOpen}
          onClose={() => {
            bookingModal.closeModal();
            setSelectedSlot(null);
          }}
          onSuccess={() => {
            bookingModal.closeModal();
            setSelectedSlot(null);
            refetch();
          }}
          clientId={clientId}
          slotId={selectedSlot.slotId}
          date={selectedSlot.date}
          time={selectedSlot.time}
        />
      )}

      <BookingDetailsModal
        isOpen={bookingDetailsModal.isOpen}
        bookingId={selectedBookingId}
        clientId={clientId}
        onClose={() => {
          bookingDetailsModal.closeModal();
          setSelectedBookingId(null);
        }}
        onSuccess={refetch}
      />

      {/* ================= DELETE CONFIRM MODAL ================= */}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        className="max-w-[480px] p-6"
        showCloseButton={false}
      >
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {hasBookedSlots ? "Cannot Delete Slot" : "Delete Slot"}
        </h4>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {hasBookedSlots ? (
            <>
              This slot has <strong>active bookings</strong> and cannot be
              deleted. Please cancel all bookings first.
            </>
          ) : (
            <>
              Are you sure you want to delete{" "}
              <strong>{slotToDelete?.date}</strong>? This action cannot be
              undone.
            </>
          )}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={deleteModal.closeModal}>
            Close
          </Button>

          {!hasBookedSlots && (
            <Button size="sm" variant="danger" onClick={confirmDeleteSlot}>
              Delete
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}

/* ================= SLOT ACTIONS ================= */

function SlotActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
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
            onEdit();
            setIsOpen(false);
          }}
        >
          Edit
        </DropdownItem>

        <DropdownItem
          onItemClick={() => {
            onDelete();
            setIsOpen(false);
          }}
          className="text-red-600 hover:text-red-600 dark:text-red-600 dark:hover:text-red-600"
        >
          Delete
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
