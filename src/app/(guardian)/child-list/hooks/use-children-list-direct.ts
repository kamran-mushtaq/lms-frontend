import { useState, useEffect } from 'react';
import { GuardianStudentResponse, Child, ChildrenListResponse } from '@/types/child';
import apiClient from "@/lib/api-client";

interface UseChildrenListResult {
  children: Child[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
  totalChildren: number;
}

export function useChildrenList(parentId: string): UseChildrenListResult {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalChildren, setTotalChildren] = useState(0);

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      
      console.log('Fetching children for guardian:', parentId);
      
      // Make the API call
      const response = await apiClient.get(
        `/guardian-student/guardian/${parentId}`
      );

      if (!response.ok) {
        // For non-2xx responses
        const errorData = await response.json(); // Assuming the error is in JSON format
        console.error("API Error Response:", errorData);
        throw new Error(
          `API Error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      // Parse the response data
      const data: GuardianStudentResponse = await response.json();
      console.log('Fetched data:', data);
      
      // Transform the API response to match our UI expectations
      const transformedChildren: Child[] = data.map((relation) => {
        const student = relation.studentId;
        
        // Generate some mock data since it's not in the API response
        const mockProgress = Math.floor(Math.random() * 40) + 60; // 60-100%
        const mockSubjects = Math.floor(Math.random() * 3) + 3; // 3-5 subjects
        const mockPending = Math.floor(Math.random() * 3); // 0-2 pending
        const mockStreak = Math.floor(Math.random() * 14) + 1; // 1-14 days
        
        return {
          id: student._id,
          name: student.name,
          email: student.email,
          age: undefined, // Not available in the API
          grade: undefined, // Not available in the API
          profileImage: undefined,
          isActive: relation.isActive,
          enrolledSince: relation.createdAt,
          lastActivity: relation.updatedAt,
          overallProgress: mockProgress,
          recentActivity: {
            type: 'lecture_completed' as const,
            subject: 'Mathematics',
            item: 'Recent lesson completed',
            timestamp: relation.updatedAt
          },
          upcomingAssessment: Math.random() > 0.5 ? {
            title: 'Upcoming Test',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            subject: 'Science'
          } : undefined,
          quickStats: {
            subjectsEnrolled: mockSubjects,
            assessmentsPending: mockPending,
            studyStreakDays: mockStreak
          }
        };
      });
      
      const result: ChildrenListResponse = {
        children: transformedChildren,
        totalChildren: transformedChildren.length,
        metadata: {
          lastUpdated: new Date().toISOString()
        }
      };
      
      setChildren(result.children);
      setTotalChildren(result.totalChildren);
    } catch (error) {
      console.error('Error fetching children:', error);
      setIsError(true);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (parentId) {
      fetchChildren();
    }
  }, [parentId]);

  const refetch = () => {
    fetchChildren();
  };

  return {
    children,
    isLoading,
    isError,
    error,
    refetch,
    totalChildren
  };
}