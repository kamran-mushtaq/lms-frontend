// app/aptitude-test/components/test-intro.tsx
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClockIcon, Lightbulb, BookOpen, Gauge, BrainCircuit } from "lucide-react";
import { AlertCircle } from "lucide-react";

interface TestIntroScreenProps {
  assessment: any;
  isLoading: boolean;
  error: string | null;
  onStartTest: () => void;
}

export function TestIntroScreen({ assessment, isLoading, error, onStartTest }: TestIntroScreenProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Loading Test Details</CardTitle>
          <CardDescription className="text-center">
            Please wait while we prepare your aptitude test...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Loading test questions and instructions...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-destructive">Error Loading Test</CardTitle>
          <CardDescription className="text-center">
            We encountered an error while preparing your test.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-center">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Test Not Found</CardTitle>
          <CardDescription className="text-center">
            The requested test could not be found or is not available.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p>Please contact support if this issue persists.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Helper function to safely capitalize strings
  const capitalize = (str: string | undefined | null): string => {
    if (!str) return "Unknown";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Get unique question types safely
  const uniqueTypes = assessment.questions && Array.isArray(assessment.questions) 
    ? Array.from(new Set(assessment.questions.map((q: any) => q?.type).filter(Boolean)))
    : [];

  // Get unique difficulty levels safely
  const uniqueDifficulties = assessment.questions && Array.isArray(assessment.questions)
    ? Array.from(new Set(assessment.questions.map((q: any) => q?.difficultyLevel).filter(Boolean)))
    : [];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto rounded-full bg-primary/10 p-4 mb-4">
          <BrainCircuit className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">{assessment.title}</CardTitle>
        <CardDescription className="text-base mt-2">
          {assessment.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Time Limit</h3>
            </div>
            <p className="text-2xl font-bold">{assessment.settings?.timeLimit || "N/A"} minutes</p>
            <p className="text-sm text-muted-foreground mt-auto">
              Once started, you must complete within the time limit
            </p>
          </div>

          <div className="rounded-lg border p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Passing Score</h3>
            </div>
            <p className="text-2xl font-bold">{assessment.passingScore || "N/A"}% or higher</p>
            <p className="text-sm text-muted-foreground mt-auto">
              Required to proceed to course materials
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Test Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="font-semibold">
                {assessment.questions && Array.isArray(assessment.questions) ? assessment.questions.length : "Loading..."}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="font-semibold">{assessment.totalPoints || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Question Types</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {uniqueTypes.length > 0 ? (
                  uniqueTypes.map((type: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {capitalize(type)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Not available</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {uniqueDifficulties.length > 0 ? (
                  uniqueDifficulties.map((level: string, index: number) => (
                    <Badge key={index} variant={
                      level === 'beginner' ? 'secondary' : level === 'intermediate' ? 'default' : 'destructive'
                    }>
                      {capitalize(level)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Not available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Test Instructions</h3>
          </div>
          <ul className="list-disc list-inside text-sm space-y-1 mt-2">
            <li>Answer all questions to the best of your ability</li>
            <li>You can navigate between questions using the previous and next buttons</li>
            <li>Use the question navigator to jump to specific questions</li>
            <li>A timer will show your remaining time at the top of the screen</li>
            <li>Your test will be automatically submitted when the time expires</li>
            <li>Click the submit button when you've completed all questions</li>
          </ul>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4">
        <p className="text-sm text-muted-foreground">
          By starting the test, you agree to complete it honestly and independently.
        </p>
        <Button onClick={onStartTest} size="lg">
          Start Test
        </Button>
      </CardFooter>
    </Card>
  );
}