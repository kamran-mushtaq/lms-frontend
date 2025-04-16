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
    <div className="py-4 md:py-6">
      <header className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-3 shadow-lg md:px-6 md:py-4 dark:bg-muted">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-blue-500 p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">Gradient</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-8">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.link}
                    className="text-sm font-medium text-gray-600 dark:text-white transition-colors hover:text-blue-600"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Login Card */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* <ModeToggle /> */}
              <UserNav />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 border-t border-gray-100 pt-4 lg:hidden">
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.link}
                    className="block text-sm font-medium text-gray-700 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
            </nav>
            <div className="mt-6">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-900">Account Login</h3>
                <div className="space-y-3">
                  <input
                    type="email"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Email"
                  />
                  <input
                    type="password"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Password"
                  />
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}