// app/dashboard/lectures/components/lecture-content-viewer.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lecture } from "../api/lectures-api";

interface LectureContentViewerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  lecture: Lecture | null;
}

export function LectureContentViewer({
  open,
  setOpen,
  lecture
}: LectureContentViewerProps) {
  if (!lecture) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{lecture.title}</DialogTitle>
          <DialogDescription>{lecture.description}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Duration: {lecture.estimatedDuration} min
            </Badge>
            <Badge variant="outline">Order: {lecture.order}</Badge>
            <Badge variant={lecture.isPublished ? "default" : "outline"}>
              {lecture.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge variant="secondary">
              Type: {lecture.content?.type || "Unknown"}
            </Badge>
          </div>

          <Card className="p-4">{renderContent(lecture)}</Card>

          {lecture.prerequisites && lecture.prerequisites.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Prerequisites</h3>
              <ul className="list-disc pl-5">
                {lecture.prerequisites.map((prerequisite, index) => (
                  <li key={index}>{prerequisite}</li>
                ))}
              </ul>
            </div>
          )}

          {lecture.tags && lecture.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {lecture.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to render different content types
function renderContent(lecture: Lecture) {
  if (!lecture.content) {
    return <div className="text-muted-foreground">No content available</div>;
  }

  switch (lecture.content.type) {
    case "video":
      if (lecture.content.data?.videoUrl) {
        // Detect YouTube video and render appropriate embed
        if (
          lecture.content.data.videoUrl.includes("youtube.com") ||
          lecture.content.data.videoUrl.includes("youtu.be")
        ) {
          const videoId = extractYouTubeVideoId(lecture.content.data.videoUrl);
          if (videoId) {
            return (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            );
          }
        }

        // If not YouTube or couldn't extract ID, show direct video player
        return (
          <div className="aspect-video">
            <video
              controls
              className="w-full h-full"
              src={lecture.content.data.videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
      return <div className="text-muted-foreground">No video URL provided</div>;

    case "text":
      if (lecture.content.data?.htmlContent) {
        return (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: lecture.content.data.htmlContent
            }}
          />
        );
      }
      return (
        <div className="text-muted-foreground">No text content provided</div>
      );

    case "pdf":
      return (
        <div className="text-muted-foreground">
          PDF viewer not implemented in preview
        </div>
      );

    case "quiz":
      return (
        <div className="text-muted-foreground">
          Quiz viewer not implemented in preview
        </div>
      );

    case "interactive":
      return (
        <div className="text-muted-foreground">
          Interactive content viewer not implemented in preview
        </div>
      );

    default:
      return <div className="text-muted-foreground">Unknown content type</div>;
  }
}

// Helper function to extract YouTube video ID
function extractYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}
