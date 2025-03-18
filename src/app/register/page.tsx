// app/register/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { registerUser, verifyOtp, resendOtp } from "@/lib/auth-api";
import { createProfile } from "@/lib/profile-api";
import { enrollStudent } from "@/lib/enrollment-api";
import { useClasses, useSubjects } from "@/hooks/use-classes";
import OtpInput from "./components/otp-input";

// Define parent registration schema
const parentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  country: z.string().min(1, "Please select a country"),
  city: z.string().min(1, "Please select a city"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

// Define OTP verification schema
const otpSchema = z.object({
  otp: z.string().length(5, "OTP must be 5 digits"),
});

// Define student details schema
const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), { 
    message: "Invalid date format" 
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  classId: z.string().min(1, "Please select a class"),
  subjects: z.array(z.object({ id: z.string() }))
    .min(1, "Please select at least one subject"),
});

// Define additional details schema
const additionalSchema = z.object({
  billingAddress: z.string().min(5, "Billing address must be at least 5 characters"),
  mailingAddress: z.string().min(5, "Mailing address must be at least 5 characters"),
  emergencyContact: z.string().min(10, "Emergency contact must be at least 10 characters"),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
});

// Registration steps
enum RegistrationStep {
  ParentDetails = 0,
  OtpVerification = 1,
  StudentDetails = 2,
  AdditionalDetails = 3,
  Complete = 4
}

