// app/dashboard/lectures/components/lecture-form.tsx
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { createLecture, Lecture, updateLecture } from "../api/lectures-api";

// Props interface
interface LectureFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  lecture: Lecture | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
  chapters: { _id: string; displayName: string }[];
  selectedChapterId: string | null;
}

// Define acceptable content types
const contentTypes = ["video", "text", "pdf", "quiz", "interactive"] as const;
type ContentType = (typeof contentTypes)[number];

// Zod validation schema
const lectureSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(5, { message: "Please provide a description." }),
  chapterId: z.string({ required_error: "Please select a chapter." }),
  estimatedDuration: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 minute." })
    .optional(),
  order: z.coerce.number().optional(),
  isPublished: z.boolean().default(false),
  content: z.object({
    type: z.enum(contentTypes, {
      required_error: "Please select a content type."
    }),
    data: z.object({
      videoUrl: z.string().url().optional().or(z.literal("")),
      htmlContent: z.string().optional().or(z.literal("")),
      duration: z.coerce.number().optional()
    })
  }),
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

// Form values type
type FormValues = z.infer<typeof lectureSchema>;

export function LectureForm({
  open,
  setOpen,
  lecture,
  onSuccess,
  onError,
  chapters,
  selectedChapterId
}: LectureFormProps) {
  const [currentTag, setCurrentTag] = useState("");
  const [currentPrerequisite, setCurrentPrerequisite] = useState("");
  const [activeTab, setActiveTab] = useState("basic-info");

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title: "",
      description: "",
      chapterId: selectedChapterId || "",
      estimatedDuration: 30,
      order: 1,
      isPublished: false,
      content: {
        type: "video",
        data: {
          videoUrl: "",
          htmlContent: "",
          duration: 0
        }
      },
      prerequisites: [],
      tags: []
    }
  });

  // Update form values when editing a lecture
  useEffect(() => {
    if (lecture) {
      form.reset({
        title: lecture.title || "",
        description: lecture.description || "",
        chapterId: lecture.chapterId || selectedChapterId || "",
        estimatedDuration: lecture.estimatedDuration || 30,
        order: lecture.order || 1,
        isPublished: lecture.isPublished || false,
        content: {
          type: (lecture.content?.type as ContentType) || "video",
          data: {
            videoUrl: lecture.content?.data?.videoUrl || "",
            htmlContent: lecture.content?.data?.htmlContent || "",
            duration: lecture.content?.data?.duration || 0
          }
        },
        prerequisites: lecture.prerequisites || [],
        tags: lecture.tags || []
      });
    } else {
      form.reset({
        title: "",
        description: "",
        chapterId: selectedChapterId || "",
        estimatedDuration: 30,
        order: 1,
        isPublished: false,
        content: {
          type: "video",
          data: {
            videoUrl: "",
            htmlContent: "",
            duration: 0
          }
        },
        prerequisites: [],
        tags: []
      });
    }
  }, [lecture, form, selectedChapterId]);

  const onSubmit = async (data: FormValues) => {
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
  };

  const addTag = () => {
    if (currentTag.trim() !== "") {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(currentTag.trim())) {
        form.setValue("tags", [...currentTags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };

  const addPrerequisite = () => {
    if (currentPrerequisite.trim() !== "") {
      const currentPrerequisites = form.getValues("prerequisites") || [];
      if (!currentPrerequisites.includes(currentPrerequisite.trim())) {
        form.setValue("prerequisites", [
          ...currentPrerequisites,
          currentPrerequisite.trim()
        ]);
      }
      setCurrentPrerequisite("");
    }
  };

  const removePrerequisite = (prerequisite: string) => {
    const currentPrerequisites = form.getValues("prerequisites") || [];
    form.setValue(
      "prerequisites",
      currentPrerequisites.filter((p) => p !== prerequisite)
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {lecture && lecture._id ? "Edit Lecture" : "Create Lecture"}
          </SheetTitle>
          <SheetDescription>
            {lecture && lecture._id
              ? "Update the lecture details below."
              : "Fill in the form below to create a new lecture."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic-info" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Introduction to Variables"
                            {...field}
                          />
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
                            placeholder="Brief description of the lecture content..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chapterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a chapter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {chapters.map((chapter) => (
                              <SelectItem key={chapter._id} value={chapter._id}>
                                {chapter.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estimatedDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormDescription>
                            Position in the chapter
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Published</FormLabel>
                          <FormDescription>
                            Make this lecture visible to students
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

                <TabsContent value="content" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="interactive">
                              Interactive
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("content.type") === "video" && (
                    <FormField
                      control={form.control}
                      name="content.data.videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/video.mp4"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a valid video URL (YouTube, Vimeo, or direct
                            link)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("content.type") === "text" && (
                    <FormField
                      control={form.control}
                      name="content.data.htmlContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Text Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter HTML or rich text content here..."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            You can use HTML tags for formatting
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Additional content type fields would go here */}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div>
                    <FormLabel>Prerequisites</FormLabel>
                    <div className="flex mt-2 mb-4">
                      <Input
                        placeholder="Add prerequisite..."
                        value={currentPrerequisite}
                        onChange={(e) => setCurrentPrerequisite(e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button type="button" onClick={addPrerequisite} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("prerequisites")?.map((prerequisite) => (
                        <Badge key={prerequisite} variant="secondary">
                          {prerequisite}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => removePrerequisite(prerequisite)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex mt-2 mb-4">
                      <Input
                        placeholder="Add tag..."
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("tags")?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {lecture && lecture._id ? "Update Lecture" : "Create Lecture"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
