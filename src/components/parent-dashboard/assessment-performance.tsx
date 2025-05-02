// src/components/parent-dashboard/assessment-performance.tsx
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Icons } from "@/components/icons";

interface AssessmentPerformanceProps {
    childId: string;
    summaryView?: boolean;
}

interface CompletedAssessment {
    id: string;
    title: string;
    type: string;
    subject: string;
    score: number;
    maxScore: number;
    completedOn: string;
    status: string;
}

interface AssessmentTrend {
    month: string;
    score: number;
}

interface SubjectPerformance {
    subject: string;
    averageScore: number;
}

interface SkillBreakdown {
    skill: string;
    score: number;
    status: string;
}

interface AssessmentData {
    completedAssessments: CompletedAssessment[];
    trends: AssessmentTrend[];
    subjectPerformance: SubjectPerformance[];
    skillBreakdown: SkillBreakdown[];
}

export default function AssessmentPerformance({ childId, summaryView = false }: AssessmentPerformanceProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AssessmentData>({
        completedAssessments: [],
        trends: [],
        subjectPerformance: [],
        skillBreakdown: []
    });
    const { toast } = useToast();

    useEffect(() => {
        const fetchAssessmentData = async () => {
            if (!childId) return;

            try {
                setIsLoading(true);
                // Fetch assessment data from the API
                const response = await apiClient.get(`/assessment-results/student/${childId}`);

                if (response.data) {
                    // Process and format the data
                    const assessmentData: AssessmentData = {
                        completedAssessments: response.data.completedAssessments || [],
                        trends: response.data.trends || [],
                        subjectPerformance: response.data.subjectPerformance || [],
                        skillBreakdown: response.data.skillBreakdown || []
                    };

                    setData(assessmentData);
                }
            } catch (error) {
                console.error("Error fetching assessment data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load assessment data. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssessmentData();
    }, [childId, toast]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "passed":
                return "bg-green-500";
            case "failed":
                return "bg-red-500";
            default:
                return "bg-slate-500";
        }
    };

    const getSkillStatusColor = (status: string) => {
        switch (status) {
            case "excellent":
                return "bg-green-500";
            case "good":
                return "bg-blue-500";
            case "needs_improvement":
                return "bg-yellow-500";
            case "poor":
                return "bg-red-500";
            default:
                return "bg-slate-500";
        }
    };

    if (summaryView) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Assessment Performance</CardTitle>
                    <CardDescription>Recent test results</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : data.completedAssessments.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <p>No completed assessments yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.completedAssessments.slice(0, 3).map((assessment) => (
                                <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <div>
                                        <p className="font-medium">{assessment.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {assessment.subject} • {format(new Date(assessment.completedOn), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={getStatusColor(assessment.status)}>
                                            {assessment.score}/{assessment.maxScore}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[300px] w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        );
    }

    const hasNoData =
        data.completedAssessments.length === 0 &&
        data.trends.length === 0 &&
        data.subjectPerformance.length === 0;

    if (hasNoData) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] border rounded-lg p-6">
                <Icons.warning className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Assessment Data Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    We couldn't find any assessment data for this child. This could be because they haven't taken any assessments yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {data.trends.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Assessment Performance</CardTitle>
                        <CardDescription>Score trends over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                                    <Legend />
                                    <Line type="monotone" dataKey="score" stroke="#3b82f6" activeDot={{ r: 8 }} name="Average Score" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {data.completedAssessments.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Recent Assessments</CardTitle>
                            <CardDescription>Latest test results</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.completedAssessments.map((assessment) => (
                                    <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-md">
                                        <div>
                                            <p className="font-medium">{assessment.title}</p>
                                            <p className="text-sm text-muted-foreground">{assessment.subject} • {format(new Date(assessment.completedOn), "MMM d, yyyy")}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={getStatusColor(assessment.status)}>
                                                {assessment.score}/{assessment.maxScore}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {data.subjectPerformance.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Subject Performance</CardTitle>
                            <CardDescription>Average scores by subject</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.subjectPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subject" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                                        <Bar dataKey="averageScore" fill="#8b5cf6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {data.skillBreakdown.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Skill Breakdown</CardTitle>
                        <CardDescription>Performance by skill area</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.skillBreakdown.map((skill, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between">
                                        <p className="text-sm font-medium">{skill.skill}</p>
                                        <p className="text-sm font-medium">{skill.score}%</p>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getSkillStatusColor(skill.status)} rounded-full`}
                                            style={{ width: `${skill.score}%` }}
                                        />
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