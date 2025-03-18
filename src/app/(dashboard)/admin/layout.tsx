import { ProtectedLayout } from "@/components/protected-layout";

export default function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout allowedRoles={["admin"]} title="Admin Dashboard">
      {children}
    </ProtectedLayout>
  );
}
