// components/parent-dashboard/assessment-results.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

interface AssessmentResultsProps {
  fullView?: boolean;
}

interface Child {
  _id: string;
  name: string;
}

interface AssessmentResult {
  _id: string;
  studentId: string;
  percentageScore: number;
  createdAt: string;
  subjectId: { name: string } | null;
  assessmentId: { title: string } | null;
}

interface FormattedResult {
  id: string;
  childName: string;
  subject: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  date: string;
  status: 'passed' | 'needs_improvement' | 'failed';
  studentId: string;
}

export default function AssessmentResults({
  fullView = false
}: AssessmentResultsProps) {
  const [childFilter, setChildFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [results, setResults] = useState<FormattedResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // First fetch the children
    const fetchChildren = async () => {
      try {
        const response = await fetch("/api/users?type=student");
        if (!response.ok) throw new Error("Failed to fetch children");
        const data = await response.json();
        setChildren(data);
        return data;
      } catch (error) {
        console.error("Error fetching children:", error);
        toast({
          title: "Error",
          description: "Failed to load children data.",
          variant: "destructive"
        });
      }
    };

    // Then fetch assessment results
    const fetchAssessmentResults = async () => {
      setLoading(true);
      try {
        const childrenData = await fetchChildren();
        if (childrenData.length === 0) {
          setLoading(false);
          return;
        }

        // Create query parameter for the API
        let queryParam = "";
        if (childFilter !== "all") {
          queryParam = `?studentId=${childFilter}`;
        }

        // Fetch assessment results using the assessment-results API
        const response = await fetch(`/api/assessment-results${queryParam}`);
        if (!response.ok) throw new Error("Failed to fetch assessment results");
        const data = await response.json();

        // Transform the data to match our component needs
        const formattedResults = data.map((result: AssessmentResult) => {
          const student = childrenData.find(
            (child: Child) => child._id === result.studentId
          );
          return {
            id: result._id,
            childName: student ? student.name : "Unknown Child",
            subject: result.subjectId
              ? result.subjectId.name
              : "Unknown Subject",
            assessmentName: result.assessmentId
              ? result.assessmentId.title
              : "Unknown Assessment",
            score: result.percentageScore,
            maxScore: 100,
            date: result.createdAt,
            status:
              result.percentageScore >= 70
                ? "passed"
                : result.percentageScore >= 50
                ? "needs_improvement"
                : "failed",
            studentId: result.studentId
          };
        });

        setResults(formattedResults);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load assessment results. Please try again.",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentResults();
  }, [childFilter, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-500">Passed</Badge>;
      case "needs_improvement":
        return <Badge className="bg-yellow-500">Needs Improvement</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const filteredResults =
    childFilter === "all"
      ? results
      : results.filter((result) => result.studentId === childFilter);

  const displayResults = fullView
    ? filteredResults
    : filteredResults.slice(0, 3);

  return (
    <Card className={fullView ? "col-span-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Assessments</CardTitle>
          <CardDescription>
            Recent assessment results and performance
          </CardDescription>
        </div>
        <Select value={childFilter} onValueChange={setChildFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select Child" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Children</SelectItem>
            {children.map((child) => (
              <SelectItem key={child._id} value={child._id}>
                {child.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              Loading assessment results...
            </div>
          ) : displayResults.length === 0 ? (
            <div className="text-center py-4 flex flex-col items-center">
              <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
              <p>No assessment results found for the selected criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {result.assessmentName}
                      </span>
                      {getStatusBadge(result.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.subject} • {result.childName} •{" "}
                      {new Date(result.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      {Math.round(result.score)}%
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/parent/assessments/${result.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      {!fullView && (
        <CardFooter className="pt-0">
          <Button variant="ghost" size="sm" className="ml-auto" asChild>
            <Link href="/parent/assessments">
              View All Assessments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
