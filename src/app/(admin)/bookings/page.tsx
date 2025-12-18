import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NoAdminBookings from "@/components/bookings/NotAdminBookings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking list",
  description: "Manage booking for client",
};

export default async function ClientBookingPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Client Booking" />
      <NoAdminBookings />
    </div>
  );
}
