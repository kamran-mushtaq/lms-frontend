// components/parent-dashboard/child-card.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Child } from "@/types/child";

interface ChildCardProps {
  child: Child;
}

export default function ChildCard({ child }: ChildCardProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressTextColor = (progress: number) => {
    if (progress >= 80) return "text-green-700 border-green-200 bg-green-50";
    if (progress >= 60) return "text-yellow-700 border-yellow-200 bg-yellow-50";
    return "text-red-700 border-red-200 bg-red-50";
  };

  const formatLastActivity = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "No recent activity";
    }
  };

  const getRecentActivityIcon = (type: string) => {
    switch (type) {
      case 'lecture_completed':
        return <BookOpen className="h-4 w-4" />;
      case 'assessment_completed':
        return <TrendingUp className="h-4 w-4" />;
      case 'subject_enrolled':
        return <Calendar className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 h-full">
      <Link href={`/app/(parent)/children/${child.id}`} className="block h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={child.profileImage} alt={child.name} />
                  <AvatarFallback className="text-lg font-semibold">
                    {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {child.isActive && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{child.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {child.grade} • Age {child.age}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`px-3 py-1 ${getProgressTextColor(child.overallProgress)}`}
            >
              {child.overallProgress}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{child.overallProgress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(child.overallProgress)}`}
                style={{ width: `${child.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-blue-600">{child.quickStats.subjectsEnrolled}</div>
              <div className="text-xs text-muted-foreground">Subjects</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-orange-600">{child.quickStats.assessmentsPending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-green-600">{child.quickStats.studyStreakDays}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30">
            {getRecentActivityIcon(child.recentActivity.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {child.recentActivity.item}
              </p>
              <p className="text-xs text-muted-foreground">
                {child.recentActivity.subject} • {formatLastActivity(child.recentActivity.timestamp)}
              </p>
            </div>
          </div>

          {/* Upcoming Assessment */}
          {child.upcomingAssessment && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {child.upcomingAssessment.title}
                  </p>
                  <p className="text-xs text-amber-600">
                    Due {formatLastActivity(child.upcomingAssessment.dueDate)}
                  </p>
                </div>
                <Badge variant="outline" className="text-amber-700 border-amber-300">
                  {child.upcomingAssessment.subject}
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2" onClick={(e) => e.preventDefault()}>
            <Button asChild size="sm" variant="outline" className="flex-1">
              <Link href={`/app/(parent)/children/${child.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link href={`/app/(parent)/children/${child.id}/assessments`}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Assessments
              </Link>
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
