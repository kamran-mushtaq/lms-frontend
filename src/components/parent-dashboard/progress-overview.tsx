// src/components/parent-dashboard/progress-overview.tsx
import { format } from "date-fns";
import { BarChart, BookOpen, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
    type: string;
    itemName: string;
    subjectName: string;
    timestamp: string;
}

interface Assessment {
    id: string;
    title: string;
    subjectName: string;
    dueDate: string;
}

interface Subject {
    id: string;
    name: string;
    progress: number;
    lastActivity: string;
    status: string;
}

interface ProgressOverviewData {
    id: string;
    name: string;
    grade: string;
    overallProgress: number;
    enrolledSince: string;
    subjects: Subject[];
    recentActivity: Activity[];
    upcomingAssessments: Assessment[];
}

interface ProgressOverviewProps {
    data: ProgressOverviewData;
}

export default function ProgressOverview({ data }: ProgressOverviewProps) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case "lecture_completed":
                return <CheckCircle className="h-4 w-4" />;
            case "assessment_completed":
                return <BarChart className="h-4 w-4" />;
            case "study_session":
                return <Clock className="h-4 w-4" />;
            default:
                return <BookOpen className="h-4 w-4" />;
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
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Progress Summary</CardTitle>
                    <CardDescription>Overall academic progress</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8">
                    <div className="flex items-center justify-center">
                        <div className="relative h-40 w-40">
                            <svg className="h-full w-full" viewBox="0 0 100 100">
                                <circle
                                    className="text-muted-foreground/20 stroke-current"
                                    strokeWidth="10"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                                <circle
                                    className="text-primary stroke-current"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.overallProgress / 100)}`}
                                    pathLength="100"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-3xl font-bold">{data.overallProgress}%</span>
                                    <p className="text-xs text-muted-foreground">Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                            <p className="text-2xl font-bold">{data.subjects.length}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Enrolled Since</p>
                            <p className="text-2xl font-bold">{format(new Date(data.enrolledSince), "MMM yyyy")}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="#subjects">View Subjects</Link>
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {data.recentActivity.length > 0 ? (
                            data.recentActivity.map((activity: Activity, index: number) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.itemName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.subjectName} • {formatDate(activity.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No recent activity to display
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {data.upcomingAssessments.length > 0 && (
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle>Upcoming Assessments</CardTitle>
                        <CardDescription>Scheduled tests and evaluations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.upcomingAssessments.map((assessment: Assessment) => (
                                <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <div>
                                        <p className="font-medium">{assessment.title}</p>
                                        <p className="text-sm text-muted-foreground">{assessment.subjectName}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline">
                                            Due {format(new Date(assessment.dueDate), "MMM d")}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}