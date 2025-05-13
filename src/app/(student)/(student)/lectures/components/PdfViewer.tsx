// File: src/app/(pages)/lectures/components/PdfViewer.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from 'sonner';

interface PdfViewerProps {
    pdfUrl: string;
    initialPage?: number;
    onProgress?: (progressPercent: number, currentPage: number, totalPages: number) => void;
    onComplete?: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
    pdfUrl,
    initialPage = 1,
    onProgress,
    onComplete
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Track fullscreen state
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Initialize pdfjs when component mounts
    useEffect(() => {
        // We need to wait for iframe to load to access its content
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleIframeLoad = () => {
            setLoading(false);

            // Try to get PDF.js viewer info
            try {
                if (iframe.contentWindow) {
                    // We're using a timeout to make sure PDF.js has initialized properly
                    setTimeout(() => {
                        const pdfViewer = iframe.contentWindow?.PDFViewerApplication;
                        if (pdfViewer && pdfViewer.pagesCount) {
                            setTotalPages(pdfViewer.pagesCount);

                            // Jump to initial page if needed
                            if (initialPage > 1 && initialPage <= pdfViewer.pagesCount) {
                                pdfViewer.page = initialPage;
                            }

                            // Set up event listener for page changes
                            const handlePageChange = () => {
                                const newPage = pdfViewer.page;
                                setCurrentPage(newPage);

                                // Calculate progress percentage
                                const progressPercent = (newPage / pdfViewer.pagesCount) * 100;

                                // Call onProgress callback
                                if (onProgress) {
                                    onProgress(progressPercent, newPage, pdfViewer.pagesCount);
                                }

                                // Auto mark as complete when reaching the end of the document
                                if (newPage === pdfViewer.pagesCount && onComplete) {
                                    onComplete();
                                }
                            };

                            // Add custom event listener for page changes
                            iframe.contentWindow.addEventListener('pagechange', handlePageChange);
                        }
                    }, 1000);
                }
            } catch (error) {
                console.error('Failed to interact with PDF viewer:', error);
            }
        };

        iframe.addEventListener('load', handleIframeLoad);

        return () => {
            iframe.removeEventListener('load', handleIframeLoad);
        };
    }, [initialPage, onProgress, onComplete]);

    // Navigation functions
    const navigateToPage = (page: number) => {
        try {
            const iframe = iframeRef.current;
            if (iframe && iframe.contentWindow && iframe.contentWindow.PDFViewerApplication) {
                iframe.contentWindow.PDFViewerApplication.page = page;
            }
        } catch (error) {
            console.error('Failed to navigate to page:', error);
            toast.error('Failed to navigate to page');
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            navigateToPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            navigateToPage(currentPage - 1);
        }
    };

    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));

        try {
            const iframe = iframeRef.current;
            if (iframe && iframe.contentWindow && iframe.contentWindow.PDFViewerApplication) {
                iframe.contentWindow.PDFViewerApplication.zoomIn();
            }
        } catch (error) {
            console.error('Failed to zoom in:', error);
        }
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));

        try {
            const iframe = iframeRef.current;
            if (iframe && iframe.contentWindow && iframe.contentWindow.PDFViewerApplication) {
                iframe.contentWindow.PDFViewerApplication.zoomOut();
            }
        } catch (error) {
            console.error('Failed to zoom out:', error);
        }
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;

        if (!isFullscreen) {
            if (container?.requestFullscreen) {
                container.requestFullscreen();
            } else if ((container as any)?.webkitRequestFullscreen) {
                (container as any).webkitRequestFullscreen();
            } else if ((container as any)?.msRequestFullscreen) {
                (container as any).msRequestFullscreen();
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

    const downloadPdf = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = pdfUrl.split('/').pop() || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handle page input change
    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const page = parseInt(e.target.value);
        if (page >= 1 && page <= totalPages) {
            navigateToPage(page);
        }
    };

    return (
        <div ref={containerRef} className="pdf-viewer-container flex flex-col w-full h-[600px] bg-white rounded-lg shadow overflow-hidden">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            )}

            {/* PDF Controls */}
            <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPreviousPage}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center space-x-1">
                        <Input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={currentPage}
                            onChange={handlePageInputChange}
                            className="w-16 h-8"
                        />
                        <span className="text-sm">/ {totalPages}</span>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>

                    <span className="text-sm">{Math.round(scale * 100)}%</span>

                    <Button variant="outline" size="icon" onClick={zoomIn} disabled={scale >= 3}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                        <Maximize className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="icon" onClick={downloadPdf}>
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 relative">
                <iframe
                    ref={iframeRef}
                    src={`${pdfUrl}#page=${initialPage}`}
                    className="w-full h-full border-none"
                    title="PDF Viewer"
                />
            </div>
        </div>
    );
};

export default PdfViewer;