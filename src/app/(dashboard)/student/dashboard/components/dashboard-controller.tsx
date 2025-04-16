// app/dashboard/components/dashboard-controller.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

import { checkStudentAptitudeTestRequired, getStudentEnrollments, getStudentClasses, getClassSubjects } from "../../../../aptitude-test/api/assessment-api;
import { getStudentProgress } from "../api/progress-service";

/**
 * Controller component for managing data fetching and error handling in dashboard
 */
export function DashboardController({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [progressOverview, setProgressOverview] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Load user data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    
    // Check if student needs to take aptitude test first
    checkAptitudeTestRequirement();
  }, []);
  
  // Check if aptitude test is required
  const checkAptitudeTestRequirement = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/login');
        return;
      }
      
      const user = JSON.parse(storedUser);
      const studentId = user._id;
      
      const result = await checkStudentAptitudeTestRequired(studentId);
      
      if (result.required) {
        // Redirect to aptitude test page
        router.push('/aptitude-test');
        return;
      }
      
      // If no aptitude test is required, load dashboard data
      loadDashboardData(studentId);
    } catch (error) {
      console.error('Error checking aptitude test requirement:', error);
      setError('Failed to check if aptitude test is required.');
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check aptitude test status. Please try again later.",
      });
    }
  };
  
  // Load dashboard data
  const loadDashboardData = async (studentId: string) => {
    try {
      setLoading(true);
      
      // Load enrollments
      const enrollmentsData = await getStudentEnrollments(studentId, { isEnrolled: true });
      setEnrollments(enrollmentsData);
      
      // Load classes
      const classesData = await getStudentClasses(studentId);
      setClasses(classesData);
      
      // Load subjects for all classes
      if (classesData && classesData.length > 0) {
        let allSubjects: any[] = [];
        
        for (const classItem of classesData) {
          const classSubjects = await getClassSubjects(classItem._id);
          allSubjects = [...allSubjects, ...classSubjects];
        }
        
        setSubjects(allSubjects);
        
        // Load progress overview (real or mock data)
        const progressData = await getStudentProgress(studentId, allSubjects);
        setProgressOverview(progressData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again later.",
      });
    }
  };
  
  // Return children with all the context data they need
  const childrenWithProps = children && typeof children === 'function' 
    ? children({ 
        loading, 
        error, 
        user, 
        progressOverview, 
        enrollments, 
        classes, 
        subjects,
        reload: () => {
          if (user) loadDashboardData(user._id);
        }
      })
    : children;
    
  // Show loading state 
  if (loading) {
    return fallback || (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Loading Your Dashboard</h2>
        <p className="text-muted-foreground">Please wait while we fetch your learning data...</p>
      </div>
    );
  }
  
  // Return the children with the data they need
  return childrenWithProps;
}