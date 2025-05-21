// app/dashboard/hooks/use-enrollment-data.ts
import { useState, useEffect } from 'react';
import { getStudentEnrollments, getStudentClasses, getClassSubjects } from '../../../aptitude-test/api/assessment-api';
import { 
  generateMockClasses, 
  generateMockSubjects,

  generateMockEnrollments 
} from '@/lib/mock-data';

interface EnrollmentDataHookProps {
  studentId: string;
  useMockData?: boolean;
}

export function useEnrollmentData({ studentId, useMockData = false }: EnrollmentDataHookProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        if (useMockData) {
          // Use mock data for development
          const mockClasses = generateMockClasses();
          setClasses(mockClasses);

          let allSubjects: any[] = [];
          for (const classItem of mockClasses) {
            const classSubjects = generateMockSubjects(classItem._id);
            allSubjects = [...allSubjects, ...classSubjects];
          }
          setSubjects(allSubjects);

          // Generate enrollments for all subjects (for simplicity in development)
          const subjectIds = allSubjects.map(s => s._id);
          const mockEnrollments = generateMockEnrollments(
            studentId, 
            mockClasses.map(c => c._id),
            subjectIds
          );
          setEnrollments(mockEnrollments);
        } else {
          // Fetch real data from API
          try {
            // Load classes
            const classesData = await getStudentClasses(studentId);
            setClasses(classesData);

            // Load subjects for all classes
            let allSubjects: any[] = [];
            for (const classItem of classesData) {
              const classSubjects = await getClassSubjects(classItem._id);
              allSubjects = [...allSubjects, ...classSubjects];
            }
            setSubjects(allSubjects);

            // Load enrollments
            const enrollmentsData = await getStudentEnrollments(studentId, { isEnrolled: true });
            setEnrollments(enrollmentsData);
          } catch (err) {
            console.log('API call failed, using mock data as fallback');
            
            // Use mock data as fallback
            const mockClasses = generateMockClasses();
            setClasses(mockClasses);

            let allSubjects: any[] = [];
            for (const classItem of mockClasses) {
              const classSubjects = generateMockSubjects(classItem._id);
              allSubjects = [...allSubjects, ...classSubjects];
            }
            setSubjects(allSubjects);

            const subjectIds = allSubjects.map(s => s._id);
            const mockEnrollments = generateMockEnrollments(
              studentId, 
              mockClasses.map(c => c._id),
              subjectIds
            );
            setEnrollments(mockEnrollments);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching enrollment data:', error);
        setError('Failed to load enrollment data');
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, useMockData]);

  return {
    enrollments,
    classes,
    subjects,
    loading,
    error,
    refresh: () => {
      if (studentId) {
        // Re-fetch data
        setLoading(true);
        const fetchData = async () => {
          // Same logic as above
          try {
            // Same as in useEffect
            if (useMockData) {
              const mockClasses = generateMockClasses();
              setClasses(mockClasses);
  
              let allSubjects: any[] = [];
              for (const classItem of mockClasses) {
                const classSubjects = generateMockSubjects(classItem._id);
                allSubjects = [...allSubjects, ...classSubjects];
              }
              setSubjects(allSubjects);
  
              const subjectIds = allSubjects.map(s => s._id);
              const mockEnrollments = generateMockEnrollments(
                studentId, 
                mockClasses.map(c => c._id),
                subjectIds
              );
              setEnrollments(mockEnrollments);
            } else {
              try {
                const classesData = await getStudentClasses(studentId);
                setClasses(classesData);
  
                let allSubjects: any[] = [];
                for (const classItem of classesData) {
                  const classSubjects = await getClassSubjects(classItem._id);
                  allSubjects = [...allSubjects, ...classSubjects];
                }
                setSubjects(allSubjects);
  
                const enrollmentsData = await getStudentEnrollments(studentId, { isEnrolled: true });
                setEnrollments(enrollmentsData);
              } catch (err) {
                // Fallback to mock data
                console.log('API call failed during refresh, using mock data');
                
                const mockClasses = generateMockClasses();
                setClasses(mockClasses);
  
                let allSubjects: any[] = [];
                for (const classItem of mockClasses) {
                  const classSubjects = generateMockSubjects(classItem._id);
                  allSubjects = [...allSubjects, ...classSubjects];
                }
                setSubjects(allSubjects);
  
                const subjectIds = allSubjects.map(s => s._id);
                const mockEnrollments = generateMockEnrollments(
                  studentId, 
                  mockClasses.map(c => c._id),
                  subjectIds
                );
                setEnrollments(mockEnrollments);
              }
            }
  
            setLoading(false);
          } catch (error) {
            console.error('Error refreshing enrollment data:', error);
            setError('Failed to refresh enrollment data');
            setLoading(false);
          }
        };
  
        fetchData();
      }
    }
  };
}