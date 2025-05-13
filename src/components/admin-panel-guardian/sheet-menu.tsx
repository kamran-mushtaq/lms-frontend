// components/admin-panel-guardian/sheet-menu.tsx
import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GuardianMenu } from "@/components/guardian-dashboard/guardian-menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from "@/components/ui/sheet";
import LogoSymbol from "../logo-symbol";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/guardian/dashboard" className="flex items-center gap-2">
              <LogoSymbol className="absolute left-0 top-0 w-full h-full" />

              <SheetTitle className="font-bold text-2xl uppercase">
                Zovo
              </SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <GuardianMenu isOpen />
      </SheetContent>
    </Sheet>
  );
}
