// app/dashboard/subjects/components/subjects-card-view.tsx
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen, 
  Pencil, 
  Trash,
  MoreHorizontal,
  ImageIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { deleteSubject } from "../api/subjects-api";

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: { _id: string; displayName: string };
  isActive: boolean;
  currentVersion: string;
  imageUrl?: string;
}

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface SubjectsCardViewProps {
  data: Subject[];
  isLoading: boolean;
  onEdit: (subject: Subject) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
  classes: Class[];
}

export function SubjectsCardView({
  data,
  isLoading,
  onEdit,
  onRefresh,
  onError,
  onSuccess,
  classes
}: SubjectsCardViewProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  // Track invalid image URLs to avoid repeated errors
  const [invalidImageUrls, setInvalidImageUrls] = useState<Set<string>>(new Set());

  // Mark an image URL as invalid
  const markImageAsInvalid = (url: string) => {
    setInvalidImageUrls(prev => {
      const newSet = new Set(prev);
      newSet.add(url);
      return newSet;
    });
  };

  // Check if an image URL is valid
  const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    if (invalidImageUrls.has(url)) return false;
    
    // Always treat relative URLs as valid (they're on your server)
    if (url.startsWith('/')) return true;
    
    // Check common image extensions for external URLs
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, url?: string) => {
    // Mark the URL as invalid
    if (url) markImageAsInvalid(url);
    
    // Set fallback image
    (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
    
    // Add an attribute to prevent further error events
    (e.target as HTMLImageElement).setAttribute('data-error-handled', 'true');
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;

    try {
      await deleteSubject(subjectToDelete._id);
      onSuccess("Subject deleted successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <p className="text-muted-foreground">No subjects found.</p>
        </div>
      ) : (
        data.map((subject) => (
          <Card key={subject._id} className="overflow-hidden">
           <div className="relative h-48 bg-slate-100">
  {subject.imageUrl ? (
    <img
      src={subject.imageUrl}
      alt={subject.displayName}
      className="w-full h-full object-cover"
      onError={(e) => {
        console.error(`Failed to load image in card: ${subject.imageUrl}`);
        
        // Try fallback URL format
        const fallbackUrl = subject.imageUrl.startsWith('/uploads/')
          ? subject.imageUrl.replace('/uploads/', '/images/subjects/')
          : subject.imageUrl.startsWith('/images/subjects/')
            ? subject.imageUrl.replace('/images/subjects/', '/uploads/')
            : null;
        
        if (fallbackUrl && !(e.target as HTMLImageElement).dataset.triedFallback) {
          console.log(`Trying fallback URL in card: ${fallbackUrl}`);
          (e.target as HTMLImageElement).dataset.triedFallback = 'true';
          (e.target as HTMLImageElement).src = fallbackUrl;
        } else {
          // Use a placeholder if all attempts fail
          (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
          // Mark as invalid to avoid repeated attempts
          markImageAsInvalid(subject.imageUrl);
        }
      }}
      loading="lazy"
    />
  ) : (
    <div className="flex items-center justify-center h-full bg-slate-100">
      <div className="flex flex-col items-center justify-center">
        <ImageIcon className="h-12 w-12 text-slate-300 mb-2" />
        <div className="text-xl font-semibold text-slate-500">
          {subject.displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  )}
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/80 hover:bg-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(subject)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/subjects/${subject._id}/chapters`)
                      }
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Manage Chapters
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSubjectToDelete(subject);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{subject.displayName}</span>
                <Badge variant={subject.isActive ? "default" : "outline"}>
                  {subject.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {subject.name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Class</p>
                  <p className="text-sm font-medium">{subject.classId.displayName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Version</p>
                  <p className="text-sm font-medium">{subject.currentVersion || "1.0.0"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => onEdit(subject)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => router.push(`/subjects/${subject._id}/chapters`)}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Chapters
              </Button>
            </CardFooter>
          </Card>
        ))
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subject{" "}
              <strong>{subjectToDelete?.displayName}</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}