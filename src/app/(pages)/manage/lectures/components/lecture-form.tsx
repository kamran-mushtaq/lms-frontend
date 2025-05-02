// app/dashboard/lectures/components/lecture-form.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash, Upload, Video, FileText, Link as LinkIcon, File, Clock, Image, Link, X, Loader2 } from "lucide-react"; // Added Image, Link, X, Loader2
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createLecture, updateLecture, uploadFile } from "../api/lectures-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { debounce } from "lodash";
import { useFileUpload } from "@/hooks/use-file-upload"; // Import the new hook
import { cn } from "@/lib/utils"; // Import cn utility

// Interfaces for Class, Subject, Chapter
interface Class {
  _id: string;
  name: string;
  displayName: string;
}

interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
}

interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
}

// Lecture interface
interface Lecture {
  _id: string;
  title: string;
  description: string;
  classId: string | { _id: string; name: string; displayName: string };
  subjectId: string | { _id: string; name: string; displayName: string };
  chapterId: string | { _id: string; name: string; displayName: string };
  order: number;
  estimatedDuration: number;
  prerequisites?: string[];
  content: {
    type: string;
    data: any;
  };
  isPublished: boolean;
  tags?: string[];
  metadata?: any;
  imageUrl?: string;
  resources?: Array<{
    title: string;
    type: string;
    resourceType: string;
    url?: string;
    fileId?: string;
    content?: string;
    description?: string;
  }>;
  hasTranscript?: boolean;
  transcript?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

// Props for Lecture Form
interface LectureFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  lecture: Lecture | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
  classes: Class[];
  subjects: Subject[];
  chapters: Chapter[];
}

// Form validation schema
const lectureSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  classId: z.string({ required_error: "Class is required" }),
  subjectId: z.string({ required_error: "Subject is required" }),
  chapterId: z.string({ required_error: "Chapter is required" }),
  order: z.coerce.number().int().positive(),
  estimatedDuration: z.coerce.number().int().positive(),
  isPublished: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  prerequisites: z.array(z.string()).optional(),
  content: z.object({
    type: z.enum(["video", "text", "quiz", "interactive"]),
    data: z.record(z.any()).optional()
  }),
  resources: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      type: z.enum(["document", "text", "video"]),
      resourceType: z.enum(["url", "file", "content"]),
      url: z.string().url().optional().or(z.literal("")),
      fileId: z.string().optional().or(z.literal("")),
      content: z.string().optional().or(z.literal("")),
      description: z.string().optional().or(z.literal(""))
    })
  ).optional(),
  hasTranscript: z.boolean().default(false),
  transcript: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      text: z.string()
    })
  ).optional()
});

type LectureFormValues = z.infer<typeof lectureSchema>;

