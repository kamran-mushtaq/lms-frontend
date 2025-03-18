import AdminPanelLayout from "@/components/admin-panel-parent/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel-parent/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPanelLayout>
      <ContentLayout title="Account">
      {children}
      </ContentLayout>
    </AdminPanelLayout>
  );
}
