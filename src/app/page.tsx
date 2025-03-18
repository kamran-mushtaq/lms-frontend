"use client";

import { useEffect } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      // If the user is a parent and not verified, redirect to OTP verification
      if (user.type === "parent" && !user.isVerified) {
        router.push(`/verify-otp?userId=${user._id}`);
      } else {
        // Otherwise redirect to appropriate dashboard based on user type
        switch (user.type) {
          case "admin":
            router.push("/admin/dashboard");
            break;
          case "teacher":
            router.push("/teacher/dashboard");
            break;
          case "parent":
            router.push("/parent/dashboard");
            break;
          default:
            router.push("/student/dashboard");
        }
      }
    }
  }, [user, router]);
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center border-b px-4 lg:px-6">
        <div className="flex items-center gap-2 font-bold">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          K12 LMS
        </div>
        <nav className="ml-auto flex gap-4 lg:gap-6">
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            About Us
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Contact
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors hover:bg-primary/90"
          >
            Sign up
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Comprehensive Learning Management System for K-12 Education
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform provides end-to-end management of educational
                    processes for K-12 schools, including student registration,
                    course delivery, assessment tracking, study planning, and
                    progress monitoring.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block h-full">
                <div className="h-full bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <p className="text-lg font-medium mb-2">
                      Platform Features
                    </p>
                    <ul className="text-left space-y-2">
                      <li className="flex items-center">
                        ✓ Multi-role user system
                      </li>
                      <li className="flex items-center">
                        ✓ Email/WhatsApp verification
                      </li>
                      <li className="flex items-center">
                        ✓ Role-based access control
                      </li>
                      <li className="flex items-center">
                        ✓ Comprehensive course management
                      </li>
                      <li className="flex items-center">
                        ✓ Structured learning paths
                      </li>
                      <li className="flex items-center">
                        ✓ Study plan management
                      </li>
                      <li className="flex items-center">
                        ✓ Advanced assessment system
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex h-16 items-center border-t px-4 lg:px-6">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} K12 LMS. All rights reserved.
        </p>
        <nav className="ml-auto hidden gap-4 lg:flex lg:gap-6">
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Terms of Service
          </Link>
        </nav>
      </footer>
    </div>
  );
}