export function LectureForm({
  open,
  setOpen,
  lecture,
  onSuccess,
  onError,
  classes,
  subjects,
  chapters
}: LectureFormProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { id: string, name: string }>>({});
  const [newTag, setNewTag] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview
  const [imageTab, setImageTab] = useState<string>("url"); // State for image tabs (url/upload)
  const [activeTab, setActiveTab] = useState("basic");

  // Helper function to get ID from object or string - memoized
  const getId = useCallback((obj: any): string => {
    if (!obj) return "";
    if (typeof obj === "object" && obj._id) {
      return obj._id;
    }
    return obj;
  }, []);


  // Get filtered subjects based on selected class - memoized
  const filteredSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    return subjects.filter((subject) => {
      const subjectClassId = typeof subject.classId === 'object' ? subject.classId._id : subject.classId;
      return subjectClassId === selectedClassId;
    });
  }, [subjects, selectedClassId]);

  // Get filtered chapters based on selected subject - memoized
  const filteredChapters = useMemo(() => {
    if (!selectedSubjectId) return [];
    return chapters.filter((chapter) => {
      // Add check for null/undefined subjectId
      const subjectIdObject = chapter.subjectId;
      if (!subjectIdObject) {
        // console.warn(`Chapter ${chapter._id} (${chapter.displayName || 'N/A'}) has null or undefined subjectId.`);
        return false; // Skip chapters with missing subjectId
      }
      const chapterSubjectId = typeof subjectIdObject === 'object' ? subjectIdObject._id : subjectIdObject;
      return chapterSubjectId === selectedSubjectId;
    });
  }, [chapters, selectedSubjectId]);

  // Create form with default values
  const form = useForm<LectureFormValues>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: "",
      subjectId: "",
      chapterId: "",
      order: 1,
      estimatedDuration: 30,
      isPublished: false,
      tags: [],
      imageUrl: "",
      prerequisites: [],
      content: {
        type: "video",
        data: {}
      },
      resources: [],
      hasTranscript: false,
      transcript: []
    },
    // Add default for imageUrl if it's null/undefined from schema
    imageUrl: lecture?.imageUrl || "",
  });

  // Setup resources field array
  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource
  } = useFieldArray({
    control: form.control,
    name: "resources"
  });

  // Setup transcript field array
  const {
    fields: transcriptFields,
    append: appendTranscript,
    remove: removeTranscript
  } = useFieldArray({
    control: form.control,
    name: "transcript"
  });

  // Add a new tag - memoized
  const handleAddTag = useCallback(() => {
    if (newTag.trim() === "") return;
    
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(newTag)) {
      form.setValue("tags", [...currentTags, newTag]);
    }
    
    setNewTag("");
  }, [newTag, form]);

  // Remove a tag - memoized
  const handleRemoveTag = useCallback((tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  }, [form]);

  // Add a new empty resource - memoized
  const handleAddResource = useCallback(() => {
    appendResource({
      title: "",
      type: "document",
      resourceType: "url",
      url: "",
      fileId: "",
      content: "",
      description: ""
    });
  }, [appendResource]);

  // Add a new transcript segment - memoized
  const handleAddTranscriptSegment = useCallback(() => {
    const transcript = form.getValues("transcript") || [];
    const lastSegment = transcript[transcript.length - 1];
    
    let newStart = 0;
    if (lastSegment) {
      newStart = lastSegment.end;
    }
    
    appendTranscript({
      start: newStart,
      end: newStart + 10,
      text: ""
    });
  }, [appendTranscript, form]);

  // Instantiate the file upload hook for images
  const {
    uploadFile: uploadImageFile,
    isUploading: isUploadingImage,
    error: imageUploadError
  } = useFileUpload({
    acceptedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
    maxSizeMB: 5, // Max 5MB for images
    apiPath: 'upload' // Assuming a generic upload endpoint
  });

  // Instantiate the file upload hook for videos
  const {
    uploadFile: uploadVideoFile,
    isUploading: isUploadingVideo,
    error: videoUploadError
  } = useFileUpload({
    acceptedTypes: ['video/mp4', 'video/webm', 'video/ogg'], // Adjust as needed
    maxSizeMB: 500, // Example: Max 500MB for videos
    apiPath: 'upload' // Assuming the same generic upload endpoint handles videos
  });

  // Instantiate the file upload hook for resources (using generic settings for now)
  const {
    uploadFile: uploadResourceFile,
    isUploading: isUploadingResource, // Use a separate state for resource uploads
    error: resourceUploadError
  } = useFileUpload({
    // Define accepted types for resources if needed, otherwise defaults
    // acceptedTypes: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', 'video/*', 'image/*'],
    maxSizeMB: 100, // Example: Allow larger files for resources
    apiPath: 'upload'
  });

  // Handle file upload for resources - memoized with debounce
  // Corrected handleFileUpload to use the useFileUpload hook for resources
  const handleFileUpload = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    resourceIndex: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Use the dedicated resource upload hook instance.
    // The hook handles setting its own loading state (isUploadingResource) and errors.
    const result = await uploadResourceFile(file); // Call the hook's function

    if (result?.url) {
      // Store uploaded file info (using the actual file name from the input)
       setUploadedFiles(prev => ({
         ...prev,
         [`resource-${resourceIndex}`]: {
           id: result.fileId || '', // Use fileId from hook result if available
           name: file.name
         }
       }));

      // Update form fields using the URL constructed by the hook
      form.setValue(`resources.${resourceIndex}.url`, result.url);
      form.setValue(`resources.${resourceIndex}.fileId`, result.fileId || ''); // Save fileId if returned
      form.setValue(`resources.${resourceIndex}.resourceType`, "file");
    }
    // Error handling (toast) is done within the hook.

  }, [uploadResourceFile, form]); // Depend on the hook's upload function

  // Update form when editing - only when lecture changes
  useEffect(() => {
    if (lecture) {
      const classId = getId(lecture.classId);
      const subjectId = getId(lecture.subjectId);
      const chapterId = getId(lecture.chapterId);
      
      setSelectedClassId(classId);
      setSelectedSubjectId(subjectId);
      
      // Prepare resources data
      const resources = lecture.resources || [];
      
      // Prepare transcript data
      const transcript = lecture.transcript || [];
      
      form.reset({
        title: lecture.title,
        description: lecture.description,
        classId,
        subjectId,
        chapterId,
        order: lecture.order,
        estimatedDuration: lecture.estimatedDuration,
        isPublished: lecture.isPublished,
        tags: lecture.tags || [],
        imageUrl: lecture.imageUrl || "", // Keep existing imageUrl logic
        prerequisites: (lecture.prerequisites || []).map(getId),
        content: lecture.content,
        resources,
        hasTranscript: lecture.hasTranscript || false,
        transcript
      });
      // Set image preview when editing
      setImagePreview(lecture.imageUrl || null);
    } else {
      form.reset({
        title: "",
        description: "",
        classId: "",
        subjectId: "",
        chapterId: "",
        order: 1,
        estimatedDuration: 30,
        isPublished: false,
        tags: [],
        imageUrl: "",
        prerequisites: [],
        content: {
          type: "video",
          data: {}
        },
        resources: [],
        hasTranscript: false,
        transcript: []
      });
      setSelectedClassId("");
      setSelectedSubjectId("");
      setImagePreview(null); // Clear preview when resetting for new lecture
    }
  }, [lecture, form, getId]);

  // Handle form submission - memoized
  const onSubmit = useCallback(async (data: LectureFormValues) => {
    try {
      if (lecture && lecture._id) {
        // Update existing lecture
        await updateLecture(lecture._id, data);
        onSuccess("Lecture updated successfully");
      } else {
        // Create new lecture
        await createLecture(data);
        onSuccess("Lecture created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [lecture, onSuccess, onError]);

  // Close handler - memoized
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  // Handle image URL input change
  const handleImageUrlChange = useCallback((url: string) => {
    form.setValue("imageUrl", url);
    setImagePreview(url || null);
  }, [form]);

  // Handle image file upload
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadImageFile(file);
    if (result?.url) {
      form.setValue("imageUrl", result.url);
      setImagePreview(result.url);
    }
     // Error handling is done within the hook (toast shown)
  }, [uploadImageFile, form]);

  // Handle video file upload for content
  const handleVideoContentUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadVideoFile(file);
    if (result?.url) {
      form.setValue("content.data.url", result.url); // Set the URL in content data
      // Optionally clear other data fields if needed: form.setValue("content.data", { url: result.url });
    }
    // Error handling is done within the hook
  }, [uploadVideoFile, form]);

  // Removed duplicate handleVideoContentUpload definition

  // Removed duplicate function definition that was here previously

  // Removed duplicate function definition

  // Clear image
  const clearImage = useCallback(() => {
    form.setValue("imageUrl", "");
    setImagePreview(null);
  }, [form]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{lecture ? "Edit Lecture" : "Create Lecture"}</SheetTitle>
          <SheetDescription>
            {lecture
              ? "Update lecture details below"
              : "Fill out the form below to create a new lecture"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Lecture title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a detailed description"
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="classId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedClassId(value);
                            form.setValue("subjectId", "");
                            form.setValue("chapterId", "");
                            setSelectedSubjectId("");
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes.map((classItem) => (
                              <SelectItem
                                key={classItem._id}
                                value={classItem._id}
                              >
                                {classItem.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedSubjectId(value);
                            form.setValue("chapterId", "");
                          }}
                          value={field.value}
                          disabled={!selectedClassId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredSubjects.map((subject) => (
                              <SelectItem
                                key={subject._id}
                                value={subject._id}
                              >
                                {subject.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="chapterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedSubjectId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a chapter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredChapters.map((chapter) => (
                              <SelectItem
                                key={chapter._id}
                                value={chapter._id}
                              >
                                {chapter.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Position of this lecture in the chapter
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Duration (minutes)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input type="number" min="1" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional cover image for the lecture
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("tags")?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-2"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex mt-2 gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Published</FormLabel>
                        <FormDescription>
                          Mark this lecture as published
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Image Upload/URL Field */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecture Thumbnail Image</FormLabel>
                    <Tabs
                      value={imageTab}
                      onValueChange={setImageTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url" className="flex items-center">
                          <LinkIcon className="w-4 h-4 mr-2" />
                          URL
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="url">
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={field.value || ""}
                            onChange={(e) => handleImageUrlChange(e.target.value)}
                          />
                        </FormControl>
                      </TabsContent>
                      <TabsContent value="upload">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="image-dropzone-file"
                            className={cn(
                              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                              isUploadingImage
                                ? "border-blue-300 bg-blue-50"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                            )}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {isUploadingImage ? (
                                <>
                                  <Loader2 className="w-8 h-8 mb-2 text-blue-500 animate-spin" />
                                  <p className="mb-2 text-sm text-blue-500">
                                    Uploading...
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (Max 5MB)</p>
                                </>
                              )}
                            </div>
                            <input
                              id="image-dropzone-file"
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                              onChange={handleImageUpload}
                              disabled={isUploadingImage}
                            />
                          </label>
                        </div>
                      </TabsContent>
                    </Tabs>
                    {imageUploadError && <FormMessage className="text-red-500">{imageUploadError}</FormMessage>}
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-2 relative w-full max-w-xs"> {/* Limit preview size */}
                        <div className="relative aspect-video overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={imagePreview}
                            alt="Lecture preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} // Fallback placeholder
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={clearImage}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Clear image</span>
                        </Button>
                      </div>
                    )}
                    <FormMessage /> {/* For Zod errors */}
                  </FormItem>
                )}
              />

              {/* Content Tab - Only render when active */}
              {activeTab === "content" && (
                <TabsContent value="content" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="content.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="interactive">Interactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of content for this lecture
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("content.type") === "video" && (
                    <Tabs defaultValue="url" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url" className="flex items-center">
                          <LinkIcon className="w-4 h-4 mr-2" />
                          URL
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="url" className="space-y-4 mt-4">
                        {/* Existing URL, Duration, Thumbnail fields */}
                        <FormField
                          control={form.control}
                          name="content.data.videoUrl" // Target the correct field name
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video URL</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Video className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="https://example.com/video.mp4"
                                    {...field}
                                    value={field.value || ""} // Ensure controlled
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                URL to the video content (or leave blank if uploading)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="content.data.duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video Duration (seconds)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="content.data.thumbnail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video Thumbnail URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/thumbnail.jpg" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="upload" className="mt-4">
                        {/* Display uploaded URL if available */}
                         {form.watch("content.data.videoUrl") && (
                           <div className="mb-2 text-sm">
                             <span className="font-semibold">Uploaded URL:</span>
                             <a href={form.watch("content.data.videoUrl")} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline break-all">
                               {form.watch("content.data.videoUrl")}
                             </a>
                           </div>
                         )}
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="video-content-dropzone-file"
                            className={cn(
                              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                              isUploadingVideo
                                ? "border-blue-300 bg-blue-50"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                            )}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {isUploadingVideo ? (
                                <>
                                  <Loader2 className="w-8 h-8 mb-2 text-blue-500 animate-spin" />
                                  <p className="mb-2 text-sm text-blue-500">Uploading Video...</p>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload video</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">MP4, WEBM, OGG (Max 500MB)</p>
                                </>
                              )}
                            </div>
                            <input
                              id="video-content-dropzone-file"
                              type="file"
                              className="hidden"
                              accept="video/mp4, video/webm, video/ogg" // Match hook config
                              onChange={handleVideoContentUpload}
                              disabled={isUploadingVideo}
                            />
                          </label>
                        </div>
                         {videoUploadError && <p className="mt-2 text-sm text-red-600">{videoUploadError}</p>}
                      </TabsContent>
                    </Tabs>
                  )}

                  {form.watch("content.type") === "text" && (
                    <FormField
                      control={form.control}
                      name="content.data.content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Text Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter content text or HTML"
                              className="min-h-[250px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>
              )}

              {/* Resources Tab - Only render when active */}
              {activeTab === "resources" && (
                <TabsContent value="resources" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Lecture Resources</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddResource}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Resource
                    </Button>
                  </div>

                  <ScrollArea className="h-[400px] pr-4">
                    {resourceFields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-2" />
                        <p>No resources yet</p>
                        <p className="text-sm">Click the button above to add resources</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {resourceFields.map((field, index) => (
                          <Card key={field.id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-medium">Resource {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeResource(index)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name={`resources.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Title</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Resource title" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`resources.${index}.type`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="document">Document</SelectItem>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`resources.${index}.resourceType`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Resource Type</FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select storage type" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="url">URL</SelectItem>
                                            <SelectItem value="file">File Upload</SelectItem>
                                            <SelectItem value="content">Direct Content</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                {form.watch(`resources.${index}.resourceType`) === "url" && (
                                  <FormField
                                    control={form.control}
                                    name={`resources.${index}.url`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>URL</FormLabel>
                                        <FormControl>
                                          <div className="flex items-center">
                                            <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="https://example.com/resource" {...field} />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}

                                {form.watch(`resources.${index}.resourceType`) === "file" && (
                                  <FormItem>
                                    <FormLabel>Upload File</FormLabel>
                                    {/* Display uploaded file name if available */}
                                    {uploadedFiles[`resource-${index}`] ? (
                                      <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <File className="h-4 w-4 flex-shrink-0" />
                                          <span className="text-sm text-gray-700 truncate">
                                            {uploadedFiles[`resource-${index}`].name}
                                          </span>
                                        </div>
                                        {/* Optional: Add a button to clear/change file? Maybe later */}
                                      </div>
                                    ) : (
                                      <FormControl>
                                        <div className="flex items-center justify-center w-full">
                                          <label
                                            htmlFor={`resource-upload-${index}`}
                                            className={cn(
                                              "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer",
                                              // Use the correct state variable for resource uploads
                                              isUploadingResource // Use the hook's state
                                                ? "border-blue-300 bg-blue-50"
                                                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                                            )}
                                          >
                                            <div className="flex flex-col items-center justify-center pt-3 pb-4">
                                              {isUploadingResource ? ( // Use the hook's state
                                                <>
                                                  <Loader2 className="w-6 h-6 mb-1 text-blue-500 animate-spin" />
                                                  <p className="text-xs text-blue-500">Uploading...</p>
                                                </>
                                              ) : (
                                                <>
                                                  <Upload className="w-6 h-6 mb-1 text-gray-500" />
                                                  <p className="text-xs text-gray-500">
                                                    <span className="font-semibold">Click or drag to upload</span>
                                                  </p>
                                                  {/* Add specific file type info if needed */}
                                                </>
                                              )}
                                            </div>
                                            <input
                                              id={`resource-upload-${index}`}
                                              type="file"
                                              className="hidden"
                                              // Accept common document/video types, adjust as needed
                                              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.avi,.txt,.zip"
                                              onChange={(e) => handleFileUpload(e, index)} // Use existing handler
                                              disabled={isUploadingResource} // Use the hook's state
                                            />
                                          </label>
                                        </div>
                                      </FormControl>
                                    )}
                                     {/* Keep hidden input for fileId */}
                                     <FormField
                                       control={form.control}
                                       name={`resources.${index}.fileId`}
                                       render={({ field }) => (
                                         <Input type="hidden" {...field} />
                                       )}
                                     />
                                    <FormMessage />
                                    {/* Display resource upload error if any */}
                                    {resourceUploadError && index === (/* How to get index here? Need adjustment if error is global */ null) && <p className="text-sm text-red-500">{resourceUploadError}</p>}
                                  </FormItem>
                                )}

                                {form.watch(`resources.${index}.resourceType`) === "content" && (
                                  <FormField
                                    control={form.control}
                                    name={`resources.${index}.content`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder="Enter direct content text"
                                            className="min-h-[100px]"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}

                                <FormField
                                  control={form.control}
                                  name={`resources.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Resource description"
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              )}

              {/* Transcript Tab - Only render when active */}
              {activeTab === "transcript" && (
                <TabsContent value="transcript" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="hasTranscript"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Has Transcript</FormLabel>
                          <FormDescription>
                            Enable transcript for this lecture
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("hasTranscript") && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Transcript Segments</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddTranscriptSegment}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Segment
                        </Button>
                      </div>

                      <ScrollArea className="h-[400px] pr-4">
                        {transcriptFields.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mb-2" />
                            <p>No transcript segments yet</p>
                            <p className="text-sm">Click the button above to add segments</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {transcriptFields.map((field, index) => (
                              <Card key={field.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium">Segment {index + 1}</h4>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTranscript(index)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <FormField
                                      control={form.control}
                                      name={`transcript.${index}.start`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Start Time (seconds)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              min="0" 
                                              step="0.1" 
                                              {...field} 
                                              onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`transcript.${index}.end`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>End Time (seconds)</FormLabel>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              min="0" 
                                              step="0.1" 
                                              {...field} 
                                              onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={form.control}
                                    name={`transcript.${index}.text`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Transcript Text</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder="Enter transcript text for this segment"
                                            className="min-h-[100px]"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {lecture ? "Update Lecture" : "Create Lecture"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default LectureForm;