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
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useRouter } from "next/navigation";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import { useWsrMutation } from "@/utils/useWsrMutation";

/* ================= TYPES ================= */

interface Client {
  _id: string;
  name: string;
  whatsappNumber: string;
  email?: string;
  isActive: boolean;
  businessType: string;
  address: string;
}

type UserFormMode = "client_admin" | "staff";

type UserStatusItem = {
  exists: boolean;
  userId: string | null;
  email: string | null;
};

type UserStatusResponse = {
  clientAdmin: UserStatusItem;
  staff: UserStatusItem;
};

/* ================= MAIN COMPONENT ================= */

export default function ViewClients() {
  const { data, loading, refetch } = useWsr<{ data: Client[] }>("/api/clients");

  const clients = data?.data || [];

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [loginClient, setLoginClient] = useState(false);
  const [loginType, setLoginType] = useState("client_admin");

  /* ================= HANDLERS ================= */

  const handleCreate = () => {
    setEditingClient(null);
    setShowFormModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowFormModal(true);
  };
  const handleLoginClient = (client: Client) => {
    setEditingClient(client);
    setLoginClient(true);
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
          <table className="w-full border-collapse text-gray-800 dark:text-white/90">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Name</th>
                <th className="py-2">WhatsApp</th>
                <th className="py-2">Business Type</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client._id} className="border-b">
                  <td className="py-2 font-medium">{client.name}</td>
                  <td className="py-2">{client.whatsappNumber}</td>
                  <td className="py-2">{client.businessType || "-"}</td>
                  <td
                    className={
                      client.isActive
                        ? "py-2 text-green-600 dark:text-green-600"
                        : "py-2 text-red-600 dark:text-red-600"
                    }
                  >
                    {client.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="py-2 text-right">
                    <ClientActions
                      client={client}
                      onEdit={handleEdit}
                      onLoginClient={handleLoginClient}
                      loginType={(type: UserFormMode) => setLoginType(type)}
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

      <Modal
        isOpen={!!loginClient}
        onClose={() => setLoginClient(false)}
        className="max-w-[520px] p-6"
        showCloseButton={false}
      >
        {loginClient && (
          <CreateClientLoginModal
            client={editingClient}
            onClose={() => setLoginClient(false)}
            onSuccess={() => {
              setLoginClient(false);
              refetch();
            }}
            role={loginType as "client_admin" | "staff"}
          />
        )}
      </Modal>
    </>
  );
}

/* ================= ACTION MENU ================= */

