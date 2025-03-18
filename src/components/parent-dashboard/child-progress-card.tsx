// components/parent-dashboard/child-progress-card.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare } from "lucide-react";

interface ChildProgressCardProps {
  child: {
    id: number;
    name: string;
    grade: string;
    age?: number;
    subjects: {
      name: string;
      progress: number;
      lastActivity: string;
    }[];
  };
}

export default function ChildProgressCard({ child }: ChildProgressCardProps) {
  const overallProgress =
    child.subjects.reduce((acc, subject) => acc + subject.progress, 0) /
    child.subjects.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{child.name}</CardTitle>
            <CardDescription>
              {child.grade}
              {child.age ? ` • Age ${child.age}` : ""}
            </CardDescription>
          </div>
          <Badge className="font-medium">
            {Math.round(overallProgress)}% Overall
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {child.subjects.map((subject, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{subject.name}</span>
                <span className="text-muted-foreground text-xs">
                  Last activity: {subject.lastActivity}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-secondary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${subject.progress}%`,
                      backgroundColor: getSubjectColor(subject.name)
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {subject.progress}%
                </span>
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/parent/message/${child.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" /> Message Teacher
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/parent/children/${child.id}`}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get color based on subject name
function getSubjectColor(subjectName: string): string {
  const subjectColors: Record<string, string> = {
    Mathematics: "hsl(var(--subject-math))",
    Math: "hsl(var(--subject-math))",
    Science: "hsl(var(--subject-science))",
    English: "hsl(var(--subject-language))",
    Language: "hsl(var(--subject-language))",
    History: "hsl(var(--subject-social))",
    "Social Studies": "hsl(var(--subject-social))",
    Art: "hsl(var(--subject-arts))",
    "Physical Education": "hsl(var(--subject-pe))",
    PE: "hsl(var(--subject-pe))"
  };

  return subjectColors[subjectName] || "hsl(var(--primary))";
}
