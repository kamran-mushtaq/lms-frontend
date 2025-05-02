// src/components/parent-dashboard/child-progress-card.tsx
import { format } from "date-fns";
import { Check, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Subject {
  id: string;
  name: string;
  progress: number;
  lastActivity: string;
  status: string;
}

interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  subjects: Subject[];
  progress: number;
}

interface ChildProgressCardProps {
  child: Child;
}

export default function ChildProgressCard({ child }: ChildProgressCardProps) {
  const getStatusIcon = (progress: number) => {
    if (progress >= 80) {
      return <Check className="h-4 w-4 text-green-500" />;
    } else if (progress >= 60) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{child.name}</CardTitle>
            <CardDescription>
              {child.grade} • Age {child.age}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {child.subjects && child.subjects.length > 0 ? (
          <div className="space-y-4">
            {child.subjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(subject.progress)}
                  <span className="font-medium">{subject.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge>{subject.progress}%</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(subject.lastActivity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No subject data available for this child
          </p>
        )}
      </CardContent>
    </Card>
  );
}