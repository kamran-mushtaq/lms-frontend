'use client';

import { useState, useEffect, useRef } from 'react';
import { TranscriptSegment } from "../hooks/useTranscript";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle } from "lucide-react";

interface TranscriptViewerProps {
  transcript: TranscriptSegment[];
  loading: boolean;
  error: string | null;
  hasTranscript: boolean;
  onTimeClick?: (time: number) => void;
  currentTime?: number;
}

export default function TranscriptViewer({
  transcript,
  loading,
  error,
  hasTranscript,
  onTimeClick,
  currentTime
}: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSegment, setCurrentSegment] = useState<number | null>(null);
  
  // Reference to transcript container for scrolling
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  
  // Update currentSegment based on video's currentTime
  useEffect(() => {
    if (currentTime !== undefined && transcript.length > 0) {
      const segmentIndex = transcript.findIndex(
        (segment, i) => {
          const isLast = i === transcript.length - 1;
          const nextStart = isLast ? Infinity : transcript[i + 1].start;
          return currentTime >= segment.start && currentTime < nextStart;
        }
      );
      
      if (segmentIndex !== -1) {
        setCurrentSegment(segmentIndex);
        
        // Scroll the current segment into view if it's not visible
        setTimeout(() => {
          const container = transcriptContainerRef.current;
          const currentSegmentEl = container?.querySelector(`[data-segment-index="${segmentIndex}"]`);
          
          if (container && currentSegmentEl) {
            const containerRect = container.getBoundingClientRect();
            const segmentRect = currentSegmentEl.getBoundingClientRect();
            
            // Check if segment is not visible in the container
            if (
              segmentRect.top < containerRect.top || 
              segmentRect.bottom > containerRect.bottom
            ) {
              currentSegmentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 100);
      }
    }
  }, [currentTime, transcript]);
  
  // Filter transcript by search query
  const filteredTranscript = searchQuery
    ? transcript.filter(segment => 
        segment.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transcript;
  
  // Format time (seconds) to mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds && timeInSeconds !== 0) return '00:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle time click (seek video to that time)
  const handleTimeClick = (time: number) => {
    if (onTimeClick) {
      onTimeClick(time);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading transcript...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-red-100 p-3 w-10 h-10 flex items-center justify-center mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Failed to load transcript</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No transcript available
  if (!hasTranscript) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No transcript is available for this lecture.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty transcript
  if (transcript.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              This lecture has a transcript, but it appears to be empty.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Normal state with transcript
  return (
    <Card>
      <CardContent className="p-6">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Transcript segments */}
        <div ref={transcriptContainerRef} className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {filteredTranscript.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No matches found for "{searchQuery}"
              </p>
            </div>
          ) : (
            filteredTranscript.map((segment, index) => (
              <div
                key={`${segment.start}-${index}`}
                data-segment-index={index}
                className={`p-2 rounded-md transition-colors ${
                currentSegment === index ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setCurrentSegment(index);
                  handleTimeClick(segment.start);
                }}
              >
                <div className="flex items-start">
                  <span 
                    className="text-xs font-mono text-primary cursor-pointer mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimeClick(segment.start);
                    }}
                  >
                    {formatTime(segment.start)}
                  </span>
                  <p className="text-sm flex-1">
                    {searchQuery ? (
                      highlightSearchText(segment.text, searchQuery)
                    ) : (
                      segment.text
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to highlight search text
function highlightSearchText(text: string, query: string) {
  if (!query.trim()) return text;
  
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

// Escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
