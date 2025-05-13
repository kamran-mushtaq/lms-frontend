import { useState, useEffect } from 'react';
import { GuardianStudentResponse, Child, ChildrenListResponse } from '@/types/child';

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
      
      // Try Next.js API route first, then fallback to direct API
      let response;
      try {
        response = await fetch(`/api/guardian-student/guardian/${parentId}`);
      } catch (apiError) {
        console.warn('Next.js API route failed, trying direct API:', apiError);
        
        // Direct API call as fallback
        response = await fetch(
          `https://phpstack-732216-5200333.cloudwaysapps.com/api/guardian-student/guardian/${parentId}`
        );
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        // Transform the direct API response
        const directData: GuardianStudentResponse = await response.json();
        
        const transformedChildren: Child[] = directData.map((relation) => {
          const student = relation.studentId;
          const mockProgress = Math.floor(Math.random() * 40) + 60;
          const mockSubjects = Math.floor(Math.random() * 3) + 3;
          const mockPending = Math.floor(Math.random() * 3);
          const mockStreak = Math.floor(Math.random() * 14) + 1;
          
          return {
            id: student._id,
            name: student.name,
            email: student.email,
            age: undefined,
            grade: undefined,
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
        
        setChildren(transformedChildren);
        setTotalChildren(transformedChildren.length);
        return;
      }
      
      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch children: ${response.status} - ${errorText}`);
      }
      
      const data: ChildrenListResponse = await response.json();
      console.log('Fetched data:', data);
      
      setChildren(data.children);
      setTotalChildren(data.totalChildren);
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
