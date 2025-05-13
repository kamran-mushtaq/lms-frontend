'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from 'lucide-react';

interface VideoPlayerWithProgressProps {
  videoUrl: string;
  initialProgress?: number;
  onProgressUpdate?: (progress: number, currentTime: number) => void;
  poster?: string;
}

export default function VideoPlayerWithProgress({
  videoUrl,
  initialProgress = 0,
  onProgressUpdate,
  poster
}: VideoPlayerWithProgressProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [progressUpdateQueue, setProgressUpdateQueue] = useState<{progress: number, time: number} | null>(null);
  const [progressUpdateTimestamp, setProgressUpdateTimestamp] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set initial playback position based on progress
  useEffect(() => {
    if (videoRef.current && duration > 0 && initialProgress > 0) {
      const targetTime = (initialProgress / 100) * duration;
      if (targetTime > 0 && targetTime < duration) {
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    }
  }, [duration, initialProgress]);

  // Ensure audio is enabled
  useEffect(() => {
    if (videoRef.current) {
      // Set volume explicitly
      videoRef.current.volume = volume;
      // Ensure not muted
      videoRef.current.muted = false;
    }
  }, [volume]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', resetControlsTimeout);
      container.addEventListener('mousedown', resetControlsTimeout);
      container.addEventListener('touchstart', resetControlsTimeout);
    }

    resetControlsTimeout();

    return () => {
      if (container) {
        container.removeEventListener('mousemove', resetControlsTimeout);
        container.removeEventListener('mousedown', resetControlsTimeout);
        container.removeEventListener('touchstart', resetControlsTimeout);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Progress update with debounce
  useEffect(() => {
    if (!progressUpdateQueue) return;
    
    // Only update if it's been at least 3 seconds since the last update
    const now = Date.now();
    if (now - progressUpdateTimestamp < 3000) {
      return;
    }
    
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }
    
    progressUpdateTimeoutRef.current = setTimeout(() => {
      if (progressUpdateQueue && onProgressUpdate) {
        onProgressUpdate(progressUpdateQueue.progress, progressUpdateQueue.time);
        setProgressUpdateTimestamp(now);
        setProgressUpdateQueue(null);
      }
    }, 500);
    
    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, [progressUpdateQueue, onProgressUpdate, progressUpdateTimestamp]);

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Ensure not muted before playing
        videoRef.current.muted = false;
        setIsMuted(false);
        
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  // Handle seeking in the video
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Skip forward 10 seconds
  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Skip backward 10 seconds
  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle time update event
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const newCurrentTime = videoRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      
      // Calculate progress percentage
      if (duration > 0) {
        const progressPercent = Math.min(100, Math.round((newCurrentTime / duration) * 100));
        
        // Queue the progress update instead of immediately calling the function
        // This will allow us to debounce the updates
        setProgressUpdateQueue({
          progress: progressPercent,
          time: newCurrentTime
        });
      }
    }
  };

  // Handle video ended event
  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Report 100% progress when video ends
    if (onProgressUpdate) {
      onProgressUpdate(100, duration);
    }
  };

  // Handle metadata loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Set volume explicitly
      videoRef.current.volume = volume;
      // Ensure not muted when metadata is loaded
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  // Update fullscreen state when exiting via Escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle waiting/buffering state
  const handleWaiting = () => {
    setBuffering(true);
  };

  const handleCanPlay = () => {
    setBuffering(false);
    // Once video can play, ensure volume settings are applied
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = false;
    }
  };

  // Fix for iOS devices that may have issues with autoplay and audio
  const handleUserInteraction = () => {
    if (videoRef.current) {
      // Unmute on user interaction
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-black overflow-hidden"
      onMouseMove={() => setShowControls(true)}
      onClick={handleUserInteraction}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        src={videoUrl || "https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4"}
        poster={poster || "https://via.placeholder.com/640x360/000000/FFFFFF/?text=Video+Placeholder"}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadataLoaded}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleVideoEnded}
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        playsInline
      />

      {/* Buffering indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Play button overlay when paused */}
      {!isPlaying && !buffering && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <div className="h-20 w-20 bg-black/60 rounded-full flex items-center justify-center">
            <Play className="h-10 w-10 text-white" />
          </div>
        </div>
      )}

      {/* Video controls - fade in/out based on showControls state */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col gap-2">
          {/* Progress bar */}
          <div className="w-full">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="h-1.5 cursor-pointer"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20" 
                onClick={skipBackward}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20" 
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20" 
                onClick={skipForward}
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white hover:bg-white/20" 
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20 hidden sm:block">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={handleVolumeChange}
                    className="h-1.5 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-white ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20" 
                onClick={toggleFullscreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}