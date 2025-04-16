// src/components/student-panel/content-layout.tsx
import { ReactNode } from "react";
import Head from "next/head";
import { 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Home, 
  BarChart2, 
  Bell, 
  Settings, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface ContentLayoutProps {
  children: ReactNode;
  title?: string;
}

export function ContentLayout({ children, title }: ContentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Main navigation items
  const mainNav = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Subjects",
      href: "/subjects",
      icon: BookOpen,
    },
    {
      name: "Study Plan",
      href: "/study-plan",
      icon: Calendar,
    },
    {
      name: "Assessments",
      href: "/assessments",
      icon: CheckSquare,
    },
    {
      name: "Progress",
      href: "/progress",
      icon: BarChart2,
    },
  ];

  return (
    <>
      {title && (
        <Head>
          <title>{title} | LMS</title>
        </Head>
      )}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col h-full border-r bg-background">
            <div className="h-16 flex items-center px-4 border-b">
              <Image
                src="/logo.svg"
                width={120}
                height={32}
                alt="LMS Logo"
                className="dark:invert"
              />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <nav className="flex-1 px-3 space-y-1">
                {mainNav.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "font-medium"
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Button>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-5 w-5 mr-3" />
                    <span>John Doe</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Logout
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Topbar */}
          <header className="w-full h-16 z-10 bg-background flex items-center justify-between border-b px-4">
            <div className="md:hidden">
              {/* Mobile logo */}
              <Image
                src="/logo-small.svg"
                width={32}
                height={32}
                alt="LMS Logo"
                className="dark:invert"
              />
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">JD</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Logout
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>

          {/* Mobile Navigation */}
          <nav className="md:hidden border-t bg-background">
            <div className="grid grid-cols-5 h-16">
              {mainNav.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                      "h-full rounded-none flex flex-col items-center justify-center px-0 space-y-1",
                      isActive && "bg-accent"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs">{item.name}</span>
                  </Button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
