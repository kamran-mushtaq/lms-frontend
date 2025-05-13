'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipForward, 
  SkipBack,
  Settings,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerWithProgressProps {
  videoUrl?: string;
  initialProgress?: number;
  onProgressUpdate?: (progress: number, currentTime: number) => void;
  poster?: string;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function VideoPlayerWithProgress({
  videoUrl,
  initialProgress = 0,
  onProgressUpdate,
  poster
}: VideoPlayerWithProgressProps) {
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio state
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  
  // UI state
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Format time helper
  const formatTime = useCallback((timeInSeconds: number) => {
    if (!isFinite(timeInSeconds)) return '0:00';
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Set up initial progress
  useEffect(() => {
    if (videoRef.current && duration > 0 && initialProgress > 0 && !isDragging) {
      const targetTime = (initialProgress / 100) * duration;
      if (Math.abs(videoRef.current.currentTime - targetTime) > 5) {
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    }
  }, [duration, initialProgress, isDragging]);
  
  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !isDragging) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isDragging]);
  
  // Progress update interval
  useEffect(() => {
    if (isPlaying && onProgressUpdate && duration > 0) {
      progressUpdateIntervalRef.current = setInterval(() => {
        if (videoRef.current && !isDragging) {
          const progress = (videoRef.current.currentTime / duration) * 100;
          onProgressUpdate(progress, videoRef.current.currentTime);
        }
      }, 5000); // Update every 5 seconds
    } else {
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }
    }
    
    return () => {
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }
    };
  }, [isPlaying, onProgressUpdate, duration, isDragging]);
  
  // Video event handlers
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setError(null);
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handlePlay = () => {
    setIsPlaying(true);
    setError(null);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleWaiting = () => {
    setBuffering(true);
  };
  
  const handleCanPlay = () => {
    setBuffering(false);
    setIsLoading(false);
  };
  
  const handleEnded = () => {
    setIsPlaying(false);
    // Report 100% completion
    if (onProgressUpdate) {
      onProgressUpdate(100, duration);
    }
  };
  
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.target as HTMLVideoElement;
    setError(`Video error: ${target.error?.message || 'Unknown error'}`);
    setIsLoading(false);
    setBuffering(false);
  };
  
  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };
  
  // Control handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (error) {
        // Try to reload the video if there was an error
        videoRef.current.load();
        return;
      }
      
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Play failed:', err);
          setError('Failed to play video');
        });
      }
    }
  };
  
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        // Unmute - restore previous volume
        const volumeToRestore = previousVolume > 0 ? previousVolume : 0.5;
        setVolume(volumeToRestore);
        videoRef.current.volume = volumeToRestore;
        videoRef.current.muted = false;
        setIsMuted(false);
      } else {
        // Mute - save current volume
        setPreviousVolume(volume);
        setVolume(0);
        videoRef.current.volume = 0;
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };
  
  const handleSeek = (values: number[]) => {
    const newTime = values[0];
    setCurrentTime(newTime);
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      
      // Report progress immediately when seeking
      if (onProgressUpdate && duration > 0) {
        const progress = (newTime / duration) * 100;
        onProgressUpdate(progress, newTime);
      }
    }
  };
  
  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };
  
  // Fullscreen handlers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  };
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === document.body || (e.target as HTMLElement).closest('.video-container')) {
        switch (e.code) {
          case 'Space':
            e.preventDefault();
            togglePlay();
            break;
          case 'KeyF':
            e.preventDefault();
            toggleFullscreen();
            break;
          case 'KeyM':
            e.preventDefault();
            toggleMute();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            skip(-10);
            break;
          case 'ArrowRight':
            e.preventDefault();
            skip(10);
            break;
          case 'ArrowUp':
            e.preventDefault();
            setVolume(v => Math.min(1, v + 0.1));
            break;
          case 'ArrowDown':
            e.preventDefault();
            setVolume(v => Math.max(0, v - 0.1));
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Render
  return (
    <div 
      ref={containerRef}
      className="video-container relative w-full h-full bg-black overflow-hidden cursor-none group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying || setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        src={videoUrl}
        poster={poster}
        onLoadedMetadata={handleMetadataLoaded}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleError}
        onLoadStart={handleLoadStart}
        preload="metadata"
        playsInline
      />
      
      {/* Loading/Buffering indicator */}
      {(isLoading || buffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">
              {isLoading ? 'Loading...' : 'Buffering...'}
            </span>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <p className="text-lg mb-4">{error}</p>
            <Button onClick={togglePlay} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {/* Center play button when paused */}
      {!isPlaying && !isLoading && !buffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            className="h-20 w-20 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm"
            onClick={togglePlay}
          >
            <Play className="h-8 w-8 text-white fill-white" />
          </Button>
        </div>
      )}
      
      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            onValueCommit={(values) => {
              setIsDragging(false);
              handleSeek(values);
            }}
            onPointerDown={() => setIsDragging(true)}
            className="h-2 cursor-pointer [&>[role=slider]]:h-4 [&>[role=slider]]:w-4"
            rangeClassName="bg-white"
            thumbClassName="bg-white border-2 border-white/50"
          />
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Skip back */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => skip(-10)}
            >
              <SkipBack className="h-6 w-6" />
            </Button>
            
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            
            {/* Skip forward */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => skip(10)}
            >
              <SkipForward className="h-6 w-6" />
            </Button>
            
            {/* Volume controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.05}
                  onValueChange={handleVolumeChange}
                  className="h-1 cursor-pointer [&>[role=slider]]:h-3 [&>[role=slider]]:w-3"
                  rangeClassName="bg-white"
                  thumbClassName="bg-white"
                />
              </div>
            </div>
            
            {/* Time display */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Playback rate */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  Playback Speed
                </div>
                {PLAYBACK_RATES.map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={playbackRate === rate ? "bg-accent" : ""}
                  >
                    {rate}x {playbackRate === rate && "✓"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}