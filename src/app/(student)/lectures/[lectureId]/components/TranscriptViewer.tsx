'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Play, 
  AlertCircle, 
  FileText,
  Download,
  Copy
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptViewerProps {
  transcript: TranscriptSegment[];
  loading: boolean;
  error: string | null;
  hasTranscript: boolean;
  onSeekTo?: (time: number) => void;
  currentTime?: number;
}

export default function TranscriptViewer({
  transcript,
  loading,
  error,
  hasTranscript,
  onSeekTo,
  currentTime = 0
}: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTranscript, setFilteredTranscript] = useState<TranscriptSegment[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { toast } = useToast();

  // Filter transcript based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTranscript(transcript);
      setHighlightedIndex(-1);
      return;
    }

    const filtered = transcript.filter(segment =>
      segment.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTranscript(filtered);
  }, [transcript, searchQuery]);

  // Highlight current segment based on time
  useEffect(() => {
    if (currentTime > 0 && transcript.length > 0) {
      const currentIndex = transcript.findIndex(
        segment => currentTime >= segment.start && currentTime <= segment.end
      );
      setHighlightedIndex(currentIndex);
    }
  }, [currentTime, transcript]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Navigate to time in video
  const handleSeekTo = (time: number) => {
    if (onSeekTo) {
      onSeekTo(time);
    }
  };

  // Highlight search term in text
  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  // Copy transcript to clipboard
  const copyTranscript = async () => {
    try {
      const transcriptText = transcript
        .map(segment => `[${formatTime(segment.start)}] ${segment.text}`)
        .join('\n\n');
      
      await navigator.clipboard.writeText(transcriptText);
      toast({
        title: "Transcript Copied",
        description: "The transcript has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy transcript to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Download transcript as text file
  const downloadTranscript = () => {
    const transcriptText = transcript
      .map(segment => `[${formatTime(segment.start)}] ${segment.text}`)
      .join('\n\n');
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecture-transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading transcript...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No transcript available
  if (!hasTranscript || transcript.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">
              Transcript is not available for this lecture.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main transcript view
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcript
            <Badge variant="secondary">
              {transcript.length} segments
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyTranscript}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTranscript}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        
        {/* Search results info */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredTranscript.length} segments found for "{searchQuery}"
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredTranscript.map((segment, index) => {
              const isHighlighted = !searchQuery && highlightedIndex === transcript.indexOf(segment);
              const originalIndex = transcript.indexOf(segment);
              
              return (
                <div
                  key={originalIndex}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/50 ${
                    isHighlighted 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:border-accent-foreground/20'
                  }`}
                  onClick={() => handleSeekTo(segment.start)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatTime(segment.start)}
                      </Badge>
                      {onSeekTo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeekTo(segment.start);
                          }}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {isHighlighted && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm leading-relaxed">
                    {highlightSearchTerm(segment.text, searchQuery)}
                  </p>
                </div>
              );
            })}
            
            {filteredTranscript.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">
                  No transcript segments found for "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}