import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NoAdminSlots from "@/components/clients/NotAdminSlots";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Slots",
  description: "Manage booking slots for client",
};

export default async function ClientSlotsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Slots" />
      <NoAdminSlots />
    </div>
  );
}
