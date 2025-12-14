"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import { wsr } from "@/utils/wsr";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  slotId: string;
  date: string;
  time: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  slotId,
  date,
  time,
}: BookingModalProps) {
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const handleConfirm = async () => {
    let hasError = false;

    const nameRegex = /[a-zA-Z]/; // must contain letters
    const phoneRegex = /^\d{10,15}$/; // numbers only

    /* Name validation */
    if (!userName.trim() || !nameRegex.test(userName)) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    /* Phone validation */
    if (!phoneRegex.test(userPhone)) {
      setPhoneError(true);
      hasError = true;
    } else {
      setPhoneError(false);
    }

    if (hasError) return;

    try {
      setSaving(true);

      await wsr(`/api/clients/${clientId}/bookings`, {
        method: "POST",
        body: {
          date,
          time,
          userName: userName.trim(),
          userPhone: userPhone.trim(),
          source: "manual",
        },
      });

      onSuccess();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[520px] p-6"
      showCloseButton={false}
    >
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Book Slot
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          📅 {date} &nbsp; ⏰ {time}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label>Customer Name</Label>
          <Input
            placeholder="Customer name"
            defaultValue={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setNameError(false);
            }}
            error={nameError}
            hint={
              nameError ? "Name must contain letters (not only numbers)." : ""
            }
          />
        </div>

        <div>
          <Label>Mobile Number</Label>
          <Input
            placeholder="Mobile number"
            defaultValue={userPhone}
            onChange={(e) => {
              setUserPhone(e.target.value);
              setPhoneError(false);
            }}
            error={phoneError}
            hint={phoneError ? "Enter a valid numeric mobile number." : ""}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleConfirm} disabled={saving}>
          {saving ? "Booking..." : "Confirm Booking"}
        </Button>
      </div>
    </Modal>
  );
}
