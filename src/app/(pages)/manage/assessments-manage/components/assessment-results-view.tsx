// app/dashboard/assessments/components/assessment-results-view.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentResultsForAssessment } from "../api/assessments-api";

// Interfaces
interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: string;
  classId: string;
  subjectId: string;
  questions: any[];
  totalPoints: number;
  passingScore: number;
  settings: {
    timeLimit: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    attemptsAllowed: number;
    isPublished: boolean;
  };
}

interface AssessmentResult {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  assessmentId: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  timeSpentMinutes: number;
  status: "completed" | "passed" | "failed" | "in_progress";
  createdAt: string;
}

// Props interface
interface AssessmentResultsViewProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  assessment: Assessment | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

export function AssessmentResultsView({
  open,
  setOpen,
  assessment,
  onSuccess,
  onError
}: AssessmentResultsViewProps) {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const STATUS_COLORS = {
    completed: "#0088FE",
    passed: "#00C49F",
    failed: "#FF8042",
    in_progress: "#FFBB28"
  };

  // Fetch results when assessment changes or modal opens
  useEffect(() => {
    if (assessment && open) {
      fetchResults();
    } else {
      setResults([]);
    }
  }, [assessment, open]);

  // Fetch assessment results
  const fetchResults = async () => {
    if (!assessment) return;

    setLoading(true);
    try {
      const data = await getStudentResultsForAssessment(assessment._id);
      setResults(data);
    } catch (error) {
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Filter results based on search term and status filter
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentId.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? result.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  // Prepare data for score distribution chart
  const prepareScoreDistribution = () => {
    const ranges = [
      { name: "0-20%", range: [0, 20], count: 0 },
      { name: "21-40%", range: [21, 40], count: 0 },
      { name: "41-60%", range: [41, 60], count: 0 },
      { name: "61-80%", range: [61, 80], count: 0 },
      { name: "81-100%", range: [81, 100], count: 0 }
    ];

    results.forEach((result) => {
      const score = result.percentageScore;
      const range = ranges.find(
        (r) => score >= r.range[0] && score <= r.range[1]
      );
      if (range) range.count++;
    });

    return ranges;
  };

  // Prepare data for status distribution chart
  const prepareStatusDistribution = () => {
    const statuses = [
      { name: "Passed", value: 0, color: STATUS_COLORS.passed },
      { name: "Failed", value: 0, color: STATUS_COLORS.failed },
      { name: "In Progress", value: 0, color: STATUS_COLORS.in_progress }
    ];

    results.forEach((result) => {
      if (result.status === "passed") statuses[0].value++;
      else if (result.status === "failed") statuses[1].value++;
      else statuses[2].value++;
    });

    return statuses.filter((status) => status.value > 0);
  };

  // Calculate summary statistics
  const calculateStats = () => {
    if (results.length === 0) return null;

    const totalAttempts = results.length;
    const completedAttempts = results.filter(
      (r) => r.status !== "in_progress"
    ).length;
    const passedAttempts = results.filter((r) => r.status === "passed").length;
    const scores = results
      .filter((r) => r.status !== "in_progress")
      .map((r) => r.percentageScore);

    const avgScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          )
        : 0;

    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const lowest = scores.length > 0 ? Math.min(...scores) : 0;

    const avgTime =
      results.filter((r) => r.status !== "in_progress").length > 0
        ? Math.round(
            results
              .filter((r) => r.status !== "in_progress")
              .reduce((sum, r) => sum + r.timeSpentMinutes, 0) /
              completedAttempts
          )
        : 0;

    return {
      totalAttempts,
      completedAttempts,
      passedAttempts,
      passRate:
        completedAttempts > 0
          ? Math.round((passedAttempts / completedAttempts) * 100)
          : 0,
      avgScore,
      highest,
      lowest,
      avgTime
    };
  };

  const stats = calculateStats();
  const scoreDistribution = prepareScoreDistribution();
  const statusDistribution = prepareStatusDistribution();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className="w-full sm:max-w-5xl overflow-hidden flex flex-col h-full"
        side="right"
      >
        <SheetHeader>
          <SheetTitle>
            {assessment ? `Results: ${assessment.title}` : "Assessment Results"}
          </SheetTitle>
          <SheetDescription>
            View student performance and analytics for this assessment.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            {results.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="text-lg font-medium">No Results Available</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No students have completed this assessment yet.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Attempts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.totalAttempts}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.completedAttempts} completed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pass Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.passRate}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.passedAttempts} passed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.avgScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Range: {stats?.lowest}% - {stats?.highest}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.avgTime} min
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Time limit: {assessment?.settings.timeLimit} min
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Score Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={scoreDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {statusDistribution.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Student Results Table */}
                <Card className="my-4">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Individual Results
                    </CardTitle>
                    <CardDescription>
                      Details of each student's performance
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Search by student name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant={statusFilter === "" ? "default" : "outline"}
                          onClick={() => setStatusFilter("")}
                          size="sm"
                        >
                          All
                        </Button>
                        <Button
                          variant={
                            statusFilter === "passed" ? "default" : "outline"
                          }
                          onClick={() => setStatusFilter("passed")}
                          size="sm"
                        >
                          Passed
                        </Button>
                        <Button
                          variant={
                            statusFilter === "failed" ? "default" : "outline"
                          }
                          onClick={() => setStatusFilter("failed")}
                          size="sm"
                        >
                          Failed
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time Spent</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResults.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="h-24 text-center"
                              >
                                No results found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredResults.map((result) => (
                              <TableRow key={result._id}>
                                <TableCell className="font-medium">
                                  <div>{result.studentId.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {result.studentId.email}
                                  </div>
                                </TableCell>
                                <TableCell>{result.percentageScore}%</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      result.status === "passed"
                                        ? "default"
                                        : result.status === "failed"
                                        ? "destructive"
                                        : "outline"
                                    }
                                  >
                                    {result.status === "passed"
                                      ? "Passed"
                                      : result.status === "failed"
                                      ? "Failed"
                                      : "In Progress"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {result.timeSpentMinutes} min
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    result.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        <div className="flex justify-end space-x-4 mt-auto pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
