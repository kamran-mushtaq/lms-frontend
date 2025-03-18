// app/(dashboard)/student/assessments/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Info,
  AlertTriangle,
  Flag,
  X,
  Eye,
  PlusCircle,
  SaveAll,
  LifeBuoy,
  Timer
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface Question {
  id: number;
  type: "multiple_choice" | "true_false" | "free_response";
  text: string;
  options?: Array<{
    id: string;
    text: string;
  }>;
  correctOption?: string;
  correctAnswer?: string;
}

interface TestData {
  id: number;
  title: string;
  subject: string;
  duration: number;
  questionsCount: number;
  passingScore: number;
  instructions: string;
  questions: Question[];
}

// Mock test data
const TEST_DATA: TestData = {
  id: 1,
  title: "Math Chapter 5 Test",
  subject: "Mathematics",
  duration: 60, // minutes
  questionsCount: 20,
  passingScore: 70,
  instructions:
    "Answer all questions. You have 60 minutes to complete this test. Each question is worth 5 points. Select the best answer for each question.",
  questions: [
    {
      id: 1,
      type: "multiple_choice",
      text: "What is the value of x in the equation 2x + 5 = 15?",
      options: [
        { id: "a", text: "5" },
        { id: "b", text: "7.5" },
        { id: "c", text: "10" },
        { id: "d", text: "15" }
      ],
      correctOption: "a"
    },
    {
      id: 2,
      type: "multiple_choice",
      text: "Solve for y: 3y - 6 = 12",
      options: [
        { id: "a", text: "2" },
        { id: "b", text: "4" },
        { id: "c", text: "6" },
        { id: "d", text: "8" }
      ],
      correctOption: "c"
    },
    {
      id: 3,
      type: "multiple_choice",
      text: "If a rectangle has a width of 4 cm and a length of 7 cm, what is its area?",
      options: [
        { id: "a", text: "11 cm²" },
        { id: "b", text: "22 cm²" },
        { id: "c", text: "28 cm²" },
        { id: "d", text: "32 cm²" }
      ],
      correctOption: "c"
    },
    {
      id: 4,
      type: "true_false",
      text: "The product of any number and zero is always zero.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correctOption: "true"
    },
    {
      id: 5,
      type: "free_response",
      text: "Find all the factors of 24.",
      correctAnswer: "1, 2, 3, 4, 6, 8, 12, 24"
    },
    // Add more questions as needed to reach questionsCount
    {
      id: 6,
      type: "multiple_choice",
      text: "Which of the following is equivalent to 0.25?",
      options: [
        { id: "a", text: "1/8" },
        { id: "b", text: "1/4" },
        { id: "c", text: "1/2" },
        { id: "d", text: "3/4" }
      ],
      correctOption: "b"
    },
    {
      id: 7,
      type: "multiple_choice",
      text: "What is the square root of 81?",
      options: [
        { id: "a", text: "7" },
        { id: "b", text: "8" },
        { id: "c", text: "9" },
        { id: "d", text: "10" }
      ],
      correctOption: "c"
    }
  ]
};

