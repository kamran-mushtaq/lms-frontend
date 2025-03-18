"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function AssessmentResultsPage({
  params
}: {
  params: { id: string };
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const passingScore = 70;

  useEffect(() => {
    const scoreParam = searchParams.get("score");
    if (scoreParam) {
      setScore(parseInt(scoreParam));
    }
  }, [searchParams]);

  if (score === null) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Assessment Results</CardTitle>
          <CardDescription>Here's how you performed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {score >= passingScore ? (
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
          )}
          <div>
            <h2 className="text-3xl font-bold">
              {score >= passingScore ? "Passed!" : "Failed"}
            </h2>
            <p className="text-muted-foreground">Score: {score}%</p>
          </div>
          <Progress 
            value={score} 
            className={score >= passingScore ? "bg-success" : "bg-destructive"}
          />
        </CardContent>
        <CardFooter className="justify-center gap-4">
          <Button onClick={() => router.push("/student/assessments")}>
            Back to Assessments
          </Button>
          <Button variant="outline" onClick={() => router.push(`/student/assessments/${params.id}`)}>
            Review Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
