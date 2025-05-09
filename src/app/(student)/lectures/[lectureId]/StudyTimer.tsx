'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Clock, Play, Pause, Plus, Minus, X } from 'lucide-react';
import { updateLectureProgress } from '../api/lecture-service';

interface StudyTimerProps {
  lectureId: string;
  position?: 'inline' | 'floating';
  onSessionEnd?: (duration: number) => void;
}

export default function StudyTimer({ 
  lectureId, 
  position = 'inline', 
  onSessionEnd 
}: StudyTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isMinimized, setIsMinimized] = useState(position === 'floating');
  const [open, setOpen] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Start the timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      sessionStartTimeRef.current = Date.now() - (timeElapsed * 1000);
      
      timerRef.current = setInterval(() => {
        if (sessionStartTimeRef.current) {
          const seconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
          setTimeElapsed(seconds);
        }
      }, 1000);
    }
  };

  // Pause the timer
  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Reset the timer
  const resetTimer = () => {
    pauseTimer();
    setTimeElapsed(0);
    sessionStartTimeRef.current = null;
  };

  // Adjust timer (add/subtract 5 minutes)
  const adjustTimer = (minutes: number) => {
    const adjustment = minutes * 60;
    const newTime = Math.max(0, timeElapsed + adjustment);
    setTimeElapsed(newTime);
    
    if (isRunning && sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now() - (newTime * 1000);
    }
  };

  // End the study session
  const endSession = () => {
    if (onSessionEnd) {
      onSessionEnd(timeElapsed);
    }
    
    // Log study session to backend if needed
    if (timeElapsed > 30) { // Only log if studied for at least 30 seconds
      try {
        updateLectureProgress(lectureId, {
          timeSpent: timeElapsed
        });
      } catch (error) {
        console.error('Error logging study session:', error);
      }
    }
    
    resetTimer();
    setOpen(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Floating timer UI
  if (position === 'floating') {
    return (
      <div 
        className={`fixed z-50 ${isMinimized ? 'bottom-4 right-4' : 'bottom-4 right-4'}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {isMinimized ? (
          <Button
            variant="secondary"
            size="sm"
            className="shadow-md rounded-full flex items-center gap-2"
            onClick={() => setIsMinimized(false)}
          >
            <Clock className="h-4 w-4" />
            {isRunning ? formatTime(timeElapsed) : 'Study Timer'}
          </Button>
        ) : (
          <div className="bg-card border shadow-md rounded-lg p-4 w-64">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm">Study Timer</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setIsMinimized(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-3xl font-mono text-center py-2">
              {formatTime(timeElapsed)}
            </div>
            
            <div className="flex justify-center gap-2 mt-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => adjustTimer(-5)}
                disabled={isRunning}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              {!isRunning ? (
                <Button onClick={startTimer}>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              ) : (
                <Button variant="secondary" onClick={pauseTimer}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => adjustTimer(5)}
                disabled={isRunning}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-end mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={endSession}
              >
                End Session
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Inline timer UI (dialog-based)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Study Timer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Study Session Timer</DialogTitle>
        </DialogHeader>
        
        <div className="text-4xl font-mono text-center py-4">
          {formatTime(timeElapsed)}
        </div>
        
        <div className="flex justify-center gap-2 my-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => adjustTimer(-5)}
            disabled={isRunning}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          {!isRunning ? (
            <Button onClick={startTimer}>
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          ) : (
            <Button variant="secondary" onClick={pauseTimer}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => adjustTimer(5)}
            disabled={isRunning}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={resetTimer}
          >
            Reset
          </Button>
          <Button 
            onClick={endSession}
          >
            End Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}