export default function AssessmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string | string[] }>(
    {}
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [remainingTime, setRemainingTime] = useState(TEST_DATA.duration * 60); // in seconds
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isTimeUpDialogOpen, setIsTimeUpDialogOpen] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    // Simulate loading test data
    const timer = setTimeout(() => {
      setLoading(false);
      // Show instructions dialog when test loads
      setIsInfoDialogOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (loading || testComplete) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUpDialogOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, testComplete]);

  // For demonstration purposes, let's assume this is called when the student completes the test
  const handleSubmitTest = () => {
    const score = calculateScore();
    setTestComplete(true);
    
    // In a real app, you would submit to your backend here
    console.log("Test submitted with answers:", answers);
    
    // Redirect to results page with the score
    router.push(`/student/assessments/${params.id}/results?score=${score}`);
  };

  // Calculate score based on answers
  const calculateScore = () => {
    let correctCount = 0;

    Object.keys(answers).forEach((questionIdStr) => {
      const questionId = parseInt(questionIdStr);
      const question = TEST_DATA.questions.find((q) => q.id === questionId);

      if (question) {
        if (
          question.type === "multiple_choice" ||
          question.type === "true_false"
        ) {
          if (answers[questionId] === question.correctOption) {
            correctCount++;
          }
        }
        // For free response, would need actual grading logic
      }
    });

    return Math.round((correctCount / TEST_DATA.questions.length) * 100);
  };

  // Handle answer selection
  const handleAnswerSelect = (
    questionId: number,
    answer: string | string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Toggle flagged question
  const toggleFlaggedQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestion < TEST_DATA.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // Navigate to previous question
  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Jump to specific question
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < TEST_DATA.questions.length) {
      setCurrentQuestion(index);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentQuestionData = TEST_DATA.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / TEST_DATA.questions.length) * 100;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      {/* Test Instructions Dialog */}
      <AlertDialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test Instructions</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">{TEST_DATA.title}</h3>
                  <p className="text-sm">{TEST_DATA.subject}</p>
                </div>

                <div className="text-sm space-y-2">
                  <p>{TEST_DATA.instructions}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4" />
                    <span>Time Limit: {TEST_DATA.duration} minutes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Total Questions: {TEST_DATA.questionsCount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Passing Score: {TEST_DATA.passingScore}%</span>
                  </div>
                </div>

                <p className="text-sm font-medium">
                  Your timer will begin once you start the test. Good luck!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Begin Test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time's Up Dialog */}
      <AlertDialog
        open={isTimeUpDialogOpen}
        onOpenChange={setIsTimeUpDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's Up!</AlertDialogTitle>
            <AlertDialogDescription>
              Your time for this assessment has ended. Your answers will be
              automatically submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSubmitTest}>
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your test? You've answered{" "}
              {Object.keys(answers).length} out of {TEST_DATA.questions.length}{" "}
              questions.
              {Object.keys(answers).length < TEST_DATA.questions.length && (
                <p className="mt-2 text-destructive font-medium">
                  Warning: You have{" "}
                  {TEST_DATA.questions.length - Object.keys(answers).length}{" "}
                  unanswered questions.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitTest}>
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header with test info */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {TEST_DATA.title}
          </h1>
          <p className="text-muted-foreground">{TEST_DATA.subject}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInfoDialogOpen(true)}
          >
            <Info className="h-4 w-4 mr-1" />
            Instructions
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsSubmitDialogOpen(true)}
          >
            <SaveAll className="h-4 w-4 mr-1" />
            Submit Test
          </Button>
        </div>
      </div>

      {/* Timer and progress bar */}
      <div className="flex items-center gap-4 border-t border-b py-3">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Remaining Time</p>
            <p
              className={`text-lg font-bold ${
                remainingTime < 300 ? "text-destructive" : ""
              }`}
            >
              {formatTime(remainingTime)}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>
              {currentQuestion + 1} of {TEST_DATA.questions.length}
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <div>
          <Badge
            variant={
              flaggedQuestions.includes(currentQuestionData.id)
                ? "destructive"
                : "outline"
            }
            className="cursor-pointer"
            onClick={() => toggleFlaggedQuestion(currentQuestionData.id)}
          >
            <Flag className="h-3 w-3 mr-1" />
            {flaggedQuestions.includes(currentQuestionData.id)
              ? "Flagged"
              : "Flag for Review"}
          </Badge>
        </div>
      </div>

      {/* Main content area with two columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Questions panel */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Question {currentQuestion + 1}</span>
                {flaggedQuestions.includes(currentQuestionData.id) && (
                  <Badge variant="destructive">
                    <Flag className="h-3 w-3 mr-1" />
                    Flagged
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Question text */}
              <div className="text-lg font-medium">
                {currentQuestionData.text}
              </div>

              {/* Different question types */}
              {currentQuestionData.type === "multiple_choice" && currentQuestionData.options && (
                <RadioGroup
                  value={(answers[currentQuestionData.id] as string) || ""}
                  onValueChange={(value) =>
                    handleAnswerSelect(currentQuestionData.id, value)
                  }
                  className="space-y-3"
                >
                  {currentQuestionData.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`option-${option.id}`}
                      />
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestionData.type === "true_false" && currentQuestionData.options && (
                <RadioGroup
                  value={(answers[currentQuestionData.id] as string) || ""}
                  onValueChange={(value) =>
                    handleAnswerSelect(currentQuestionData.id, value)
                  }
                  className="space-y-3"
                >
                  {currentQuestionData.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`option-${option.id}`}
                      />
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestionData.type === "free_response" && (
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-32"
                  value={(answers[currentQuestionData.id] as string) || ""}
                  onChange={(e) =>
                    handleAnswerSelect(currentQuestionData.id, e.target.value)
                  }
                />
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPrevQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={() => toggleFlaggedQuestion(currentQuestionData.id)}
              >
                {flaggedQuestions.includes(currentQuestionData.id) ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Remove Flag
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4 mr-2" />
                    Flag for Review
                  </>
                )}
              </Button>

              <Button
                variant="default"
                onClick={goToNextQuestion}
                disabled={currentQuestion === TEST_DATA.questions.length - 1}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Questions navigation panel */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Question Navigator</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {TEST_DATA.questions.map((question, index) => (
                  <Button
                    key={question.id}
                    variant={currentQuestion === index ? "default" : "outline"}
                    size="sm"
                    className={`
                      relative p-0 w-full h-10
                      ${answers[question.id] ? "ring-1 ring-primary" : ""}
                      ${
                        flaggedQuestions.includes(question.id)
                          ? "border-destructive"
                          : ""
                      }
                    `}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                    {flaggedQuestions.includes(question.id) && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                    )}
                  </Button>
                ))}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 ring-1 ring-primary rounded-sm"></div>
                  <span>Answered</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-destructive rounded-sm"></div>
                  <span>Flagged for review</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded-sm"></div>
                  <span>Current question</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Test Summary</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total Questions:</span>
                    <span>{TEST_DATA.questions.length}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span>{Object.keys(answers).length}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Unanswered:</span>
                    <span>
                      {TEST_DATA.questions.length - Object.keys(answers).length}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Flagged:</span>
                    <span>{flaggedQuestions.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                onClick={() => setIsSubmitDialogOpen(true)}
                variant="default"
              >
                Submit Test
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-4">
            <Button variant="outline" className="w-full" size="sm">
              <LifeBuoy className="h-4 w-4 mr-2" />
              Need Help?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
