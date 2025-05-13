'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface LearningReminderProps {
  progress: number;
  lastActive?: number;
  lectureType?: string;
}

export default function LearningReminder({
  progress,
  lastActive,
  lectureType = 'video'
}: LearningReminderProps) {
  const [showReminder, setShowReminder] = useState(true);
  const [reminderType, setReminderType] = useState<'progress' | 'resume' | 'streak' | null>(null);

  useEffect(() => {
    // Determine which reminder to show based on props
    if (progress > 0 && progress < 50) {
      setReminderType('progress');
    } else if (lastActive && (Date.now() - lastActive) > 86400000 * 3) { // 3 days
      setReminderType('resume');
    } else if (Math.random() > 0.7) { // Randomly show streak reminder sometimes
      setReminderType('streak');
    } else {
      setReminderType(null);
    }
  }, [progress, lastActive]);

  if (!showReminder || !reminderType) {
    return null;
  }

  const renderReminderContent = () => {
    switch (reminderType) {
      case 'progress':
        return (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Continue your learning</AlertTitle>
            <AlertDescription className="text-yellow-700">
              You've made {Math.round(progress)}% progress on this lecture. 
              Keep going to complete it and unlock your achievements!
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              onClick={() => setShowReminder(false)}
            >
              Got it
            </Button>
          </Alert>
        );
      case 'resume':
        return (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Welcome back!</AlertTitle>
            <AlertDescription className="text-blue-700">
              It's been a while since your last session. 
              Pick up where you left off to maintain your learning momentum.
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => setShowReminder(false)}
            >
              Dismiss
            </Button>
          </Alert>
        );
      case 'streak':
        return (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Learning streak active!</AlertTitle>
            <AlertDescription className="text-green-700">
              You're on a 3-day learning streak! Consistent practice is key to mastery.
              Complete this {lectureType} to keep your streak going.
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 bg-white border-green-200 text-green-700 hover:bg-green-100"
              onClick={() => setShowReminder(false)}
            >
              Thanks
            </Button>
          </Alert>
        );
      default:
        return null;
    }
  };

  return renderReminderContent();
}