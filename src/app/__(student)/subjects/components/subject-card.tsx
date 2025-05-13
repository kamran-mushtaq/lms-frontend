// src/app/(student)/subjects/components/subject-card.tsx
import Image from "next/image";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Clock, ArrowRight, BookType } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SubjectCardProps {
  title: string;
  description: string;
  className: string;
  progress: number;
  completedChapters: number;
  totalChapters: number;
  image: string;
  onClick: () => void;
  lastAccessedAt?: string;
  nextChapterName?: string;
}

export function SubjectCard({
  title,
  description,
  className,
  progress,
  completedChapters,
  totalChapters,
  image,
  onClick,
  lastAccessedAt,
  nextChapterName
}: SubjectCardProps) {
  // Get status badge
  const getStatusBadge = () => {
    if (progress === 100) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    } else if (progress > 0) {
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
    } else {
      return <Badge variant="outline">Not Started</Badge>;
    }
  };

  // Format last accessed time
  const getLastAccessedText = () => {
    if (!lastAccessedAt) return null;
    
    try {
      const date = new Date(lastAccessedAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return null;
    }
  };

  const lastAccessed = getLastAccessedText();

  const [imageError, setImageError] = useState(false);

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative h-40 w-full bg-gray-100">
        {!imageError ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
            // Placeholder image while loading
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88Pj+fwAIJgNmYNlx2AAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <BookType className="h-12 w-12 text-gray-400" />
            <span className="sr-only">{title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="text-xs">{className}</Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{completedChapters} of {totalChapters} chapters</span>
            </div>
            
            {lastAccessed && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{lastAccessed}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={onClick} className="w-full">
          {progress === 0 ? (
            <>Start Learning</>
          ) : progress === 100 ? (
            <>Review Content</>
          ) : nextChapterName ? (
            <>Continue: {nextChapterName.length > 20 ? `${nextChapterName.substring(0, 20)}...` : nextChapterName}</>
          ) : (
            <>Continue Learning</>
          )}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}