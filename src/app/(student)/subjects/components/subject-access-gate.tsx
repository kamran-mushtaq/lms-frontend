// src/app/(student)/subjects/components/subject-access-gate.tsx
import { ReactNode, useState } from "react";
import { AlertCircle, CreditCard, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useSubjectAccess } from "../hooks/use-subject-access";

interface SubjectAccessGateProps {
  studentId: string;
  subjectId: string;
  subjectName: string;
  children: ReactNode;
  onTakeAptitudeTest: () => void;
  onMakePayment: () => void;
}

export function SubjectAccessGate({
  studentId,
  subjectId,
  subjectName,
  children,
  onTakeAptitudeTest,
  onMakePayment
}: SubjectAccessGateProps) {
  const { access, isLoading } = useSubjectAccess(studentId, subjectId);
  const [testInfoOpen, setTestInfoOpen] = useState(false);
  const [paymentInfoOpen, setPaymentInfoOpen] = useState(false);

  // If still loading, show a loading placeholder
  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center py-12">
        <div className="text-center p-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access to {subjectName}...</p>
        </div>
      </Card>
    );
  }

  // If user has access, render the children
  if (access?.hasAccess) {
    return <>{children}</>;
  }

  // If user doesn't have access, show appropriate message based on reason
  const requirements = access?.requirements || {};
  
  // Check if aptitude test is required but not passed
  const needsAptitudeTest = requirements.aptitudeTestRequired && !requirements.aptitudeTestPassed;
  
  // Check if payment is required but not completed
  const needsPayment = requirements.paymentRequired && !requirements.paymentCompleted;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          Access Required for {subjectName}
        </CardTitle>
        <CardDescription>
          {access?.reason || "You need to fulfill requirements to access this subject"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {needsAptitudeTest && (
            <div className="flex items-start p-4 border rounded-lg bg-amber-50">
              <FileText className="h-6 w-6 mr-3 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Aptitude Test Required</h3>
                <p className="text-sm text-muted-foreground">
                  You need to pass an aptitude test to access this subject.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setTestInfoOpen(true)}
                >
                  Learn More
                </Button>
              </div>
            </div>
          )}
          
          {needsPayment && (
            <div className="flex items-start p-4 border rounded-lg bg-amber-50">
              <CreditCard className="h-6 w-6 mr-3 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Payment Required</h3>
                <p className="text-sm text-muted-foreground">
                  This subject requires payment to access.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setPaymentInfoOpen(true)}
                >
                  View Payment Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        {needsAptitudeTest && (
          <Button onClick={onTakeAptitudeTest}>
            Take Aptitude Test
          </Button>
        )}
        
        {needsPayment && (
          <Button onClick={onMakePayment}>
            Make Payment
          </Button>
        )}
      </CardFooter>
      
      {/* Aptitude Test Dialog */}
      <Dialog open={testInfoOpen} onOpenChange={setTestInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About the Aptitude Test</DialogTitle>
            <DialogDescription>
              This aptitude test helps determine your readiness for the subject material.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Test Details:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                <li>Duration: 30 minutes</li>
                <li>Format: Multiple choice questions</li>
                <li>Passing score: 60%</li>
                <li>You can retake the test if needed</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Preparation Tips:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                <li>Review basic concepts in the subject area</li>
                <li>Ensure you have a stable internet connection</li>
                <li>Allow for uninterrupted time to complete the test</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestInfoOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setTestInfoOpen(false);
              onTakeAptitudeTest();
            }}>
              Start Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={paymentInfoOpen} onOpenChange={setPaymentInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Information</DialogTitle>
            <DialogDescription>
              Complete the payment to gain access to {subjectName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{subjectName} Access</h4>
                  <p className="text-sm text-muted-foreground">Full course access for 12 months</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$49.99</p>
                </div>
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>$49.99</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-3 border rounded-md bg-green-50 text-green-800">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
              <p className="text-sm">Secure payment processing</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentInfoOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setPaymentInfoOpen(false);
              onMakePayment();
            }}>
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}