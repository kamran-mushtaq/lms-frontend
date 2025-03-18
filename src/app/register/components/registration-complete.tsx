// app/register/components/registration-complete.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface RegistrationCompleteProps {
  parent?: any;
  student?: any;
}

export function RegistrationComplete({ parent, student }: RegistrationCompleteProps) {
  const router = useRouter();

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl">Registration Complete!</CardTitle>
        <CardDescription>
          You have successfully registered and enrolled a student.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <h3 className="font-medium mb-2">Registration Details</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-medium">Parent Name:</span> {parent?.name || "Not provided"}
            </li>
            <li>
              <span className="font-medium">Parent Email:</span> {parent?.email || "Not provided"}
            </li>
            <li>
              <span className="font-medium">Student Name:</span> {student?.name || "Not provided"}
            </li>
            <li>
              <span className="font-medium">Student Email:</span> {student?.email || "Not provided"}
            </li>
          </ul>
        </div>
        
        <p className="text-center text-muted-foreground">
          You will be redirected to the login page shortly. Please use your credentials to log in.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </CardFooter>
    </Card>
  );
}