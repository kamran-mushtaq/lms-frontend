// app/guardian/children/page.tsx
"use client";

import { useEffect, useState } from "react";
import ChildrenList from "@/components/guardian-dashboard/children-list";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GuardianChildrenPage() {
  const [guardianId, setGuardianId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem("token");
    
    if (!token) {
      // Redirect to login if no token
      window.location.href = "/login";
      return;
    }

    setIsAuthenticated(true);
    
    // Try to get user ID from localStorage
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        // Use _id as that's what AuthContext uses
        setGuardianId(userData._id || userData.id);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    
    setLoading(false);
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-lg font-semibold mb-2">Please log in</h3>
        <p className="text-muted-foreground mb-4">
          You need to be logged in to view your children.
        </p>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  // Show error if no guardian ID
  if (!guardianId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-lg font-semibold mb-2">Unable to load user data</h3>
        <p className="text-muted-foreground mb-4">
          Please try refreshing the page or logging in again.
        </p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Guardian Portal</h1>
            <nav className="flex space-x-4">
              <Link href="/guardian/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/guardian/children" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                My Children
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChildrenList guardianId={guardianId} />
      </div>
    </div>
  );
}
