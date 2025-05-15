

import { AuthProvider } from "@/contexts/AuthContext"; // Import the AuthProvider
import AdminPanelLayout from "@/components/admin-panel/admin-panel-other-layout";

export default function StudentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminPanelLayout>
      {children}

      </AdminPanelLayout>
    </AuthProvider>
  );
}