// For testing - add this temporarily to use-children-list.ts
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
      const fallbackResponse = await apiClient.get('/users/children');
      if (Array.isArray(fallbackResponse.data)) {
        // Transform the existing data to match the new interface
        const transformedChildren: Child[] = fallbackResponse.data.map((child: LegacyChild) => 
          transformLegacyChild(child)
        );
        setChildren(transformedChildren);
        setTotalChildren(transformedChildren.length);
      } else {
        // TEMPORARY: For testing, add mock data
        console.log('Using mock data for testing');
        const mockChildren: Child[] = [
          {
            id: "child-1",
            name: "John Doe",
            email: "john@example.com",
            age: 12,
            grade: "7th Grade",
            profileImage: "",
            isActive: true,
            enrolledSince: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            overallProgress: 78,
            recentActivity: {
              type: "lecture_completed",
              subject: "Mathematics",
              item: "Introduction to Fractions",
              timestamp: new Date().toISOString()
            },
            quickStats: {
              subjectsEnrolled: 4,
              assessmentsPending: 2,
              studyStreakDays: 7
            }
          },
          {
            id: "child-2",
            name: "Jane Smith",
            email: "jane@example.com",
            age: 10,
            grade: "5th Grade",
            profileImage: "",
            isActive: true,
            enrolledSince: new Date().toISOString(),
            lastActivity: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            overallProgress: 85,
            recentActivity: {
              type: "assessment_completed",
              subject: "English",
              item: "Reading Comprehension Test",
              timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            quickStats: {
              subjectsEnrolled: 5,
              assessmentsPending: 0,
              studyStreakDays: 12
            }
          }
        ];
        setChildren(mockChildren);
        setTotalChildren(mockChildren.length);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setIsError(true);
      toast({
        title: 'Error',
        description: 'Failed to load children data. Please try again.',
        variant: 'destructive'
      });
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
