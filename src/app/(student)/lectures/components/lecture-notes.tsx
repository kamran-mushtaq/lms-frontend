// components/lecture/lecture-notes.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { updateStudentProgress } from "@/app/(student)/lecture/[id]/api";

interface LectureNotesProps {
  lectureId: string;
  initialNotes?: string;
}

export function LectureNotes({ lectureId, initialNotes = "" }: LectureNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes, lectureId]);

  // Auto-save notes every 30 seconds if changed
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isEditing) {
      interval = setInterval(() => {
        handleSave(true);
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isEditing, notes]);

  const handleSave = async (isAutoSave = false) => {
    if (!lectureId) return;
    if (isSaving) return;
    
    // Don't save if no changes
    if (notes === initialNotes && !isAutoSave) {
      toast.info("No changes to save");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Get current progress before saving notes to maintain it
      const userId = localStorage.getItem("userId");
      let progress = 0;
      
      if (userId) {
        try {
          const progressResponse = await fetch(`/api/student-progress/${userId}/lecture/${lectureId}`);
          if (progressResponse.ok) {
            const data = await progressResponse.json();
            progress = data.progress || 0;
          }
        } catch (err) {
          console.error("Error fetching progress:", err);
        }
      }
      
      // Save the notes with current progress
      await updateStudentProgress(lectureId, progress, notes);
      
      // Only show success message for manual saves
      if (!isAutoSave) {
        toast.success("Notes saved successfully");
      }
      
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err: any) {
      if (!isAutoSave) {
        toast.error(err.message || "Failed to save notes");
      }
      console.error("Error saving notes:", err);
    } finally {
      setIsSaving(false);
      if (!isAutoSave) {
        setIsEditing(false);
      }
    }
  };

  const handleExport = () => {
    if (!notes) {
      toast.info("No notes to export");
      return;
    }
    
    // Create blob and download
    const blob = new Blob([notes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lecture_notes_${lectureId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Notes exported successfully");
  };

  const handleImport = () => {
    // Create file input and trigger click
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".txt";
    
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setNotes(content);
        setIsEditing(true);
        toast.info("Notes imported - click Save to store them");
      };
      
      reader.readAsText(file);
    };
    
    fileInput.click();
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-muted p-2 border-b">
        <h3 className="text-sm font-medium">Lecture Notes</h3>
        <div className="flex items-center space-x-1">
          {!isEditing && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport} disabled={!notes}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleImport}>
                <Upload className="h-4 w-4" />
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleSave()} disabled={isSaving}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                setNotes(initialNotes);
                setIsEditing(false);
              }}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="p-2">
        {isEditing ? (
          <Textarea
            placeholder="Take your lecture notes here..."
            className="min-h-[200px] border-none focus-visible:ring-0"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        ) : (
          <div 
            className="min-h-[200px] p-2 text-sm whitespace-pre-wrap"
            onClick={() => setIsEditing(true)}
          >
            {notes || (
              <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                Click to add notes for this lecture
              </div>
            )}
          </div>
        )}
      </div>
      
      {lastSaved && (
        <div className="text-xs text-muted-foreground p-2 border-t">
          Last saved at {lastSaved}
        </div>
      )}
    </div>
  );
}