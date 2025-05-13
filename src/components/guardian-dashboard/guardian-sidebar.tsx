// components/guardian-dashboard/guardian-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu as MenuIcon, Ellipsis } from "lucide-react";
import { useState } from "react";
import LogoSymbol from "@/components/logo-symbol";
import LogoText from "@/components/logo-text";
import { getMenuList } from "@/lib/menu-list";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";

interface GuardianSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

export default function GuardianSidebar({ className, isOpen = true }: GuardianSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuList = getMenuList(pathname, 'guardian');

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/guardian/dashboard"
          className="flex items-center gap-2 font-semibold"
          onClick={() => isMobile && setMobileOpen(false)}
        >
          <LogoSymbol className="h-6 w-6" />
          <span className={cn(
            "transition-all duration-300",
            !isOpen && !isMobile ? "opacity-0 w-0" : "opacity-100"
          )}>
            <LogoText className="h-5" />
          </span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {menuList.map(({ groupLabel, menus }, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              {(isOpen || isMobile) && groupLabel && (
                <h3 className="text-xs font-semibold text-muted-foreground px-3 pb-2">
                  {groupLabel}
                </h3>
              )}
              {!isOpen && !isMobile && groupLabel && (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="flex justify-center items-center py-2">
                        <Ellipsis className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {menus.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <TooltipProvider key={itemIndex} disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-2 h-10",
                            pathname.startsWith(item.href) &&
                              "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                          asChild
                        >
                          <Link 
                            href={item.href} 
                            onClick={() => isMobile && setMobileOpen(false)}
                          >
                            <span className={cn(!isOpen && !isMobile ? "" : "mr-2")}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className={cn(
                              "transition-all duration-300",
                              !isOpen && !isMobile 
                                ? "opacity-0 w-0 hidden" 
                                : "opacity-100"
                            )}>
                              {item.label}
                            </span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {!isOpen && !isMobile && (
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 fixed left-4 top-4 z-40 md:hidden flex items-center justify-center"
          >
            <MenuIcon className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col bg-sidebar-background border-r p-0 w-72"
        >
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-sidebar-background border-r transition-all duration-300",
          isOpen ? "w-56" : "w-16",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
