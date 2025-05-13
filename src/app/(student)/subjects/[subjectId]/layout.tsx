// src/app/(student)/subjects/[subjectId]/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subject Detail | Learning Management System",
  description: "View subject details, chapters, and track your progress",
};

export default function SubjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}