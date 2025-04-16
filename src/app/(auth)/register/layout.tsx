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
    <div>
      {children}
    </div>
  );
}