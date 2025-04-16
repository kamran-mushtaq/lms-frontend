'use client'; // Needed for hooks like useState, useEffect

import React, { useState, useEffect } from 'react';
import SubjectCard from './SubjectCard';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// Mock data structure - replace with actual API response type
interface Subject {
  id: string;
  title: string;
  imageUrl: string;
  progress: number;
  status: 'inProgress' | 'completed' | 'notStarted'; // Example status
  // Add other relevant fields
}

interface SubjectGridProps {
  studentId: string; // Needed to fetch data
  searchTerm: string;
  filters: Record<string, boolean>;
}

// Mock API function - replace with actual API call using your client
const fetchEnrolledSubjects = async (studentId: string): Promise<Subject[]> => {
  console.log(`Fetching subjects for student: ${studentId}`);
  // Replace with: await apiClient.get(`/enrollment/student/${studentId}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return mock data
  return [
    { id: 'subj-1', title: 'Mathematics 101', imageUrl: '/images/math.jpg', progress: 75, status: 'inProgress' },
    { id: 'subj-2', title: 'Introduction to Physics', imageUrl: '/images/physics.jpg', progress: 30, status: 'inProgress' },
    { id: 'subj-3', title: 'History of Art', imageUrl: '/images/art.jpg', progress: 100, status: 'completed' },
    { id: 'subj-4', title: 'Chemistry Basics', imageUrl: '/images/chemistry.jpg', progress: 10, status: 'inProgress' },
    { id: 'subj-5', title: 'Literature Studies', imageUrl: '/images/literature.jpg', progress: 95, status: 'completed' },
    { id: 'subj-6', title: 'Computer Science Fundamentals', imageUrl: '/images/cs.jpg', progress: 50, status: 'inProgress' },
  ];
};


const SubjectGrid: React.FC<SubjectGridProps> = ({ studentId, searchTerm, filters }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        const fetchedSubjects = await fetchEnrolledSubjects(studentId);
        setSubjects(fetchedSubjects);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setError("Failed to load subjects. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, [studentId]); // Re-fetch if studentId changes

  const filteredSubjects = subjects.filter(subject => {
    // Apply search term
    const matchesSearch = subject.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply filters
    const matchesFilters = filters.all ||
                           (filters.inProgress && subject.status === 'inProgress') ||
                           (filters.completed && subject.status === 'completed');
                           // Add more filter conditions if needed

    return matchesSearch && matchesFilters;
  });

  if (isLoading) {
    // Show skeleton loaders while fetching data
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (filteredSubjects.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No subjects found matching your criteria.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {/* TODO: Implement lazy loading if needed */}
      {filteredSubjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subjectId={subject.id}
          title={subject.title}
          imageUrl={subject.imageUrl}
          progress={subject.progress}
        />
      ))}
    </div>
  );
};

export default SubjectGrid;