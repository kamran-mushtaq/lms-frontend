// src/components/student/lecture/LectureHeader.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Menu, MessageSquare, BookOpen } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface LectureHeaderProps {
    title: string;
    chapterId: string;
    progress: number;
    onBack: () => void;
    onToggleSidebar: () => void;
    isMobile: boolean;
}

export default function LectureHeader({
    title,
    chapterId,
    progress,
    onBack,
    onToggleSidebar,
    isMobile
}: LectureHeaderProps) {
    const [scrolled, setScrolled] = useState(false);

    // Add shadow to header when scrolled
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`sticky top-0 z-50 bg-background py-2 px-4 border-b flex items-center justify-between ${scrolled ? 'shadow-sm' : ''}`}>
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to lectures list">
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex flex-col">
                    <h1 className="font-semibold text-lg line-clamp-1">{title}</h1>
                    {!isMobile && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Link href={`/chapters/${chapterId}`} className="hover:underline">
                                Back to Chapter
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {!isMobile && progress > 0 && progress < 100 && (
                    <div className="flex items-center gap-2 pr-2">
                        <Progress value={progress} className="w-24" />
                        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                )}

                {progress === 100 && (
                    <Badge variant="success" className="mr-2">
                        Completed
                    </Badge>
                )}

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onToggleSidebar}
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Toggle sidebar</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </header>
    );
}