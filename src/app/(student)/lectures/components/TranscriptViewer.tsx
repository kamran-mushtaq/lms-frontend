// File: src/app/(pages)/lectures/components/TranscriptViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TranscriptSegment, formatTime } from '../utils/LectureViewUtils';

interface TranscriptViewerProps {
    transcript: TranscriptSegment[];
    currentTime?: number;
    onSegmentClick?: (startTime: number) => void;
    onClose?: () => void;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
    transcript,
    currentTime = 0,
    onSegmentClick,
    onClose
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTranscript, setFilteredTranscript] = useState<TranscriptSegment[]>([]);
    const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const activeSegmentRef = useRef<HTMLDivElement>(null);

    // Filter transcript when search term changes
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredTranscript(transcript);
            return;
        }

        const filtered = transcript.filter(segment =>
            segment.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTranscript(filtered);
    }, [searchTerm, transcript]);

    // Find active segment based on current playback time
    useEffect(() => {
        if (!currentTime || transcript.length === 0) {
            setActiveSegmentId(null);
            return;
        }

        // Find the current segment based on playback time
        for (let i = 0; i < transcript.length; i++) {
            const segment = transcript[i];
            const nextSegment = transcript[i + 1];

            if (
                currentTime >= segment.startTime &&
                (!nextSegment || currentTime < nextSegment.startTime)
            ) {
                setActiveSegmentId(i);
                break;
            }
        }
    }, [currentTime, transcript]);

    // Scroll to active segment when it changes
    useEffect(() => {
        if (activeSegmentId !== null && activeSegmentRef.current && scrollAreaRef.current) {
            const scrollArea = scrollAreaRef.current;
            const activeElement = activeSegmentRef.current;

            // Calculate the position of the active segment
            const activePosition = activeElement.offsetTop;
            const scrollAreaHeight = scrollArea.clientHeight;

            // Scroll to the active segment if it's not visible
            if (
                activePosition < scrollArea.scrollTop ||
                activePosition > scrollArea.scrollTop + scrollAreaHeight
            ) {
                scrollArea.scrollTop = activePosition - scrollAreaHeight / 2;
            }
        }
    }, [activeSegmentId]);

    const handleSegmentClick = (index: number) => {
        if (onSegmentClick && transcript[index]) {
            onSegmentClick(transcript[index].startTime);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const exportTranscript = () => {
        // Create text content
        let textContent = 'Transcript\n\n';

        transcript.forEach(segment => {
            textContent += `[${formatTime(segment.startTime)}] ${segment.text}\n`;
        });

        // Create a blob and download it
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'transcript.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="transcript-viewer-container bg-background rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Transcript</h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportTranscript}>
                        <Download className="h-4 w-4 mr-1" /> Export
                    </Button>
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search transcript..."
                    className="pl-8 pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7"
                        onClick={handleClearSearch}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {filteredTranscript.length === 0 ? (
                <div className="text-center py-8">
                    {transcript.length === 0 ? (
                        <p className="text-muted-foreground">No transcript available</p>
                    ) : (
                        <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                    )}
                </div>
            ) : (
                <div className="h-[300px] overflow-auto pr-2" ref={scrollAreaRef}>
                    <div className="space-y-1">
                        {filteredTranscript.map((segment, index) => (
                            <div
                                key={index}
                                ref={activeSegmentId === index ? activeSegmentRef : null}
                                className={`transcript-segment p-2 rounded cursor-pointer transition-colors ${activeSegmentId === index
                                        ? 'bg-primary/20 text-primary-foreground'
                                        : 'hover:bg-secondary/40'
                                    }`}
                                onClick={() => handleSegmentClick(index)}
                            >
                                <div className="text-muted-foreground text-xs mb-1">
                                    {formatTime(segment.startTime)}
                                </div>
                                <p className="text-sm">{segment.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranscriptViewer;