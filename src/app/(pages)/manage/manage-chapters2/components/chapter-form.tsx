// app/dashboard/chapters/components/chapter-form.tsx
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
import { Image, Upload, X } from "lucide-react";
import { createChapter, updateChapter } from "../api/chapters-api";
import apiClient from "@/lib/api-client";

// Chapter interface
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked: boolean;
  isActive: boolean;
  description?: string;
  duration?: number;
  prerequisites?: string[];
  imageUrl?: string;
}

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
}

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface ChapterFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chapter: Chapter | null;
  subjects: Subject[];
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const chapterSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters." })
    .refine(val => /^[a-z0-9-]+$/.test(val), {
      message: "Name must be lowercase with hyphens only (e.g. chapter-name)."
    }),
  displayName: z.string()
    .min(2, { message: "Display name must be at least 2 characters." }),
  classId: z.string({ required_error: "Please select a class." }),
  subjectId: z.string({ required_error: "Please select a subject." }),
  order: z.coerce.number()
    .min(1, { message: "Order must be at least 1." }),
  description: z.string().optional(),
  duration: z.coerce.number()
    .min(0, { message: "Duration cannot be negative." })
    .optional(),
  isLocked: z.boolean().default(false),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url({ message: "Please enter a valid URL for the image." }).optional().or(z.literal("")),
});

// Form values type derived from schema
type FormValues = z.infer<typeof chapterSchema>;

