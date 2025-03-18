// app/register/components/otp-input.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ 
  length, 
  value, 
  onChange, 
  disabled = false
}) => {
  const [otp, setOtp] = useState<string[]>(value.split('').concat(Array(length - value.length).fill('')));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Update internal state when value prop changes
  useEffect(() => {
    setOtp(value.split('').concat(Array(length - value.length).fill('')));
  }, [value, length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Only accept digits
    if (!/^\d*$/.test(val)) return;
    
    // Take only the last character if multiple are somehow pasted/entered
    const digit = val.slice(-1);
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    
    // Notify parent component
    onChange(newOtp.join(''));
    
    // Auto-focus next input if we entered a digit
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Move to next input on right arrow
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Move to previous input on left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // Check if pasted content is all digits and matches expected length
    if (new RegExp(`^\\d{1,${length}}$`).test(pastedData)) {
      const digits = pastedData.split('').slice(0, length);
      const newOtp = [...Array(length).fill('')];
      
      digits.forEach((digit, idx) => {
        newOtp[idx] = digit;
      });
      
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus the next empty input or the last input if all are filled
      const nextEmptyIndex = digits.length < length ? digits.length : length - 1;
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus
    e.target.select();
  };

  return (
    <div className="flex justify-center space-x-2">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={handleFocus}
          className="w-12 h-14 text-center text-xl font-semibold"
          disabled={disabled}
          autoFocus={index === 0 && !disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;