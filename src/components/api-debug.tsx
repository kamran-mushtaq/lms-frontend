// components/api-debug.tsx
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type ApiError = {
  timestamp: string;
  url: string;
  method: string;
  status?: number;
  message: string;
};

export function ApiDebugPanel() {
  const [errors, setErrors] = useState<ApiError[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // This function will be called by our enhanced API client
    const handleApiError = (errorDetails: ApiError) => {
      setErrors((prev) => [errorDetails, ...prev].slice(0, 10)); // Keep last 10 errors
      setIsVisible(true);
    };

    // Register a global event listener for API errors
    window.addEventListener("api-error", (e: any) => handleApiError(e.detail));

    return () => {
      window.removeEventListener("api-error", (e: any) =>
        handleApiError(e.detail)
      );
    };
  }, []);

  if (!isVisible || process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white shadow-lg rounded-lg z-50 border border-red-300">
      <div className="flex items-center justify-between bg-red-100 p-2 rounded-t-lg">
        <h3 className="font-semibold">API Errors (Development Only)</h3>
        <button onClick={() => setIsVisible(false)}>
          <X size={16} />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {errors.length === 0 ? (
          <p className="text-sm text-gray-500 p-2">No errors logged</p>
        ) : (
          errors.map((error, index) => (
            <div key={index} className="border-b pb-2 mb-2">
              <p className="text-sm text-red-600 font-semibold">
                {error.message}
              </p>
              <p className="text-xs">
                {error.method} {error.url}
              </p>
              {error.status && (
                <p className="text-xs">Status: {error.status}</p>
              )}
              <p className="text-xs text-gray-500">{error.timestamp}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
