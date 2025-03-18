// components/parent-dashboard/children-overview.tsx
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ChildrenOverviewProps {
  children: any[];
  loading: boolean;
}

export default function ChildrenOverview({
  children,
  loading
}: ChildrenOverviewProps) {
  // Mock data - replace with actual API data
  const mockChildren = [
    { id: 1, name: "John Smith", grade: "Grade 6", subjects: 5, progress: 78 },
    {
      id: 2,
      name: "Emily Johnson",
      grade: "Grade 4",
      subjects: 4,
      progress: 85
    }
  ];

  const displayChildren = children.length > 0 ? children : mockChildren;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {loading ? (
        // Loading skeletons
        Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
      ) : (
        <>
          {displayChildren.map((child) => (
            <Card key={child.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{child.name}</CardTitle>
                    <CardDescription>{child.grade}</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary"
                  >
                    {child.progress}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-2">
                  <div className="text-sm flex justify-between">
                    <span>Active Subjects</span>
                    <span className="font-medium">{child.subjects}</span>
                  </div>
                  <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${child.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" asChild className="gap-1">
                      <Link href={`/parent/children/${child.id}`}>
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="flex flex-col justify-center items-center p-6">
            <User className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium mb-1">Add New Child</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Add another child to manage their learning
            </p>
            <Button asChild>
              <Link href="/add-student">
                <Plus className="mr-2 h-4 w-4" /> Add Child
              </Link>
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
