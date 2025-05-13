import { useState, useEffect } from 'react';
import { Child, ChildrenListResponse } from '@/types/child';

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
      
      // Option 1: Use Next.js API route (current)
      const response = await fetch(`/api/guardian-student/guardian/${parentId}`);
      
      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);
      
      // Option 2: Use external backend API (uncomment and modify as needed)
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guardian/${parentId}/children`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`, // Add auth token if needed
      //     'Content-Type': 'application/json',
      //   },
      // });
      
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
