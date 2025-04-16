// app/(dashboard)/student/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import  AdminPanelLayout  from "@/components/admin-panel/admin-panel-other-layout";

export default function StudentDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is loaded and is student without passing aptitude test, redirect
    if (!isLoading && user) {
      if (user.type === "student" && !user.aptitudeTestStatus?.passed) {
        router.push("/aptitude-test");
      }
    }
  }, [user, isLoading, router]);

  // If still loading or not authenticated, show loading state
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If not a student, redirect to home
  if (user.type !== "student") {
    router.push("/");
    return null;
  }

  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