export default function RegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.ParentDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [cooldown, setCooldown] = useState(0);
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [countryLoading, setCountryLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);

  // Use our hooks to fetch class and subject data
  const { classes, isLoading: classesLoading } = useClasses();
  const { subjects, isLoading: subjectsLoading } = useSubjects(selectedClass);

  // Form setup for parent registration
  const parentForm = useForm<z.infer<typeof parentSchema>>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      country: "",
      city: "",
      termsAccepted: false,
    },
  });

  // Form setup for OTP verification
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Form setup for student details
  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      dateOfBirth: "",
      gender: "male",
      classId: "",
      subjects: [],
    },
  });

  // Form setup for additional details
  const additionalForm = useForm<z.infer<typeof additionalSchema>>({
    resolver: zodResolver(additionalSchema),
    defaultValues: {
      billingAddress: "",
      mailingAddress: "",
      emergencyContact: "",
      bloodGroup: "",
      allergies: "",
    },
  });

  // Fetch countries from REST Countries API
  useEffect(() => {
    const fetchCountries = async () => {
      setCountryLoading(true);
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
        const data = await response.json();
        // Sort countries alphabetically
        const sortedCountries = data.sort((a: any, b: any) => 
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast.error('Failed to load countries');
      } finally {
        setCountryLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch cities when a country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setCityLoading(true);
      try {
        // Using GeoDB Cities API via RapidAPI
        // Note: In a production environment, this should be a server-side call
        const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${selectedCountry}/regions`, {
          headers: {
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // You should replace this with your own key
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
          }
        });
        const data = await response.json();
        
        // For demo purposes, if API call fails or no key, use dummy data
        let citiesData = data?.data || [];
        
        if (citiesData.length === 0) {
          // Fallback to dummy cities if API fails or returns empty
          citiesData = [
            { id: "1", name: "Karachi" },
            { id: "2", name: "Lahore" },
            { id: "3", name: "Islamabad" },
            { id: "5", name: "Rawalpindi" },
            { id: "4", name: "Peshawar" },
          ];
        }
        
        setCities(citiesData);
      } catch (error) {
        console.error('Error fetching cities:', error);
        // Fallback to dummy cities
        setCities([
          { id: "1", name: "Karachi" },
          { id: "2", name: "Lahore" },
          { id: "3", name: "Islamabad" },
          { id: "5", name: "Rawalpindi" },
          { id: "4", name: "Peshawar" },
        ]);
      } finally {
        setCityLoading(false);
      }
    };

    fetchCities();
  }, [selectedCountry]);

  // Cooldown effect for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    
    const timer = setTimeout(() => {
      setCooldown(cooldown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Handle parent registration
  const handleParentRegistration = async (data: z.infer<typeof parentSchema>) => {
    setIsLoading(true);
    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        type: "parent",
        roleId: "679cd2ec2b0f000ac3e9a147", // Replace with actual parent role ID
      });

      await createProfile(response.user._id, [
        { key: "phone", value: data.phone },
        { key: "country", value: data.country },
        { key: "city", value: data.city },
      ]);

      setUserId(response.user._id);
      toast.success("Registration successful! Please verify your email with the OTP.");
      
      // Move to OTP verification step
      setCurrentStep(RegistrationStep.OtpVerification);
    } catch (error) {
      console.error("Registration error:", error);
      // Error handled by API functions
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (data: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    try {
      await verifyOtp(userId, data.otp);
      toast.success("Email verified successfully!");
      
      // Move to student details step
      setCurrentStep(RegistrationStep.StudentDetails);
    } catch (error) {
      console.error("OTP verification error:", error);
      // Error handled by API functions
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resending OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await resendOtp(userId);
      toast.success("A new OTP has been sent to your email.");
      setCooldown(60); // Start 60-second cooldown
    } catch (error) {
      console.error("Resend OTP error:", error);
      // Error handled by API functions
    } finally {
      setIsLoading(false);
    }
  };

  // Handle student registration
  const handleStudentRegistration = async (data: z.infer<typeof studentSchema>) => {
    setIsLoading(true);
    try {
      // Register student
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        type: "student",
        roleId: "679cd2e82b0f000ac3e9a145", // Replace with actual student role ID
        isVerified: true, // Auto-verify the student
      });
      
      setStudentId(response.user._id);

      // Create student profile
      await createProfile(response.user._id, [
        { key: "dateOfBirth", value: data.dateOfBirth },
        { key: "gender", value: data.gender },
        { key: "classId", value: data.classId },
        { key: "parentId", value: userId }, // Link to parent
      ]);

      // Enroll student in selected subjects
      const subjectIds = data.subjects.map(subject => subject.id);
      await enrollStudent(response.user._id, data.classId, subjectIds);

      toast.success("Student registered successfully!");
      setCurrentStep(RegistrationStep.AdditionalDetails);
    } catch (error) {
      console.error("Student registration error:", error);
      // Error handled by API functions
    } finally {
      setIsLoading(false);
    }
  };

  // Handle additional details submission
  const handleAdditionalDetails = async (data: z.infer<typeof additionalSchema>) => {
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

      toast.success("Registration completed successfully!");
      setCurrentStep(RegistrationStep.Complete);
      
      // Redirect to login page after a delay
      setTimeout(() => {
        router.push("/login");
      }, 5000);
    } catch (error) {
      console.error("Failed to add additional details:", error);
      // Error handled by API functions
    } finally {
      setIsLoading(false);
    }
  };

  // Subject selection helpers
  const isSubjectSelected = (subjectId: string) => {
    return studentForm.getValues().subjects.some(subject => subject.id === subjectId);
  };

  const toggleSubject = (subjectId: string) => {
    const currentSubjects = studentForm.getValues().subjects;
    
    if (isSubjectSelected(subjectId)) {
      // Remove subject
      const updatedSubjects = currentSubjects.filter(subject => subject.id !== subjectId);
      studentForm.setValue("subjects", updatedSubjects);
    } else {
      // Add subject
      studentForm.setValue("subjects", [...currentSubjects, { id: subjectId }]);
    }
    
    // Manually trigger validation
    studentForm.trigger("subjects");
  };

  // Progress calculation
  const progressPercentage = (currentStep / 4) * 100;

  // Render completion step
  if (currentStep === RegistrationStep.Complete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-lg shadow-xl text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Registration Complete!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for registering! You will be redirected to the login page in a few seconds.
            </p>
            
            <Button 
              size="lg"
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex min-h-screen">
        {/* Left section with image */}
        <div className="hidden lg:block lg:w-1/2 bg-blue-600 relative">
          <div className="absolute inset-0 bg-blue-700 opacity-20"></div>
          <div className="absolute inset-0 flex flex-col justify-center p-12">
            <h1 className="text-4xl font-bold text-white mb-6">Join our Learning Management System</h1>
            <p className="text-xl text-white opacity-90 mb-8">
              Create an account to access our comprehensive learning platform and start your educational journey today.
            </p>
            <div className="flex space-x-4">
              <div className="w-3 h-3 rounded-full bg-white opacity-70"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-70"></div>
            </div>
          </div>
        </div>
        
        {/* Right section with form */}
        <div className="w-full lg:w-1/2 bg-white">
          <div className="max-w-2xl mx-auto p-6 sm:p-10 lg:p-12">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Step {currentStep + 1} of 4</h3>
              {currentStep === RegistrationStep.ParentDetails && (
                <h2 className="text-3xl font-bold mt-2">Parent Registration</h2>
              )}
              {currentStep === RegistrationStep.OtpVerification && (
                <h2 className="text-3xl font-bold mt-2">Verify Email</h2>
              )}
              {currentStep === RegistrationStep.StudentDetails && (
                <h2 className="text-3xl font-bold mt-2">Student Details</h2>
              )}
              {currentStep === RegistrationStep.AdditionalDetails && (
                <h2 className="text-3xl font-bold mt-2">Additional Information</h2>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Parent registration form */}
                {currentStep === RegistrationStep.ParentDetails && (
                  <Form {...parentForm}>
                    <form onSubmit={parentForm.handleSubmit(handleParentRegistration)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={parentForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={parentForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+1234567890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={parentForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={parentForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Must be at least 6 characters long
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={parentForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select
                                disabled={countryLoading || isLoading}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedCountry(value);
                                  // Clear city when country changes
                                  parentForm.setValue("city", "");
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countryLoading ? (
                                    <SelectItem value="loading" disabled>Loading countries...</SelectItem>
                                  ) : countries && countries.length > 0 ? (
                                    countries.map((country) => (
                                      <SelectItem key={country.cca2} value={country.cca2}>
                                        {country.name.common}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="none" disabled>No countries available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={parentForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <Select
                                disabled={cityLoading || !selectedCountry || isLoading}
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select city" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {!selectedCountry ? (
                                    <SelectItem value="select-country" disabled>Select a country first</SelectItem>
                                  ) : cityLoading ? (
                                    <SelectItem value="loading" disabled>Loading cities...</SelectItem>
                                  ) : cities && cities.length > 0 ? (
                                    cities.map((city) => (
                                      <SelectItem key={city.id || city.name} value={city.id || city.name}>
                                        {city.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="none" disabled>No cities available for this country</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={parentForm.control}
                        name="termsAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I accept the terms and conditions
                              </FormLabel>
                              <FormDescription>
                                You agree to our Terms of Service and Privacy Policy.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Continue
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
                
                {/* OTP verification form */}
                {currentStep === RegistrationStep.OtpVerification && (
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
                      <div className="text-gray-600 mb-6">
                        <p>We've sent a verification code to your email address. Please enter the 5-digit code below.</p>
                      </div>
                      
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <div className="flex justify-center">
                              <OtpInput
                                length={5}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isLoading}
                              />
                            </div>
                            <FormMessage className="text-center" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="text-center pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResendOtp}
                          disabled={cooldown > 0 || isLoading}
                        >
                          Resend OTP
                          {cooldown > 0 && ` (${cooldown}s)`}
                        </Button>
                      </div>
                      
                      <div className="flex gap-4 pt-6">
                        <Button 
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(RegistrationStep.ParentDetails)}
                          disabled={isLoading}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        
                        <Button 
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          // Fix: Watch form field value instead of using getValues() which doesn't update reactively
                          disabled={!otpForm.watch("otp") || otpForm.watch("otp").length !== 5 || isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              Verify & Continue
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
                
                {/* Student details form */}
                {currentStep === RegistrationStep.StudentDetails && (
                  <Form {...studentForm}>
                    <form onSubmit={studentForm.handleSubmit(handleStudentRegistration)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={studentForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={studentForm.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={studentForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="student@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={studentForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={studentForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={studentForm.control}
                          name="classId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class</FormLabel>
                              <Select
                                disabled={classesLoading || isLoading}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedClass(value);
                                  // Clear subjects when class changes
                                  studentForm.setValue("subjects", []);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {classesLoading ? (
                                    <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                                  ) : classes && classes.length > 0 ? (
                                    classes.map((classItem) => (
                                      <SelectItem key={classItem._id} value={classItem._id}>
                                        {classItem.displayName}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="none" disabled>No classes available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <FormLabel>Subjects</FormLabel>
                        <FormDescription>Select subjects for enrollment</FormDescription>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          {subjectsLoading ? (
                            <div className="col-span-2 flex items-center justify-center p-6 border border-dashed rounded-lg">
                              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                              <span>Loading subjects...</span>
                            </div>
                          ) : !selectedClass ? (
                            <div className="col-span-2 text-center p-6 text-gray-500 border border-dashed rounded-lg">
                              Please select a class first
                            </div>
                          ) : subjects && subjects.length > 0 ? (
                            subjects.map((subject) => (
                              <div
                                key={subject._id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                  isSubjectSelected(subject._id)
                                    ? "bg-blue-50 border-blue-600"
                                    : "hover:border-blue-300"
                                }`}
                                onClick={() => toggleSubject(subject._id)}
                              >
                                <div className="flex items-center">
                                  <div className={`w-4 h-4 mr-2 rounded-full border ${
                                    isSubjectSelected(subject._id) 
                                      ? "bg-blue-600 border-blue-600" 
                                      : "border-gray-300"
                                  }`}>
                                    {isSubjectSelected(subject._id) && (
                                      <div className="w-2 h-2 rounded-full bg-white mx-auto mt-[3px]" />
                                    )}
                                  </div>
                                  <div className="font-medium">{subject.displayName}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 text-center p-6 text-gray-500 border border-dashed rounded-lg">
                              No subjects available for this class
                            </div>
                          )}
                        </div>
                        
                        {studentForm.formState.errors.subjects && (
                          <p className="text-sm font-medium text-red-500 mt-2">
                            {studentForm.formState.errors.subjects.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-4 pt-6">
                        <Button 
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(RegistrationStep.OtpVerification)}
                          disabled={isLoading}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        
                        <Button 
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Continue
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
                
                {/* Additional details form */}
                {currentStep === RegistrationStep.AdditionalDetails && (
                  <Form {...additionalForm}>
                    <form onSubmit={additionalForm.handleSubmit(handleAdditionalDetails)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={additionalForm.control}
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
                          control={additionalForm.control}
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={additionalForm.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact</FormLabel>
                              <FormControl>
                                <Input placeholder="Name and phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={additionalForm.control}
                          name="bloodGroup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Group (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., A+, B-, O+" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={additionalForm.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies or Medical Conditions (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter allergies or medical conditions"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-4 pt-6">
                        <Button 
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(RegistrationStep.StudentDetails)}
                          disabled={isLoading}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        
                        <Button 
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Complete Registration"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </motion.div>
            </AnimatePresence>
            
            <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <Button 
                variant="link" 
                className="p-0 text-blue-600" 
                onClick={() => router.push("/login")}
              >
                Log in
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}