// src/components/student/lecture/InteractiveContent.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Radio } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Play, RefreshCw, RotateCcw } from "lucide-react";
import { updateLectureProgress } from "./api/lecture-service";

interface InteractiveContentProps {
    content: any; // This would be the interactive content data structure
    onProgress: (progress: number) => void;
    initialProgress?: number;
    lectureId: string;
}

export default function InteractiveContent({
    content,
    onProgress,
    initialProgress = 0,
    lectureId
}: InteractiveContentProps) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [progress, setProgress] = useState(initialProgress || 0);

    const progressReportTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Parse interactive content
    const steps = content.steps || [];
    const totalSteps = steps.length;
    const currentStep = steps[step] || null;

    // Set initial step based on progress
    useEffect(() => {
        if (initialProgress > 0 && initialProgress < 100 && totalSteps > 0) {
            const initialStep = Math.floor((initialProgress / 100) * totalSteps);
            setStep(Math.min(initialStep, totalSteps - 1));
        }
    }, [initialProgress, totalSteps]);

    // Update progress when step changes
    useEffect(() => {
        const calculatedProgress = totalSteps > 0 ? Math.round(((step + 1) / totalSteps) * 100) : 0;
        setProgress(calculatedProgress);

        // Report progress to parent component
        onProgress(calculatedProgress);

        // Report progress to server
        if (progressReportTimeoutRef.current) {
            clearTimeout(progressReportTimeoutRef.current);
        }

        progressReportTimeoutRef.current = setTimeout(() => {
            updateLectureProgress(lectureId, {
                progress: calculatedProgress,
                currentStep: step
            });
        }, 2000);

        // Check if completed
        if (step === totalSteps - 1 && calculatedProgress >= 100) {
            setIsCompleted(true);
        }
    }, [step, totalSteps, onProgress, lectureId]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (progressReportTimeoutRef.current) {
                clearTimeout(progressReportTimeoutRef.current);
            }
        };
    }, []);

    // Handle navigation between steps
    const goToNextStep = () => {
        if (step < totalSteps - 1) {
            setStep(step + 1);
            setShowFeedback(false);
        }
    };

    const goToPreviousStep = () => {
        if (step > 0) {
            setStep(step - 1);
            setShowFeedback(false);
        }
    };

    // Reset the current step
    const resetStep = () => {
        // Clear answers for current step
        const stepId = currentStep?.id;
        if (stepId) {
            const newAnswers = { ...answers };
            delete newAnswers[stepId];
            setAnswers(newAnswers);
        }
        setShowFeedback(false);
    };

    // Handle input changes for different question types
    const handleInputChange = (value: any) => {
        if (!currentStep) return;

        setAnswers({
            ...answers,
            [currentStep.id]: value
        });
    };

    // Check answers for the current step
    const checkAnswer = () => {
        if (!currentStep) return;

        const userAnswer = answers[currentStep.id];
        // This would compare the user's answer with the correct answer
        // based on the question type

        setShowFeedback(true);
    };

    // Render different types of interactive elements
    const renderInteractiveElement = () => {
        if (!currentStep) return null;

        const { type, question, options, correctAnswer } = currentStep;
        const userAnswer = answers[currentStep.id];

        switch (type) {
            case 'multiple-choice':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">{question}</h3>
                        <div className="space-y-2">
                            {options.map((option: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id={`option-${index}`}
                                        name={`question-${currentStep.id}`}
                                        checked={userAnswer === index}
                                        onChange={() => handleInputChange(index)}
                                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor={`option-${index}`} className="text-sm">
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {showFeedback && (
                            <div className={`p-3 mt-4 rounded-md ${userAnswer === correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {userAnswer === correctAnswer
                                    ? 'Correct! ' + (currentStep.feedback?.correct || '')
                                    : 'Incorrect. ' + (currentStep.feedback?.incorrect || '')}
                            </div>
                        )}
                    </div>
                );

            case 'checkboxes':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">{question}</h3>
                        <div className="space-y-2">
                            {options.map((option: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`option-${index}`}
                                        checked={userAnswer?.includes(index)}
                                        onChange={() => {
                                            const selected = userAnswer || [];
                                            const newSelected = selected.includes(index)
                                                ? selected.filter((i: number) => i !== index)
                                                : [...selected, index];
                                            handleInputChange(newSelected);
                                        }}
                                        className="h-4 w-4 border-gray-300 rounded text-primary focus:ring-primary"
                                    />
                                    <label htmlFor={`option-${index}`} className="text-sm">
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {showFeedback && (
                            <div className={`p-3 mt-4 rounded-md ${JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)
                                    ? 'Correct! ' + (currentStep.feedback?.correct || '')
                                    : 'Incorrect. ' + (currentStep.feedback?.incorrect || '')}
                            </div>
                        )}
                    </div>
                );

            case 'free-text':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">{question}</h3>
                        <textarea
                            value={userAnswer || ''}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full min-h-[100px] p-2 border rounded-md"
                        />
                        {showFeedback && (
                            <div className="p-3 mt-4 rounded-md bg-blue-100 text-blue-800">
                                {currentStep.feedback?.general || 'Your answer has been recorded.'}
                            </div>
                        )}
                    </div>
                );

            case 'drag-drop':
                // Simplified drag-drop implementation
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">{question}</h3>
                        <p className="text-sm text-muted-foreground">
                            Drag and drop functionality would be implemented here.
                        </p>
                        {showFeedback && (
                            <div className="p-3 mt-4 rounded-md bg-blue-100 text-blue-800">
                                {currentStep.feedback?.general || 'Your answer has been recorded.'}
                            </div>
                        )}
                    </div>
                );

            case 'simulation':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">{question || 'Interactive Simulation'}</h3>
                        <div className="border rounded-md p-4 bg-gray-50 flex items-center justify-center min-h-[300px]">
                            <div className="text-center">
                                <Play className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">
                                    An interactive simulation would be embedded here.
                                </p>
                            </div>
                        </div>
                        {showFeedback && (
                            <div className="p-3 mt-4 rounded-md bg-blue-100 text-blue-800">
                                {currentStep.feedback?.general || 'Your interaction has been recorded.'}
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="p-4">
                        <p className="text-muted-foreground">Unsupported interactive element type</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Progress Bar */}
            <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                <div className="text-sm">
                    Step {step + 1} of {totalSteps}
                </div>
                <div className="flex items-center space-x-2">
                    <Progress value={progress} className="w-32" />
                    <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardContent className="p-6">
                            {renderInteractiveElement()}
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>

            {/* Navigation Controls */}
            <div className="border-t p-4 flex items-center justify-between bg-background">
                <div>
                    <Button
                        variant="outline"
                        onClick={goToPreviousStep}
                        disabled={step <= 0}
                    >
                        Previous
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    {!showFeedback && currentStep?.type !== 'simulation' && (
                        <Button
                            variant="default"
                            onClick={checkAnswer}
                            disabled={!answers[currentStep?.id]}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Check Answer
                        </Button>
                    )}

                    {showFeedback && step < totalSteps - 1 && (
                        <Button variant="default" onClick={goToNextStep}>
                            Continue
                        </Button>
                    )}

                    {showFeedback && step === totalSteps - 1 && (
                        <Button
                            variant="default"
                            onClick={() => {
                                setIsCompleted(true);
                                onProgress(100);
                            }}
                        >
                            Complete
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetStep}
                        title="Reset Step"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}