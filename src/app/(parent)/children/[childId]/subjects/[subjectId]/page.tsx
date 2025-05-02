// src/app/(parent)/children/[childId]/subjects/[subjectId]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import apiClient from "@/lib/api-client";
import SubjectHeader from "./components/subject-header";
import ChapterCompletion from "@/components/parent-dashboard/chapter-completion";
import { useSubjectProgress } from "@/hooks/parent/use-subject-progress";

interface Chapter {
    id: string;
    name: string;
    progress: number;
    assessmentScore: number | null;
    status: "completed" | "in_progress" | "not_started";
}

interface SubjectProgress {
    subject: {
        id: string;
        name: string;
        description: string;
    };
    completionPercentage: number;
    totalChapters: number;
    chaptersCompleted: number;
    currentChapter: string;
    totalStudyTimeHours: number;
    averageAssessmentScore: number;
    chapters: Chapter[];
    strengths: string[];
    areasForImprovement: string[];
}

export default function SubjectDetailPage() {
    const params = useParams();
    const childId = params.childId as string;
    const subjectId = params.subjectId as string;
    const { toast } = useToast();
    const { subjectProgress, isLoading, isError } = useSubjectProgress(childId, subjectId);

    useEffect(() => {
        if (isError) {
            toast({
                title: "Error",
                description: "Failed to load subject progress data. Please try again.",
                variant: "destructive"
            });
        }
    }, [isError, toast]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (isError || !subjectProgress) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px]">
                <Icons.warning className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Data Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    We couldn't find any progress data for this subject. Please try again later.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" className="mb-4" asChild>
                <Link href={`/parent/children/${childId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Progress
                </Link>
            </Button>

            <SubjectHeader data={subjectProgress} />

            <Tabs defaultValue="chapters" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    <TabsTrigger value="assessments">Assessments</TabsTrigger>
                    <TabsTrigger value="study-time">Study Time</TabsTrigger>
                </TabsList>

                <TabsContent value="chapters">
                    <ChapterCompletion chapters={subjectProgress.chapters} />
                </TabsContent>

                <TabsContent value="assessments">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Strengths</h3>
                            <ul className="space-y-2">
                                {subjectProgress.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-4">Areas for Improvement</h3>
                            <ul className="space-y-2">
                                {subjectProgress.areasForImprovement.map((area, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span>{area}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="study-time">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="p-6 border rounded-lg">
                            <h3 className="text-lg font-medium mb-2">Total Study Time</h3>
                            <p className="text-3xl font-bold">{subjectProgress.totalStudyTimeHours.toFixed(1)} hours</p>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <h3 className="text-lg font-medium mb-2">Average Assessment Score</h3>
                            <p className="text-3xl font-bold">{subjectProgress.averageAssessmentScore}%</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}