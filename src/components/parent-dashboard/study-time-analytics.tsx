// src/components/parent-dashboard/study-time-analytics.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Icons } from "@/components/icons";

interface StudyTimeAnalyticsProps {
    childId: string;
}

interface StudyTimeData {
    daily: {
        data: Array<{
            day: string;
            hours: number;
            target: number;
        }>;
        totalHours: number;
        targetHours: number;
        adherenceRate: number;
    };
    weekly: {
        data: Array<{
            week: string;
            hours: number;
            target: number;
        }>;
        totalHours: number;
        targetHours: number;
        adherenceRate: number;
    };
    subjectDistribution: Array<{
        subject: string;
        hours: number;
        percentage: number;
    }>;
    peakStudyTimes: Array<{
        time: string;
        percentage: number;
    }>;
}

export default function StudyTimeAnalytics({ childId }: StudyTimeAnalyticsProps) {
    const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
    const [isLoading, setIsLoading] = useState(true);
    const [studyData, setStudyData] = useState<StudyTimeData>({
        daily: {
            data: [],
            totalHours: 0,
            targetHours: 0,
            adherenceRate: 0
        },
        weekly: {
            data: [],
            totalHours: 0,
            targetHours: 0,
            adherenceRate: 0
        },
        subjectDistribution: [],
        peakStudyTimes: []
    });
    const { toast } = useToast();

    useEffect(() => {
        const fetchStudyData = async () => {
            if (!childId) return;

            try {
                setIsLoading(true);
                // Fetch study time data from the API
                const response = await apiClient.get(`/study-sessions/${childId}/analytics`);

                if (response.data) {
                    setStudyData(response.data);
                }
            } catch (error) {
                console.error("Error fetching study time data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load study time data. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyData();
    }, [childId, toast]);

    const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#f59e0b"];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[400px] w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
            </div>
        );
    }

    const hasNoData =
        studyData.daily.data.length === 0 &&
        studyData.weekly.data.length === 0 &&
        studyData.subjectDistribution.length === 0;

    if (hasNoData) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] border rounded-lg p-6">
                <Icons.warning className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Study Data Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    We couldn't find any study time data for this child. This could be because they haven't logged any study sessions yet.
                </p>
            </div>
        );
    }

    const chartData = viewMode === "daily"
        ? studyData.daily.data
        : studyData.weekly.data;

    return (
        <div className="space-y-6">
            {chartData.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Study Time</CardTitle>
                                <CardDescription>Hours spent studying over time</CardDescription>
                            </div>
                            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "daily" | "weekly")}>
                                <TabsList>
                                    <TabsTrigger value="daily">Daily</TabsTrigger>
                                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey={viewMode === "daily" ? "day" : "week"}
                                    />
                                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        formatter={(value) => [`${value} hours`, 'Study time']}
                                    />
                                    <Legend />
                                    <Bar dataKey="hours" fill="#3b82f6" name="Actual" />
                                    <Bar dataKey="target" fill="#8b5cf6" name="Target" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {studyData.subjectDistribution.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Subject Distribution</CardTitle>
                            <CardDescription>Study time by subject</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={studyData.subjectDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ subject, percentage }) =>
                                                `${subject}: ${(percentage).toFixed(0)}%`
                                            }
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="hours"
                                            nameKey="subject"
                                        >
                                            {studyData.subjectDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} hours`, 'Study time']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {studyData.peakStudyTimes.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Peak Study Times</CardTitle>
                            <CardDescription>Most productive hours</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={studyData.peakStudyTimes}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                                        <Bar dataKey="percentage" fill="#ec4899" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {(studyData.daily.totalHours > 0 || studyData.weekly.totalHours > 0) && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Study Statistics</CardTitle>
                        <CardDescription>Study metrics and achievements</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Weekly Study Time</p>
                                <p className="text-2xl font-bold">{studyData.daily.totalHours.toFixed(1)} hours</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Monthly Study Time</p>
                                <p className="text-2xl font-bold">{studyData.weekly.totalHours.toFixed(1)} hours</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Weekly Target</p>
                                <p className="text-2xl font-bold">{studyData.daily.targetHours.toFixed(1)} hours</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Adherence Rate</p>
                                <p className="text-2xl font-bold">{studyData.daily.adherenceRate.toFixed(0)}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}