"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StudentNavbar() {
  return (
    <div className="h-16 border-b px-4">
      <div className="flex h-full items-center justify-end gap-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/help">Help Center</Link>
        </Button>
        <ModeToggle />
      </div>
    </div>
  );
}
