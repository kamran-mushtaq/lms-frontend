// app/dashboard/hooks/use-assessment-data.ts
import { useState, useEffect } from 'react';
import { getPendingAssessments, getStudentAssessmentResults } from '../../../aptitude-test/api/assessment-api';
import { generateMockAssessments, generateMockAssessmentResults } from '@/lib/mock-data';

interface AssessmentDataHookProps {
  studentId: string;
  useMockData?: boolean;
}

export function useAssessmentData({ studentId, useMockData = false }: AssessmentDataHookProps) {
  const [pendingAssessments, setPendingAssessments] = useState<any[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        let pendingData;
        let resultsData;

        if (useMockData) {
          // Use mock data for development
          pendingData = {
            hasPendingTest: true,
            pendingTests: generateMockAssessments(studentId)
          };
          resultsData = generateMockAssessmentResults(studentId);
        } else {
          // Fetch real data from API
          try {
            const pendingResponse = await getPendingAssessments(studentId);
            pendingData = pendingResponse;
          } catch (err) {
            console.log('Using mock pending assessments as fallback');
            pendingData = {
              hasPendingTest: true,
              pendingTests: generateMockAssessments(studentId)
            };
          }

          try {
            resultsData = await getStudentAssessmentResults(studentId);
          } catch (err) {
            console.log('Using mock assessment results as fallback');
            resultsData = generateMockAssessmentResults(studentId);
          }
        }

        setPendingAssessments(pendingData.pendingTests || []);
        setAssessmentResults(resultsData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setError('Failed to load assessment data');
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, useMockData]);

  return {
    pendingAssessments,
    assessmentResults,
    loading,
    error,
    refresh: () => {
      if (studentId) {
        setLoading(true);
        // Re-fetch data
        const fetchData = async () => {
          try {
            let pendingData;
            let resultsData;

            if (useMockData) {
              pendingData = {
                hasPendingTest: true,
                pendingTests: generateMockAssessments(studentId)
              };
              resultsData = generateMockAssessmentResults(studentId);
            } else {
              try {
                pendingData = await getPendingAssessments(studentId);
              } catch (err) {
                pendingData = {
                  hasPendingTest: true,
                  pendingTests: generateMockAssessments(studentId)
                };
              }

              try {
                resultsData = await getStudentAssessmentResults(studentId);
              } catch (err) {
                resultsData = generateMockAssessmentResults(studentId);
              }
            }

            setPendingAssessments(pendingData.pendingTests || []);
            setAssessmentResults(resultsData || []);
            setLoading(false);
          } catch (error) {
            console.error('Error refreshing assessment data:', error);
            setError('Failed to refresh assessment data');
            setLoading(false);
          }
        };

        fetchData();
      }
    }
  };
}