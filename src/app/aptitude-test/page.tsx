// app/aptitude-test/page.tsx - COMPLETE UPDATED FILE
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { getPendingAssessments, getAssessmentById, getStudentEnrollments } from "./api/assessment-api";
import { AptitudeTestComponent } from "./components/aptitude-test";
import { TestIntroScreen } from "./components/test-intro";
import { TestResults } from "./components/test-results";
import { AssignAptitudeTest } from "./components/assign-aptitude-test";

// Define interface for the assessment data
interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: string;
  classId: string;
  subjectId?: string;
  questions: Question[];
  totalPoints: number;
  passingScore: number;
  settings: {
    timeLimit: number; // in minutes
    shuffleQuestions: boolean;
    showResults: boolean;
    attemptsAllowed: number;
    isPublished: boolean;
    isRequired?: boolean;
  };
}

// Define interface for questions
interface Question {
  _id: string;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  type: string;
  explanation?: string;
  difficultyLevel: string;
  points: number;
}

// Define interface for test data
interface TestData {
  assessment: Assessment | null;
  isLoading: boolean;
  error: string | null;
}

export default function AptitudeTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State for test flow
  const [testData, setTestData] = useState<TestData>({
    assessment: null,
    isLoading: true,
    error: null
  });
  const [currentStep, setCurrentStep] = useState<'loading' | 'no-test' | 'intro' | 'test' | 'results'>('loading');
  const [pendingTests, setPendingTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});

  // Load pending assessments on component mount
  useEffect(() => {
    // Check for redirect loop
    const redirectCount = parseInt(localStorage.getItem('redirect_count') || '0', 10);
    localStorage.setItem('redirect_count', (redirectCount + 1).toString());
    
    // If we've redirected more than 3 times, stop and show an error
    if (redirectCount > 3) {
      localStorage.setItem('redirect_count', '0'); // Reset counter
      setTestData({
        ...testData,
        isLoading: false,
        error: 'Detected a redirect loop. Please contact support.'
      });
      setCurrentStep('loading');
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Detected a redirect loop between pages. Please contact support.",
      });
      return;
    }
    
    // Reset counter when successfully loading
    const cleanup = () => {
      localStorage.setItem('redirect_count', '0');
    };

    const fetchPendingAssessments = async () => {
      try {
        // Get user ID from localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/login');
          return;
        }
        
        const user = JSON.parse(storedUser);
        const studentId = user._id;
        
        console.log("Checking for pending assessments for student:", studentId);
        
        // Get pending assessments
        const pendingData = await getPendingAssessments(studentId);
        console.log('Pending assessments data:', pendingData); // Keep original log too
        
        if (pendingData.hasPendingTest && pendingData.pendingTests.length > 0) {
            // Filter only aptitude tests
            const aptitudeTests = pendingData.pendingTests.filter(
              (test) => test.type === 'aptitude'
            );
            
            console.log('Aptitude tests found:', JSON.stringify(aptitudeTests));
            setPendingTests(aptitudeTests);
          
            if (aptitudeTests.length > 0) {
                // Get the first test
                const firstTest = aptitudeTests[0];
                
                // Debug the first test object structure
                console.log("First aptitude test object:", JSON.stringify(firstTest));
                
                // Try to extract a valid test ID
                let testId = null;
                
                if (firstTest.id) {
                  console.log("Test ID from API:", firstTest.id, "Type:", typeof firstTest.id);
                  
                  if (typeof firstTest.id === 'string') {
                    // Direct string ID
                    testId = firstTest.id;
                  } else if (typeof firstTest.id === 'object' && firstTest.id !== null) {
                    // Object with potential _id field
                    console.log("ID is an object:", JSON.stringify(firstTest.id));
                    
                    if (firstTest.id._id) {
                      // Extract the _id property if it exists
                      testId = typeof firstTest.id._id === 'string' 
                        ? firstTest.id._id 
                        : String(firstTest.id._id);
                    } else if (firstTest.id.toString) {
                      // Try to get a string representation
                      testId = firstTest.id.toString();
                    }
                  }
                }
                
                // If we couldn't get an ID from the id property, try looking for _id
                if (!testId && firstTest._id) {
                  console.log("Using _id property instead:", firstTest._id);
                  testId = typeof firstTest._id === 'string' 
                    ? firstTest._id 
                    : String(firstTest._id);
                }
                
                // Check if we have an ID
                if (testId) {
                  // Extract just the hex string if the value contains more information
                  const hexMatch = testId.match(/[0-9a-fA-F]{24}/);
                  if (hexMatch) {
                    testId = hexMatch[0];
                  }
                  
                  console.log("Final test ID to use:", testId);
                  
                  // Validate ID format
                  const isValidId = /^[0-9a-fA-F]{24}$/.test(testId);
                  if (isValidId) {
                    console.log("Found valid aptitude test ID, moving to intro step");
                    setSelectedTest(testId);
                    setCurrentStep('intro');
                  } else {
                    console.error("Invalid test ID format after processing:", testId);
                    throw new Error(`Invalid assessment ID format: ${testId}. Expected a 24-character hex string.`);
                  }
                } else {
                  // No test ID yet, need to assign one
                  console.log("Found aptitude test without ID, moving to no-test step");
                  setCurrentStep('no-test');
                }
              } else {
            // No test ID yet, need to assign one
            console.log("Found aptitude test without ID, moving to no-test step");
            setCurrentStep('no-test');
          }
        } else {
          // Check enrollments directly to see if we need tests
          console.log("No pending tests found in initial check, checking enrollments directly");
          const enrollments = await getStudentEnrollments(studentId);
          console.log("Student enrollments:", enrollments); // Keep original log too
          
          const pendingAptitudeEnrollments = enrollments.filter((enrollment) => 
            !enrollment.aptitudeTestCompleted && (!enrollment.aptitudeTestId || enrollment.aptitudeTestId === undefined)
          );
          
          console.log("Enrollments without aptitude tests:", pendingAptitudeEnrollments);
          
          if (pendingAptitudeEnrollments.length > 0) {
            // Needs tests assigned
            console.log("Enrollments found that need aptitude tests, moving to no-test step");
            setPendingTests(pendingAptitudeEnrollments.map(e => ({
              type: 'aptitude',
              name: `Aptitude Test ${e.subjectId?.displayName ? `for ${e.subjectId.displayName}` : ''}`,
              id: null,
              dueDate: null,
              subjectId: e.subjectId?._id || e.subjectId,
              subjectName: e.subjectId?.displayName || 'Subject'
            })));
            setCurrentStep('no-test');
          } else {
            // Check if there are enrollments with aptitude tests that aren't completed
            const incompleteTestEnrollments = enrollments.filter((enrollment) => 
              !enrollment.aptitudeTestCompleted && enrollment.aptitudeTestId
            );
            
            console.log("Enrollments with incomplete aptitude tests:", incompleteTestEnrollments);
            
            if (incompleteTestEnrollments.length > 0) {
              // There are tests assigned but not completed
              console.log("Enrollments found with assigned but incomplete tests");
              
              // Make sure we handle aptitudeTestId properly
              const formattedTests = incompleteTestEnrollments.map(e => {
                let testId = e.aptitudeTestId;
                
                // Handle if the ID is an object with _id property
                if (typeof testId === 'object' && testId !== null && testId._id) {
                  testId = testId._id.toString();
                } else if (typeof testId === 'string') {
                  // Keep it as is if it's already a string
                } else if (testId) {
                  // Try to stringify if it's something else but truthy
                  testId = testId.toString();
                } else {
                  // Null/undefined case
                  testId = null;
                }
                
                return {
                  type: 'aptitude',
                  name: `Aptitude Test ${e.subjectId?.displayName ? `for ${e.subjectId.displayName}` : ''}`,
                  id: testId,
                  dueDate: null,
                  subjectId: e.subjectId?._id || e.subjectId,
                  subjectName: e.subjectId?.displayName || 'Subject'
                };
              });
              
              setPendingTests(formattedTests);
              
              if (formattedTests[0].id) {
                console.log("Setting selected test to first incomplete test:", formattedTests[0].id);
                setSelectedTest(formattedTests[0].id);
                setCurrentStep('intro');
              } else {
                console.log("No test ID found, moving to no-test step");
                setCurrentStep('no-test');
              }
            } else {
              // --- NEW CHECK: Look for completed but failed tests ---
              const failedTestEnrollments = enrollments.filter((enrollment) =>
                enrollment.aptitudeTestCompleted === true && enrollment.aptitudeTestPassed === false
              );
              
              console.log("Enrollments with completed but failed tests:", failedTestEnrollments);

              if (failedTestEnrollments.length > 0) {
                // Tests are completed, but at least one was failed. Stay on this page.
                console.log("Found completed but failed tests. Staying on aptitude page.");
                
                const formattedFailedTests = failedTestEnrollments.map(e => {
                   // Ensure we extract a usable ID string
                   let testId = e.aptitudeTestId;
                   if (typeof testId === 'object' && testId !== null && testId._id) {
                     testId = testId._id.toString();
                   } else if (testId) {
                     testId = testId.toString();
                   } else {
                     testId = null; // Handle cases where ID might be missing
                   }
                   
                   return {
                     type: 'aptitude',
                     name: `Aptitude Test for ${e.subjectId?.displayName || 'Subject'} (Failed)`,
                     id: testId,
                     status: 'Failed', // Add a status indicator
                     subjectId: e.subjectId?._id || e.subjectId,
                     subjectName: e.subjectId?.displayName || 'Subject'
                   };
                 });

                 setPendingTests(formattedFailedTests);
                 setTestData(prev => ({ ...prev, isLoading: false, error: null })); // Ensure loading is false and error is cleared
                 
                 // --- IMPORTANT: Set the selectedTest to the first failed test ID ---
                 if (formattedFailedTests.length > 0 && formattedFailedTests[0].id) {
                   console.log("Setting selected test to the first failed test:", formattedFailedTests[0].id);
                   setSelectedTest(formattedFailedTests[0].id);
                 } else {
                    console.warn("Could not determine a valid ID for the failed test to display.");
                    // Handle case where failed test ID is missing - maybe show a generic error?
                    setTestData(prev => ({ ...prev, isLoading: false, error: "Could not load details for the failed test." }));
                 }
                 
                 // Set step to intro AFTER setting selectedTest
                 setCurrentStep('intro');
                 
                 toast({
                   variant: "destructive",
                   title: "Aptitude Test Failed",
                   description: "You must pass all required aptitude tests to proceed.",
                   duration: 5000,
                 });

              } else {
                // --- ORIGINAL LOGIC: No incomplete AND no failed tests ---
                // No pending tests at all, redirect to dashboard
                console.log("No incomplete or failed tests found, redirecting to dashboard");
                toast({
                  title: "All Aptitude Tests Passed!",
                  description: "Redirecting to your dashboard.",
                  duration: 3000,
                });
                
                // Delay to show the toast
                setTimeout(() => {
                  localStorage.setItem('redirect_count', '0'); // Reset the redirect counter
                  router.push('/student/dashboard');
                }, 3000);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching pending assessments:', error);
        setTestData({
          ...testData,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load pending assessments. Please try again later.'
        });
        setCurrentStep('loading');
        
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load aptitude tests. Please try again later.",
        });
      }
    };

    fetchPendingAssessments();
    return cleanup;
  }, []);

  // Load test details when a test is selected
  useEffect(() => {
    if (selectedTest && currentStep === 'intro') {
     // Add this code to your useEffect where you're fetching assessment data
// Replace your existing fetchAssessment function with this improved version

const fetchAssessment = async () => {
    try {
      setTestData({
        ...testData,
        isLoading: true,
        error: null
      });
      
      // Debug: Log the exact value and type of selectedTest
      console.log("Selected test value:", selectedTest);
      console.log("Selected test type:", typeof selectedTest);
      
      // Ensure we have a valid string ID by extracting it properly
      let assessmentId = selectedTest;
      
      // Extra debugging to help identify what the value actually is
      if (typeof assessmentId === 'object' && assessmentId !== null) {
        console.log("Assessment ID is an object:", JSON.stringify(assessmentId));
        // Try to extract _id if it exists
        if ('_id' in assessmentId) {
          assessmentId = assessmentId._id;
          console.log("Extracted _id:", assessmentId);
        }
      }
      
      // Convert to string if it's not already
      if (typeof assessmentId !== 'string') {
        assessmentId = String(assessmentId);
        console.log("Converted to string:", assessmentId);
      }
      
      // Try to extract just the hex string if the value contains more information
      const hexMatch = assessmentId.match(/[0-9a-fA-F]{24}/);
      if (hexMatch) {
        assessmentId = hexMatch[0];
        console.log("Extracted hex string:", assessmentId);
      }
      
      // Final validation
      if (!/^[0-9a-fA-F]{24}$/.test(assessmentId)) {
        console.error("Invalid ID format after processing:", assessmentId);
        throw new Error(`Invalid assessment ID format: ${assessmentId}. Expected a 24-character hex string.`);
      }
      
      console.log("Fetching assessment details for ID:", assessmentId);
      const assessmentData = await getAssessmentById(assessmentId);
      console.log("Assessment data fetched:", assessmentData);
      
      setTestData({
        assessment: assessmentData,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching assessment:', error);
      setTestData({
        ...testData,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load assessment. Please try again later.'
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load test details. Please try again later.",
      });
    }
  };

      fetchAssessment();
    }
  }, [selectedTest, currentStep]);

  // Handle starting the test
  const handleStartTest = () => {
    if (testData.assessment) {
      setCurrentStep('test');
    }
  };

  // Handle test completion
  const handleTestComplete = (responses: Record<string, string>, results: any) => {
    setUserResponses(responses);
    setTestResults(results);
    setCurrentStep('results');
  };

  // Handle test assignment when there's no test yet
  const handleTestAssigned = (testId: string) => {
    setSelectedTest(testId);
    setCurrentStep('intro');
    
    toast({
      title: "Aptitude test assigned",
      description: "Your aptitude test has been generated successfully.",
    });
  };

  // Handle returning to dashboard after test
  const handleReturnToDashboard = () => {
    localStorage.setItem('redirect_count', '0'); // Reset the redirect counter
    router.push('/student/dashboard');
  };

  // Render appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 'loading':
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Loading Aptitude Test</CardTitle>
              <CardDescription className="text-center">
                Please wait while we prepare your aptitude test...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Checking your enrollment status and preparing your test...</p>
            </CardContent>
          </Card>
        );
      
      case 'no-test':
        return (
          <AssignAptitudeTest 
            pendingTests={pendingTests} 
            onTestAssigned={handleTestAssigned} 
            onError={(error) => {
              toast({
                variant: "destructive",
                title: "Error",
                description: error,
              });
            }}
          />
        );
        
      case 'intro':
        return (
          <TestIntroScreen 
            assessment={testData.assessment} 
            isLoading={testData.isLoading} 
            error={testData.error}
            onStartTest={handleStartTest}
          />
        );
        
      case 'test':
        return (
          <AptitudeTestComponent 
            assessment={testData.assessment!} 
            onComplete={handleTestComplete}
          />
        );
        
      case 'results':
        return (
          <TestResults 
            results={testResults} 
            assessment={testData.assessment}
            userResponses={userResponses}
            onReturn={handleReturnToDashboard}
          />
        );
        
      default:
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Error</CardTitle>
              <CardDescription className="text-center">
                An unexpected error occurred. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p>We encountered an unexpected state. Please refresh the page.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      {renderStep()}
    </div>
  );
}