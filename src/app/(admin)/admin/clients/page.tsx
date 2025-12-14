import type { Metadata } from "next";
import ViewClients from "@/components/clients/ViewClients";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Clients | NoQBot Admin",
  description: "Manage business clients in NoQBot",
};

export default function ClientsPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Clients" />
      <ViewClients />
    </>
  );
}
