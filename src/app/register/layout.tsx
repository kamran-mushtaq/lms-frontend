// app/register/layout.tsx
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Learning Management System",
  description: "Create an account to access the Learning Management System",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      style={{
        backgroundImage: `
          radial-gradient(circle at 90% 10%, rgba(124, 58, 237, 0.07) 0%, transparent 30%),
          radial-gradient(circle at 10% 90%, rgba(59, 130, 246, 0.07) 0%, transparent 30%)
        `,
        backgroundSize: "cover",
      }}
    >
      <div className="absolute top-6 left-6 z-10">
        <a href="/" className="flex items-center">
          <img 
            src="/logo.svg" 
            alt="LMS Logo"
            className="h-8 w-auto"
          />
          <span className="ml-2 text-xl font-bold text-gray-900">LMS</span>
        </a>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      
      {children}
    </div>
  );
}