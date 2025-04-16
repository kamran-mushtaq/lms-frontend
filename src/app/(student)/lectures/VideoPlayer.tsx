// src/components/student/lecture/VideoPlayer.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    PlayCircle, PauseCircle, Volume2, VolumeX,
    Maximize, Minimize, RotateCcw, Settings
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
    const [quality, setQuality] = useState<string>("auto");
    const [progress, setProgress] = useState(initialProgress || 0);

    const progressReportTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastReportedTimeRef = useRef<number>(0);

    // Initialize video
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
            videoRef.current.playbackRate = playbackRate;

            // Set initial position based on progress
            if (initialProgress > 0 && initialProgress < 100) {
                const startTimeSeconds = (initialProgress / 100) * duration;
                videoRef.current.currentTime = startTimeSeconds;
                setCurrentTime(startTimeSeconds);
            }
        }

        // Setup event listeners for mousemove to show/hide controls
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
    }, [initialProgress, duration, volume, isMuted, playbackRate, isPlaying]);

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

                progressReportTimeoutRef.current = setTimeout(() => {
                    updateLectureProgress(lectureId, { progress: calculatedProgress, currentTime: time });
                }, 2000);
            }
        }
    };

    // Play/Pause toggle
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
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
            className="relative w-full h-full bg-black rounded-md overflow-hidden group"
        >
            {/* Video Element */}
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
            />

            {/* Loading Indicator */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Big Play Button (only when paused) */}
            {!isPlaying && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full text-white bg-black bg-opacity-50 hover:bg-opacity-70"
                    onClick={togglePlay}
                >
                    <PlayCircle className="h-10 w-10" />
                </Button>
            )}

            {/* Video Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Progress Bar */}
                <Slider
                    value={[currentTime / duration * 100]}
                    onValueChange={handleSeek}
                    max={100}
                    step={0.1}
                    className="mb-2"
                />

                {/* Controls Row */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-2">
                        {/* Play/Pause Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={togglePlay}
                        >
                            {isPlaying ? (
                                <PauseCircle className="h-5 w-5" />
                            ) : (
                                <PlayCircle className="h-5 w-5" />
                            )}
                        </Button>

                        {/* Time Display */}
                        <div className="text-xs">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        {/* Volume Control */}
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20"
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
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
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
                            className="text-white hover:bg-white/20"
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
                            className="text-white hover:bg-white/20"
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
        </div>
    );
}