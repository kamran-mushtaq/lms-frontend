// app/aptitude-test/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, Shield, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { 
  checkStudentAptitudeTestRequired, 
  getPendingAssessments,
  getAssessmentById,
  getStudentEnrollments,
  getStudentAssessmentResults
} from "./api/assessment-api";
import { AssignAptitudeTest } from "./components/assign-aptitude-test";
import { AptitudeTestComponent } from "./components/aptitude-test";
import { TestResults } from "./components/test-results";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function AptitudeTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pendingTests, setPendingTests] = useState<any[]>([]);
  const [completedTests, setCompletedTests] = useState<any[]>([]);
  const [hasExistingAssignedTests, setHasExistingAssignedTests] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [currentTest, setCurrentTest] = useState<any>(null);
  const [testResponses, setTestResponses] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<any>(null);
  
  const [view, setView] = useState<'list' | 'test' | 'results'>('list');
  const [activeTab, setActiveTab] = useState<string>("pending");
  
  // Load user data and check aptitude test requirements
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    loadAptitudeTestData();
  }, []);
  
  // Load aptitude test data including both pending and completed tests
  const loadAptitudeTestData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/login');
        return;
      }
      
      const user = JSON.parse(storedUser);
      const studentId = user._id;
      
      // Check if student has any pending aptitude tests
      const checkResult = await checkStudentAptitudeTestRequired(studentId);
      
      // Get enrollments that need aptitude tests
      const enrollments = await getStudentEnrollments(studentId, {
        isEnrolled: true,
        aptitudeTestPassed: false
      });
      
      console.log("Loading aptitude test data:", {
        checkResult,
        enrollments
      });
      
      // If test is not required, no need to redirect - just show completed tests
      if (!checkResult.required && (!enrollments || enrollments.length === 0)) {
        console.log("No aptitude tests required");
        // Log this for debugging
        localStorage.setItem('aptitude_redirect_log', JSON.stringify({
          timestamp: new Date().toISOString(),
          reason: 'No aptitude tests required or already passed them all'
        }));
        
        // Instead of redirecting, just load completed tests and stay on this page
        // Set activeTab to "completed" if there are no pending tests
        setActiveTab("completed");
      }
      
      // Get detailed pending assessments
      const pendingResult = await getPendingAssessments(studentId);
      setPendingTests(pendingResult.pendingTests.filter((test: any) => test.type === 'aptitude'));
      
      // Check if there's an assigned test with an ID already
      const existingTest = pendingResult.pendingTests.find(
        (test: any) => test.type === 'aptitude' && test.id
      );
      
      if (existingTest && existingTest.id) {
        setHasExistingAssignedTests(true);
        setCurrentTestId(existingTest.id);
      } else {
        setHasExistingAssignedTests(false);
      }
      
      // Check for existing aptitude tests that have been started but not completed
      const savedTestId = localStorage.getItem('current_aptitude_test_id');
      if (savedTestId) {
        setCurrentTestId(savedTestId);
        await loadTestById(savedTestId);
      }
      
      // Load completed aptitude tests
      try {
        const completedResults = await getStudentAssessmentResults(studentId, {
          type: 'aptitude'
        });
        
        console.log("Completed test results:", completedResults);
        
        if (completedResults && Array.isArray(completedResults)) {
          // Sort by date completed (newest first)
          const sortedResults = [...completedResults].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          setCompletedTests(sortedResults);
        }
      } catch (error) {
        console.error("Error loading completed tests:", error);
        // Don't set error state for this, as pending tests may still load fine
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading aptitude test data:', error);
      setError('Failed to load aptitude test data. Please try again later.');
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load aptitude test data. Please try again later.",
      });
    }
  };
  
  // Load a specific test by ID
 // Improved function to load test by ID with better error handling
