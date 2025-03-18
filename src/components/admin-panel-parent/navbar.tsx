"use client";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { useStore } from "@/hooks/use-store";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarToggle } from "./sidebar-toggle";

import LogoText from "@/components/logo-text";
import LogoSymbol from "@/components/logo-symbol";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../ui/breadcrumb";
import { GlobalSearch } from "../GlobalSearch";
import { useAuth } from "@/contexts/AuthContext";


interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const { user, logout } = useAuth();
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { isOpen, toggleOpen } = sidebar;

  return (
    <header
      className="sticky top-0 z-10 w-full bg-muted/50 backdrop-blur rounded-t-2xl dark:bg-dashboard-background"
      style={{ backdropFilter: "blur(20px)" }}
    >
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <LogoSymbol className="absolute left-0 top-0 w-full h-full" />
          {/* <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}
        </div>

        <div className="flex items-center justify-center absolute left-[50%] translate-x-[-50%] w-[40%]">
          <div className="w-full md:flex-none">
            <h2>
            {user?.name || "User"}
            </h2>
            {/* <GlobalSearch /> */}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
