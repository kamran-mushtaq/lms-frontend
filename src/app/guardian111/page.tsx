// app/guardian/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GuardianRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to guardian dashboard
    router.push("/guardian/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting...</h1>
        <p>You're being redirected to the guardian dashboard.</p>
      </div>
    </div>
  );
}
