"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { StudentRegistrationForm } from "@/components/student-registration-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function AddStudentPage() {
  const { user, isUserVerified } = useAuth();
  const router = useRouter();

  // If user is not a parent or not verified, redirect
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.type !== "parent") {
      router.push(`/${user.type}/dashboard`);
    } else if (!isUserVerified) {
      router.push(`/verify-otp?userId=${user._id}`);
    }
  }, [user, isUserVerified, router]);

  const handleSkip = () => {
    router.push("/registration-success");
  };

  if (!user || user.type !== "parent" || !isUserVerified) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="min-h-svh">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8"></div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Add Your Child</h1>
            <p className="text-muted-foreground">
              Register your child to help them get started with their learning
              journey
            </p>
          </div>

          <StudentRegistrationForm />
          <div className="flex justify-center mt-4">

          <Button
            className="text-center mt-4"
            variant="outline"
            onClick={handleSkip}
          >
            Skip for now
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
