'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import LectureHeader from '../LectureHeader';
import LectureContent from '../LectureContent';
import LectureSidebar from '../LectureSidebar';
import StudyTimer from './StudyTimer';
import { useLectureProgress } from '../hooks/use-lecture-progress';
import LearningReminder from './LearningReminder';
import LectureDiscussion from './LectureDiscussion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types more strictly
interface LectureViewProps {
  lecture: any;
  progress: number;
  onProgressUpdate: (progress: number) => void;
  navigationData?: {
    chapterTitle?: string;
    lectures?: Array<any>;
    currentIndex?: number;
  };
  onNavigate: (lectureId: string) => void;
  onBack: () => void;
  isMobile: boolean;
}

// Create a simple empty navigation data object to use as fallback
const EMPTY_NAV_DATA = {
  chapterTitle: '',
  lectures: [],
  currentIndex: -1
};

export default function LectureView(props: LectureViewProps) {
  // Safety check for lecture ID
  if (!props.lecture || !props.lecture._id) {
    console.error('Missing lecture ID in LectureView component');
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="mb-4 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 mx-auto"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Lecture data error</h2>
          <p className="text-gray-600 mb-4">Unable to load lecture information. The lecture may be unavailable or deleted.</p>
          <button
            onClick={props.onBack}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Return to course
          </button>
        </div>
      </div>
    );
  }
  // Destructure with default values to ensure nothing is undefined
  const { 
    lecture, 
    progress = 0, 
    onProgressUpdate, 
    onNavigate, 
    onBack, 
    isMobile = false
  } = props;
  
  // Create a safe version of navigationData with defaults
  const navData = props.navigationData || EMPTY_NAV_DATA;
  const navLectures = navData.lectures || [];
  const navCurrentIndex = navData.currentIndex || 0;
  const navChapterTitle = navData.chapterTitle || '';
  
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState('resources');
  const { toast } = useToast();
  
  // Use the lecture progress hook to manage progress
  const { progress: currentProgress, updateProgress, isCompleted } = useLectureProgress(
    lecture._id,
    progress,
    90 // 90% threshold for completion
  );
  
  // Update parent component with progress changes
  useEffect(() => {
    if (currentProgress > progress) {
      onProgressUpdate(currentProgress);
    }
  }, [currentProgress, progress, onProgressUpdate]);

  // Add debug information
  useEffect(() => {
    console.log('LectureView initial props:', {
      'lecture._id': lecture?._id,
      'lecture.chapterId': lecture?.chapterId,
      'lecture.resources': lecture?.resources?.length || 0,
      'lecture.transcript': lecture?.transcript?.length || 0,
      'lecture.chapterLectures': lecture?.chapterLectures?.length || lecture?.lectures?.length || 0,
      'navData.lectures': navLectures?.length || 0,
      'navData.chapterTitle': navChapterTitle || ''
    });
  }, [lecture, navLectures, navChapterTitle]);

  // Toggle sidebar visibility when mobile state changes
  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handlePrevious = () => {
    if (navCurrentIndex > 0 && navLectures.length > 0) {
      const prevLecture = navLectures[navCurrentIndex - 1];
      if (prevLecture && prevLecture._id) {
        onNavigate(prevLecture._id);
      }
    }
  };

  const handleNext = () => {
    if (navCurrentIndex < navLectures.length - 1) {
      const nextLecture = navLectures[navCurrentIndex + 1];
      if (nextLecture && nextLecture._id) {
        onNavigate(nextLecture._id);
      }
    }
  };

  const hasPrevious = navCurrentIndex > 0 && navLectures.length > 0;
  const hasNext = navCurrentIndex < navLectures.length - 1;

  return (
    <div className="h-screen flex flex-col">
      <LectureHeader
        title={lecture.title || ''}
        chapterId={lecture.chapterId || ''}
        chapterTitle={navChapterTitle}
        progress={progress}
        duration={lecture.estimatedDuration || lecture.content?.data?.duration}
        onBack={onBack}
        onToggleSidebar={handleToggleSidebar}
        isMobile={isMobile}
      />

      <main className="flex-1 flex overflow-hidden">
        {!isMobile && (
          <StudyTimer 
            lectureId={lecture._id} 
            position="floating"
            onSessionEnd={(duration) => {
              toast({
                title: "Study session completed",
                description: `You studied for ${Math.floor(duration / 60)} minutes.`,
              });
            }} 
          />
        )}
        <div className={`flex-1 flex flex-col overflow-auto`}>
          {/* Learning Reminder */}
          <div className="px-4 pt-2">
            <LearningReminder 
              progress={currentProgress} 
              lastActive={lecture.lastAccessedAt ? new Date(lecture.lastAccessedAt).getTime() : undefined}
              lectureType={lecture.content?.type}
            />
          </div>
          
          <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-2">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="content" className="flex-1 overflow-hidden flex flex-col">
              <LectureContent
                lecture={lecture}
                onProgressUpdate={(newProgress) => updateProgress({ progress: newProgress })}
                onPrevious={handlePrevious}
                onNext={handleNext}
                initialProgress={progress}
              />
            </TabsContent>
            
            <TabsContent value="discussion" className="p-4 overflow-auto flex-1">
              <LectureDiscussion lectureId={lecture._id} />
            </TabsContent>
          </Tabs>
        </div>

        {showSidebar && (
          <div className={`${isMobile ? 'fixed inset-0 z-50 bg-background' : 'w-80'}`}>
            {isMobile && (
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold">Lecture Resources</h2>
                <Button variant="ghost" size="sm" onClick={handleToggleSidebar}>
                  Close
                </Button>
              </div>
            )}
            <div className={`${isMobile ? 'h-[calc(100%-4rem)]' : 'h-full'}`}>
              <LectureSidebar
                lectureId={lecture._id || ''}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                navigationData={{
                  chapterTitle: navChapterTitle,
                  lectures: navLectures.length > 0 ? navLectures : lecture.chapterLectures || lecture.lectures || []
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}