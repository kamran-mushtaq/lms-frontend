'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect from /lectures to /student/lectures
export default function LecturesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/student/lectures');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="ml-4">Redirecting to lectures...</p>
    </div>
  );
}
