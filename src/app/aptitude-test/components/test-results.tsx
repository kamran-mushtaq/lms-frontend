// app/aptitude-test/components/test-results.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, ArrowRight, Sparkles, BookOpen, AlertTriangle, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestResultsProps {
  results: any;
  assessment: any | null;
  userResponses: Record<string, string>;
  onReturn: () => void;
}

export function TestResults({ results, assessment, userResponses, onReturn }: TestResultsProps) {
  const [activeTab, setActiveTab] = useState<string>("summary");
  
  // Check if all required data is available
  if (!results || !assessment) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Missing Result Data</CardTitle>
          <CardDescription className="text-center">
            Test result information is incomplete.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <p>Please contact support if this issue persists.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onReturn}>Return to Dashboard</Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Extract result data
  const { percentageScore, isPassed } = results;
  const passingScore = assessment.passingScore;
  const totalPoints = assessment.totalPoints;
  const questions = assessment.questions || [];
  
  // Calculate stats
  const correctAnswers = results.questionResponses.filter((r: any) => r.isCorrect).length;
  const totalQuestions = questions.length;
  const accuracy = (correctAnswers / totalQuestions) * 100;
  
  // Get feedback message based on score
  const getFeedbackMessage = () => {
    if (isPassed) {
      if (percentageScore >= 90) {
        return "Excellent! You've demonstrated exceptional understanding of the subject matter.";
      } else if (percentageScore >= 80) {
        return "Great job! You show strong knowledge of the material.";
      } else {
        return "Good work! You've successfully passed the aptitude test.";
      }
    } else {
      if (percentageScore >= passingScore - 10) {
        return "You were close to passing. Consider reviewing the material and trying again.";
      } else {
        return "You need more preparation in this subject area. Review the material thoroughly before retaking the test.";
      }
    }
  };
  
  // Get feedback for a specific question
  const getQuestionFeedback = (questionId: string) => {
    const response = results.questionResponses.find((r: any) => r.questionId === questionId);
    const question = questions.find((q: any) => q._id === questionId);
    
    if (!response || !question) return null;
    
    const correctOption = question.options.find((o: any) => o.isCorrect);
    const explanation = question.explanation || correctOption?.explanation || "No explanation available.";
    
    return {
      isCorrect: response.isCorrect,
      selectedAnswer: response.selectedAnswer,
      correctAnswer: correctOption?.text,
      explanation,
    };
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader className={cn(
          "pb-3",
          isPassed ? "bg-green-50" : "bg-red-50"
        )}>
          <div className="mx-auto rounded-full bg-white p-3 mb-3">
            {isPassed ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <XCircle className="h-10 w-10 text-red-600" />
            )}
          </div>
          <CardTitle className="text-center text-2xl">
            {isPassed ? "Aptitude Test Passed!" : "Aptitude Test Not Passed"}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {getFeedbackMessage()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Score */}
            <div className="rounded-lg border p-4 flex flex-col items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground mb-2">Your Score</span>
              <div className="relative">
                <svg className="w-24 h-24" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#e9ecef" strokeWidth="2"></circle>
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    stroke={isPassed ? "#10b981" : "#ef4444"} 
                    strokeWidth="2" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - percentageScore}
                    transform="rotate(-90 18 18)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{Math.round(percentageScore)}%</span>
                </div>
              </div>
              <div className="text-sm mt-2 flex items-center gap-1.5">
                <span>Passing: {passingScore}%</span>
              </div>
            </div>
            
            {/* Accuracy */}
            <div className="rounded-lg border p-4 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground mb-2">Accuracy</span>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Correct Answers</span>
                  <span className="font-medium">{correctAnswers}/{totalQuestions}</span>
                </div>
                <Progress value={accuracy} className="h-2" />
                <span className="text-xs text-muted-foreground">
                  {Math.round(accuracy)}% of questions answered correctly
                </span>
              </div>
            </div>
            
            {/* Points */}
            <div className="rounded-lg border p-4 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground mb-2">Points Earned</span>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Score</span>
                  <span className="font-medium">{results.totalScore}/{totalPoints}</span>
                </div>
                <Progress value={(results.totalScore / totalPoints) * 100} className="h-2" />
                <span className="text-xs text-muted-foreground">
                  Each question is worth different points based on difficulty
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center my-6">
            <Button 
              onClick={onReturn} 
              variant={isPassed ? "default" : "outline"}
              className="gap-2"
              size="lg"
            >
              {isPassed ? (
                <>
                  Continue to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Home className="h-4 w-4" />
                  Return to Dashboard
                </>
              )}
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <Tabs defaultValue="summary" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="summary">Performance Summary</TabsTrigger>
              <TabsTrigger value="questions">Question Review</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="pt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Performance Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-4">
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="text-sm">Time Spent</span>
                          <span className="font-medium">
                            {results.timeSpentMinutes} minute{results.timeSpentMinutes !== 1 ? 's' : ''}
                          </span>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="text-sm">Test Status</span>
                          <Badge variant={isPassed ? "default" : "destructive"}>
                            {isPassed ? "Passed" : "Failed"}
                          </Badge>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="text-sm">Questions Answered</span>
                          <span className="font-medium">{totalQuestions}/{totalQuestions}</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-sm">Score Required</span>
                          <span className="font-medium">{passingScore}%</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {/* Difficulty Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Difficulty Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {['beginner', 'intermediate', 'advanced'].map((level) => {
                        const levelQuestions = questions.filter(q => q.difficultyLevel === level);
                        const correctInLevel = results.questionResponses.filter(
                          (r: any) => {
                            const q = questions.find((q: any) => q._id === r.questionId);
                            return q && q.difficultyLevel === level && r.isCorrect;
                          }
                        ).length;
                        
                        const totalInLevel = levelQuestions.length;
                        const levelAccuracy = totalInLevel ? (correctInLevel / totalInLevel) * 100 : 0;
                        
                        return (
                          <div key={level} className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <Badge variant={
                                  level === 'beginner' ? 'secondary' : 
                                  level === 'intermediate' ? 'default' : 
                                  'destructive'
                                } className="mr-2">
                                  {level.charAt(0).toUpperCase() + level.slice(1)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {correctInLevel}/{totalInLevel} correct
                                </span>
                              </div>
                              <span className="text-sm font-medium">
                                {totalInLevel ? Math.round(levelAccuracy) : 0}%
                              </span>
                            </div>
                            <Progress value={levelAccuracy} className="h-2" />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
                
                {!isPassed && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-amber-800 mb-4">
                        Don't worry! Many students need multiple attempts to pass the aptitude test.
                      </p>
                      <ul className="space-y-2 text-sm text-amber-800">
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Review the questions you missed in the "Question Review" tab</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Focus on improving your understanding of the subjects where you scored lowest</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>The system will automatically assign you a new test for a lower class level</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Return to the dashboard to take the next test when you're ready</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="questions" className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {questions.map((question: any, index: number) => {
                  const feedback = getQuestionFeedback(question._id);
                  if (!feedback) return null;
                  
                  return (
                    <AccordionItem value={`question-${index}`} key={index}>
                      <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3 text-left">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs",
                            feedback.isCorrect ? "bg-green-500" : "bg-red-500"
                          )}>
                            {feedback.isCorrect ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 truncate mr-2">Question {index + 1}</div>
                          <Badge variant={
                            question.difficultyLevel === 'beginner' ? 'secondary' : 
                            question.difficultyLevel === 'intermediate' ? 'default' : 
                            'destructive'
                          } className="ml-auto mr-2">
                            {question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1)}
                          </Badge>
                          <span className="text-xs">{question.points} pts</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2 pb-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">{question.text}</h4>
                            <div className="space-y-2">
                              {question.options.map((option: any, optIndex: number) => (
                                <div 
                                  key={optIndex} 
                                  className={cn(
                                    "flex items-center p-3 rounded-md border",
                                    option.isCorrect && "border-green-500 bg-green-50",
                                    feedback.selectedAnswer === option.text && !option.isCorrect && "border-red-500 bg-red-50",
                                    feedback.selectedAnswer === option.text && option.isCorrect && "border-green-500 bg-green-50",
                                  )}
                                >
                                  <div className="flex-1">
                                    {option.text}
                                  </div>
                                  <div>
                                    {option.isCorrect && (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Correct Answer
                                      </Badge>
                                    )}
                                    {feedback.selectedAnswer === option.text && !option.isCorrect && (
                                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        Your Answer
                                      </Badge>
                                    )}
                                    {feedback.selectedAnswer === option.text && option.isCorrect && (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        Your Answer (Correct)
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-muted p-3 rounded-md">
                            <h5 className="font-medium mb-1">Explanation</h5>
                            <p className="text-sm">{feedback.explanation}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}