// app/aptitude-test/components/aptitude-test.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Clock, ArrowLeft, ArrowRight, AlertCircle, Loader2, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { submitAssessmentResult } from '../api/assessment-api';

interface AptitudeTestComponentProps {
  assessment: any;
  onComplete: (responses: Record<string, any>, results: any) => void;
}

// Define the types of questions
type QuestionType = 'mcq' | 'true-false' | 'short-answer' | 'essay';

export function AptitudeTestComponent({ assessment, onComplete }: AptitudeTestComponentProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [textInputValues, setTextInputValues] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(assessment.settings.timeLimit * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarningDialog, setShowTimeWarningDialog] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  
  // Create refs for textarea and short-answer inputs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const questions = assessment.questions || [];
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(userResponses).length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  // Save responses to localStorage in case of browser refresh
  useEffect(() => {
    // Load saved responses and text input values from localStorage
    const savedResponses = localStorage.getItem(`aptitude-test-${assessment._id}-responses`);
    const savedTextInputs = localStorage.getItem(`aptitude-test-${assessment._id}-text-inputs`);
    
    if (savedResponses) {
      setUserResponses(JSON.parse(savedResponses));
    }
    
    if (savedTextInputs) {
      setTextInputValues(JSON.parse(savedTextInputs));
    }
  }, [assessment._id]);

  // Save responses whenever they change
  useEffect(() => {
    localStorage.setItem(`aptitude-test-${assessment._id}-responses`, JSON.stringify(userResponses));
  }, [userResponses, assessment._id]);

  // Save text input values whenever they change
  useEffect(() => {
    localStorage.setItem(`aptitude-test-${assessment._id}-text-inputs`, JSON.stringify(textInputValues));
  }, [textInputValues, assessment._id]);

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Full assessment object:", assessment);
      console.log("Questions array:", assessment.questions);
      if (assessment.questions && assessment.questions.length > 0) {
        console.log("First question structure:", assessment.questions[0]);
      }
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

  // Toggle hint visibility
  const toggleHint = (questionId: string) => {
    setShowHint(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Handle MCQ or true-false response
  const handleMultipleChoiceResponse = (questionId: string, response: string) => {
    setUserResponses({
      ...userResponses,
      [questionId]: response
    });
  };

  // Handle text-based responses (short-answer and essay)
  const handleTextResponse = (questionId: string, value: string) => {
    // Store the current text input value
    setTextInputValues({
      ...textInputValues,
      [questionId]: value
    });
    
    // Only consider it as a response if there's actual text
    if (value.trim()) {
      setUserResponses({
        ...userResponses,
        [questionId]: value
      });
    } else {
      // Remove from responses if empty
      const updatedResponses = { ...userResponses };
      delete updatedResponses[questionId];
      setUserResponses(updatedResponses);
    }
  };

  // Handle true-false response
  const handleBooleanResponse = (questionId: string, value: boolean) => {
    setUserResponses({
      ...userResponses,
      [questionId]: value
    });
  };

  // Save the current text input when navigating away
  const saveCurrentTextInput = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    if (currentQuestion.type === 'short-answer' || currentQuestion.type === 'essay') {
      const value = textInputValues[currentQuestion._id] || '';
      if (value.trim()) {
        setUserResponses({
          ...userResponses,
          [currentQuestion._id]: value
        });
      }
    }
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    saveCurrentTextInput();
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    saveCurrentTextInput();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle submitting the test
  const handleSubmit = async () => {
    try {
      // Save any current text input
      saveCurrentTextInput();
      
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
      const questionResponses = Object.entries(userResponses).map(([questionId, response]) => {
        // Find the question
        const question = questions.find((q: any) => q._id === questionId);
        if (!question) return null;
        
        // Handle different question types
        let isCorrect = false;
        let score = 0;
        let selectedAnswer = '';
        
        switch (question.type) {
          case 'mcq':
            // For MCQ, the response is the text of the selected option
            selectedAnswer = response as string;
            const selectedOption = question.options.find((opt: any) => opt.text === response);
            isCorrect = selectedOption?.isCorrect || false;
            score = isCorrect ? question.points : 0;
            break;
            
          case 'true-false':
            // For true-false, the response is a boolean
            selectedAnswer = response.toString();
            const correctOption = question.options.find((opt: any) => opt.isCorrect);
            const correctAnswer = correctOption?.text.toLowerCase() === 'true';
            isCorrect = response === correctAnswer;
            score = isCorrect ? question.points : 0;
            break;
            
          case 'short-answer':
            // For short-answer, we need to check if the answer is close to any correct option
            selectedAnswer = response as string;
            // Simple exact match for now - could be enhanced with fuzzy matching
            isCorrect = question.options.some((opt: any) => 
              opt.isCorrect && opt.text.toLowerCase() === (response as string).toLowerCase());
            score = isCorrect ? question.points : 0;
            break;
            
          case 'essay':
            // Essays need to be manually graded, so we just store the response
            selectedAnswer = response as string;
            isCorrect = false; // Will be graded manually later
            score = 0; // Will be scored manually later
            break;
        }
        
        return {
          questionId,
          selectedAnswer,
          isCorrect,
          score,
          timeSpentSeconds: Math.floor((assessment.settings.timeLimit * 60 - timeRemaining) / totalQuestions) // Estimate time spent per question
        };
      }).filter(Boolean);
      
      // Calculate total score
      const totalScore = questionResponses.reduce((sum, response) => sum + (response?.score || 0), 0);
      const timeSpentMinutes = Math.floor((assessment.settings.timeLimit * 60 - timeRemaining) / 60);
      
      // Build assessment result payload
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Submitting assessment with payload:', JSON.stringify(resultPayload, null, 2));
      }
      
      // Submit assessment result to API
      const result = await submitAssessmentResult(studentId, resultPayload);
      
      // Calculate pass/fail based on result
      const percentageScore = (totalScore / assessment.totalPoints) * 100;
      const isPassed = percentageScore >= assessment.passingScore;
      
      // Clear saved responses from localStorage
      localStorage.removeItem(`aptitude-test-${assessment._id}-responses`);
      localStorage.removeItem(`aptitude-test-${assessment._id}-text-inputs`);
      
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
    saveCurrentTextInput();
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

  // Render question based on its type
  const renderQuestionByType = (question: any) => {
    // Safely handle the difficultyLevel - it might be undefined in some questions
    const difficultyLevel = question.difficultyLevel || "beginner"; // Default to beginner if undefined
    const formattedDifficulty = difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1);
    
    // Check if there are hints available
    const hasHints = question.metadata?.hints && question.metadata.hints.length > 0;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <Badge className="mb-2">{formattedDifficulty}</Badge>
            <h3 className="text-lg font-semibold">{question.text}</h3>
          </div>
          
          {hasHints && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleHint(question._id)}
                    className="ml-2"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Hint
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click for a hint</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* Display hint if available and shown */}
        {hasHints && showHint[question._id] && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 mb-1">Hint:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {question.metadata.hints.map((hint: string, i: number) => (
                    <li key={i} className="text-sm text-amber-700">{hint}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Show question explanation if available */}
        {question.explanation && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 mb-1">Note:</p>
                <p className="text-sm text-blue-700">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Render input based on question type */}
        {renderQuestionInput(question)}
      </div>
    );
  };
  
  // Render the appropriate input for each question type
  const renderQuestionInput = (question: any) => {
    switch (question.type) {
      case 'mcq':
        return renderMultipleChoiceInput(question);
      case 'true-false':
        return renderTrueFalseInput(question);
      case 'short-answer':
        return renderShortAnswerInput(question);
      case 'essay':
        return renderEssayInput(question);
      default:
        return (
          <div className="p-4 border rounded-md bg-red-50 text-red-700">
            <p>Unsupported question type: {question.type}</p>
          </div>
        );
    }
  };
  
  // Render multiple choice question input
  const renderMultipleChoiceInput = (question: any) => {
    const selectedAnswer = userResponses[question._id];
    const options = Array.isArray(question.options) ? question.options : [];

    if (options.length === 0) {
      return (
        <div className="p-4 border rounded-md bg-amber-50 text-amber-800">
          <p>No options available for this question. Please contact support.</p>
        </div>
      );
    }

    return (
      <RadioGroup 
        value={selectedAnswer} 
        onValueChange={(value) => handleMultipleChoiceResponse(question._id, value)}
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
              id={`option-${question._id}-${index}`} 
              className="aria-checked:border-primary"
            />
            <Label htmlFor={`option-${question._id}-${index}`} className="flex-grow cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };
  
  // Render true-false question input
  const renderTrueFalseInput = (question: any) => {
    const selectedAnswer = userResponses[question._id];
    
    return (
      <div className="space-y-4">
        <div 
          className={cn(
            "flex items-center space-x-2 rounded-md border p-4 transition-colors",
            selectedAnswer === true && "border-primary bg-primary/5"
          )}
        >
          <Switch
            id={`true-option-${question._id}`}
            checked={selectedAnswer === true}
            onCheckedChange={() => handleBooleanResponse(question._id, true)}
          />
          <Label htmlFor={`true-option-${question._id}`} className="flex-grow cursor-pointer">True</Label>
        </div>
        
        <div 
          className={cn(
            "flex items-center space-x-2 rounded-md border p-4 transition-colors",
            selectedAnswer === false && "border-primary bg-primary/5"
          )}
        >
          <Switch
            id={`false-option-${question._id}`}
            checked={selectedAnswer === false}
            onCheckedChange={() => handleBooleanResponse(question._id, false)}
          />
          <Label htmlFor={`false-option-${question._id}`} className="flex-grow cursor-pointer">False</Label>
        </div>
      </div>
    );
  };
  
  // Render short answer question input
  const renderShortAnswerInput = (question: any) => {
    return (
      <div className="space-y-2">
        <Input
          placeholder="Type your answer here..."
          value={textInputValues[question._id] || ''}
          onChange={(e) => handleTextResponse(question._id, e.target.value)}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Type a short, concise answer. Be precise with your wording.
        </p>
      </div>
    );
  };
  
  // Render essay question input
  const renderEssayInput = (question: any) => {
    return (
      <div className="space-y-2">
        <Textarea
          ref={textareaRef}
          placeholder="Write your answer here..."
          value={textInputValues[question._id] || ''}
          onChange={(e) => handleTextResponse(question._id, e.target.value)}
          className="min-h-[200px] w-full"
        />
        <p className="text-sm text-muted-foreground">
          Write a detailed answer. You can use paragraphs to organize your thoughts.
        </p>
      </div>
    );
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
    return renderQuestionByType(question);
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
                {questions.map((q: any, index: number) => {
                  // Determine the variant based on question type and answered status
                  let variant = userResponses[q._id] ? "default" : "outline";
                  
                  // Add visual indicators for different question types
                  const questionTypeClasses = {
                    'mcq': '',
                    'true-false': 'border-blue-400',
                    'short-answer': 'border-green-400',
                    'essay': 'border-purple-400'
                  };
                  
                  return (
                    <Button
                      key={index}
                      variant={variant}
                      size="sm"
                      className={cn(
                        "h-10 w-10 p-0",
                        !userResponses[q._id] && questionTypeClasses[q.type as QuestionType],
                        currentQuestionIndex === index && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Answered</span>
                  <span>{answeredQuestions}/{totalQuestions}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              {/* Question type legend */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Question Types:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    <span>Multiple Choice</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>True/False</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Short Answer</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span>Essay</span>
                  </div>
                </div>
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
                <div className="flex space-x-2 items-center">
                  <Badge variant="outline">
                    {questions[currentQuestionIndex]?.points || 0} points
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn({
                      'bg-primary/10 text-primary': questions[currentQuestionIndex]?.type === 'mcq',
                      'bg-blue-100 text-blue-800': questions[currentQuestionIndex]?.type === 'true-false',
                      'bg-green-100 text-green-800': questions[currentQuestionIndex]?.type === 'short-answer',
                      'bg-purple-100 text-purple-800': questions[currentQuestionIndex]?.type === 'essay',
                    })}
                  >
                    {questions[currentQuestionIndex]?.type === 'mcq' ? 'Multiple Choice' :
                     questions[currentQuestionIndex]?.type === 'true-false' ? 'True/False' :
                     questions[currentQuestionIndex]?.type === 'short-answer' ? 'Short Answer' :
                     questions[currentQuestionIndex]?.type === 'essay' ? 'Essay' : 'Unknown'}
                  </Badge>
                </div>
              </div>
              <Progress value={getQuestionProgress(currentQuestionIndex)} className="h-1" />
            </CardHeader>
            <CardContent>
              {renderQuestion()}
              
              {/* Navigation buttons */}
              <div className="flex justify-between pt-6 mt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button onClick={goToNextQuestion}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowSubmitDialog(true)}
                    disabled={isSubmitting}
                    variant="default"
                  >
                    Submit Test
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
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