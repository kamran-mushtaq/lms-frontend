import AdminPanelLayout from "@/components/admin-panel/admin-panel-other-layout"; // Import the layout component
import { AuthProvider } from "@/hooks/use-auth"; // Import AuthProvider

export default function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider> {/* Wrap the content with AuthProvider */}
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </AuthProvider>
  );
}