// src/components/student/lecture/PDFViewer.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    Search,
    RotateCcw,
    File
} from "lucide-react";
import { updateLectureProgress } from "./api/lecture-service";

// In a real app, you would use a PDF library like pdfjs-dist
// This is a simplified example that doesn't actually render PDFs

interface PDFViewerProps {
    pdfUrl: string;
    onProgress: (progress: number) => void;
    initialProgress?: number;
    lectureId: string;
}

export default function PDFViewer({
    pdfUrl,
    onProgress,
    initialProgress = 0,
    lectureId
}: PDFViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10); // This would come from PDF.js
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(initialProgress || 0);

    const progressReportTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial setup
    useEffect(() => {
        // This is where you would initialize PDF.js
        // Example:
        // const loadingTask = pdfjs.getDocument(pdfUrl);
        // loadingTask.promise.then(pdf => {
        //   setTotalPages(pdf.numPages);
        //   setLoading(false);
        // });

        // For this example, we'll simulate loading
        const timer = setTimeout(() => {
            setLoading(false);

            // Set initial page based on progress
            if (initialProgress > 0) {
                const initialPage = Math.max(1, Math.ceil((initialProgress / 100) * totalPages));
                setCurrentPage(initialPage);
            }
        }, 1500);

        return () => {
            clearTimeout(timer);
            if (progressReportTimeoutRef.current) {
                clearTimeout(progressReportTimeoutRef.current);
            }
        };
    }, [pdfUrl, initialProgress, totalPages]);

    // Update progress when page changes
    useEffect(() => {
        const calculatedProgress = Math.round((currentPage / totalPages) * 100);
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
                currentPage
            });
        }, 2000);
    }, [currentPage, totalPages, onProgress, lectureId]);

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

    // Navigate to next/previous page
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Zoom controls
    const zoomIn = () => {
        setZoom(Math.min(zoom + 0.25, 3));
    };

    const zoomOut = () => {
        setZoom(Math.max(zoom - 0.25, 0.5));
    };

    // Reset zoom
    const resetZoom = () => {
        setZoom(1);
    };

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // This is where you would implement PDF search
        // For example:
        // pdf.getPage(currentPage).then(page => {
        //   page.getTextContent().then(textContent => {
        //     // Search logic here
        //   });
        // });
        console.log(`Searching for: ${searchText}`);
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full bg-white rounded-md overflow-hidden"
        >
            {/* Toolbar */}
            <div className="bg-muted p-2 border-b flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage <= 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center min-w-[100px]">
                        <Input
                            type="number"
                            value={currentPage}
                            onChange={(e) => {
                                const page = parseInt(e.target.value);
                                if (page >= 1 && page <= totalPages) {
                                    setCurrentPage(page);
                                }
                            }}
                            className="w-12 h-8 text-center"
                            min={1}
                            max={totalPages}
                            disabled={loading}
                        />
                        <span className="mx-2 text-sm text-muted-foreground">of {totalPages}</span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages || loading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomOut}
                        disabled={zoom <= 0.5 || loading}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>

                    <span className="text-sm">{Math.round(zoom * 100)}%</span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomIn}
                        disabled={zoom >= 3 || loading}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetZoom}
                        disabled={zoom === 1 || loading}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="h-8 pl-8 w-[120px] sm:w-[180px]"
                            disabled={loading}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={!searchText.trim() || loading}
                    >
                        Find
                    </Button>
                </form>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    disabled={loading}
                >
                    {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                    ) : (
                        <Maximize className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* PDF Display Area */}
            <div className="flex-1 overflow-auto bg-gray-100">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="flex justify-center p-4 min-h-full">
                        <div
                            className="bg-white shadow-md transition-transform origin-center"
                            style={{ transform: `scale(${zoom})` }}
                        >
                            {/* This is where the actual PDF page would be rendered */}
                            <div className="w-[595px] h-[842px] flex items-center justify-center border">
                                <div className="text-center p-4">
                                    <File className="h-16 w-16 mx-auto text-muted-foreground" />
                                    <p className="mt-4 text-muted-foreground">
                                        PDF page {currentPage} of {totalPages} would be displayed here.
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        In a real application, this would use a library like PDF.js to render actual PDF content.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Page Progress Indicator */}
            <div className="p-2 border-t bg-muted flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>
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