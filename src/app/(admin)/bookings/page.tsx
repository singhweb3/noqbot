import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BookingList from "@/components/bookings/BookingList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking list",
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
      <BookingList clientId={clientId} />
    </div>
  );
}
