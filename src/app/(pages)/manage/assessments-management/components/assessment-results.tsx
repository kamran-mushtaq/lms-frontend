// app/dashboard/assessments/components/assessment-results.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Filter, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Assessment } from "../hooks/use-assessments";
import {
  getAssessmentResultById,
  getAssessmentResults,
  AssessmentResult
} from "../api/assessments-api";
import { format } from "date-fns";

interface AssessmentResultsProps {
  assessment: Assessment | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onError: (error: Error) => void;
}

export function AssessmentResults({
  assessment,
  open,
  setOpen,
  onError
}: AssessmentResultsProps) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open && assessment) {
      fetchResults();
    } else {
      setResults([]);
      setLoading(true);
    }
  }, [open, assessment]);

  const fetchResults = async () => {
    if (!assessment) return;

    try {
      setLoading(true);
      const data = await getAssessmentResults({
        assessmentId: assessment._id
      });
      setResults(data);
    } catch (error) {
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (resultId: string) => {
    try {
      setLoading(true);
      const result = await getAssessmentResultById(resultId);
      setSelectedResult(result);
      setDetailsDialogOpen(true);
    } catch (error) {
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setOpen(false);
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      searchTerm === "" ||
      (result.studentName &&
        result.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || result.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate assessment statistics
  const totalAttempts = results.length;
  const averageScore =
    totalAttempts > 0
      ? results.reduce((sum, r) => sum + r.percentageScore, 0) / totalAttempts
      : 0;
  const passCount = results.filter(
    (r) => r.percentageScore >= (assessment?.passingScore || 0)
  ).length;
  const passRate = totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0;

  if (!assessment) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>Results: {assessment.title}</span>
          </DialogTitle>
          <DialogDescription>
            View all student results for this assessment
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="summary" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Detailed Results</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAttempts}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {averageScore.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pass Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {passRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {passCount} of {totalAttempts} students passed
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>
                  Student score distribution by range
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-8">
                    {/* Score distribution bars */}
                    {[
                      { range: "0-20%", color: "bg-red-500" },
                      { range: "21-40%", color: "bg-orange-500" },
                      { range: "41-60%", color: "bg-yellow-500" },
                      { range: "61-80%", color: "bg-blue-500" },
                      { range: "81-100%", color: "bg-green-500" }
                    ].map((bucket) => {
                      const [min, max] = bucket.range
                        .split("-")
                        .map((n) => parseInt(n.replace("%", "")));
                      const count = results.filter(
                        (r) =>
                          r.percentageScore >= min && r.percentageScore <= max
                      ).length;
                      const percentage =
                        totalAttempts > 0 ? (count / totalAttempts) * 100 : 0;

                      return (
                        <div key={bucket.range} className="space-y-2">
                          <div className="flex justify-between">
                            <span>{bucket.range}</span>
                            <span className="text-muted-foreground">
                              {count} students ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full ${bucket.color}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter || "all"}
                  onValueChange={(value) =>
                    setStatusFilter(value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Completed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No results found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResults.map((result) => (
                        <TableRow key={result._id}>
                          <TableCell>
                            {result.studentName || result.studentId}
                          </TableCell>
                          <TableCell>
                            {result.totalScore} / {result.maxPossibleScore}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                result.percentageScore >=
                                (assessment.passingScore || 0)
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {result.percentageScore.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>{result.timeSpentMinutes} min</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                result.status === "completed"
                                  ? "default"
                                  : result.status === "in-progress"
                                  ? "outline"
                                  : "destructive"
                              }
                            >
                              {result.status.charAt(0).toUpperCase() +
                                result.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result.createdAt &&
                              format(new Date(result.createdAt), "PPp")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(result._id)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Result details dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Result Details</DialogTitle>
              <DialogDescription>
                Detailed view of student assessment result
              </DialogDescription>
            </DialogHeader>

            {selectedResult && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Student
                    </h3>
                    <p>
                      {selectedResult.studentName || selectedResult.studentId}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Date Completed
                    </h3>
                    <p>
                      {selectedResult.createdAt &&
                        format(new Date(selectedResult.createdAt), "PPp")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Score
                    </h3>
                    <p>
                      {selectedResult.totalScore} /{" "}
                      {selectedResult.maxPossibleScore} (
                      {selectedResult.percentageScore.toFixed(1)}%)
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Time Spent
                    </h3>
                    <p>{selectedResult.timeSpentMinutes} minutes</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Question Responses
                  </h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">No.</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead>Response</TableHead>
                          <TableHead className="w-[100px] text-center">
                            Correct
                          </TableHead>
                          <TableHead className="w-[80px] text-right">
                            Points
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedResult.questionResponses &&
                          selectedResult.questionResponses.map(
                            (response: any, index: number) => (
                              <TableRow key={response.questionId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  {response.questionText || response.questionId}
                                </TableCell>
                                <TableCell>
                                  {response.selectedAnswer || "No response"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {response.isCorrect ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      Yes
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-800">
                                      No
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {response.score}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setDetailsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
