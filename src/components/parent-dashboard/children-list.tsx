// components/parent-dashboard/children-list.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import ChildCard from "./child-card";
import ChildCardSkeleton from "./child-card-skeleton";
import { useChildrenList, Child } from "@/app/(parent)/children/hooks/use-children-list";

interface ChildrenListProps {
  parentId: string;
}

export default function ChildrenList({ parentId }: ChildrenListProps) {
  const { children, isLoading, isError, refetch, totalChildren } = useChildrenList(parentId);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);

  // Filter children based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChildren(children);
    } else {
      const filtered = children.filter(child =>
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.grade.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredChildren(filtered);
    }
  }, [children, searchTerm]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Failed to load children</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading your children's data.
        </p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
          <p className="text-muted-foreground">
            Manage your children and monitor their progress.
          </p>
        </div>
        <Button asChild>
          <Link href="/add-student">
            <Plus className="mr-2 h-4 w-4" />
            Add Child
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      {children.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search children by name or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <ChildCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && children.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No children added yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get started by adding your first child to monitor their educational progress.
          </p>
          <Button asChild size="lg">
            <Link href="/add-student">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Child
            </Link>
          </Button>
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && children.length > 0 && filteredChildren.length === 0 && searchTerm && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No children found</h3>
          <p className="text-muted-foreground">
            No children match your search criteria. Try a different search term.
          </p>
        </div>
      )}

      {/* Children Grid */}
      {!isLoading && filteredChildren.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChildren.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
          
          {/* Results Summary */}
          {searchTerm && (
            <p className="text-sm text-muted-foreground text-center">
              Showing {filteredChildren.length} of {totalChildren} children
            </p>
          )}
        </>
      )}
    </div>
  );
}
