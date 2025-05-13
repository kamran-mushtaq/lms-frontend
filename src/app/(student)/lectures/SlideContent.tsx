// src/components/student/lecture/SlideContent.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    RotateCcw,
    MoreHorizontal
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { updateLectureProgress } from "./api/lecture-service";

interface SlideContentProps {
    slides: Array<{
        id: string;
        title?: string;
        imageUrl: string;
        content?: string;
    }>;
    onProgress: (progress: number) => void;
    initialProgress?: number;
    lectureId: string;
}

export default function SlideContent({
    slides,
    onProgress,
    initialProgress = 0,
    lectureId
}: SlideContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [presentationMode, setPresentationMode] = useState(false);
    const [progress, setProgress] = useState(initialProgress || 0);

    const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressReportTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Set initial slide based on progress
    useEffect(() => {
        if (initialProgress > 0 && slides.length > 0) {
            const initialSlide = Math.floor((initialProgress / 100) * slides.length);
            setCurrentSlideIndex(Math.min(initialSlide, slides.length - 1));
        }
    }, [initialProgress, slides.length]);

    // Update progress when slide changes
    useEffect(() => {
        const totalSlides = slides.length;
        if (totalSlides > 0) {
            const calculatedProgress = Math.round(((currentSlideIndex + 1) / totalSlides) * 100);
            setProgress(calculatedProgress);

            // Report progress to parent component
            onProgress(calculatedProgress);

            // Report progress to server
            if (progressReportTimeoutRef.current) {
                clearTimeout(progressReportTimeoutRef.current);
            }

            progressReportTimeoutRef.current = setTimeout(() => {
                updateLectureProgress(lectureId, {
                    progress: calculatedProgress,
                    currentSlide: currentSlideIndex
                });
            }, 2000);
        }
    }, [currentSlideIndex, slides.length, onProgress, lectureId]);

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

            // Enter presentation mode when going fullscreen
            if (document.fullscreenElement) {
                setPresentationMode(true);
            } else {
                setPresentationMode(false);
                // Also stop autoplay if exiting fullscreen
                if (isAutoPlaying) {
                    stopAutoPlay();
                }
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [isAutoPlaying]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                goToPreviousSlide();
            } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
                goToNextSlide();
            } else if (e.key === "Escape") {
                if (presentationMode) {
                    setPresentationMode(false);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [presentationMode]);

    // Clean up timers
    useEffect(() => {
        return () => {
            if (autoPlayTimerRef.current) {
                clearInterval(autoPlayTimerRef.current);
            }
            if (progressReportTimeoutRef.current) {
                clearTimeout(progressReportTimeoutRef.current);
            }
        };
    }, []);

    // Navigate between slides
    const goToNextSlide = () => {
        if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        } else if (isAutoPlaying) {
            // Stop autoplay if we reach the end
            stopAutoPlay();
        }
    };

    const goToPreviousSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        }
    };

    const goToSlide = (index: number) => {
        if (index >= 0 && index < slides.length) {
            setCurrentSlideIndex(index);
        }
    };

    // Zoom controls
    const zoomIn = () => {
        setZoom(Math.min(zoom + 0.1, 2));
    };

    const zoomOut = () => {
        setZoom(Math.max(zoom - 0.1, 0.5));
    };

    // Reset zoom
    const resetZoom = () => {
        setZoom(1);
    };

    // Auto play controls
    const startAutoPlay = () => {
        setIsAutoPlaying(true);
        autoPlayTimerRef.current = setInterval(() => {
            goToNextSlide();
        }, 5000); // Change slide every 5 seconds
    };

    const stopAutoPlay = () => {
        setIsAutoPlaying(false);
        if (autoPlayTimerRef.current) {
            clearInterval(autoPlayTimerRef.current);
            autoPlayTimerRef.current = null;
        }
    };

    const toggleAutoPlay = () => {
        if (isAutoPlaying) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    };

    // Get current slide
    const currentSlide = slides[currentSlideIndex] || null;

    return (
        <div
            ref={containerRef}
            className={`flex flex-col h-full bg-white rounded-md overflow-hidden ${presentationMode ? 'bg-black' : ''
                }`}
        >
            {/* Toolbar - hidden in presentation mode */}
            {!presentationMode && (
                <div className="bg-muted p-2 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousSlide}
                            disabled={currentSlideIndex <= 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <span className="text-sm">
                            Slide {currentSlideIndex + 1} of {slides.length}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextSlide}
                            disabled={currentSlideIndex >= slides.length - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={zoomOut}
                            disabled={zoom <= 0.5}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>

                        <span className="text-sm">{Math.round(zoom * 100)}%</span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={zoomIn}
                            disabled={zoom >= 2}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetZoom}
                            disabled={zoom === 1}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Slide Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={toggleAutoPlay}>
                                    {isAutoPlaying ? "Stop" : "Start"} Auto Play
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPresentationMode(true)}>
                                    Presentation Mode
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullscreen}
                        >
                            {isFullscreen ? (
                                <Minimize className="h-4 w-4" />
                            ) : (
                                <Maximize className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Slide Display Area */}
            <div className={`flex-1 overflow-hidden ${presentationMode ? 'bg-black' : 'bg-gray-100'}`}>
                <div className="h-full flex items-center justify-center p-4">
                    {currentSlide ? (
                        <div
                            className={`relative transition-transform origin-center bg-white shadow-lg ${presentationMode ? 'max-h-full max-w-full' : ''
                                }`}
                            style={{
                                transform: `scale(${zoom})`,
                                maxWidth: presentationMode ? '100%' : '1200px'
                            }}
                        >
                            <img
                                src={currentSlide.imageUrl}
                                alt={currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                                className="max-w-full h-auto"
                            />

                            {/* Slide content (optional) */}
                            {currentSlide.content && (
                                <div
                                    className="p-4 bg-white"
                                    dangerouslySetInnerHTML={{ __html: currentSlide.content }}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-4">
                            <p className="text-muted-foreground">No slides available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Slide Navigation - Different in presentation mode */}
            {presentationMode ? (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-black/50 text-white border-white/20 hover:bg-white/20"
                        onClick={goToPreviousSlide}
                        disabled={currentSlideIndex <= 0}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                        variant={isAutoPlaying ? "default" : "outline"}
                        size="sm"
                        className={isAutoPlaying ? "bg-primary" : "bg-black/50 text-white border-white/20 hover:bg-white/20"}
                        onClick={toggleAutoPlay}
                    >
                        {isAutoPlaying ? "Auto Playing" : "Auto Play"}
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-black/50 text-white border-white/20 hover:bg-white/20"
                        onClick={goToNextSlide}
                        disabled={currentSlideIndex >= slides.length - 1}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-black/50 text-white border-white/20 hover:bg-white/20 absolute right-4"
                        onClick={() => document.exitFullscreen()}
                    >
                        <Minimize className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="p-2 border-t bg-muted">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex space-x-1">
                            {slides.map((_, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    className={`w-8 h-8 p-0 ${index === currentSlideIndex ? 'bg-primary text-primary-foreground' : 'bg-gray-200'
                                        }`}
                                    onClick={() => goToSlide(index)}
                                >
                                    {index + 1}
                                </Button>
                            ))}
                        </div>

                        <div className="ml-4 flex items-center space-x-2">
                            <Progress value={progress} className="w-24" />
                            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}