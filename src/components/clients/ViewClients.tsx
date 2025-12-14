"use client";

import { useState } from "react";
import Link from "next/link";
import { useWsr, wsr } from "@/utils/wsr";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface Client {
  _id: string;
  name: string;
  whatsappNumber: string;
  email?: string;
  isActive: boolean;
}

/* ================= MAIN COMPONENT ================= */

export default function ViewClients() {
  const { data, loading, refetch } = useWsr<{ data: Client[] }>("/api/clients");

  const clients = data?.data || [];

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const deleteModal = useModal();
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  /* ================= HANDLERS ================= */

  const handleCreate = () => {
    setEditingClient(null);
    setShowFormModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowFormModal(true);
  };

  const toggleClientStatus = async (client: Client) => {
    try {
      await wsr(`/api/clients/${client._id}`, {
        method: "PUT",
        body: {
          isActive: !client.isActive,
        },
      });

      refetch();
    } catch (error) {
      console.error("Failed to update client status", error);
    }
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await wsr(`/api/clients/${clientToDelete._id}`, {
        method: "DELETE",
      });

      refetch();
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setClientToDelete(null);
      deleteModal.closeModal();
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      <ComponentCard
        title="Clients"
        action={
          <Button size="sm" onClick={handleCreate}>
            Add Client
          </Button>
        }
      >
        {loading ? (
          <p>Loading...</p>
        ) : clients.length === 0 ? (
          <p>No clients found</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Name</th>
                <th className="py-2">WhatsApp</th>
                <th className="py-2">Email</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client._id} className="border-b">
                  <td className="py-2 font-medium">{client.name}</td>
                  <td className="py-2">{client.whatsappNumber}</td>
                  <td className="py-2">{client.email || "-"}</td>
                  <td className="py-2">
                    {client.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="py-2 text-right">
                    <ClientActions
                      client={client}
                      onEdit={handleEdit}
                      onToggleStatus={toggleClientStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ComponentCard>

      {/* ================= CREATE / EDIT MODAL ================= */}

      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        className="max-w-[520px] p-6"
        showCloseButton={false}
      >
        <ClientFormModal
          client={editingClient}
          onClose={() => setShowFormModal(false)}
          onSuccess={() => {
            setShowFormModal(false);
            refetch();
          }}
        />
      </Modal>

      {/* ================= DELETE CONFIRM MODAL ================= */}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        className="max-w-[480px] p-6"
        showCloseButton={false}
      >
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Delete Client
        </h4>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-800 dark:text-white">
            {clientToDelete?.name}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={deleteModal.closeModal}>
            Cancel
          </Button>

          <Button size="sm" variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

/* ================= ACTION MENU ================= */

function ClientActions({
  client,
  onEdit,
  onToggleStatus,
}: {
  client: Client;
  onEdit: (c: Client) => void;
  onToggleStatus: (c: Client) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

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
            router.push(`/admin/clients/${client._id}/slots`);
            setIsOpen(false);
          }}
        >
          View
        </DropdownItem>

        <DropdownItem
          onItemClick={() => {
            onEdit(client);
            setIsOpen(false);
          }}
        >
          Edit
        </DropdownItem>

        <DropdownItem
          onItemClick={() => {
            onToggleStatus(client);
            setIsOpen(false);
          }}
          className={client.isActive ? "text-red-600" : "text-green-600"}
        >
          {client.isActive ? "Deactivate" : "Activate"}
        </DropdownItem>
      </Dropdown>
    </div>
  );
}

/* ================= FORM MODAL ================= */

function ClientFormModal({
  client,
  onClose,
  onSuccess,
}: {
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(client?.name || "");
  const [whatsappNumber, setWhatsappNumber] = useState(
    client?.whatsappNumber || "",
  );
  const [email, setEmail] = useState(client?.email || "");

  const [saving, setSaving] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ================= HANDLERS ================= */

  const handleSubmit = async () => {
    let hasError = false;

    // Name validation
    if (!name.trim()) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    // WhatsApp validation
    if (!whatsappNumber.trim()) {
      setPhoneError(true);
      hasError = true;
    } else {
      setPhoneError(false);
    }

    // Email validation (optional)
    if (email && !emailRegex.test(email)) {
      setEmailError(true);
      hasError = true;
    } else {
      setEmailError(false);
    }

    if (hasError) return;

    try {
      setSaving(true);

      const body = {
        name,
        whatsappNumber,
        email: email || undefined,
      };

      if (client) {
        await wsr(`/api/clients/${client._id}`, {
          method: "PUT",
          body,
        });
      } else {
        await wsr("/api/clients", {
          method: "POST",
          body,
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
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        {client ? "Edit Client" : "Create Client"}
      </h2>

      <div className="space-y-4">
        {/* Client Name */}
        <div>
          <Label>Client Name</Label>
          <Input
            placeholder="Enter client name"
            defaultValue={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(false);
            }}
            error={nameError}
            hint={nameError ? "Client name is required." : ""}
          />
        </div>

        {/* WhatsApp Number */}
        <div>
          <Label>WhatsApp Number</Label>
          <Input
            placeholder="Enter WhatsApp number"
            defaultValue={whatsappNumber}
            onChange={(e) => {
              setWhatsappNumber(e.target.value);
              setPhoneError(false);
            }}
            error={phoneError}
            hint={phoneError ? "WhatsApp number is required." : ""}
          />
        </div>

        {/* Email (Optional) */}
        <div>
          <Label>Email (optional)</Label>
          <Input
            type="email"
            placeholder="business@example.com"
            defaultValue={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(false);
            }}
            error={emailError}
            hint={emailError ? "Please enter a valid email address." : ""}
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
