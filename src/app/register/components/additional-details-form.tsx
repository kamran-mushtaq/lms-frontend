// app/register/components/additional-details-form.tsx
"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createProfile } from "@/lib/profile-api";
import { enrollStudent } from "@/lib/enrollment-api";
import { toast } from "sonner";

// Define the schema for additional student details
const additionalDetailsSchema = z.object({
  billingAddress: z.string().min(5, "Billing address must be at least 5 characters"),
  mailingAddress: z.string().min(5, "Mailing address must be at least 5 characters"),
  emergencyContact: z.string().min(10, "Emergency contact must be at least 10 characters"),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
});

type AdditionalDetailsFormValues = z.infer<typeof additionalDetailsSchema>;

interface AdditionalDetailsFormProps {
  studentId: string;
  onComplete: () => void;
}

export function AdditionalDetailsForm({ studentId, onComplete }: AdditionalDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Form setup
  const form = useForm<AdditionalDetailsFormValues>({
    resolver: zodResolver(additionalDetailsSchema),
    defaultValues: {
      billingAddress: "",
      mailingAddress: "",
      emergencyContact: "",
      bloodGroup: "",
      allergies: "",
    },
  });

  const onSubmit = async (data: AdditionalDetailsFormValues) => {
    setIsLoading(true);
    try {
      // Update student profile with additional details
      await createProfile(studentId, [
        { key: "billingAddress", value: data.billingAddress },
        { key: "mailingAddress", value: data.mailingAddress },
        { key: "emergencyContact", value: data.emergencyContact },
        ...(data.bloodGroup ? [{ key: "bloodGroup", value: data.bloodGroup }] : []),
        ...(data.allergies ? [{ key: "allergies", value: data.allergies }] : []),
      ]);

      // Call the API to assign aptitude tests
      try {
        await fetch(`/api/enrollment/assign-tests/${studentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error("Failed to assign aptitude tests:", error);
        // Non-critical error, continue with registration
      }

      toast.success("Student registration completed successfully!");
      
      onComplete();
    } catch (error) {
      console.error("Failed to add additional details:", error);
      // Error already handled by API functions
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Additional Student Details</CardTitle>
        <CardDescription>
          Please provide additional information for the student
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="billingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter billing address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mailingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mailing Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter mailing address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter emergency contact information" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name and phone number of an emergency contact
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter blood group (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any allergies or medical conditions (optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Registration...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}