// src/app/(parent)/children/[childId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import ProgressOverview from "@/components/parent-dashboard/progress-overview";
import SubjectProgress from "@/components/parent-dashboard/subject-progress";
import StudyTimeAnalytics from "@/components/parent-dashboard/study-time-analytics";
import AssessmentPerformance from "@/components/parent-dashboard/assessment-performance";
import { useChildProgress } from "@/hooks/parent/use-child-progress";

interface Subject {
    id: string;
    name: string;
    progress: number;
    lastActivity: string;
    status: string;
}

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

interface ProgressData {
    id: string;
    name: string;
    grade: string;
    overallProgress: number;
    enrolledSince: string;
    subjects: Subject[];
    recentActivity: Activity[];
    upcomingAssessments: Assessment[];
}

export default function ChildProgressPage() {
    const params = useParams();
    const childId = params.childId as string;
    const { toast } = useToast();
    const { progress, isLoading, isError } = useChildProgress(childId);

    useEffect(() => {
        if (isError) {
            toast({
                title: "Error",
                description: "Failed to load child progress data. Please try again.",
                variant: "destructive"
            });
        }
    }, [isError, toast]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (isError || !progress) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px]">
                <Icons.warning className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Data Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    We couldn't find any progress data for this child. This could be because they haven't started any courses yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{progress.name}'s Progress</h1>
                <p className="text-muted-foreground">
                    Monitor your child's academic progress and performance
                </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="subjects">Subjects</TabsTrigger>
                    <TabsTrigger value="study-time">Study Time</TabsTrigger>
                    <TabsTrigger value="assessments">Assessments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <ProgressOverview data={progress} />
                </TabsContent>

                <TabsContent value="subjects">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {progress.subjects.map((subject) => (
                            <SubjectProgress key={subject.id} childId={childId} subject={subject} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="study-time">
                    <StudyTimeAnalytics childId={childId} />
                </TabsContent>

                <TabsContent value="assessments">
                    <AssessmentPerformance childId={childId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}