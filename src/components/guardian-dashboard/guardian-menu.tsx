// components/guardian-dashboard/guardian-menu.tsx
"use client";

import Link from "next/link";
import { Ellipsis, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";

interface GuardianMenuProps {
  isOpen: boolean | undefined;
}

export function GuardianMenu({ isOpen }: GuardianMenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname, 'guardian');

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-4 h-[full] w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-md font-bold text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                ""
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, index) => (
                  <div className="w-full " key={index}>
                    <TooltipProvider disableHoverableContent>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={
                              (active === undefined &&
                                pathname.startsWith(href)) ||
                              active
                                ? "secondary"
                                : "ghost"
                            }
                            className={`w-full justify-start h-10 mb-1 hover:bg-muted-foreground/10 hover:text-foreground text-muted-foreground ${
                              (active === undefined &&
                                pathname.startsWith(href)) ||
                              active
                                ? "bg-white shadow text-black hover:bg-muted-foreground/10 hover:text-foreground "
                                : "text-muted-foreground"
                            }`}
                            asChild
                          >
                            <Link href={href}>
                              <span
                                className={cn(isOpen === false ? "" : "mr-4")}
                              >
                                <Icon size={18} />
                              </span>
                              <p
                                className={cn(
                                  "max-w-[200px] truncate",
                                  isOpen === false
                                    ? "-translate-x-96 opacity-0"
                                    : "translate-x-0 opacity-100"
                                )}
                              >
                                {label}
                              </p>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        {isOpen === false && (
                          <TooltipContent side="right">
                            {label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      </nav>
    </ScrollArea>
  );
}
