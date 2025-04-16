// app/register/components/otp-verification-form.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface OtpVerificationFormProps {
  onVerify: (otp: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
  isLoading: boolean;
}

export function OtpVerificationForm({
  onVerify,
  onResendOtp,
  isLoading
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
  }, []);

  // Handle cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    
    const timer = setTimeout(() => {
      setCooldown(cooldown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleOtpChange = (index: number, value: string) => {
    // Allow only digits
    if (!/^\d*$/.test(value)) return;

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if current input has a value
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // Check if pasted content is a valid OTP (5 digits)
    if (/^\d{5}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      
      // Focus the last input
      inputRefs.current[4]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 5) return;
    
    await onVerify(otpString);
  };

  const handleResendOtp = async () => {
    await onResendOtp();
    setCooldown(60); // Start 60-second cooldown
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification code to your email. Please enter it below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold"
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <Button 
            onClick={handleVerify} 
            disabled={otp.join("").length !== 5 || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center">
          Didn't receive the code?{" "}
          <Button
            variant="link"
            onClick={handleResendOtp}
            disabled={cooldown > 0 || isLoading}
            className="p-0"
          >
            Resend OTP
            {cooldown > 0 && ` (${cooldown}s)`}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}