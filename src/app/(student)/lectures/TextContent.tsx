// src/components/student/lecture/TextContent.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Printer,
    Download,
    Maximize,
    Minimize
} from "lucide-react";
import { updateLectureProgress } from "./api/lecture-service";

interface TextContentProps {
    content: string;
    onProgress: (progress: number) => void;
    initialProgress?: number;
    lectureId: string;
}

export default function TextContent({
    content,
    onProgress,
    initialProgress = 0,
    lectureId
}: TextContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [progress, setProgress] = useState(initialProgress || 0);
    const [maxScrollPosition, setMaxScrollPosition] = useState(0);

    const progressReportTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize scroll position
    useEffect(() => {
        const contentElement = contentRef.current;
        if (contentElement) {
            // Calculate max scroll position
            const scrollHeight = contentElement.scrollHeight;
            const clientHeight = contentElement.clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            setMaxScrollPosition(maxScroll);

            // Set initial scroll position based on progress
            if (initialProgress > 0 && maxScroll > 0) {
                const scrollPosition = (initialProgress / 100) * maxScroll;
                contentElement.scrollTop = scrollPosition;
            }
        }
    }, [initialProgress, content]);

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

    // Track scroll progress
    const handleScroll = () => {
        const contentElement = contentRef.current;
        if (contentElement) {
            // Calculate current scroll position
            const scrollTop = contentElement.scrollTop;
            const scrollHeight = contentElement.scrollHeight;
            const clientHeight = contentElement.clientHeight;

            // Update max scroll position if needed
            const maxScroll = scrollHeight - clientHeight;
            if (maxScroll !== maxScrollPosition) {
                setMaxScrollPosition(maxScroll);
            }

            // Calculate progress
            const calculatedProgress = maxScroll > 0 ? Math.round((scrollTop / maxScroll) * 100) : 100;
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
                    scrollPosition: scrollTop
                });
            }, 2000);
        }
    };

    // Zoom controls
    const zoomIn = () => {
        setZoom(Math.min(zoom + 0.1, 1.5));
    };

    const zoomOut = () => {
        setZoom(Math.max(zoom - 0.1, 0.8));
    };

    // Reset zoom
    const resetZoom = () => {
        setZoom(1);
    };

    // Handle printing content
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    // Handle downloading content
    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lecture-content.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full bg-white rounded-md overflow-hidden"
        >
            {/* Toolbar */}
            <div className="bg-muted p-2 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomOut}
                        disabled={zoom <= 0.8}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>

                    <span className="text-sm">{Math.round(zoom * 100)}%</span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomIn}
                        disabled={zoom >= 1.5}
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
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                    >
                        <Printer className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                    </Button>

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

            {/* Content Display Area */}
            <ScrollArea
                className="flex-1"
                onScrollCapture={handleScroll}
                ref={contentRef}
            >
                <div
                    className="p-8 max-w-4xl mx-auto"
                    style={{
                        fontSize: `${zoom}rem`,
                        lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </ScrollArea>

            {/* Progress Indicator */}
            <div className="p-2 border-t bg-muted flex items-center justify-end">
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                </div>
            </div>
        </div>
    );
}