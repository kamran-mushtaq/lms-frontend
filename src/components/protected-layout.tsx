"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import  AdminPanelLayout  from "@/components/admin-panel/admin-panel-layout";
import { Icons } from "@/components/icons";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  title?: string;
}

export function ProtectedLayout({
  children,
  allowedRoles = ["admin", "teacher", "parent", "student"],
  title = "Dashboard"
}: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("You must be logged in to view this page");
      router.push("/login");
      return;
    }

    if (!isLoading && user && !allowedRoles.includes(user.type)) {
      toast.error("You don't have permission to access this page");

      // Redirect to appropriate dashboard based on role
      switch (user.type) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "teacher":
          router.push("/teacher/dashboard");
          break;
        case "parent":
          router.push("/parent/dashboard");
          break;
        case "student":
          router.push("/student/dashboard");
          break;
        default:
          router.push("/login");
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.type)) {
    return null;
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title={title}>{children}</ContentLayout>
    </AdminPanelLayout>
  );
}
