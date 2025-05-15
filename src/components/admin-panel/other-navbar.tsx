"use client";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { useStore } from "@/hooks/use-store";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarToggle } from "./sidebar-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../ui/breadcrumb";
import { GlobalSearch } from "../GlobalSearch";

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image";


import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Menu, User, X } from "lucide-react"

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  // First, call all hooks unconditionally
  const sidebar = useStore(useSidebar, (x) => x);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Then check for sidebar and return null if needed
  if (!sidebar) return null;

  // Now destructure sidebar properties
  const { isOpen, toggleOpen } = sidebar;

  // Menu items with their corresponding links
  const menuItems = [
    { name: "Dashboard", link: "/student/dashboard" },
    { name: "Subjects", link: "/subjects" },
    { name: "Study Plan", link: "/studyplan" },
    { name: "Assessments", link: "/assessments" },
    { name: "Progress", link: "/Progress" }
  ];



  return (
    <div className="bg-gradient-to-br p-1">
      <div className="w-full max-w-9xl mx-auto px-4 pt-4 sm:px-6 lg:px-8">
        <header className="rounded-full backdrop-blur-md bg-blue dark:bg-slate-900 border border-white/40 dark:border-gray-800/40 shadow-lg">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white">
                  <span className="font-semibold">LMS</span>
                </div>
                <span className="text-lg font-semibold">
                 
                 </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="text-sm font-medium hover:text-sky-600 dark:hover:text-sky-400"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <ModeToggle />
              <UserNav />

            </div>

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 py-6">

                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.link}
                      className="text-sm font-medium hover:text-sky-600 dark:hover:text-sky-400"
                    >
                      {item.name}
                    </Link>
                  ))}
                 
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700"
                      >
                        Register
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
      </div>
    </div>
  );
}