"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { wsr } from "@/utils/wsr";

interface SlotTime {
  _id?: string;
  time: string;
  isBooked: boolean;
}

interface Slot {
  _id: string;
  date: string;
  times: SlotTime[];
}

export function SlotForm({
  clientId,
  slot,
  onClose,
  onSuccess,
}: {
  clientId: string;
  slot?: Slot | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  /* ================= STATE ================= */

  // Edit mode (single slot)
  const [date, setDate] = useState(slot?.date || "");

  // Create mode (bulk)
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState("");

  const [times, setTimes] = useState(
    slot ? slot.times.map((t) => t.time).join(", ") : "",
  );

  const [saving, setSaving] = useState(false);

  const [dateError, setDateError] = useState(false);
  const [daysError, setDaysError] = useState(false);
  const [timesError, setTimesError] = useState(false);

  /* ================= HANDLERS ================= */

  const handleSubmit = async () => {
    let hasError = false;

    if (slot) {
      // EDIT VALIDATION
      if (!date) {
        setDateError(true);
        hasError = true;
      } else {
        setDateError(false);
      }
    } else {
      // CREATE VALIDATION
      if (!startDate) {
        setDateError(true);
        hasError = true;
      } else {
        setDateError(false);
      }

      if (!days || Number(days) <= 0) {
        setDaysError(true);
        hasError = true;
      } else {
        setDaysError(false);
      }
    }

    if (!times.trim()) {
      setTimesError(true);
      hasError = true;
    } else {
      setTimesError(false);
    }

    if (hasError) return;

    const timeArray = times
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setSaving(true);

      if (slot) {
        // ✅ EDIT SLOT (single date)
        await wsr(`/api/clients/${clientId}/slots/${slot._id}`, {
          method: "PUT",
          body: {
            times: timeArray,
          },
        });
      } else {
        // ✅ CREATE SLOTS (bulk days)
        await wsr(`/api/clients/${clientId}/slots`, {
          method: "POST",
          body: {
            startDate,
            days: Number(days),
            times: timeArray,
          },
        });
      }

      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        {slot ? "Edit Slots" : "Add Slots"}
      </h3>

      <div className="space-y-4">
        {/* DATE / START DATE */}
        {slot ? (
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              defaultValue={date}
              disabled
              error={dateError}
              hint={dateError ? "Date is required." : ""}
            />
          </div>
        ) : (
          <>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateError(false);
                }}
                error={dateError}
                hint={dateError ? "Start date is required." : ""}
              />
            </div>

            <div>
              <Label>Number of Days</Label>
              <Input
                type="number"
                placeholder="e.g. 7"
                onChange={(e) => {
                  setDays(e.target.value);
                  setDaysError(false);
                }}
                error={daysError}
                hint={daysError ? "Enter a valid number of days." : ""}
              />
            </div>
          </>
        )}

        {/* TIMES */}
        <div>
          <Label>Times (comma separated)</Label>
          <Input
            placeholder="10:00, 10:30, 11:00"
            defaultValue={times}
            onChange={(e) => {
              setTimes(e.target.value);
              setTimesError(false);
            }}
            error={timesError}
            hint={timesError ? "At least one time is required." : ""}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </>
  );
}
