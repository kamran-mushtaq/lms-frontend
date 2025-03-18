// components/parent-dashboard/parent-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  UsersRound,
  BarChart3,
  BookOpen,
  Calendar,
  Settings,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import  LogoSymbol  from "@/components/logo-symbol";

const parentNavItems = [
  {
    title: "Dashboard",
    href: "/parent/dashboard",
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    title: "My Children",
    href: "/parent/children",
    icon: <UsersRound className="h-5 w-5" />
  },
  {
    title: "Courses",
    href: "/parent/courses",
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    title: "Calendar",
    href: "/parent/calendar",
    icon: <Calendar className="h-5 w-5" />
  },
  {
    title: "Messages",
    href: "/parent/messages",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    title: "Settings",
    href: "/parent/settings",
    icon: <Settings className="h-5 w-5" />
  }
];

interface ParentSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function ParentSidebar({ className }: ParentSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 fixed left-4 top-4 z-40 md:hidden flex items-center justify-center"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col bg-sidebar-background border-r p-0"
        >
          <div className="flex h-14 items-center border-b px-4">
            <Link
              href="/parent/dashboard"
              className="flex items-center gap-2 font-semibold"
              onClick={() => setOpen(false)}
            >
              <LogoSymbol className="h-6 w-6" />
              <span>LMS Portal</span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 p-2">
              {parentNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start gap-2",
                    pathname === item.href &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    {item.icon}
                    {item.title}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex w-56 flex-col bg-sidebar-background border-r",
          className
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link
            href="/parent/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <LogoSymbol className="h-6 w-6" />
            <span>Parent Portal</span>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {parentNavItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "justify-start gap-2",
                  pathname === item.href &&
                    "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  {item.icon}
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