export function ChapterForm({
  open,
  setOpen,
  chapter,
  subjects,
  onSuccess,
  onError
}: ChapterFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "image">("details");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const response = await apiClient.get("/classes");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        onError(new Error("Failed to load classes"));
      } finally {
        setIsLoadingClasses(false);
      }
    };

    if (open) {
      fetchClasses();
    }
  }, [open, onError]);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      name: "",
      displayName: "",
      classId: "",
      subjectId: "",
      order: 1,
      description: "",
      duration: 0,
      isLocked: false,
      isActive: true,
      imageUrl: "",
    }
  });

  // Filter subjects based on selected class
  useEffect(() => {
    if (selectedClass) {
      const filtered = subjects.filter(subject => subject.classId === selectedClass);
      setFilteredSubjects(filtered);
      
      // If current selected subject is not in filtered subjects, reset it
      const currentSubjectId = form.getValues("subjectId");
      if (currentSubjectId && !filtered.some(s => s._id === currentSubjectId)) {
        form.setValue("subjectId", "");
      }
      
      // Log for debugging
      console.log(`Filtered ${filtered.length} subjects for class ${selectedClass}`);
      console.log("All subjects:", subjects);
      console.log("Filtered subjects:", filtered);
    } else {
      setFilteredSubjects([]);
    }
  }, [selectedClass, subjects, form]);

  // Update form values when editing a chapter
  useEffect(() => {
    if (chapter) {
      // Find the subject
      const subject = subjects.find(s => s._id === chapter.subjectId);
      const classId = subject ? subject.classId : "";
      
      // Update form values
      form.reset({
        name: chapter.name || "",
        displayName: chapter.displayName || "",
        classId: classId,
        subjectId: chapter.subjectId || "",
        order: chapter.order || 1,
        description: chapter.description || "",
        duration: chapter.duration || 0,
        isLocked: chapter.isLocked || false,
        isActive: chapter.isActive || true,
        imageUrl: chapter.imageUrl || "",
      });
      
      // Set selected class
      setSelectedClass(classId);
      
      // Set image preview if imageUrl exists
      if (chapter.imageUrl) {
        setImagePreview(chapter.imageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      form.reset({
        name: "",
        displayName: "",
        classId: "",
        subjectId: "",
        order: 1,
        description: "",
        duration: 0,
        isLocked: false,
        isActive: true,
        imageUrl: "",
      });
      setImagePreview(null);
      setSelectedClass(null);
    }
  }, [chapter, form, subjects]);

  // Auto-generate kebab-case name from display name
  const handleDisplayNameChange = (value: string) => {
    const name = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    form.setValue("name", name);
  };

  // Handle class change
  const handleClassChange = (classId: string) => {
    console.log(`Class changed to: ${classId}`);
    setSelectedClass(classId);
    form.setValue("classId", classId);
    form.setValue("subjectId", ""); // Reset subject when class changes
  };

  // Handle image URL change
  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    setImagePreview(url.trim() !== "" ? url : null);
    setUploadedFile(null); // Clear any uploaded file
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      onError(new Error("Please upload an image file"));
      return;
    }

    setUploadedFile(file);
    
    // Create URL preview
    const fileUrl = URL.createObjectURL(file);
    setImagePreview(fileUrl);
    form.setValue("imageUrl", ""); // Clear the URL input field
  };

  // Clear image
  const handleClearImage = () => {
    form.setValue("imageUrl", "");
    setImagePreview(null);
    setUploadedFile(null);

    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = async (data: FormValues) => {
    try {
      let finalImageUrl = data.imageUrl || "";

      // If there's an uploaded file, handle file upload
      if (uploadedFile) {
        // In a real implementation, you would upload the file to your server
        // Here we're simulating a successful upload
        finalImageUrl = URL.createObjectURL(uploadedFile);
        
        // For production, you should implement a proper file upload
        // and set the finalImageUrl to the URL returned from your server
        
        // Example of actual implementation:
        /*
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('File upload failed');
        }
        
        const result = await response.json();
        finalImageUrl = result.url;
        */
      }

      // Prepare data with the correct imageUrl
      const submissionData = {
        ...data,
        imageUrl: finalImageUrl || undefined
      };

      console.log("Submitting chapter data:", submissionData);

      if (chapter && chapter._id) {
        // Update existing chapter
        await updateChapter(chapter._id, submissionData);
        onSuccess("Chapter updated successfully");
      } else {
        // Create new chapter
        await createChapter(submissionData);
        onSuccess("Chapter created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{chapter ? "Edit Chapter" : "Create Chapter"}</SheetTitle>
          <SheetDescription>
            {chapter
              ? "Update the chapter details below."
              : "Fill in the form below to create a new chapter."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs 
                defaultValue="details" 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as "details" | "image")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="image">Chapter Image</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Introduction to Variables" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              handleDisplayNameChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          This is how the chapter will be displayed to users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="introduction-to-variables"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the system identifier for the chapter. Use lowercase with hyphens.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select
                          onValueChange={(value) => handleClassChange(value)}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={isLoadingClasses}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes?.map((cls) => (
                              <SelectItem key={cls._id} value={cls._id}>
                                {cls.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the class that this chapter belongs to.
                        </FormDescription>
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={!selectedClass}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !selectedClass 
                                  ? "Select a class first"
                                  : "Select a subject"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredSubjects.length > 0 ? (
                              filteredSubjects.map((subject) => (
                                <SelectItem key={subject._id} value={subject._id}>
                                  {subject.displayName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-subjects" disabled>
                                {selectedClass ? "No subjects available for this class" : "Select a class first"}
                              </SelectItem>
                            )}
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
                          <Input
                            type="number"
                            min="1"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The display order of this chapter within the subject.
                        </FormDescription>
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
                            placeholder="Enter a description of the chapter content and learning objectives."
                            className="resize-none"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Estimated time to complete the chapter (in minutes).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col space-y-4">
                    <FormField
                      control={form.control}
                      name="isLocked"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Lock Chapter</FormLabel>
                            <FormDescription>
                              Locked chapters are not accessible to students.
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

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Status</FormLabel>
                            <FormDescription>
                              Inactive chapters are hidden from all views.
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
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div>
                      <FormLabel htmlFor="image-upload">Upload Image</FormLabel>
                      <div className="mt-1 flex items-center gap-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className="flex gap-2 items-center"
                        >
                          <Upload className="h-4 w-4" />
                          Choose File
                        </Button>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        {uploadedFile && (
                          <span className="text-sm text-muted-foreground">
                            {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload an image for the chapter. Recommended size: 800x450px.
                      </p>
                    </div>

                    <p className="text-sm font-medium my-2">- OR -</p>

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Use Image URL</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                placeholder="https://example.com/image.jpg"
                                {...field}
                                onChange={(e) => handleImageUrlChange(e.target.value)}
                                disabled={!!uploadedFile}
                              />
                              {field.value && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleImageUrlChange("")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Alternatively, provide a direct URL to an image.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    {imagePreview ? (
                      <div className="relative border rounded-md overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Chapter preview" 
                          className="object-cover w-full h-auto max-h-[250px]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            setImagePreview(null);
                            form.setValue("imageUrl", "");
                            setUploadedFile(null);
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleClearImage}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border rounded-md p-8 bg-muted/30">
                        <Image className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm">No image provided</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Upload an image or provide a URL
                        </p>
                      </div>
                    )}
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
                  {chapter ? "Update Chapter" : "Create Chapter"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}