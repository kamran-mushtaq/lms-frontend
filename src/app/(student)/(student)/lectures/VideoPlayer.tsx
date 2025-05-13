// src/components/student/lecture/VideoPlayer.tsx
import { useState, useEffect, useRef } from "react";
import { YouTubeEmbed } from "@next/third-parties/youtube";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    PlayCircle, PauseCircle, Volume2, VolumeX,
    Maximize, Minimize, RotateCcw, Settings, CheckCircle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTime } from "@/lib/utils";
import { updateLectureProgress } from "./api/lecture-service";

interface VideoPlayerProps {
    videoUrl: string;
    duration: number;
    thumbnailUrl?: string;
    onTimeUpdate?: (currentTime: number) => void;
    onProgress: (progress: number) => void;
    initialProgress?: number;
    lectureId: string;
}

export default function VideoPlayer({
    videoUrl,
    duration,
    thumbnailUrl,
    onTimeUpdate,
    onProgress,
    initialProgress = 0,
    lectureId
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [loading, setLoading] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [progress, setProgress] = useState(initialProgress || 0);
    const [showSavedIndicator, setShowSavedIndicator] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);

    const progressReportTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastReportedTimeRef = useRef<number>(0);

    // Check if URL is a YouTube URL
    const isYoutubeUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:)?\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(&.*)?$/;
        return youtubeRegex.test(url);
    };

    // Extract YouTube video ID from URL
    const getYoutubeVideoId = (url: string): string | null => {
        const match = url.match(/^(https?:)?\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(&.*)?$/);
        return match && match[4] ? match[4] : null;
    };

    // Check if video is YouTube
    const [isYoutube, setIsYoutube] = useState(videoUrl ? isYoutubeUrl(videoUrl) : false);
    const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

    useEffect(() => {
        if (videoUrl) {
            const isYT = isYoutubeUrl(videoUrl);
            setIsYoutube(isYT);
            if (isYT) {
                const videoId = getYoutubeVideoId(videoUrl);
                setYoutubeVideoId(videoId);
            }
        }
    }, [videoUrl]);

    // Initialize video and attempt playback after load
    useEffect(() => {
        if (!isYoutube && videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
            videoRef.current.playbackRate = playbackRate;

            // Set initial position based on progress
            if (initialProgress > 0 && initialProgress < 100) {
                const startTimeSeconds = (initialProgress / 100) * duration;
                videoRef.current.currentTime = startTimeSeconds;
                setCurrentTime(startTimeSeconds);
            }

            // Add error handling for video element
            const handleVideoError = () => {
                if (videoRef.current) {
                    const errorCode = videoRef.current.error?.code;
                    let errorMessage = "An error occurred while playing the video.";
                    
                    switch (errorCode) {
                        case 1: // MEDIA_ERR_ABORTED
                            errorMessage = "The video playback was aborted.";
                            break;
                        case 2: // MEDIA_ERR_NETWORK
                            errorMessage = "A network error caused the video download to fail.";
                            break;
                        case 3: // MEDIA_ERR_DECODE
                            errorMessage = "The video could not be decoded.";
                            break;
                        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                            errorMessage = "The video format is not supported.";
                            break;
                    }
                    
                    setVideoError(errorMessage);
                    setLoading(false);
                }
            };

            videoRef.current.addEventListener('error', handleVideoError);
            
            return () => {
                if (videoRef.current) {
                    videoRef.current.removeEventListener('error', handleVideoError);
                }
            };
        }
    }, [initialProgress, duration, volume, isMuted, playbackRate]);

    // Setup mouse control events
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            const handleMouseMove = () => {
                setShowControls(true);

                // Clear any existing timeout
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current);
                }

                // Hide controls after 3 seconds of inactivity
                controlsTimeoutRef.current = setTimeout(() => {
                    if (isPlaying) {
                        setShowControls(false);
                    }
                }, 3000);
            };

            container.addEventListener("mousemove", handleMouseMove);

            return () => {
                container.removeEventListener("mousemove", handleMouseMove);
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current);
                }
                if (progressReportTimeoutRef.current) {
                    clearTimeout(progressReportTimeoutRef.current);
                }
            };
        }
    }, [isPlaying]);

    // Handle time updates
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);

            if (onTimeUpdate) {
                onTimeUpdate(time);
            }

            // Calculate progress percentage
            const calculatedProgress = Math.round((time / duration) * 100);
            setProgress(calculatedProgress);

            // Report progress to parent component
            if (onProgress && calculatedProgress !== Math.round(progress)) {
                onProgress(calculatedProgress);
            }

            // Report progress to server at most once every 10 seconds
            if (
                time > lastReportedTimeRef.current + 10 ||
                (calculatedProgress >= 90 && lastReportedTimeRef.current < duration - 15)
            ) {
                lastReportedTimeRef.current = time;

                // Debounce progress reports to avoid too many API calls
                if (progressReportTimeoutRef.current) {
                    clearTimeout(progressReportTimeoutRef.current);
                }

                const saveProgress = async () => {
                    try {
                        await updateLectureProgress(lectureId, { 
                            progress: calculatedProgress, 
                            currentTime: time 
                        });
                        // Show saved indicator 
                        setShowSavedIndicator(true);
                        setTimeout(() => setShowSavedIndicator(false), 2000);
                    } catch (err) {
                        console.error("Error updating lecture progress:", err);
                    }
                };
                
                progressReportTimeoutRef.current = setTimeout(saveProgress, 2000);
            }
        }
    };

    // Play/Pause toggle
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                // Use the play() Promise to handle autoplay restrictions
                const playPromise = videoRef.current.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                            setVideoError(null);
                        })
                        .catch(error => {
                            console.error("Error playing video:", error);
                            setVideoError("Could not play video. This may be due to autoplay restrictions.");
                        });
                }
            }
        }
    };

    // Volume control
    const handleVolumeChange = (values: number[]) => {
        const newVolume = values[0];
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };

    // Toggle mute
    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
        }
    };

    // Seek to a specific time
    const handleSeek = (values: number[]) => {
        const seekTime = (values[0] / 100) * duration;
        setCurrentTime(seekTime);
        if (videoRef.current) {
            videoRef.current.currentTime = seekTime;
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    // Set playback rate
    const handlePlaybackRateChange = (rate: number) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
        >
            {/* Video Element - Show regular video player for MP4 or YouTube embed for YouTube URLs */}
            {isYoutube && youtubeVideoId ? (
                <div className="w-full h-full">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&controls=1&rel=0&modestbranding=1`}
                        className="w-full h-full"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full"
                    poster={thumbnailUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onWaiting={() => setLoading(true)}
                    onCanPlay={() => setLoading(false)}
                    onEnded={() => {
                        setIsPlaying(false);
                        onProgress(100);
                    }}
                    onClick={togglePlay}
                    controls={false} // Disable default controls
                    playsInline // Better mobile experience
                    preload="auto" // Preload for better playback
                />
            )}

            {/* Loading Indicator - Only show for non-YouTube videos */}
            {!isYoutube && loading && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Video Error Message - Only show for non-YouTube videos */}
            {!isYoutube && videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-6">
                    <div className="max-w-md text-center">
                        <div className="text-red-500 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Video Error</h3>
                        <p className="mb-4">{videoError}</p>
                        <Button 
                            variant="default" 
                            onClick={() => {
                                setVideoError(null);
                                if (videoRef.current) {
                                    videoRef.current.load();
                                }
                            }}
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

            {/* Save Progress Indicator */}
            {showSavedIndicator && (
                <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 shadow-md">
                    <CheckCircle className="h-4 w-4" />
                    Progress saved
                </div>
            )}

            {/* Big Play Button (only when paused, for non-YouTube videos) */}
            {!isYoutube && !isPlaying && !loading && !videoError && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full text-white bg-primary/80 hover:bg-primary shadow-lg"
                    onClick={togglePlay}
                >
                    <PlayCircle className="h-12 w-12" />
                </Button>
            )}

            {/* Video Controls - Only show for non-YouTube videos since YouTube has its own controls */}
            {!isYoutube && (
                <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pt-8 pb-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
                >
                {/* Progress Bar */}
                <Slider
                    value={[currentTime / duration * 100]}
                    onValueChange={handleSeek}
                    max={100}
                    step={0.1}
                    className="h-1.5 mb-3 hover:h-2.5 transition-all duration-200"
                />

                {/* Controls Row */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                        {/* Play/Pause Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white rounded-full hover:bg-white/20"
                            onClick={togglePlay}
                        >
                            {isPlaying ? (
                                <PauseCircle className="h-5 w-5" />
                            ) : (
                                <PlayCircle className="h-5 w-5" />
                            )}
                        </Button>

                        {/* Time Display */}
                        <div className="text-xs min-w-[100px]">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Volume Control */}
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white rounded-full hover:bg-white/20"
                                onClick={toggleMute}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="h-5 w-5" />
                                ) : (
                                    <Volume2 className="h-5 w-5" />
                                )}
                            </Button>

                            <Slider
                                value={[isMuted ? 0 : volume]}
                                onValueChange={handleVolumeChange}
                                max={1}
                                step={0.01}
                                className="w-20 hidden sm:block"
                            />
                        </div>

                        {/* Playback Speed */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white rounded-full hover:bg-white/20">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                    <DropdownMenuItem
                                        key={rate}
                                        onClick={() => handlePlaybackRateChange(rate)}
                                        className={playbackRate === rate ? "bg-accent" : ""}
                                    >
                                        {rate === 1 ? "Normal" : `${rate}x`}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Reset Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white rounded-full hover:bg-white/20"
                            onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.currentTime = 0;
                                    setCurrentTime(0);
                                }
                            }}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>

                        {/* Fullscreen Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white rounded-full hover:bg-white/20"
                            onClick={toggleFullscreen}
                        >
                            {isFullscreen ? (
                                <Minimize className="h-5 w-5" />
                            ) : (
                                <Maximize className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}