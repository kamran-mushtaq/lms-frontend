// components/lecture/lecture-transcript.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  text: string;
}

interface LectureTranscriptProps {
  transcript: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
  onClose: () => void;
}

export function LectureTranscript({ transcript, videoRef, onClose }: LectureTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<string | null>(null);
  const [parsedTranscript, setParsedTranscript] = useState<string>(transcript);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Parse transcript if it's in a structured format (like WebVTT)
  useEffect(() => {
    // Try to detect if transcript is in a structured format
    // This is a simple check - real implementation would need a proper parser
    const hasTimestamps = /\d{2}:\d{2}:\d{2}\.\d{3}\s-->\s\d{2}:\d{2}:\d{2}\.\d{3}/.test(transcript);
    
    if (hasTimestamps) {
      try {
        // Simple parser for WebVTT-like format
        const lines = transcript.split("\n");
        const parsedSegments: TranscriptSegment[] = [];
        let currentSegment: Partial<TranscriptSegment> = {};
        let segmentText: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Skip empty lines and WEBVTT header
          if (!line || line === "WEBVTT") continue;
          
          // Parse timestamp line
          const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s-->\s(\d{2}:\d{2}:\d{2}\.\d{3})/);
          if (timestampMatch) {
            // If we were building a segment, save it
            if (currentSegment.start !== undefined && segmentText.length > 0) {
              parsedSegments.push({
                id: `segment-${parsedSegments.length}`,
                start: currentSegment.start,
                end: currentSegment.end!,
                text: segmentText.join(" ")
              });
            }
            
            // Start a new segment
            const startTime = timestampToSeconds(timestampMatch[1]);
            const endTime = timestampToSeconds(timestampMatch[2]);
            
            currentSegment = { start: startTime, end: endTime };
            segmentText = [];
          }
          // Content line
          else if (currentSegment.start !== undefined) {
            segmentText.push(line);
          }
        }
        
        // Add the last segment if any
        if (currentSegment.start !== undefined && segmentText.length > 0) {
          parsedSegments.push({
            id: `segment-${parsedSegments.length}`,
            start: currentSegment.start,
            end: currentSegment.end!,
            text: segmentText.join(" ")
          });
        }
        
        if (parsedSegments.length > 0) {
          setSegments(parsedSegments);
        } else {
          // Fallback to plain text if parsing fails
          setParsedTranscript(transcript);
        }
      } catch (err) {
        console.error("Error parsing transcript:", err);
        setParsedTranscript(transcript);
      }
    } else {
      // Just use the raw text if no structured format detected
      setParsedTranscript(transcript);
    }
  }, [transcript]);

  // Update current segment based on video time
  useEffect(() => {
    if (!videoRef?.current || segments.length === 0) return;
    
    const handleTimeUpdate = () => {
      const currentTime = videoRef.current?.currentTime || 0;
      
      // Find the segment that contains the current time
      const activeSegment = segments.find(
        seg => currentTime >= seg.start && currentTime <= seg.end
      );
      
      if (activeSegment && activeSegment.id !== currentSegment) {
        setCurrentSegment(activeSegment.id);
        
        // Scroll to the current segment
        const segmentElement = document.getElementById(activeSegment.id);
        if (segmentElement && scrollAreaRef.current) {
          segmentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    
    videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, segments, currentSegment]);

  // Convert timestamp string (hh:mm:ss.mmm) to seconds
  const timestampToSeconds = (timestamp: string): number => {
    const [hours, minutes, seconds] = timestamp.split(':');
    const [sec, ms] = seconds.split('.');
    
    return (
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(sec) +
      parseInt(ms) / 1000
    );
  };

  // Format seconds to display time (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Jump to specific time in video
  const jumpToTime = (seconds: number) => {
    if (videoRef?.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  // Highlight search results
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return <span key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</span>;
      }
      return part;
    });
  };

  // Filter segments based on search query
  const filteredSegments = searchQuery && segments.length > 0
    ? segments.filter(seg => seg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : segments;

  // If there are no parsed segments, render plain text
  if (segments.length === 0) {
    return (
      <div className="border rounded-md overflow-hidden h-full flex flex-col">
        <div className="flex items-center justify-between bg-muted p-2 border-b">
          <h3 className="text-sm font-medium">Transcript</h3>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1">
          <ScrollArea className="h-full p-4">
            <div className="whitespace-pre-wrap text-sm">
              {parsedTranscript}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between bg-muted p-2 border-b">
        <h3 className="text-sm font-medium">Synchronized Transcript</h3>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1" ref={scrollAreaRef}>
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {filteredSegments.map((segment) => (
              <div 
                key={segment.id} 
                id={segment.id}
                className={`p-2 rounded-md text-sm cursor-pointer hover:bg-muted transition-colors ${
                  currentSegment === segment.id ? "bg-muted" : ""
                }`}
                onClick={() => jumpToTime(segment.start)}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(segment.start)}</span>
                </div>
                <div>{highlightText(segment.text)}</div>
              </div>
            ))}
            
            {searchQuery && filteredSegments.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}