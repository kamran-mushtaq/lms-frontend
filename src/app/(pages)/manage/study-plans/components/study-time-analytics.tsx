"use client";

import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ComposedChart,
    Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Clock,
    BarChart2,
    PieChart as PieChartIcon,
    TrendingUp,
    Calendar,
    RefreshCw,
    Award,
    BookOpen
} from "lucide-react";

import { StudyAnalytics, StudyProgress, SubjectBreakdown } from "../types";

// Chart colors
const CHART_COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f97316', '#84cc16', '#14b8a6', '#3b82f6', '#f43f5e'];
const PLANNED_COLOR = '#4f46e5';  // indigo
const ACTUAL_COLOR = '#f97316';   // amber
const ADHERENCE_COLOR = '#10b981'; // emerald

interface StudyTimeAnalyticsProps {
    analytics?: StudyAnalytics;
    weeklyProgress?: StudyProgress;
    progressSummary?: StudyProgress;
    isLoading: boolean;
    onRefresh: () => void;
}

export function StudyTimeAnalytics({
    analytics,
    weeklyProgress,
    progressSummary,
    isLoading,
    onRefresh,
}: StudyTimeAnalyticsProps) {
    const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('week');

    // Format minutes to hours and minutes
    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Round percentage to 1 decimal place
    const formatPercentage = (value: number) => {
        return `${Math.round(value * 10) / 10}%`;
    };

    // Filter time series data based on selected time frame
    const getFilteredTimeSeriesData = () => {
        if (!analytics?.timeSeriesData) return [];

        // Clone the data to avoid modifying the original
        const data = [...analytics.timeSeriesData];

        // For weekly and monthly views, we'll aggregate the data
        if (timeFrame === 'day') {
            // Return the last 7 days
            return data.slice(-7);
        } else if (timeFrame === 'week') {
            // Return all data
            return data;
        } else {
            // For monthly view, return all data
            return data;
        }
    };

    // Render loading state
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Study Time Analytics</CardTitle>
                    <CardDescription>Loading analytics data...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Render no data state
    if (!analytics && !weeklyProgress && !progressSummary) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Study Time Analytics</CardTitle>
                            <CardDescription>No analytics data available</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={onRefresh}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 border-2 border-dashed rounded-md">
                        <div className="text-lg font-medium text-gray-500 mb-2">
                            No study analytics available
                        </div>
                        <div className="text-sm text-gray-400">
                            Analytics will be available once study sessions are recorded
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Study Time Analytics</CardTitle>
                        <CardDescription>Study time metrics and adherence tracking</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            defaultValue={timeFrame}
                            onValueChange={(value: 'day' | 'week' | 'month') => setTimeFrame(value)}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Time frame" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">Daily</SelectItem>
                                <SelectItem value="week">Weekly</SelectItem>
                                <SelectItem value="month">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={onRefresh}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="overview">
                            <BarChart2 className="h-4 w-4 mr-1" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="trends">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Trends
                        </TabsTrigger>
                        <TabsTrigger value="subjects">
                            <PieChartIcon className="h-4 w-4 mr-1" />
                            Subjects
                        </TabsTrigger>
                        <TabsTrigger value="sessions">
                            <Clock className="h-4 w-4 mr-1" />
                            Sessions
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Overall Adherence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold mb-1">
                                        {analytics?.overallAdherence ? formatPercentage(analytics.overallAdherence) : 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Target vs. actual study time
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Planned Study Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold mb-1">
                                        {analytics?.totalPlannedHours
                                            ? `${Math.round(analytics.totalPlannedHours * 10) / 10}h`
                                            : 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Total scheduled hours
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Actual Study Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold mb-1">
                                        {analytics?.totalActualHours
                                            ? `${Math.round(analytics.totalActualHours * 10) / 10}h`
                                            : 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Total study hours completed
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mb-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Study Time Comparison
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={getFilteredTimeSeriesData()}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(value) => {
                                                        const date = new Date(value);
                                                        return timeFrame === 'day'
                                                            ? date.toLocaleDateString('en-US', { weekday: 'short' })
                                                            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                    }}
                                                />
                                                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip
                                                    formatter={(value: any) => [`${value} min`, '']}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend />
                                                <Bar name="Planned" dataKey="planned" fill={PLANNED_COLOR} />
                                                <Bar name="Actual" dataKey="actual" fill={ACTUAL_COLOR} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Benchmarks Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <div className="relative flex items-center justify-center w-40 h-40">
                                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                                {/* Background circle */}
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="40"
                                                    fill="none"
                                                    stroke="#e5e7eb"
                                                    strokeWidth="8"
                                                />
                                                {/* Progress circle */}
                                                {analytics?.completedBenchmarks !== undefined && analytics?.totalBenchmarks && (
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke={ADHERENCE_COLOR}
                                                        strokeWidth="8"
                                                        strokeDasharray={`${(analytics.completedBenchmarks / analytics.totalBenchmarks) * 251.2} 251.2`}
                                                        strokeDashoffset="0"
                                                        strokeLinecap="round"
                                                        transform="rotate(-90 50 50)"
                                                    />
                                                )}
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                <div className="text-3xl font-bold">
                                                    {analytics?.completedBenchmarks !== undefined && analytics?.totalBenchmarks
                                                        ? analytics.completedBenchmarks
                                                        : 'N/A'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    of {analytics?.totalBenchmarks || 0}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center text-sm font-medium">
                                            Benchmarks Completed
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Adherence Rate Over Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-60">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={getFilteredTimeSeriesData()}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(value) => {
                                                        const date = new Date(value);
                                                        return timeFrame === 'day'
                                                            ? date.toLocaleDateString('en-US', { weekday: 'short' })
                                                            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                    }}
                                                />
                                                <YAxis domain={[0, 100]} label={{ value: '%', position: 'insideLeft' }} />
                                                <Tooltip
                                                    formatter={(value: any) => [`${value}%`, 'Adherence']}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="adherenceRate"
                                                    stroke={ADHERENCE_COLOR}
                                                    strokeWidth={2}
                                                    name="Adherence"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">
                                    Study Time Trends
                                </CardTitle>
                                <CardDescription>
                                    Planned vs. actual study time with adherence rate
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={getFilteredTimeSeriesData()}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) => {
                                                    const date = new Date(value);
                                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                }}
                                            />
                                            <YAxis yAxisId="left" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: 'Adherence %', angle: 90, position: 'insideRight' }} />
                                            <Tooltip
                                                formatter={(value: any, name: string) => {
                                                    return name === 'Adherence'
                                                        ? [`${value}%`, name]
                                                        : [`${value} min`, name];
                                                }}
                                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="planned"
                                                fill={`${PLANNED_COLOR}40`}
                                                stroke={PLANNED_COLOR}
                                                yAxisId="left"
                                                name="Planned"
                                            />
                                            <Bar
                                                dataKey="actual"
                                                fill={ACTUAL_COLOR}
                                                yAxisId="left"
                                                name="Actual"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="adherenceRate"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                yAxisId="right"
                                                name="Adherence"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Subjects Tab */}
                    <TabsContent value="subjects">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium">
                                        Subject Breakdown
                                    </CardTitle>
                                    <CardDescription>
                                        Study time distribution by subject
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics?.subjectBreakdown || []}
                                                    dataKey="actualMinutes"
                                                    nameKey="subjectName"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                >
                                                    {(analytics?.subjectBreakdown || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: any) => [`${formatTime(value)}`, 'Study time']}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium">
                                        Subject Adherence
                                    </CardTitle>
                                    <CardDescription>
                                        Planned vs. actual study time by subject
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={analytics?.subjectBreakdown || []}
                                                layout="vertical"
                                                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" label={{ value: 'Minutes', position: 'insideBottom', offset: -5 }} />
                                                <YAxis
                                                    type="category"
                                                    dataKey="subjectName"
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <Tooltip
                                                    formatter={(value: any) => [`${formatTime(value)}`, '']}
                                                />
                                                <Legend />
                                                <Bar name="Planned" dataKey="plannedMinutes" fill={PLANNED_COLOR} />
                                                <Bar name="Actual" dataKey="actualMinutes" fill={ACTUAL_COLOR} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium">
                                        Subject Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analytics?.subjectBreakdown.map((subject, index) => (
                                            <div key={subject.subjectId} className="p-4 border rounded-md">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                                                    <div className="font-medium">{subject.subjectName}</div>
                                                    <Badge
                                                        variant="outline"
                                                        className={subject.adherenceRate >= 80
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : subject.adherenceRate >= 50
                                                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                                : "bg-red-50 text-red-700 border-red-200"
                                                        }
                                                    >
                                                        {formatPercentage(subject.adherenceRate)} Adherence
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Planned:</span> {formatTime(subject.plannedMinutes)}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Actual:</span> {formatTime(subject.actualMinutes)}
                                                    </div>
                                                </div>
                                                {/* Progress bar */}
                                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600"
                                                        style={{ width: `${Math.min(100, (subject.actualMinutes / subject.plannedMinutes) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Sessions Tab */}
                    <TabsContent value="sessions">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium">
                                    Session Analytics
                                </CardTitle>
                                <CardDescription>
                                    Study session metrics and summaries
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 border rounded-md flex items-center space-x-4">
                                        <div className="p-2 bg-blue-100 rounded-full text-blue-700">
                                            <Award className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Total Sessions</div>
                                            <div className="text-2xl font-bold">
                                                {weeklyProgress?.sessionsCompleted || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border rounded-md flex items-center space-x-4">
                                        <div className="p-2 bg-green-100 rounded-full text-green-700">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Topics Completed</div>
                                            <div className="text-2xl font-bold">
                                                {weeklyProgress?.topicsCompleted || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border rounded-md flex items-center space-x-4">
                                        <div className="p-2 bg-amber-100 rounded-full text-amber-700">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Assessments Taken</div>
                                            <div className="text-2xl font-bold">
                                                {weeklyProgress?.assessmentsTaken || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Weekly session summary */}
                                <div className="mt-4">
                                    <h3 className="text-base font-medium mb-2">Weekly Study Schedule Adherence</h3>

                                    {weeklyProgress?.adherenceMetrics ? (
                                        <div className="p-4 border rounded-md">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Scheduled Time</div>
                                                    <div className="text-xl font-medium">
                                                        {formatTime(weeklyProgress.adherenceMetrics.scheduledMinutes)}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-sm text-muted-foreground">Actual Time</div>
                                                    <div className="text-xl font-medium">
                                                        {formatTime(weeklyProgress.adherenceMetrics.actualMinutes)}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-sm text-muted-foreground">Adherence Rate</div>
                                                    <div className="text-xl font-medium">
                                                        {formatPercentage(weeklyProgress.adherenceMetrics.adherenceRate)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="space-y-1">
                                                <div className="text-sm flex justify-between">
                                                    <span>Progress</span>
                                                    <span>{formatPercentage(weeklyProgress.adherenceMetrics.adherenceRate)}</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${weeklyProgress.adherenceMetrics.adherenceRate >= 80
                                                                ? "bg-green-600"
                                                                : weeklyProgress.adherenceMetrics.adherenceRate >= 50
                                                                    ? "bg-yellow-600"
                                                                    : "bg-red-600"
                                                            }`}
                                                        style={{ width: `${weeklyProgress.adherenceMetrics.adherenceRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 border rounded-md text-muted-foreground">
                                            No weekly progress data available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}