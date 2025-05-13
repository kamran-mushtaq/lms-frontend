// File: src/app/(pages)/lectures/components/VideoPlayer.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTime } from '../utils/LectureViewUtils';

interface VideoPlayerProps {
    videoUrl: string;
    thumbnailUrl?: string;
    initialTime?: number;
    onProgress?: (progressPercent: number, currentTime: number) => void;
    onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    thumbnailUrl,
    initialTime = 0,
    onProgress,
    onComplete
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // State for player controls
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(initialTime);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [loading, setLoading] = useState(true);

    // Hide controls after inactivity
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    // Set up initial state when video loads
    useEffect(() => {
        const videoElement = videoRef.current;

        if (videoElement) {
            const handleLoadedMetadata = () => {
                setDuration(videoElement.duration);
                if (initialTime > 0) {
                    videoElement.currentTime = initialTime;
                }
                setLoading(false);
            };

            videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

            return () => {
                videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [initialTime, videoRef.current]);

    // Handle time updates
    useEffect(() => {
        const videoElement = videoRef.current;

        if (videoElement) {
            const handleTimeUpdate = () => {
                setCurrentTime(videoElement.currentTime);

                // Calculate percentage of progress
                const percentage = (videoElement.currentTime / videoElement.duration) * 100;
                setProgress(percentage);

                // Call onProgress callback
                if (onProgress) {
                    onProgress(percentage, videoElement.currentTime);
                }

                // Auto mark as complete when reaching 95%+ of content
                if (percentage >= 95 && onComplete) {
                    onComplete();
                }
            };

            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            const handleEnded = () => {
                setIsPlaying(false);
                if (onComplete) onComplete();
            };

            videoElement.addEventListener('timeupdate', handleTimeUpdate);
            videoElement.addEventListener('play', handlePlay);
            videoElement.addEventListener('pause', handlePause);
            videoElement.addEventListener('ended', handleEnded);

            return () => {
                videoElement.removeEventListener('timeupdate', handleTimeUpdate);
                videoElement.removeEventListener('play', handlePlay);
                videoElement.removeEventListener('pause', handlePause);
                videoElement.removeEventListener('ended', handleEnded);
            };
        }
    }, [onProgress, onComplete]);

    // Monitor fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Handle control visibility
    useEffect(() => {
        const resetControlsTimeout = () => {
            // Clear existing timeout
            if (controlsTimeout.current) {
                clearTimeout(controlsTimeout.current);
            }

            // Show controls
            setShowControls(true);

            // Set new timeout
            controlsTimeout.current = setTimeout(() => {
                if (isPlaying) {
                    setShowControls(false);
                }
            }, 3000);
        };

        const videoContainer = document.querySelector('.video-container');

        if (videoContainer) {
            videoContainer.addEventListener('mousemove', resetControlsTimeout);
            videoContainer.addEventListener('mouseenter', resetControlsTimeout);
            videoContainer.addEventListener('mouseleave', () => {
                if (isPlaying) {
                    setShowControls(false);
                }
            });
        }

        return () => {
            if (videoContainer) {
                videoContainer.removeEventListener('mousemove', resetControlsTimeout);
                videoContainer.removeEventListener('mouseenter', resetControlsTimeout);
                videoContainer.removeEventListener('mouseleave', () => {
                    if (isPlaying) {
                        setShowControls(false);
                    }
                });
            }

            if (controlsTimeout.current) {
                clearTimeout(controlsTimeout.current);
            }
        };
    }, [isPlaying]);

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }

        // Update mute state based on volume
        if (newVolume === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handlePlaybackRateChange = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    const handleSeek = (value: number[]) => {
        if (videoRef.current) {
            const seekTime = (value[0] / 100) * videoRef.current.duration;
            videoRef.current.currentTime = seekTime;
            setCurrentTime(seekTime);
        }
    };

    const skipForward = (seconds = 10) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds);
        }
    };

    const skipBackward = (seconds = 10) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
        }
    };

    const toggleFullscreen = () => {
        const videoContainer = document.querySelector('.video-container');

        if (!isFullscreen) {
            if (videoContainer?.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if ((videoContainer as any)?.webkitRequestFullscreen) {
                (videoContainer as any).webkitRequestFullscreen();
            } else if ((videoContainer as any)?.msRequestFullscreen) {
                (videoContainer as any).msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
        }
    };

    return (
        <div className="video-container relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                </div>
            )}

            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                poster={thumbnailUrl}
                preload="metadata"
                onClick={togglePlayPause}
            />

            {/* Video Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Progress bar */}
                <div className="mb-3">
                    <Slider
                        value={[progress]}
                        min={0}
                        max={100}
                        step={0.01}
                        onValueChange={handleSeek}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button variant="ghost" size="icon" onClick={togglePlayPause} className="text-white hover:bg-white/20">
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>

                        {/* Skip controls */}
                        <Button variant="ghost" size="icon" onClick={() => skipBackward()} className="text-white hover:bg-white/20">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => skipForward()} className="text-white hover:bg-white/20">
                            <ChevronRight className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                            <div className="w-20">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    onValueChange={handleVolumeChange}
                                />
                            </div>
                        </div>

                        <span className="text-white text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePlaybackRateChange(0.5)}>
                                    0.5x {playbackRate === 0.5 && '✓'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePlaybackRateChange(0.75)}>
                                    0.75x {playbackRate === 0.75 && '✓'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePlaybackRateChange(1)}>
                                    1x {playbackRate === 1 && '✓'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePlaybackRateChange(1.25)}>
                                    1.25x {playbackRate === 1.25 && '✓'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePlaybackRateChange(1.5)}>
                                    1.5x {playbackRate === 1.5 && '✓'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePlaybackRateChange(2)}>
                                    2x {playbackRate === 2 && '✓'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                            <Maximize className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Center play button for mobile or when paused */}
            {(!isPlaying || !showControls) && (
                <button
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-4 text-white hover:bg-black/70 transition-all"
                    onClick={togglePlayPause}
                >
                    <Play className="h-8 w-8" />
                </button>
            )}
        </div>
    );
};

export default VideoPlayer;