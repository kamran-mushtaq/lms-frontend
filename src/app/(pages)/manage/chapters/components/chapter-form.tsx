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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chapter } from "../hooks/use-chapters";
import { createChapter, updateChapter, uploadChapterImage } from "../api/chapters-api";
import { useClasses } from "../hooks/use-classes";
import { useSubjects } from "../hooks/use-subjects";
import Image from "next/image";
import { ImageIcon, Trash2, UploadIcon } from "lucide-react";

// Zod validation schema for the form
const chapterSchema = z.object({
  displayName: z.string().min(3, {
    message: "Chapter name must be at least 3 characters long"
  }),
  name: z.string().min(3, {
    message: "System name must be at least 3 characters long"
  }).regex(/^[a-z0-9-]+$/, {
    message: "System name must be kebab-case (only lowercase letters, numbers, and hyphens)"
  }),
  classId: z.string({
    required_error: "Please select a class"
  }),
  subjectId: z.string({
    required_error: "Please select a subject"
  }),
  order: z.coerce.number().min(1, {
    message: "Order must be at least 1"
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters long"
  }),
  duration: z.coerce.number().min(1, {
    message: "Duration must be at least 1 minute"
  }),
  isLocked: z.boolean().default(false),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional()
});

// Props interface
interface ChapterFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chapter: Chapter | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Form values type derived from schema
type FormValues = z.infer<typeof chapterSchema>;