const loadTestById = async (testId: string) => {
  try {
    setLoading(true);
    console.log(`Attempting to load test with ID: ${testId}`);
    
    // Validate testId format
    if (!testId || testId.length !== 24) {
      console.error(`Invalid test ID format: ${testId}`);
      throw new Error('Invalid test ID format');
    }
    
    // Add authorization header check
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('You must be logged in to take this test');
    }
    
    // Make the API request with more detailed logging
    console.log(`Making API request to: /assessments/${testId}`);
    const testData = await getAssessmentById(testId);
    
    // Validate the response data
    if (!testData || !testData._id) {
      console.error('Received invalid test data', testData);
      throw new Error('The test data received is invalid or incomplete');
    }
    
    console.log('Test data loaded successfully:', {
      testId: testData._id,
      title: testData.title,
      questionCount: testData.questions?.length || 0
    });
    
    // Save the test data and update the view
    setCurrentTest(testData);
    localStorage.setItem('current_aptitude_test_id', testId);
    setView('test');
    setLoading(false);
  } catch (error) {
    console.error('Error loading test:', error);
    
    // More specific error messages based on the error type
    let errorMessage = 'Failed to load test. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('Network Error')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Test not found. It may have been removed or is not available.';
      } else if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to access this test.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        // Use the actual error message for other cases
        errorMessage = error.message;
      }
    }
    
    setError(errorMessage);
    setLoading(false);
    
    toast({
      variant: "destructive",
      title: "Error Loading Test",
      description: errorMessage,
    });
    
    // Provide debugging information in console
    console.log('Debug information:');
    console.log('- Test ID:', testId);
    console.log('- Current user:', localStorage.getItem('user'));
    console.log('- Token exists:', !!localStorage.getItem('token'));
  }
};
  
  // Handle when test is assigned
  const handleTestAssigned = async (testId: string) => {
    console.log('Test assigned:', testId);
    await loadTestById(testId);
  };
  
  // Handle when test is completed
  const handleTestComplete = (responses: Record<string, string>, results: any) => {
    console.log('Test completed with results:', results);
    
    setTestResponses(responses);
    setTestResults(results);
    setView('results');
    
    // Clear the current test ID from localStorage
    localStorage.removeItem('current_aptitude_test_id');
    // Clear any aptitude test redirection timestamp to allow future redirects if needed
    localStorage.removeItem('aptitude_redirect_timestamp');
    
    // Reset current test data
    setCurrentTest(null);
    setCurrentTestId(null);
    
    // Show success message
    toast({
      title: "Test Submitted",
      description: "Your aptitude test has been submitted successfully.",
    });
    
    // Add the newly completed test to completedTests
    if (results) {
      setCompletedTests(prev => [results, ...prev]);
    }
  };
  
  // Handle going back to dashboard
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };
  
  // Handle taking another test
  const handleTakeAnotherTest = () => {
    // Reset current test and results
    setCurrentTest(null);
    setCurrentTestId(null);
    setTestResults(null);
    setTestResponses({});
    
    // Reload test data
    loadAptitudeTestData();
    
    // Go back to list view
    setView('list');
    setActiveTab("pending");
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };
  
  // Calculate relative time
  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Loading Aptitude Tests</h2>
        <p className="text-muted-foreground">Please wait while we prepare your assessments...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error</CardTitle>
            <CardDescription className="text-center">
              We encountered an error while loading your aptitude tests.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-center mb-4">{error}</p>
            <div className="flex gap-4">
              <Button onClick={() => loadAptitudeTestData()}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show test view
  if (view === 'test' && currentTest) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Aptitude Test</h1>
          <p className="text-muted-foreground">
            Complete this assessment to unlock your learning materials.
          </p>
        </div>
        
        <AptitudeTestComponent 
          assessment={currentTest}
          onComplete={handleTestComplete}
        />
      </div>
    );
  }
  
  // Show results view
  if (view === 'results' && testResults) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Test Results</h1>
          <p className="text-muted-foreground">
            Review your aptitude test results below.
          </p>
        </div>
        
        <TestResults
          results={testResults}
          assessment={currentTest}
          userResponses={testResponses}
          onReturn={handleGoToDashboard}
        />
      </div>
    );
  }
  
  // Default view - list of pending tests or assign new test
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Aptitude Tests</h1>
        <p className="text-muted-foreground">
          Complete these tests to access your course materials.
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingTests.length === 0 && !hasExistingAssignedTests ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Assign Aptitude Test
                </CardTitle>
                <CardDescription>
                  You need to take an aptitude test for each subject you're enrolled in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssignAptitudeTest 
                  pendingTests={[]} 
                  onTestAssigned={handleTestAssigned}
                  onError={(message) => {
                    setError(message);
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: message,
                    });
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingTests.map((test, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{test.name || "Aptitude Test"}</CardTitle>
                    <CardDescription>
                      {test.subjectName ? `Subject: ${test.subjectName}` : "General aptitude assessment"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          This test will assess your knowledge and skills in this subject area.
                        </p>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm">Required to unlock course content</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => test.id ? loadTestById(test.id) : handleTestAssigned(test.id)}
                        disabled={!test.id}
                      >
                        {test.id ? "Start Test" : "Generate Test"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* If there are no specific pending tests but we need to show the assignment form */}
              {pendingTests.length === 0 && hasExistingAssignedTests && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generate New Aptitude Test</CardTitle>
                    <CardDescription>
                      Generate a new aptitude test for your enrolled subjects.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssignAptitudeTest 
                      pendingTests={[]} 
                      onTestAssigned={handleTestAssigned}
                      onError={(message) => {
                        setError(message);
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: message,
                        });
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tests</CardTitle>
              <CardDescription>
                Your aptitude test history and results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedTests.length > 0 ? (
                <div className="space-y-4">
                  {completedTests.map((test, index) => (
                    <div 
                      key={index} 
                      className="p-4 border rounded-lg flex flex-col sm:flex-row items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">
                            {(test.assessmentId && typeof test.assessmentId === 'object' && test.assessmentId.title) || 
                            test.title || "Aptitude Test"}
                          </h3>
                          <Badge variant={test.percentageScore >= (test.passingScore || 60) ? "default" : "destructive"}>
                            {test.percentageScore >= (test.passingScore || 60) ? "Passed" : "Failed"}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          {test.classId && typeof test.classId === 'object' && test.classId.displayName && 
                          test.subjectId && typeof test.subjectId === 'object' && test.subjectId.displayName ? (
                            <span>
                              {test.classId.displayName} - {test.subjectId.displayName}
                            </span>
                          ) : (
                            <span>Aptitude Assessment</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Score:</span>
                            <span>{Math.round(test.percentageScore || 0)}%</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 opacity-70" />
                            <span className="text-muted-foreground">{getRelativeTime(test.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {test.percentageScore >= (test.passingScore || 60) ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-5 w-5 mr-1.5" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Handle retry by generating a new test
                              handleTakeAnotherTest();
                            }}
                          >
                            Retry Test
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    You haven't completed any aptitude tests yet.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setActiveTab("pending");
                    }}
                  >
                    Take Your First Test
                  </Button>
                </div>
              )}
              
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}