// src/components/parent-dashboard/chapter-completion.tsx
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Chapter {
    id: string;
    name: string;
    progress: number;
    assessmentScore: number | null;
    status: "completed" | "in_progress" | "not_started";
}

interface ChapterCompletionProps {
    chapters: Chapter[];
}

export default function ChapterCompletion({ chapters }: ChapterCompletionProps) {
    const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

    const toggleChapter = (chapterId: string) => {
        setExpandedChapters((prev) => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500";
            case "in_progress":
                return "bg-yellow-500";
            case "not_started":
                return "bg-slate-300";
            default:
                return "bg-slate-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed":
                return "Completed";
            case "in_progress":
                return "In Progress";
            case "not_started":
                return "Not Started";
            default: return "Unknown";
        }
    };

    if (chapters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 border rounded-lg">
                <p className="text-muted-foreground">No chapters available for this subject</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {chapters.map((chapter) => (
                <Card key={chapter.id}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`h-3 w-3 rounded-full ${getStatusColor(chapter.status)}`}
                                />
                                <h3 className="font-medium">{chapter.name}</h3>
                                <Badge variant="outline">
                                    {chapter.progress}% complete
                                </Badge>
                                {chapter.assessmentScore !== null && (
                                    <Badge variant="secondary">
                                        Assessment: {chapter.assessmentScore}%
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleChapter(chapter.id)}
                            >
                                {expandedChapters[chapter.id] ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {expandedChapters[chapter.id] && (
                            <div className="mt-4 pl-6">
                                <div>
                                    <div className="mb-3">
                                        <div className="text-sm font-medium mb-1">Progress</div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getStatusColor(chapter.status)} rounded-full`}
                                                style={{ width: `${chapter.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Status: </span>
                                            <span className="font-medium">{getStatusText(chapter.status)}</span>
                                        </div>
                                        {chapter.assessmentScore !== null && (
                                            <div>
                                                <span className="text-muted-foreground">Assessment Score: </span>
                                                <span className="font-medium">{chapter.assessmentScore}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}