export function ChapterForm({
  open,
  setOpen,
  chapter,
  onSuccess,
  onError
}: ChapterFormProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { classes, isLoading: classesLoading } = useClasses();
  const { subjects, isLoading: subjectsLoading } = useSubjects(selectedClassId);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      displayName: "",
      name: "",
      classId: "",
      subjectId: "",
      order: 1,
      description: "",
      duration: 60,
      isLocked: false,
      isActive: true,
      imageUrl: ""
    }
  });

  // Update form values when editing an existing chapter
  useEffect(() => {
    if (chapter) {
      // Handle subjectId which could be a string or an object
      const subjectId = typeof chapter.subjectId === 'object' 
        ? chapter.subjectId._id 
        : chapter.subjectId;
      
      // If we have a subject, we need to get its classId to populate the class dropdown
      if (typeof chapter.subjectId === 'object' && chapter.subjectId.classId) {
        setSelectedClassId(
          typeof chapter.subjectId.classId === 'object'
            ? chapter.subjectId.classId._id
            : chapter.subjectId.classId
        );
      }

      // Set image preview if there's an image URL
      if (chapter.metadata?.imageUrl) {
        setImagePreview(chapter.metadata.imageUrl);
      } else {
        setImagePreview(null);
      }

      // Reset form with chapter data
      form.reset({
        displayName: chapter.displayName,
        name: chapter.name,
        classId: selectedClassId || "",
        subjectId: subjectId || "",
        order: chapter.order,
        description: chapter.description,
        duration: chapter.duration,
        isLocked: chapter.isLocked,
        isActive: chapter.isActive,
        imageUrl: chapter.metadata?.imageUrl || ""
      });
    } else {
      // Reset form to defaults for new chapter
      form.reset({
        displayName: "",
        name: "",
        classId: "",
        subjectId: "",
        order: 1,
        description: "",
        duration: 60,
        isLocked: false,
        isActive: true,
        imageUrl: ""
      });
      setSelectedClassId(null);
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [chapter, form]);

  // Auto-generate kebab-case name when display name changes
  const autoGenerateSystemName = (displayName: string) => {
    const kebabCase = displayName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove non-word chars except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen

    form.setValue("name", kebabCase);
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      onError(new Error("Selected file is not an image"));
      return;
    }

    setSelectedImage(file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    form.setValue("imageUrl", "");
  };

  // Handle class change to filter subjects
  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    form.setValue("classId", value);
    form.setValue("subjectId", ""); // Reset subject when class changes
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    try {
      let imageUrl = values.imageUrl;

      // If there's a new selected image, upload it first
      if (selectedImage) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadChapterImage(selectedImage);
          // --- Frontend Logging: Check Upload Result ---
          console.log("Frontend: Upload Result:", JSON.stringify(uploadResult, null, 2));
          // Construct the full URL using the filename and the /api/upload/ path
          const backendBaseUrl = "http://localhost:3005"; // Adjust if your backend URL is different
          imageUrl = uploadResult?.filename ? `${backendBaseUrl}/api/uploads/${uploadResult.filename}` : undefined; // Use /api/uploads/
        } catch (error) {
          onError(error as Error);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Prepare chapter data
      // Destructure imageUrl out of values to avoid sending the top-level form field
      const { imageUrl: formImageUrl, ...otherValues } = values;
      const chapterData = {
        ...otherValues, // Spread only the other values
        metadata: {
          imageUrl: imageUrl // Use the correct imageUrl (potentially updated from upload)
        }
      };

      // --- Frontend Logging: Check Data Before Sending ---
      console.log("Frontend: Chapter Data Payload:", JSON.stringify(chapterData, null, 2));

      if (chapter) {
        // Update existing chapter
        await updateChapter(chapter._id, chapterData);
        onSuccess("Chapter updated successfully");
      } else {
        // Create new chapter
        await createChapter(chapterData);
        onSuccess("Chapter created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{chapter ? "Edit Chapter" : "Create Chapter"}</SheetTitle>
          <SheetDescription>
            {chapter
              ? "Update the chapter details below."
              : "Fill in the form below to create a new chapter."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="image">Chapter Image</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <TabsContent value="details" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Introduction to Algebra"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-generate system name on first input only
                              if (!form.getValues("name") || chapter === null) {
                                autoGenerateSystemName(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          The name displayed to users
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
                            placeholder="introduction-to-algebra"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          System identifier (kebab-case, auto-generated from display name)
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
                          disabled={classesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes
                              ?.filter(cls => typeof cls._id === 'string' && String(cls._id).trim() !== '') // Stricter filter (trim)
                              .map((cls) => (
                              <SelectItem key={String(cls._id)} value={String(cls._id)}> {/* Filter & Cast */}
                                {cls.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the class this chapter belongs to
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
                          disabled={subjectsLoading || !selectedClassId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedClassId ? "Select a subject" : "Select a class first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects
                              ?.filter(sub => typeof sub._id === 'string' && String(sub._id).trim() !== '') // Stricter filter (trim)
                              .map((subject) => (
                              <SelectItem key={String(subject._id)} value={String(subject._id)}> {/* Filter & Cast */}
                                {subject.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the subject this chapter belongs to
                        </FormDescription>
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
                          The display order of this chapter within the subject
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
                            placeholder="A comprehensive introduction to algebraic concepts..."
                            className="min-h-[100px]"
                            {...field}
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
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Estimated time to complete this chapter
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isLocked"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                          <div>
                            <FormLabel>Lock Chapter</FormLabel>
                            <FormDescription>
                              Prevent students from accessing this chapter
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
                        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                          <div>
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Display this chapter in the curriculum
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

                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-4 border-2 border-dashed rounded-md p-6">
                      {imagePreview ? (
                        <div className="relative w-full max-w-xs">
                          <div className="relative w-full h-48 overflow-hidden rounded-md border">
                            <Image
                              src={imagePreview}
                              alt="Chapter image preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleRemoveImage}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No image selected
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col items-center space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById("chapter-image")?.click()}
                        >
                          <UploadIcon className="mr-2 h-4 w-4" />
                          {imagePreview ? "Change Image" : "Upload Image"}
                        </Button>
                        <input
                          type="file"
                          id="chapter-image"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <p className="text-sm text-muted-foreground">
                          Upload a JPEG or PNG image for this chapter
                        </p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value && !selectedImage) {
                                  setImagePreview(e.target.value);
                                } else if (!e.target.value && !selectedImage) {
                                  setImagePreview(null);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Alternatively, provide a direct URL to an image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isUploading}
                  >
                    {isUploading 
                      ? "Uploading..." 
                      : chapter 
                        ? "Update Chapter" 
                        : "Create Chapter"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}