// components/admin-panel-parent/sidebar.tsx
"use client";
import { ParentMenu } from "@/components/parent-dashboard/parent-menu";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import LogoText from "@/components/logo-text";
import LogoSymbol from "@/components/logo-symbol";

export function ParentSidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { getOpenState, setIsHover, settings } = sidebar;
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-56",
        settings.disabled && "hidden"
      )}
    >
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col px-3 py-4 overflow-y-auto bg-background"
      >
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            !getOpenState() ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/parent/dashboard" className="flex items-center gap-2 logo mt-3">
            <LogoSymbol className="absolute left-0 top-0 w-full h-full" />
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                !getOpenState()
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              <LogoText className="logo-text" />
            </h1>
          </Link>
        </Button>
        <ParentMenu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
