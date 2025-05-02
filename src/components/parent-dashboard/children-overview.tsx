import { Card, CardContent } from "@/components/ui/card";
import { Child } from "@/types/parent-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChildrenOverviewProps {
  children: Child[];
  loading: boolean;
  onChildSelect: (childId: string) => void;
  selectedChildId: string | null;
}

export default function ChildrenOverview({
  children,
  loading,
  onChildSelect,
  selectedChildId
}: ChildrenOverviewProps) {
  const getStatusIcon = (progress: number) => {
    if (progress >= 80) {
      return <Check className="h-4 w-4 text-green-500" />;
    } else if (progress >= 60) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 80) {
      return "bg-green-500";
    } else if (progress >= 60) {
      return "bg-yellow-500";
    } else {
      return "bg-red-500";
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No Children Added</h3>
          <p className="text-muted-foreground">
            You haven't added any children to your account yet. Add a child to start tracking their academic progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children.map((child) => (
        <Card
          key={child.id}
          className={cn(
            "overflow-hidden cursor-pointer transition-colors",
            selectedChildId === child.id ? "border-primary ring-1 ring-primary" : "hover:bg-muted/50"
          )}
          onClick={() => onChildSelect(child.id)}
        >
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{child.name}</div>
                  <Badge variant="outline">{child.grade}</Badge>
                </div>
                <Badge className={getStatusColor(child.progress)}>
                  {child.progress}%
                </Badge>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span>{child.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", getStatusColor(child.progress))}
                    style={{ width: `${child.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subjects: <span className="font-medium">{child.subjects.length}</span>
                </span>
                <span className="text-muted-foreground">
                  Age: <span className="font-medium">{child.age}</span>
                </span>
              </div>
            </div>

            {child.subjects.length > 0 && (
              <div className="border-t px-4 py-3 bg-muted/30">
                <p className="text-xs font-medium mb-2">Recent Subjects</p>
                <div className="space-y-2">
                  {child.subjects.slice(0, 2).map((subject) => (
                    <div key={subject.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(subject.progress)}
                        <span>{subject.name}</span>
                      </div>
                      <span>{subject.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}