function ClientActions({
  client,
  onEdit,
  onToggleStatus,
  onLoginClient,
  loginType,
}: {
  client: Client;
  onEdit: (c: Client) => void;
  onToggleStatus: (c: Client) => void;
  onLoginClient: (c: Client) => void;
  loginType: (type: UserFormMode) => void;
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
            onLoginClient(client);
            setIsOpen(false);
            loginType("client_admin");
          }}
        >
          Create Login
        </DropdownItem>
        <DropdownItem
          onItemClick={() => {
            onLoginClient(client);
            setIsOpen(false);
            loginType("staff");
          }}
        >
          Create Staff
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
          className={
            client.isActive
              ? "text-red-600 hover:text-red-600 dark:text-red-600 dark:hover:text-red-600"
              : "text-green-600 hover:text-green-600 dark:text-green-600 dark:hover:text-green-600"
          }
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
  const [businessType, setBusinessType] = useState(
    client?.businessType || "clinic",
  );
  const [address, setAddress] = useState(client?.address || "");
  const [email, setEmail] = useState(client?.email || "");

  const [saving, setSaving] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const [addressError, setAddressError] = useState(false);

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

    // Address validation
    if (!address.trim()) {
      setAddressError(true);
      hasError = true;
    } else {
      setAddressError(false);
    }

    if (hasError) return;

    try {
      setSaving(true);

      const body = {
        name,
        whatsappNumber,
        email: email || undefined,
        businessType,
        address: address || undefined,
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

  const businessTypeOptions = [
    { value: "clinic", label: "Clinic" },
    { value: "hospital", label: "Hospital" },
    { value: "salon", label: "Salon" },
    { value: "spa", label: "Spa" },
    { value: "restaurant", label: "Restaurant" },
    { value: "diagnostic", label: "Diagnostic Center" },
    { value: "other", label: "Other" },
  ];

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
        {/* Business Type */}
        <div>
          <Label>Business Type</Label>
          <div className="relative">
            <Select
              options={businessTypeOptions}
              placeholder="Select business type"
              defaultValue={businessType}
              onChange={(value) => {
                setBusinessType(value);
              }}
              className="dark:bg-dark-900"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* Address */}
        <div>
          <Label>Address</Label>
          <TextArea
            rows={3}
            value={address}
            onChange={(value) => {
              setAddress(value);
              setAddressError(false);
            }}
            error={addressError}
            hint={addressError ? "Address is required." : ""}
            placeholder="Full business address"
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

/* ================= ClientLoginModal ================= */
function CreateClientLoginModal({
  client,
  onClose,
  onSuccess,
  role,
}: {
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
  role: "client_admin" | "staff";
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // const [saving, setSaving] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const { mutate, loading: saving, errorMsg } = useWsrMutation();

  const { data, loading } = useWsr<{ data: UserStatusResponse }>(
    `/api/clients/${client?._id}/user-status`,
  );

  const userStatus = data?.data;
  const isExisting =
    role === "client_admin"
      ? userStatus?.clientAdmin?.exists
      : userStatus?.staff?.exists;

  const existingEmail =
    role === "client_admin"
      ? userStatus?.clientAdmin?.email
      : userStatus?.staff?.email;

  const userId =
    role === "client_admin"
      ? userStatus?.clientAdmin?.userId
      : userStatus?.staff?.userId;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async () => {
    let hasError = false;

    // ================= CREATE MODE =================
    if (!isExisting) {
      if (!name.trim()) {
        setNameError(true);
        hasError = true;
      } else {
        setNameError(false);
      }

      if (!emailRegex.test(email)) {
        setEmailError(true);
        hasError = true;
      } else {
        setEmailError(false);
      }

      if (!phone.trim()) {
        setPhoneError(true);
        hasError = true;
      } else {
        setPhoneError(false);
      }

      if (password.length < 6) {
        setPasswordError(true);
        hasError = true;
      } else {
        setPasswordError(false);
      }
    }

    // ================= UPDATE MODE =================
    if (isExisting) {
      // ❗ At least one must be provided
      if (!email && !password) {
        setEmailError(true);
        setPasswordError(true);
        hasError = true;
      } else {
        setEmailError(false);
        setPasswordError(false);
      }

      // Validate email only if provided
      if (email && !emailRegex.test(email)) {
        setEmailError(true);
        hasError = true;
      }

      // Validate password only if provided
      if (password && password.length < 6) {
        setPasswordError(true);
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      // ================= UPDATE EXISTING USER =================
      if (isExisting && userId) {
        const res = await mutate(
          `/api/clients/${client?._id}/users/${userId}`,
          {
            method: "PUT",
            body: {
              email: email || undefined,
              password: password || undefined,
            },
          },
        );

        if (!res) return;

        onSuccess();
        return;
      }

      // ================= CREATE NEW USER =================
      const res = await mutate(`/api/clients/${client?._id}/users`, {
        method: "POST",
        body: {
          name,
          email,
          phone,
          password,
          role,
          clientId: client?._id,
        },
      });

      if (!res) return;

      onSuccess();
    } catch (error) {
      console.error("Failed to create/update user", error);
    } finally {
      // setSaving(false); --- IGNORE ---
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        {isExisting
          ? `Manage ${role === "client_admin" ? "Client Admin" : "Staff"}`
          : `Create ${role === "client_admin" ? "Client Admin" : "Staff"} Login`}
      </h2>

      <div className="space-y-4">
        {isExisting ? (
          <div className="space-y-4">
            <div className="text-gray-800 dark:text-white">
              Current: {existingEmail}
            </div>

            <div>
              <Label>New Email</Label>
              <Input
                type="email"
                placeholder="Enter new email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                error={emailError}
                hint={emailError ? "Valid email required." : ""}
              />
            </div>

            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Leave empty to keep unchanged"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                error={passwordError}
                hint={passwordError ? "Minimum 6 characters." : ""}
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <Label>Name</Label>
              <Input
                placeholder="Full name"
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(false);
                }}
                error={nameError}
                hint={nameError ? "Name is required." : ""}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="admin@clinic.com"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                error={emailError}
                hint={emailError ? "Valid email required." : ""}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                placeholder="Phone number"
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(false);
                }}
                error={phoneError}
                hint={phoneError ? "Phone is required." : ""}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                error={passwordError}
                hint={
                  passwordError ? "Password must be at least 6 characters." : ""
                }
              />
            </div>
          </>
        )}
      </div>
      {errorMsg && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-500">
          Error: {errorMsg}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating..." : "Submit"}
        </Button>
      </div>
    </>
  );
}
