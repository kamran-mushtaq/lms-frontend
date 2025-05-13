// src/app/(student)/subjects/components/subject-list-item.tsx
import Image from "next/image";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Clock, ArrowRight, BookType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SubjectListItemProps {
  title: string;
  className: string;
  progress: number;
  completedChapters: number;
  totalChapters: number;
  image: string;
  onClick: () => void;
  lastAccessedAt?: string;
}

export function SubjectListItem({
  title,
  className,
  progress,
  completedChapters,
  totalChapters,
  image,
  onClick,
  lastAccessedAt
}: SubjectListItemProps) {
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
  
  // State for image loading errors
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
        {!imageError ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88Pj+fwAIJgNmYNlx2AAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <BookType className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{title}</h3>
              {getStatusBadge()}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{className}</Badge>
              <div className="flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                <span>{completedChapters} of {totalChapters} chapters</span>
              </div>
              {lastAccessed && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{lastAccessed}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            size="sm"
            className="sm:ml-auto whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Button clicked, navigating...");
              onClick();
            }}
          >
            {progress === 0 ? (
              <>Start</>
            ) : progress === 100 ? (
              <>Review</>
            ) : (
              <>Continue</>
            )}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        <div className="w-full mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    </div>
  );
}