'use client';

import { useState, useEffect, useRef } from 'react';

interface VideoPlayerWithProgressProps {
  videoUrl?: string;
  initialProgress?: number;
  onProgressUpdate?: (progress: number, currentTime: number) => void;
  poster?: string;
  seekToTime?: number;
  onComplete?: () => void;
  isCompleted?: boolean; // Add this to prevent progress updates for completed lectures
}

export default function VideoPlayerWithProgress({
  videoUrl,
  initialProgress = 0,
  onProgressUpdate,
  poster,
  seekToTime,
  onComplete,
  isCompleted = false
}: VideoPlayerWithProgressProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(initialProgress);
  
  // Track if seeking is in progress
  const [isSeeking, setIsSeeking] = useState(false);
  
  // Progress reporting interval
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if initial seek was performed
  const initialSeekPerformedRef = useRef(false);
  
  // Track last reported progress to avoid excessive updates
  const lastReportedProgressRef = useRef(initialProgress);
  
  // Log initial progress received
  useEffect(() => {
    console.log('VideoPlayer received initial progress:', initialProgress);
    setProgress(initialProgress);
    lastReportedProgressRef.current = initialProgress;
  }, [initialProgress]);
  
  // Handle seeking from transcript
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || seekToTime === undefined) return;
    
    // Only seek if video is loaded
    if (videoElement.readyState >= 2) {
      handleSeek(seekToTime);
    }
  }, [seekToTime]);

  // Initialize video when URL changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    initialSeekPerformedRef.current = false;
    
    if (!videoUrl) {
      setError('No video URL provided');
      setIsLoading(false);
      return;
    }
    
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Set up event listeners
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
      
      // Set initial playback position based on progress only if not already done
      if (!initialSeekPerformedRef.current && initialProgress > 0 && initialProgress < 100) {
        console.log(`Setting initial playback position based on progress: ${initialProgress}%`);
        const seekTime = (initialProgress / 100) * videoElement.duration;
        videoElement.currentTime = seekTime;
        setCurrentTime(seekTime);
        initialSeekPerformedRef.current = true;
      }
    };
    
    const handleError = () => {
      setError('Failed to load video');
      setIsLoading(false);
    };
    
    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(videoElement.currentTime);
        
        // Calculate progress percentage
        if (videoElement.duration) {
          const newProgress = (videoElement.currentTime / videoElement.duration) * 100;
          setProgress(newProgress);
        }
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-set to 100% complete when video ends
      setProgress(100);
      
      // Only update progress if not already completed
      if (!isCompleted) {
        onProgressUpdate?.(100, videoElement.currentTime);
      }
      
      // Call onComplete callback if provided
      if (onComplete) {
        console.log('Video ended, calling onComplete callback');
        onComplete();
      }
    };
    
    // Add play/pause listeners to sync isPlaying state
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      
      // Only report progress if lecture is not already completed
      if (!isCompleted) {
        const newProgress = (videoElement.currentTime / videoElement.duration) * 100;
        
        // Only report if progress has changed significantly (>1%)
        if (Math.abs(newProgress - lastReportedProgressRef.current) > 1) {
          console.log(`Reporting progress on pause: ${newProgress.toFixed(1)}%`);
          onProgressUpdate?.(newProgress, videoElement.currentTime);
          lastReportedProgressRef.current = newProgress;
        }
      }
    };
    
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    
    // Clean up event listeners
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      
      // Clear any intervals
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoUrl, initialProgress, onProgressUpdate]);
  
  // Set up progress reporting interval when playing
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isPlaying) {
      // Report progress every 5 seconds while playing (only if not completed)
      progressIntervalRef.current = setInterval(() => {
        const newProgress = (videoElement.currentTime / videoElement.duration) * 100;
        
        // Only report progress if lecture is not already completed
        if (!isCompleted && Math.abs(newProgress - lastReportedProgressRef.current) > 1) {
          console.log(`Reporting progress during playback: ${newProgress.toFixed(1)}%`);
          onProgressUpdate?.(newProgress, videoElement.currentTime);
          lastReportedProgressRef.current = newProgress;
          
          // Call onComplete if we've reached completion threshold
          if (newProgress >= 95 && onComplete) {
            console.log('Progress reached completion threshold, calling onComplete');
            onComplete();
          }
        }
      }, 5000);
    } else {
      // Clear interval when paused
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, onProgressUpdate]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
      
      // Only report progress if lecture is not already completed
      if (!isCompleted) {
        const newProgress = (videoElement.currentTime / videoElement.duration) * 100;
        
        // Only report if progress has changed significantly (>1%)
        if (Math.abs(newProgress - lastReportedProgressRef.current) > 1) {
          console.log(`Reporting progress on manual pause: ${newProgress.toFixed(1)}%`);
          onProgressUpdate?.(newProgress, videoElement.currentTime);
          lastReportedProgressRef.current = newProgress;
        }
      }
    } else {
      videoElement.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Error playing video:', err);
          setError('Failed to play video. Please try again.');
        });
    }
  };
  
  // Handle seeking - only allow backward seeking unless lecture is already completed
  const handleSeek = (newTime: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Restrict forward seeking unless lecture is already completed
    if (!isCompleted && newTime > videoElement.currentTime) {
      console.log('Forward seeking blocked - complete the lecture first');
      return;
    }
    
    setIsSeeking(true);
    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
    
    // Calculate and update progress
    const newProgress = (newTime / videoElement.duration) * 100;
    setProgress(newProgress);
    
    // Only report progress if lecture is not completed
    if (!isCompleted) {
      console.log(`Reporting progress after seek: ${newProgress.toFixed(1)}%`);
      onProgressUpdate?.(newProgress, newTime);
      lastReportedProgressRef.current = newProgress;
    }
    
    setIsSeeking(false);
  };
  
  // Format time (seconds) to mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.volume = newVolume;
    setVolume(newVolume);
  };
  
  return (
    <div className="relative w-full h-full">
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain bg-black"
        poster={poster}
        preload="metadata"
        playsInline
        onLoadedData={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError('Failed to load video');
        }}
      />
      
      {/* Loading overlay - only show when actually loading and not errored */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4">
          <div className="text-center">
            <p className="text-red-400 mb-2">Error: {error}</p>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-md"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        {/* Progress bar */}
        <div className={`relative w-full h-1 bg-gray-600 rounded-full mb-2 ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={(e) => {
            // Only allow seeking if lecture is completed or seeking backwards
            if (isCompleted) {
              const rect = e.currentTarget.getBoundingClientRect();
              const position = (e.clientX - rect.left) / rect.width;
              handleSeek(position * duration);
            }
          }}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
          {/* Add visual indicator that forward seeking is disabled */}
          {!isCompleted && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full transform translate-x-1 -translate-y-1"
              title="Forward seeking disabled until lecture completion"
            ></div>
          )}
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause button */}
            <button 
              className="text-white focus:outline-none"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
            
            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button 
                className="text-white focus:outline-none"
                onClick={() => handleVolumeChange(volume === 0 ? 1 : 0)}
              >
                {volume === 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          {/* Time display */}
          <div className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
}