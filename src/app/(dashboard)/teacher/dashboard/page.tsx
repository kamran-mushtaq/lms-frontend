"use client";

import { Activity, BookOpen, GraduationCap, Users } from "lucide-react";

import DashboardSingleCard from "@/components/dashboard-single-card";

export default function TeacherDashboardPage() {
  return (
    <div>
      <div className="grid auto-rows-min gap-4 lg:grid-cols-4">
        <DashboardSingleCard
          title="My Classes"
          icon={<GraduationCap />}
          highlight="8"
          smallDetail="2 classes today"
        />

        <DashboardSingleCard
          title="My Students"
          icon={<Users />}
          highlight="236"
          smallDetail="Active students"
        />

        <DashboardSingleCard
          title="Lectures"
          icon={<BookOpen />}
          highlight="124"
          smallDetail="12 pending reviews"
        />

        <DashboardSingleCard
          title="Active Now"
          icon={<Activity />}
          highlight="57"
          smallDetail="Students online"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Welcome to Teacher Dashboard
        </h2>
        <p className="text-muted-foreground">
          This is the teacher dashboard of the K12 Learning Management System.
          From here you can manage your classes, students, lectures,
          assessments, and grades.
        </p>
      </div>
    </div>
  );
}
