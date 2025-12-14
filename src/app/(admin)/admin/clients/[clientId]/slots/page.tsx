import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ViewSlots from "@/components/clients/ViewSlots";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Slots",
  description: "Manage booking slots for client",
};

export default async function ClientSlotsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  return (
    <div>
      <PageBreadcrumb pageTitle="Client Slots" />
      <ViewSlots clientId={clientId} />
    </div>
  );
}
