// app/guardian/children/hooks/use-children-list.ts
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Child, ChildrenListResponse, LegacyChild, transformLegacyChild } from '@/types/child';

export function useChildrenList(guardianId: string) {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [totalChildren, setTotalChildren] = useState(0);
  const { toast } = useToast();

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Try the new API endpoint first
      try {
        const response = await apiClient.get(`/guardian-student/guardian/${guardianId}`);
        
        if (response.data && response.data.children) {
          const { children: childrenData, totalChildren: total } = response.data as ChildrenListResponse;
          setChildren(childrenData);
          setTotalChildren(total);
          return;
        }
      } catch (newApiError) {
        console.log('New API not available, falling back to legacy API');
      }
      
      // Fallback to the existing API
      try {
        const fallbackResponse = await apiClient.get('/users/children');
        if (Array.isArray(fallbackResponse.data)) {
          // Transform the existing data to match the new interface
          const transformedChildren: Child[] = fallbackResponse.data.map((child: LegacyChild) => 
            transformLegacyChild(child)
          );
          setChildren(transformedChildren);
          setTotalChildren(transformedChildren.length);
        } else {
          // If no children found, set empty state
          setChildren([]);
          setTotalChildren(0);
        }
      } catch (fallbackError) {
        // Both APIs failed, set empty state
        console.log('Both APIs failed, showing empty state');
        setChildren([]);
        setTotalChildren(0);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setIsError(true);
      // Only show error toast for actual errors, not 404s
      if (error instanceof Error && !error.message.includes('404')) {
        toast({
          title: 'Error',
          description: 'Failed to load children data. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (guardianId) {
      fetchChildren();
    }
  }, [guardianId]);

  const refetch = () => {
    fetchChildren();
  };

  return {
    children,
    isLoading,
    isError,
    refetch,
    totalChildren
  };
}

// Re-export types for convenience
export type { Child, ChildrenListResponse };
