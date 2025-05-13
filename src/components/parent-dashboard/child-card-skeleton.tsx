// components/parent-dashboard/child-card-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChildCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar Skeleton */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-2 rounded-lg bg-muted/50">
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex space-x-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}
