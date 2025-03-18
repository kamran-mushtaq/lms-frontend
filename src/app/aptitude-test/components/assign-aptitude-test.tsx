// app/aptitude-test/components/assign-aptitude-test.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, School, BookOpen, Brain } from "lucide-react";
import { assignAptitudeTests } from "../api/assessment-api";

interface AssignAptitudeTestProps {
  pendingTests: any[];
  onTestAssigned: (testId: string) => void;
  onError: (error: string) => void;
}

export function AssignAptitudeTest({ pendingTests, onTestAssigned, onError }: AssignAptitudeTestProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  
  const handleAssignTests = async () => {
    try {
      setIsAssigning(true);
      
      // Get user ID from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        onError('User information not found. Please log in again.');
        return;
      }
      
      const user = JSON.parse(storedUser);
      const studentId = user._id;
      
      // Call API to assign tests
      const assignedTests = await assignAptitudeTests(studentId);
      console.log('Assigned tests:', assignedTests);
      
      // Check if any tests were assigned
      if (Object.keys(assignedTests).length === 0) {
        onError('No aptitude tests could be assigned. Please contact support.');
        setIsAssigning(false);
        return;
      }
      
      // Get the first assigned test ID
      const firstAssignedTestId = Object.values(assignedTests)[0];
      onTestAssigned(firstAssignedTestId as string);
      
    } catch (error) {
      console.error('Error assigning aptitude tests:', error);
      onError('Failed to assign aptitude tests. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto rounded-full bg-primary/10 p-4 mb-4">
          <Brain className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Aptitude Test Required</CardTitle>
        <CardDescription>
          You need to take an aptitude test before accessing course materials.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="font-medium flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            Why an Aptitude Test?
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Aptitude tests help us understand your current knowledge level and ensure you're placed
            in the appropriate learning path. This ensures your learning experience is optimized for your needs.
          </p>
        </div>
        
        {pendingTests.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Your Pending Tests
            </h3>
            <div className="space-y-2">
              {pendingTests.map((test, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div>
                    <p className="font-medium">{test.name || "Aptitude Test"}</p>
                    {test.subjectName && (
                      <p className="text-sm text-muted-foreground">Subject: {test.subjectName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="rounded-lg border p-4 bg-primary/5">
          <h3 className="font-medium">Before You Begin:</h3>
          <ul className="list-disc list-inside text-sm space-y-1 mt-2">
            <li>The test will be generated specifically for your enrolled class and subjects</li>
            <li>Make sure you have a quiet environment with no distractions</li>
            <li>Allocate sufficient time to complete the test without interruptions</li>
            <li>You'll need to achieve the minimum passing score to access course materials</li>
          </ul>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-center p-6">
        <Button 
          onClick={handleAssignTests} 
          disabled={isAssigning}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isAssigning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing Your Test...
            </>
          ) : (
            "Generate My Aptitude Test"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}