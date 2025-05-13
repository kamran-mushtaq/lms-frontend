'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import LectureView from '../../(student)/lectures/[lectureId]1/LectureView';
import { getLectureById, getLectureDetails, updateLectureProgress } from '../../(student)/lectures/api/lecture-service';

export default function LecturePage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params.lectureId as string;
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [lecture, setLecture] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [navigationData, setNavigationData] = useState<any>(null);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        console.log('Fetching lecture data for ID:', lectureId);
        
        // Validate lectureId
        if (!lectureId || typeof lectureId !== 'string') {
          throw new Error('Invalid lecture ID');
        }
        
        // Fetch lecture data
        let lectureData;
        try {
          // Fetch from your API using the details endpoint
          const response = await getLectureDetails(lectureId);
          lectureData = response;
          console.log('Successfully fetched lecture data:', lectureData);
        } catch (apiError) {
          console.error('API error:', apiError);
          throw new Error('Could not load lecture data. Please try again.');
        }
        
        if (!lectureData || !lectureData.title) {
          throw new Error('Invalid lecture data received from server');
        }
        
        setLecture(lectureData);
        
        // Update document title
        document.title = `${lectureData.title} | LMS Platform`;
        
        // Set initial progress
        if (lectureData.studentProgress) {
          setProgress(lectureData.studentProgress.progress || 0);
        }
        
        // Set navigation data
        setNavigationData({
          chapterId: lectureData.chapterId,
          chapterTitle: lectureData.chapterTitle,
          lectures: lectureData.chapterLectures || [],
          currentIndex: lectureData.chapterLectures?.findIndex(
            (l: any) => l._id === lectureId
          ) || 0,
        });
      } catch (err: any) {
        console.error('Error fetching lecture:', err);
        setError(err.message || 'Failed to load lecture');
      } finally {
        setLoading(false);
      }
    };

    if (lectureId) {
      fetchLecture();
    }
  }, [lectureId]);

  const handleProgressUpdate = async (newProgress: number) => {
    if (newProgress > progress) {
      setProgress(newProgress);
      try {
        // Update progress in backend
        await updateLectureProgress(lectureId, newProgress);
      } catch (err) {
        console.error('Error updating progress:', err);
      }
    }
  };

  const handleNavigateLecture = (id: string) => {
    // Use the correct path format for the project - now using /lectures instead of /student/lectures
    router.push(`/lectures/${id}`);
  };

  const handleBack = () => {
    // Check if we have a saved chapter ID in localStorage
    const lastVisitedChapter = localStorage.getItem('lastVisitedChapter');
    if (lastVisitedChapter && lecture?.chapterId === lastVisitedChapter) {
      // Navigate back to the previously visited chapter - keep using original chapters path
      router.push(`/student/chapters/${lastVisitedChapter}`);
    } else if (lecture?.chapterId) {
      // Navigate back to the current lecture's chapter
      router.push(`/student/chapters/${lecture.chapterId}`);
    } else {
      // Fallback to subjects list
      router.push('/student/subjects');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-red-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Lecture</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Go Back to Chapter
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LectureView
      lecture={lecture}
      progress={progress}
      onProgressUpdate={handleProgressUpdate}
      navigationData={navigationData}
      onNavigate={handleNavigateLecture}
      onBack={handleBack}
      isMobile={isMobile}
    />
  );
}
