// app/register/components/parent-registration-form.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth-api";
import { createProfile } from "@/lib/profile-api";
import { useAttributeTypeByName, useCountries, useCities } from "@/hooks/use-attributes";
import { toast } from "sonner";

// Validation schema for parent registration
const parentRegistrationSchema = z.object({
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

type ParentRegistrationFormValues = z.infer<typeof parentRegistrationSchema>;

interface ParentRegistrationFormProps {
  onComplete: (user: any, formData: ParentRegistrationFormValues) => void;
}

export function ParentRegistrationForm({ onComplete }: ParentRegistrationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  
  // Use our hooks to fetch attribute data
  const { countries, isLoading: countriesLoading } = useCountries();
  const { cities, isLoading: citiesLoading } = useCities(selectedCountry);

  // Form setup
  const form = useForm<ParentRegistrationFormValues>({
    resolver: zodResolver(parentRegistrationSchema),
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

  const onSubmit = async (data: ParentRegistrationFormValues) => {
    setIsLoading(true);
    try {
      // Register parent user
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        type: "parent", // Using "parent" as specified in API
        roleId: "507f1f77bcf86cd799439011", // Assuming this is the parent role ID - replace with actual role ID
      });

      // Create parent profile
      await createProfile(response.user._id, [
        { key: "phone", value: data.phone },
        { key: "country", value: data.country },
        { key: "city", value: data.city },
      ]);

      toast.success("Registration successful! Please verify your email with the OTP.");
      
      // Signal completion and pass user data to parent component
      onComplete(response.user, data);
    } catch (error) {
      console.error("Registration error:", error);
      // Error is already handled by our API functions
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Parent Registration</CardTitle>
        <CardDescription>
          Create an account as a guardian to enroll students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
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
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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

            <FormField
              control={form.control}
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

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    disabled={countriesLoading || isLoading}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCountry(value);
                      // Clear city when country changes
                      form.setValue("city", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countriesLoading ? (
                        <SelectItem value="loading" disabled>Loading countries...</SelectItem>
                      ) : countries && countries.length > 0 ? (
                        countries.map((country) => (
                          <SelectItem key={country._id} value={country._id}>
                            {country.title}
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
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select
                    disabled={citiesLoading || !selectedCountry || isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!selectedCountry ? (
                        <SelectItem value="select-country" disabled>Select a country first</SelectItem>
                      ) : citiesLoading ? (
                        <SelectItem value="loading" disabled>Loading cities...</SelectItem>
                      ) : cities && cities.length > 0 ? (
                        cities.map((city) => (
                          <SelectItem key={city._id} value={city._id}>
                            {city.title}
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

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Button variant="link" className="p-0" onClick={() => router.push("/login")}>
            Login
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}