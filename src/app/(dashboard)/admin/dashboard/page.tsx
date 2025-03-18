"use client";

import { Activity, CreditCard, DollarSign, Users } from "lucide-react";

import DashboardSingleCard from "@/components/dashboard-single-card";

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="grid auto-rows-min gap-4 lg:grid-cols-4">
        <DashboardSingleCard
          title="Total Users"
          icon={<Users />}
          highlight="4,231"
          smallDetail="+20.1% from last month"
        />

        <DashboardSingleCard
          title="Total Classes"
          icon={<CreditCard />}
          highlight="350"
          smallDetail="+18.1% from last month"
        />

        <DashboardSingleCard
          title="Total Subjects"
          icon={<DollarSign />}
          highlight="1,234"
          smallDetail="+19% from last month"
        />

        <DashboardSingleCard
          title="Active Now"
          icon={<Activity />}
          highlight="573"
          smallDetail="+201 since last hour"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h2>
        <p className="text-muted-foreground">
          This is the admin dashboard of the K12 Learning Management System.
          From here you can manage users, classes, subjects, and other aspects
          of the system.
        </p>
      </div>
    </div>
  );
}
