// app/aptitude-test/components/aptitude-test.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, ArrowLeft, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createAssessmentResultPayload, submitAssessmentResult } from '../api/assessment-api';

interface AptitudeTestComponentProps {
  assessment: any;
  onComplete: (responses: Record<string, string>, results: any) => void;
}

export function AptitudeTestComponent({ assessment, onComplete }: AptitudeTestComponentProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(assessment.settings.timeLimit * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarningDialog, setShowTimeWarningDialog] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const questions = assessment.questions || [];
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(userResponses).length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  // Save responses to localStorage in case of browser refresh
  useEffect(() => {
    const savedResponses = localStorage.getItem(`aptitude-test-${assessment._id}`);
    if (savedResponses) {
      setUserResponses(JSON.parse(savedResponses));
    }
  }, [assessment._id]);

  // Save responses whenever they change
  useEffect(() => {
    localStorage.setItem(`aptitude-test-${assessment._id}`, JSON.stringify(userResponses));
  }, [userResponses, assessment._id]);

  // Modify your assessment data fetching logic


  useEffect(() => {
    console.log("Full assessment object:", assessment);
    console.log("Questions array:", assessment.questions);
    if (assessment.questions && assessment.questions.length > 0) {
      console.log("First question structure:", assessment.questions[0]);
    }
  }, [assessment]);

  // Timer functionality
  useEffect(() => {
    if (!isTimerActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        
        // Show warning when 2 minutes remaining
        if (newTime === 120) {
          setShowTimeWarningDialog(true);
        }
        
        // Auto-submit when time is up
        if (newTime <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive]);

  // Format time remaining as mm:ss
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate completion percentage for current question
  const getQuestionProgress = (index: number) => {
    return ((index + 1) / totalQuestions) * 100;
  };

  // Handle user response
  const handleResponse = (questionId: string, response: string) => {
    setUserResponses({
      ...userResponses,
      [questionId]: response
    });
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle submitting the test
  const handleSubmit = async () => {
    try {
      setIsTimerActive(false);
      setIsSubmitting(true);
      setShowSubmitDialog(false);
  
      // Prepare submission data
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User information not found');
      }
      
      const user = JSON.parse(storedUser);
      const studentId = user._id;
      
      // Prepare submission data - map responses to question responses format
      const questionResponses = Object.entries(userResponses).map(([questionId, selectedAnswer]) => {
        // Find the question and selected option
        const question = questions.find((q: any) => q._id === questionId);
        if (!question) return null;
        
        const selectedOption = question.options.find((opt: any) => opt.text === selectedAnswer);
        if (!selectedOption) return null;
        
        return {
          questionId,
          selectedAnswer,
          isCorrect: selectedOption.isCorrect,
          score: selectedOption.isCorrect ? question.points : 0,
          timeSpentSeconds: Math.floor((assessment.settings.timeLimit * 60 - timeRemaining) / totalQuestions) // Estimate time spent per question
        };
      }).filter(Boolean);
      
      // Calculate total score
      const totalScore = questionResponses.reduce((sum, response) => sum + (response?.score || 0), 0);
      const timeSpentMinutes = Math.floor((assessment.settings.timeLimit * 60 - timeRemaining) / 60);
      
      // Build assessment result payload - MATCHING EXACT POSTMAN STRUCTURE

      console.log("Assessment result payload Test:", assessment);

      const resultPayload = {
        assessmentId: assessment._id,
        classId: assessment.classId._id,
        subjectId: assessment.subjectId._id,
        totalScore,
        maxPossibleScore: assessment.totalPoints,
        timeSpentMinutes,
        questionResponses,
        status: 'completed',
        metadata: {
          startTime: new Date(Date.now() - (timeSpentMinutes * 60000)).toISOString(),
          endTime: new Date().toISOString()
        }
      };
      
      console.log('Submitting assessment with payload:', JSON.stringify(resultPayload, null, 2));
      
      // Submit assessment result to API
      const result = await submitAssessmentResult(studentId, resultPayload);
      
      // Calculate pass/fail based on result
      const percentageScore = (totalScore / assessment.totalPoints) * 100;
      const isPassed = percentageScore >= assessment.passingScore;
      
      // Clear saved responses from localStorage
      localStorage.removeItem(`aptitude-test-${assessment._id}`);
      
      // Show success toast
      toast({
        title: "Test Submitted Successfully",
        description: `Your test has been submitted. ${isPassed ? 'Congratulations!' : 'Review your results for feedback.'}`,
        variant: isPassed ? "default" : "destructive",
      });
      
      // Call the onComplete callback with results
      onComplete(userResponses, {
        ...result,
        isPassed,
        percentageScore
      });
      
    } catch (error) {
      console.error('Error submitting test:', error);
      // Enhanced error messaging
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to submit your test. Please try again.";
        
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
      setIsTimerActive(true);
    }
  };

  // Navigate to a specific question
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    const currentQuestion = questions[currentQuestionIndex];
    return currentQuestion && userResponses[currentQuestion._id] !== undefined;
  };

  // Check if all questions are answered
  const areAllQuestionsAnswered = () => {
    return questions.every((q: any) => userResponses[q._id] !== undefined);
  };

  // Render the current question
  const renderQuestion = () => {
    if (!questions.length || currentQuestionIndex >= questions.length) {
      return (
        <div className="flex flex-col items-center justify-center p-10">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-center">Question not found. Please try again.</p>
        </div>
      );
    }

    const question = questions[currentQuestionIndex];
    const selectedAnswer = userResponses[question._id];
    
    // Safely handle the difficultyLevel - it might be undefined in some questions
    const difficultyLevel = question.difficultyLevel || "beginner"; // Default to beginner if undefined
    const formattedDifficulty = difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1);
    
    // Ensure options exists and is an array
    const options = Array.isArray(question.options) ? question.options : [];

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge className="mb-2">
            {formattedDifficulty}
          </Badge>
          <h3 className="text-lg font-semibold">{question.text}</h3>
        </div>

        {options.length > 0 ? (
          <RadioGroup 
            value={selectedAnswer} 
            onValueChange={(value) => handleResponse(question._id, value)}
            className="space-y-3"
          >
            {options.map((option: any, index: number) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-center space-x-2 rounded-md border p-4 transition-colors",
                  selectedAnswer === option.text && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem 
                  value={option.text} 
                  id={`option-${index}`} 
                  className="aria-checked:border-primary"
                />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="p-4 border rounded-md bg-amber-50 text-amber-800">
            <p>No options available for this question. Please contact support.</p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button 
              onClick={goToNextQuestion}
              disabled={!isCurrentQuestionAnswered()}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={() => setShowSubmitDialog(true)}
              disabled={!areAllQuestionsAnswered() || isSubmitting}
              variant="default"
            >
              Submit Test
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with timer and progress */}
      <div className="bg-white sticky top-0 z-10 p-4 mb-6 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{assessment.title}</h2>
          <div className={cn(
            "flex items-center px-4 py-2 rounded-full",
            timeRemaining <= 120 ? "bg-red-50 text-red-700" : "bg-muted"
          )}>
            <Clock className={cn(
              "h-5 w-5 mr-2",
              timeRemaining <= 120 && "animate-pulse text-red-600"
            )} />
            <span className="font-mono font-bold">{formatTimeRemaining()}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress: {answeredQuestions}/{totalQuestions} questions answered</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} />
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Question navigator sidebar */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q: any, index: number) => (
                  <Button
                    key={index}
                    variant={userResponses[q._id] ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-10 w-10 p-0",
                      currentQuestionIndex === index && "ring-2 ring-primary ring-offset-2"
                    )}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Answered</span>
                  <span>{answeredQuestions}/{totalQuestions}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Question display */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </CardTitle>
                <Badge variant="outline">
                  {questions[currentQuestionIndex]?.points || 0} points
                </Badge>
              </div>
              <Progress value={getQuestionProgress(currentQuestionIndex)} className="h-1" />
            </CardHeader>
            <CardContent>
              {renderQuestion()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile question navigator */}
      <div className="md:hidden mt-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-5 gap-2">
              {questions.slice(0, 10).map((q: any, index: number) => (
                <Button
                  key={index}
                  variant={userResponses[q._id] ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-10 w-10 p-0",
                    currentQuestionIndex === index && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
            {questions.length > 10 && (
              <div className="text-center mt-2 text-sm text-muted-foreground">
                + {questions.length - 10} more questions
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Your Test?</AlertDialogTitle>
            <AlertDialogDescription>
              {areAllQuestionsAnswered() 
                ? "You've answered all questions. Are you sure you want to submit your test?" 
                : `You've answered ${answeredQuestions} out of ${totalQuestions} questions. Unanswered questions will be marked as incorrect.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit Test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time warning dialog */}
      <AlertDialog open={showTimeWarningDialog} onOpenChange={setShowTimeWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time Warning</AlertDialogTitle>
            <AlertDialogDescription>
              You have only 2 minutes remaining. Please finish your test soon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Continue Test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submitting overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center max-w-md">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-bold">Submitting Your Test</h3>
            <p className="text-center text-muted-foreground mt-2">
              Please wait while we process your answers...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}