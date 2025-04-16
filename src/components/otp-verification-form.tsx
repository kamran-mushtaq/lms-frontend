"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  otpVerificationSchema,
  OtpVerificationFormValues
} from "@/lib/validations/register";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Icons } from "@/components/icons";

interface OtpVerificationFormProps
  extends React.ComponentPropsWithoutRef<"div"> {
  userId?: string;
}

export function OtpVerificationForm({
  className,
  userId,
  ...props
}: OtpVerificationFormProps) {
  const router = useRouter();
  const { verifyOtp, isLoading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const form = useForm<OtpVerificationFormValues>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: ""
    }
  });

  // Redirect to appropriate page if already logged in and verified
  useEffect(() => {
    if (user && user.isVerified) {
      if (user.type === "parent") {
        router.push("/add-student");
      } else {
        router.push(`/${user.type}/dashboard`);
      }
    }
  }, [user, router]);

  // If userId is not provided, check if we can get it from the user
  const effectiveUserId = userId || (user?._id ? user._id : null);

  // Check that we have a user ID
  useEffect(() => {
    if (!effectiveUserId) {
      setError("User ID is missing. Please try registering again.");
    } else {
      setError(null);
    }
  }, [effectiveUserId]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (values: OtpVerificationFormValues) => {
    if (!effectiveUserId) {
      setError("User ID is missing. Please try registering again.");
      return;
    }

    setError(null);
    try {
      const success = await verifyOtp(effectiveUserId, values.otp);

      if (success) {
        toast.success("OTP verified successfully! You are now logged in.");
        // Redirect to add student page after verification
        router.push("/add-student");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(error.message || "Failed to verify OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!effectiveUserId || resendCooldown > 0) return;

    try {
      await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/users/resend-otp/${effectiveUserId}`
      );
      toast.success("A new OTP has been sent to your email and WhatsApp.");

      // Set a cooldown period before allowing another resend
      setResendCooldown(60); // 60-second cooldown
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    }
  };

  if (!effectiveUserId) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Icons.warning className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Invalid Verification Link</h1>
          <p className="text-balance text-sm text-muted-foreground">
            We couldn't find the user ID needed for verification. Please try
            registering again.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/register">Back to Registration</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-balance text-sm text-muted-foreground">
          We've sent a verification code to your email address and WhatsApp number.
          Please enter it below.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your verification code"
                    {...field}
                    autoComplete="one-time-code"
                    className="text-center text-lg tracking-widest"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Didn&apos;t receive the code via email or WhatsApp?
        </p>
        <Button
          variant="outline"
          onClick={handleResendOtp}
          disabled={resendCooldown > 0}
        >
          {resendCooldown > 0
            ? `Resend Code (${resendCooldown}s)`
            : "Resend Code"}
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <Link
          href="/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to Registration
        </Link>
      </div>
    </div>
  );
}
