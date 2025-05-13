

import { AuthProvider } from "@/contexts/AuthContext"; // Import the AuthProvider

export default function StudentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}