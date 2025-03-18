"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GalleryVerticalEnd,
  CheckCircle,
  ArrowRight,
  Users,
  BookOpen
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Icons } from "@/components/icons";

export default function RegistrationSuccessPage() {
  const { user, isUserVerified, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in or not verified
  useEffect(() => {
    if (!isLoading && (!user || !isUserVerified)) {
      router.push("/login");
    }
  }, [user, isUserVerified, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Registration Complete!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for registering with K12 Learning Management System. Your
            account has been successfully created.
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="p-6 border rounded-lg bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Add More Students</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Register additional children to your parent account
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/add-student">Add Student</Link>
              </Button>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Go to Dashboard</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Access your parent dashboard to manage your children's education
              </p>
              <Button className="w-full" asChild>
                <Link href="/parent/dashboard">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg border border-muted">
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <ul className="text-sm text-muted-foreground text-left space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>
                  Your registered students can now take the aptitude test. Check
                  your email for instructions.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>
                  Access your parent dashboard to track your children's
                  progress.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>
                  Set up study goals and benchmarks through the study planning
                  tools.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>
                  Explore available courses and learning materials for your
                  children.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
