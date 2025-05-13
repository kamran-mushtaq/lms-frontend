// components/parent-dashboard/add-child-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AddChildButtonProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export default function AddChildButton({ 
  className,
  size = "default",
  variant = "default"
}: AddChildButtonProps) {
  return (
    <Button asChild size={size} variant={variant} className={className}>
      <Link href="/add-student">
        <Plus className="mr-2 h-4 w-4" />
        Add Child
      </Link>
    </Button>
  );
}
