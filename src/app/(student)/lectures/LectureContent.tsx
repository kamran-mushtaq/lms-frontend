// src/components/student/lecture/LectureContent.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ChevronLeft, ChevronRight, PlayCircle, PauseCircle,
    Volume2, VolumeX, RotateCcw, Maximize, FileText,
    BookOpen, ArrowDown, Clock, MessageSquare
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { getLectureTranscript } from "./api/lecture-service";
import VideoPlayer from "./VideoPlayer";
import PDFViewer from "./PDFViewer";
import TextContent from "./TextContent";
import InteractiveContent from "./InteractiveContent";
import SlideContent from "./SlideContent";

interface LectureContentProps {
    lecture: any;
    onProgressUpdate: (progress: number) => void;
    onPrevious: () => void;
    onNext: () => void;
    initialProgress?: number;
}

export default function LectureContent({
    lecture,
    onProgressUpdate,
    onPrevious,
    onNext,
    initialProgress = 0
}: LectureContentProps) {
    const [contentType, setContentType] = useState<string>("content");
    const [transcript, setTranscript] = useState<any[]>([]);
    const [showTranscript, setShowTranscript] = useState(false);
    const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(-1);
    const [contentTab, setContentTab] = useState<string>(lecture?.content?.type || "video");
    const transcriptRef = useRef<HTMLDivElement>(null);

    // Fetch transcript if available
    useEffect(() => {
        const fetchTranscript = async () => {
            if (lecture?.transcript) {
                try {
                    const transcriptData = await getLectureTranscript(lecture._id);
                    setTranscript(transcriptData.transcript);
                } catch (error) {
                    console.error("Error fetching transcript:", error);
                }
            }
        };

        fetchTranscript();
    }, [lecture]);

    // Update transcript highlighting based on current time
    const handleTimeUpdate = (currentTime: number) => {
        // Find the transcript entry that corresponds to the current time
        const index = transcript.findIndex((item, idx) => {
            const nextItem = transcript[idx + 1];
            return currentTime >= item.time && (!nextItem || currentTime < nextItem.time);
        });

        if (index !== currentTranscriptIndex) {
            setCurrentTranscriptIndex(index);

            // Scroll to the current transcript item if the transcript is visible
            if (showTranscript && transcriptRef.current && index >= 0) {
                const transcriptItems = transcriptRef.current.querySelectorAll('.transcript-item');
                if (transcriptItems[index]) {
                    transcriptItems[index].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        }
    };

    const renderContent = () => {
        if (!lecture || !lecture.content) {
            return <div className="flex items-center justify-center h-full">No content available</div>;
        }

        const { type, data } = lecture.content;

        switch (type) {
            case 'video':
                return (
                    <VideoPlayer
                        videoUrl={data.videoUrl}
                        duration={data.duration}
                        thumbnailUrl={data.thumbnailUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onProgress={onProgressUpdate}
                        initialProgress={initialProgress}
                        lectureId={lecture._id}
                    />
                );
            case 'pdf':
                return (
                    <PDFViewer
                        pdfUrl={data.pdfUrl}
                        onProgress={onProgressUpdate}
                        initialProgress={initialProgress}
                        lectureId={lecture._id}
                    />
                );
            case 'text':
                return (
                    <TextContent
                        content={data.content}
                        onProgress={onProgressUpdate}
                        initialProgress={initialProgress}
                        lectureId={lecture._id}
                    />
                );
            case 'slides':
                return (
                    <SlideContent
                        slides={data.slides}
                        onProgress={onProgressUpdate}
                        initialProgress={initialProgress}
                        lectureId={lecture._id}
                    />
                );
            case 'interactive':
                return (
                    <InteractiveContent
                        content={data}
                        onProgress={onProgressUpdate}
                        initialProgress={initialProgress}
                        lectureId={lecture._id}
                    />
                );
            default:
                return <div className="flex items-center justify-center h-full">Unsupported content type</div>;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
                {/* Content and Transcript Toggle */}
                <Tabs
                    value={contentType}
                    onValueChange={setContentType}
                    className="h-full flex flex-col"
                >
                    <div className="px-4 pt-2">
                        <TabsList className="grid w-full max-w-xs grid-cols-2">
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger
                                value="transcript"
                                disabled={!lecture?.transcript || transcript.length === 0}
                            >
                                Transcript
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="content" className="flex-1 p-4 h-full overflow-hidden">
                        <div className="h-full flex flex-col">
                            {/* Content Type Tabs - Only show if lecture has multiple content types */}
                            {lecture?.additionalContent && (
                                <Tabs
                                    value={contentTab}
                                    onValueChange={setContentTab}
                                    className="mb-4"
                                >
                                    <TabsList>
                                        <TabsTrigger value={lecture.content.type}>
                                            {lecture.content.type === 'video' && <PlayCircle className="h-4 w-4 mr-2" />}
                                            {lecture.content.type === 'pdf' && <FileText className="h-4 w-4 mr-2" />}
                                            {lecture.content.type === 'text' && <BookOpen className="h-4 w-4 mr-2" />}
                                            {lecture.content.type.charAt(0).toUpperCase() + lecture.content.type.slice(1)}
                                        </TabsTrigger>
                                        {lecture.additionalContent.map((content: any, index: number) => (
                                            <TabsTrigger key={index} value={content.type}>
                                                {content.type === 'video' && <PlayCircle className="h-4 w-4 mr-2" />}
                                                {content.type === 'pdf' && <FileText className="h-4 w-4 mr-2" />}
                                                {content.type === 'text' && <BookOpen className="h-4 w-4 mr-2" />}
                                                {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                            )}

                            {/* The actual content */}
                            <div className="flex-1 overflow-hidden">
                                {renderContent()}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="transcript" className="flex-1 p-4 overflow-hidden">
                        <Card className="h-full">
                            <CardContent className="p-4 h-full">
                                <ScrollArea className="h-full pr-4" ref={transcriptRef}>
                                    <div className="space-y-4">
                                        {transcript.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`transcript-item p-2 rounded-md transition-colors ${index === currentTranscriptIndex ? "bg-primary/10 border-l-4 border-primary pl-3" : ""
                                                    }`}
                                            >
                                                <div className="text-xs text-muted-foreground mb-1">
                                                    {formatTime(item.time)}
                                                </div>
                                                <p>{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Navigation Bar */}
            <div className="border-t p-4 flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={onPrevious}
                    disabled={!lecture?.previousLecture}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                </Button>

                <div className="flex items-center space-x-4">
                    {lecture?.transcript && transcript.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setContentType(contentType === "content" ? "transcript" : "content")}
                        >
                            {contentType === "content" ? (
                                <>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Show Transcript
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Show Content
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <Button
                    variant="default"
                    onClick={onNext}
                    disabled={!lecture?.nextLecture}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}