// page.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CalculatorIcon, Clock, History } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PricingCalculatorForm } from "./components/pricing-calculator-form";
import { PricingBreakdown } from "./components/pricing-breakdown";
import { SnapshotViewer } from "./components/snapshot-viewer";
import usePricingCalculator, { PricingRequest, PricingResult } from "./hooks/use-pricing-calculator";
import useStudents, { Student, getStudent, getStudentSiblings } from "./hooks/use-students";
import { useClasses, useSubjects, getSubjectsByClass } from "./hooks/use-classes-and-subjects";
import { Class, Subject } from "./hooks/use-classes-and-subjects";

export default function PricingCalculatorPage() {
  // State management
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [classSubjects, setClassSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSiblings, setStudentSiblings] = useState<Student[]>([]);
  const [isSnapshotViewerOpen, setIsSnapshotViewerOpen] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingSiblings, setIsLoadingSiblings] = useState(false);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);

  // Hooks
  const { students, isLoading: isStudentsLoading } = useStudents();
  const { classes, isLoading: isClassesLoading } = useClasses();
  const { 
    pricingResult, 
    isLoading: isCalculationLoading, 
    error: calculationError,
    calculate,
    getSnapshot,
    reset: resetCalculation
  } = usePricingCalculator();

  // Handle class selection
  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    setClassSubjects([]);
    
    if (classId) {
      setIsLoadingSubjects(true);
      try {
        const subjects = await getSubjectsByClass(classId);
        setClassSubjects(subjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects for the selected class");
      } finally {
        setIsLoadingSubjects(false);
      }
    }
  };

  // Handle student selection
  const handleStudentChange = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudent(null);
    setStudentSiblings([]);
    
    if (studentId) {
      // Fetch student details
      setIsLoadingStudent(true);
      try {
        const student = await getStudent(studentId);
        setSelectedStudent(student);
      } catch (error) {
        console.error("Error fetching student:", error);
        toast.error("Failed to load student details");
      } finally {
        setIsLoadingStudent(false);
      }
      
      // Fetch student siblings
      setIsLoadingSiblings(true);
      try {
        const siblings = await getStudentSiblings(studentId);
        setStudentSiblings(siblings);
      } catch (error) {
        console.error("Error fetching siblings:", error);
        toast.error("Failed to load student siblings");
      } finally {
        setIsLoadingSiblings(false);
      }
    }
  };

  // Handle pricing calculation
  const handleCalculate = async (data: PricingRequest) => {
    try {
      await calculate(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to calculate pricing";
      toast.error(errorMessage);
    }
  };

  // Handle snapshot loading
  const handleLoadSnapshot = async (snapshotId: string) => {
    try {
      await getSnapshot(snapshotId);
      toast.success("Pricing snapshot loaded successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load pricing snapshot";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Handle errors from calculation
  useEffect(() => {
    if (calculationError) {
      toast.error(calculationError.message);
    }
  }, [calculationError]);

  // Handle create invoice (placeholder for now)
  const handleCreateInvoice = (snapshotId: string) => {
    toast.info(`Creating invoice from snapshot: ${snapshotId}`);
    // Navigate to invoice creation page with the snapshot ID
    // TODO: Implement invoice creation
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Calculator</h1>
          <p className="text-muted-foreground">
            Calculate subject pricing with applicable discounts and taxes
          </p>
        </div>
        <Button onClick={() => setIsSnapshotViewerOpen(true)} variant="outline">
          <History className="mr-2 h-4 w-4" />
          Load Saved Calculation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <div>
          <PricingCalculatorForm
            students={students}
            classes={classes}
            subjects={classSubjects}
            siblings={studentSiblings}
            isLoading={isCalculationLoading}
            isStudentsLoading={isStudentsLoading}
            isClassesLoading={isClassesLoading}
            isSubjectsLoading={isLoadingSubjects}
            isSiblingsLoading={isLoadingSiblings}
            onSelectClass={handleClassChange}
            onSelectStudent={handleStudentChange}
            onCalculate={handleCalculate}
          />

          {/* Recent Calculations (placeholder) */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Recent Calculations</CardTitle>
              <CardDescription>
                Your recently calculated pricing snapshots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-6">
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No recent calculations found</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Results */}
        <div>
          {!pricingResult ? (
            <Card className="h-full flex flex-col justify-center items-center p-6">
              <CalculatorIcon className="h-16 w-16 mb-6 text-muted-foreground opacity-20" />
              <CardTitle className="text-xl mb-2 text-center">No Active Calculation</CardTitle>
              <CardDescription className="text-center max-w-md">
                Use the calculator on the left to calculate pricing for a student, or load a previously saved calculation.
              </CardDescription>
            </Card>
          ) : (
            <PricingBreakdown
              result={pricingResult}
              student={selectedStudent}
              subjects={classSubjects}
              siblings={studentSiblings}
              onCreateInvoice={handleCreateInvoice}
            />
          )}
        </div>
      </div>

      {/* Snapshot Viewer Dialog */}
      <SnapshotViewer
        isOpen={isSnapshotViewerOpen}
        setIsOpen={setIsSnapshotViewerOpen}
        onLoad={handleLoadSnapshot}
        isLoading={isCalculationLoading}
      />
    </div>
  );
}