// components/subject-pricing-form.tsx
"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format, parseISO } from "date-fns";
import { 
  SubjectPricing, 
  createSubjectPricing, 
  updateSubjectPricing 
} from "../hooks/use-subject-pricing";
import { Class } from "../hooks/use-classes";
import { Subject } from "../hooks/use-subjects";

interface SubjectPricingFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  pricing: SubjectPricing | null;
  onSuccess: (message: string) => void;
  onError: (error: Error | unknown) => void;
  classes: Class[];
  subjects: Subject[];
  selectedClassId?: string;
  onClassChange?: (classId: string) => void;
  classesLoading?: boolean;
}

// Form validation schema
const formSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  basePrice: z.coerce.number().min(0, "Price must be a positive number"),
  validFrom: z.date({ required_error: "Valid from date is required" }),
  validTo: z.date({ required_error: "Valid to date is required" }),
  isActive: z.boolean().default(true),
}).refine(data => data.validTo > data.validFrom, {
  message: "Valid to date must be after valid from date",
  path: ["validTo"],
});

type FormValues = z.infer<typeof formSchema>;

export function SubjectPricingForm({
  // Use destructuring with default values to prevent undefined props

  open,
  setOpen,
  pricing,
  onSuccess,
  onError,
  classes,
  subjects,
  selectedClassId,
  onClassChange,
  // Track loading state for classes
  classesLoading = false,
}: SubjectPricingFormProps) {
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with default values or existing pricing data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: selectedClassId || "",
      subjectId: "",
      basePrice: 0,
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 6)), // Default 6 months validity
      isActive: true,
    },
  });

  // Log props for debugging
  useEffect(() => {
    console.log('Form props:', { 
      open, 
      pricing, 
      classes: classes?.length || 0, 
      classItems: classes,
      subjects: subjects?.length || 0,
      selectedClassId,
      classesLoading
    });
  }, [open, pricing, classes, subjects, selectedClassId, classesLoading]);

  // Update form values when editing existing pricing
  useEffect(() => {
    if (pricing) {
      const classId = typeof pricing.classId === 'object' ? pricing.classId._id : pricing.classId;
      const subjectId = typeof pricing.subjectId === 'object' ? pricing.subjectId._id : pricing.subjectId;
      
      // Properly parse date strings to Date objects
      const parseDateString = (dateStr: string) => {
        try {
          // First try to parse as ISO string
          return parseISO(dateStr);
        } catch (e) {
          // If that fails, try alternative formats
          try {
            // Try parsing as YYYY-MM-DD
            const dateParts = dateStr.split('-');
            if (dateParts.length === 3) {
              return new Date(
                parseInt(dateParts[0]), 
                parseInt(dateParts[1]) - 1, // Month is 0-indexed in JS Date
                parseInt(dateParts[2])
              );
            }
            // Fall back to standard Date constructor
            return new Date(dateStr);
          } catch (e2) {
            console.error('Failed to parse date:', dateStr, e2);
            return new Date(); // Return current date as fallback
          }
        }
      };
      
      form.reset({
        classId,
        subjectId,
        basePrice: pricing.basePrice,
        validFrom: parseDateString(pricing.validFrom),
        validTo: parseDateString(pricing.validTo),
        isActive: pricing.isActive,
      });

      if (onClassChange) {
        onClassChange(classId);
      }
    } else {
      form.reset({
        classId: selectedClassId || "",
        subjectId: "",
        basePrice: 0,
        validFrom: new Date(),
        validTo: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        isActive: true,
      });
    }
  }, [pricing, form, selectedClassId, onClassChange]);

  // Filter subjects based on selected class
  useEffect(() => {
    const classId = form.watch("classId");
    if (classId) {
      const filtered = subjects.filter(subject => {
        const subjectClassId = typeof subject.classId === 'object' 
          ? subject.classId._id 
          : subject.classId;
        return subjectClassId === classId;
      });
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
    }
  }, [form.watch("classId"), subjects]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Check token availability
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found. Please login again.');
          onError(new Error('Authentication token is missing. Please login again.'));
          setIsLoading(false);
          return;
        }
        console.log('Token available:', !!token, 'Token length:', token.length);
      }
      
      console.log('API base URL:', apiClient.defaults.baseURL);
      
      // Format dates to YYYY-MM-DD format only
      const formattedValues = {
        ...values,
        validFrom: values.validFrom.toISOString().split('T')[0],  // YYYY-MM-DD format
        validTo: values.validTo.toISOString().split('T')[0],  // YYYY-MM-DD format
      };
      
      console.log('Form values on submit:', formattedValues);
      
      try {
        if (pricing) {
          // Update existing pricing
          console.log(`Updating subject pricing ID: ${pricing._id}`);
          const result = await updateSubjectPricing(pricing._id, formattedValues);
          console.log('Update result:', result);
          onSuccess("Pricing updated successfully");
        } else {
          // Create new pricing
          console.log('Creating new subject pricing');
          const result = await createSubjectPricing(formattedValues);
          console.log('Create result:', result);
          onSuccess("Pricing created successfully");
        }
        setOpen(false);
      } catch (apiError: any) {
        console.error('API operation error:', apiError);
        // Try a fallback with simpler date format if it might be a date format issue
        if (apiError.toString().includes('date') || apiError.toString().includes('Date')) {
          console.log('Trying fallback with ISO date format...');
          // Try alternative date format
          try {
            const isoDateFormat = {
              ...values,
              validFrom: values.validFrom.toISOString(),
              validTo: values.validTo.toISOString(),
            };
            
            if (pricing) {
              // Update
              await updateSubjectPricing(pricing._id, isoDateFormat);
              onSuccess("Pricing updated successfully with ISO date format");
            } else {
              // Create
              await createSubjectPricing(isoDateFormat);
              onSuccess("Pricing created successfully with ISO date format");
            }
            setOpen(false);
            return;
          } catch (fallbackError) {
            console.error('Fallback with ISO date format also failed:', fallbackError);
            // Continue to the original error
          }
        }
        throw apiError; // Re-throw the original error if fallback fails
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      // Log detailed error information if available
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        response: error?.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        request: error?.request ? 'Request sent but no response received' : 'Request setup failed',
        stack: error?.stack
      });
      
      // Format the error message to be more user-friendly
      let errorMessage = error.message;
      
      // Handle common error patterns
      if (errorMessage === '[object Object], [object Object]' && error.response?.data?.details?.message) {
        // Try to extract validation errors from the response details
        try {
          if (Array.isArray(error.response.data.details.message)) {
            // Format validation errors
            errorMessage = error.response.data.details.message
              .map((err: any) => {
                if (typeof err === 'object' && err.property && err.message) {
                  return `${err.property}: ${err.message}`;
                }
                return String(err);
              })
              .join('\n');
          } else if (typeof error.response.data.details.message === 'string') {
            errorMessage = error.response.data.details.message;
          } else {
            errorMessage = JSON.stringify(error.response.data.details.message);
          }
        } catch (e) {
          errorMessage = 'Validation error occurred. Please check form values.';
        }
      }
      
      onError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (value: string) => {
    console.log('Class selected:', value);
    form.setValue("classId", value);
    form.setValue("subjectId", ""); // Reset subject when class changes
    
    if (onClassChange) {
      onClassChange(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {pricing ? "Edit Subject Pricing" : "Create Subject Pricing"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  {classesLoading ? (
                    <div className="w-full h-10 rounded-md border border-input bg-muted flex items-center px-3">
                      Loading classes...
                    </div>
                  ) : (
                    <Select
                      disabled={isLoading}
                      onValueChange={(value) => {
                        console.log('Class selected:', value);
                        handleClassChange(value);
                      }}
                      value={field.value || ""}
                      defaultValue=""
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.length === 0 ? (
                          <SelectItem value="no-class" disabled>
                            No classes available
                          </SelectItem>
                        ) : (
                          classes.map((classItem) => {
                            console.log('Rendering class item:', classItem);
                            return (
                              <SelectItem key={classItem._id} value={classItem._id}>
                                {classItem.displayName || classItem.name}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {classes.length === 0 && !classesLoading && (
                    <div className="text-xs text-destructive mt-1">
                      No classes available. Please create classes first.
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    disabled={isLoading || !form.watch("classId")}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSubjects.length === 0 ? (
                        <SelectItem value="no-subject" disabled>
                          No subjects available for this class
                        </SelectItem>
                      ) : (
                        filteredSubjects.map((subject) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter base price"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid From</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid To</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < new Date("1900-01-01") || 
                            (form.getValues("validFrom") && date <= form.getValues("validFrom"))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Set whether this pricing is currently active
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : pricing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}