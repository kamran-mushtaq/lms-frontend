"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Home,
  LayoutDashboard,
  ScrollText
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/student/dashboard",
    color: "text-sky-500"
  },
  {
    label: "My Courses",
    icon: BookOpen,
    href: "/student/courses",
    color: "text-violet-500"
  },
  {
    label: "Assessments",
    icon: ScrollText,
    href: "/student/assessments",
    color: "text-pink-500"
  },
  {
    label: "Achievements",
    icon: GraduationCap,
    href: "/student/achievements",
    color: "text-orange-500"
  }
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/student/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">LMS Application</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === route.href
                  ? "bg-white/10 hover:bg-white/20"
                  : "hover:bg-white/10"
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
