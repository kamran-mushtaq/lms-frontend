// src/app/(student)/lectures/[lectureId]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LectureError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Lecture view error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <div className="rounded-full bg-destructive/10 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        
        <p className="text-muted-foreground mb-6">
          We encountered an error while trying to load this lecture. Please try again or navigate back.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          
          <Button variant="ghost" onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-muted rounded-md text-left overflow-auto max-h-[200px]">
            <p className="font-mono text-xs">{error.message}</p>
            <p className="font-mono text-xs mt-2">{error.stack}</p>
          </div>
        )}
      </div>
    </div>
  );
}
