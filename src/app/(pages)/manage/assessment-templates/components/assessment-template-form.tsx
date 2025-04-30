// src/app/(pages)/assessment-templates/components/assessment-template-form.tsx
"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { PlusCircle, Trash, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  createAssessmentTemplate,
  updateAssessmentTemplate,
  getTopicsForSubject,
  getSkillsForSubject
} from "../api/assessment-templates-api";
import { AssessmentTemplate } from "../hooks/use-assessment-templates";
import {
  useClasses,
  useSubjectsByClass
} from "../hooks/use-classes-and-subjects";

// Props interface
interface AssessmentTemplateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  template: AssessmentTemplate | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const assessmentTemplateSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  type: z.enum(["aptitude", "lecture-activity", "chapter-test", "final-exam"], {
    required_error: "Please select a template type."
  }),
  classId: z.string({ required_error: "Please select a class." }),
  subjectId: z.string().optional(),
  questionCriteria: z.object({
    totalQuestions: z
      .number()
      .min(1, { message: "Must have at least 1 question." }),
    difficultyDistribution: z
      .object({
        beginner: z.number().min(0),
        intermediate: z.number().min(0),
        advanced: z.number().min(0)
      }),
    topicDistribution: z.record(z.string(), z.number()),
    skillsToAssess: z.array(z.string()).default([])
  }),
  totalPoints: z
    .number()
    .min(1, { message: "Total points must be at least 1." }),
  passingScore: z
    .number()
    .min(0)
    .max(100, { message: "Passing score must be between 0 and 100." }),
  settings: z.object({
    timeLimit: z
      .number()
      .min(1, { message: "Time limit must be at least 1 minute." }),
    shuffleQuestions: z.boolean(),
    showResults: z.boolean(),
    attemptsAllowed: z
      .number()
      .min(1, { message: "Must allow at least 1 attempt." }),
    isPublished: z.boolean()
  }),
  isActive: z.boolean().default(true)
});

// Form values type derived from schema
type FormValues = z.infer<typeof assessmentTemplateSchema>;

export function AssessmentTemplateForm({
  open,
  setOpen,
  template,
  onSuccess,
  onError
}: AssessmentTemplateFormProps) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [dynamicTopics, setDynamicTopics] = useState<string[]>([]);
  const [dynamicSkills, setDynamicSkills] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const { classes, isLoading: classesLoading } = useClasses();
  const { subjects, isLoading: subjectsLoading } =
    useSubjectsByClass(selectedClass);
  const [topicName, setTopicName] = useState("");
  const [topicValue, setTopicValue] = useState<number>(0);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(assessmentTemplateSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "aptitude",
      classId: "",
      subjectId: "",
      questionCriteria: {
        totalQuestions: 20,
        difficultyDistribution: {
          beginner: 30,
          intermediate: 50,
          advanced: 20
        },
        topicDistribution: {},
        skillsToAssess: []
      },
      totalPoints: 100,
      passingScore: 60,
      settings: {
        timeLimit: 60,
        shuffleQuestions: true,
        showResults: true,
        attemptsAllowed: 1,
        isPublished: false
      },
      isActive: true
    }
  });

  // Initialize form fields for skills to assess
  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
    replace: replaceSkills
  } = useFieldArray({
    control: form.control,
    name: "questionCriteria.skillsToAssess"
  });

  // Load topics for a subject
  const fetchTopicsForSubject = async (subjectId: string) => {
    if (!subjectId) return;
    
    setIsLoadingTopics(true);
    try {
      const topics = await getTopicsForSubject(subjectId);
      setDynamicTopics(topics);
      toast.success(`Loaded ${topics.length} topics for this subject`);
    } catch (error) {
      console.error("Failed to load topics:", error);
      toast.error("Failed to load topics for this subject");
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Load skills for a subject
  const fetchSkillsForSubject = async (subjectId: string) => {
    if (!subjectId) return;
    
    setIsLoadingSkills(true);
    try {
      const skills = await getSkillsForSubject(subjectId);
      setDynamicSkills(skills);
      toast.success(`Loaded ${skills.length} skills for this subject`);
    } catch (error) {
      console.error("Failed to load skills:", error);
      toast.error("Failed to load skills for this subject");
    } finally {
      setIsLoadingSkills(false);
    }
  };

  // Update form values when editing a template
  useEffect(() => {
    if (template) {
      // Set the selected class for the subjects dropdown
      setSelectedClass(template.classId);
      
      // Set the selected subject
      if (template.subjectId) {
        setSelectedSubject(template.subjectId);
        // Fetch topics and skills for this subject
        fetchTopicsForSubject(template.subjectId);
        fetchSkillsForSubject(template.subjectId);
      }

      // Populate the form with template data
      form.reset({
        title: template.title || "",
        description: template.description || "",
        type: template.type as "aptitude" | "lecture-activity" | "chapter-test" | "final-exam" || "aptitude",
        classId: template.classId || "",
        subjectId: template.subjectId || "",
        questionCriteria: {
          totalQuestions: template.questionCriteria.totalQuestions || 20,
          difficultyDistribution: {
            beginner:
              template.questionCriteria.difficultyDistribution.beginner || 30,
            intermediate:
              template.questionCriteria.difficultyDistribution.intermediate ||
              50,
            advanced:
              template.questionCriteria.difficultyDistribution.advanced || 20
          },
          topicDistribution: template.questionCriteria.topicDistribution || {},
          skillsToAssess: template.questionCriteria.skillsToAssess || []
        },
        totalPoints: template.totalPoints || 100,
        passingScore: template.passingScore || 60,
        settings: {
          timeLimit: template.settings.timeLimit || 60,
          shuffleQuestions:
            template.settings.shuffleQuestions !== undefined
              ? template.settings.shuffleQuestions
              : true,
          showResults:
            template.settings.showResults !== undefined
              ? template.settings.showResults
              : true,
          attemptsAllowed: template.settings.attemptsAllowed || 1,
          isPublished:
            template.settings.isPublished !== undefined
              ? template.settings.isPublished
              : false
        },
        isActive: template.isActive !== undefined ? template.isActive : true
      });
    } else {
      form.reset({
        title: "",
        description: "",
        type: "aptitude",
        classId: "",
        subjectId: "",
        questionCriteria: {
          totalQuestions: 20,
          difficultyDistribution: {
            beginner: 30,
            intermediate: 50,
            advanced: 20
          },
          topicDistribution: {},
          skillsToAssess: []
        },
        totalPoints: 100,
        passingScore: 60,
        settings: {
          timeLimit: 60,
          shuffleQuestions: true,
          showResults: true,
          attemptsAllowed: 1,
          isPublished: false
        },
        isActive: true
      });
      setSelectedClass(null);
      setSelectedSubject(null);
      setDynamicTopics([]);
      setDynamicSkills([]);
    }
  }, [template, form]);

  // Handle class change to update subject dropdown
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    form.setValue("classId", value);
    form.setValue("subjectId", ""); // Reset subject when class changes
    setSelectedSubject(null);
    setDynamicTopics([]);
    setDynamicSkills([]);
  };

  // Handle subject change to load topics and skills
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    form.setValue("subjectId", value);
    
    // Fetch topics and skills for this subject
    if (value) {
      fetchTopicsForSubject(value);
      fetchSkillsForSubject(value);
    }
  };

  // Add a topic from the dropdown to the distribution
  const handleAddDynamicTopic = (topic: string) => {
    if (!topic.trim()) return;
    
    const currentDistribution = form.getValues(
      "questionCriteria.topicDistribution"
    );

    // Check if the topic already exists
    if (currentDistribution[topic]) {
      toast.error(`Topic "${topic}" already exists`);
      return;
    }

    // Calculate remaining percentage
    const currentTotal = Object.values(currentDistribution).reduce(
      (sum, val) => sum + val,
      0
    );
    
    if (currentTotal >= 100) {
      toast.error(
        `Total topic distribution is already at 100%. Remove some topics first.`
      );
      return;
    }
    
    // Default value is either the remaining percentage or 10%, whichever is smaller
    const defaultValue = Math.min(100 - currentTotal, 10);

    // Add the new topic
    const updatedDistribution = {
      ...currentDistribution,
      [topic]: defaultValue
    };

    form.setValue("questionCriteria.topicDistribution", updatedDistribution);
  };

  // Add a new topic to the distribution
  const handleAddTopic = () => {
    if (!topicName.trim()) {
      toast.error("Topic name cannot be empty");
      return;
    }

    const currentDistribution = form.getValues(
      "questionCriteria.topicDistribution"
    );

    // Check if the topic already exists
    if (currentDistribution[topicName]) {
      toast.error(`Topic "${topicName}" already exists`);
      return;
    }

    // Check if total percentage is already at 100%
    const currentTotal = Object.values(currentDistribution).reduce(
      (sum, val) => sum + val,
      0
    );
    if (currentTotal + topicValue > 100) {
      toast.error(
        `Total topic distribution cannot exceed 100%. Current total: ${currentTotal}%`
      );
      return;
    }

    // Add the new topic
    const updatedDistribution = {
      ...currentDistribution,
      [topicName]: topicValue
    };

    form.setValue("questionCriteria.topicDistribution", updatedDistribution);
    setTopicName("");
    setTopicValue(0);
  };

  // Remove a topic from the distribution
  const handleRemoveTopic = (topic: string) => {
    const currentDistribution = {
      ...form.getValues("questionCriteria.topicDistribution")
    };
    delete currentDistribution[topic];
    form.setValue("questionCriteria.topicDistribution", currentDistribution);
  };

  // Add a skill from the dropdown
  const handleAddDynamicSkill = (skill: string) => {
    if (!skill.trim()) return;
    
    // Check if the skill already exists in the array
    const currentSkills = form.getValues("questionCriteria.skillsToAssess");
    if (currentSkills.includes(skill)) {
      toast.error(`Skill "${skill}" already added`);
      return;
    }
    
    // Add the skill
    appendSkill(skill);
  };

  // Add all dynamic skills
  const handleAddAllSkills = () => {
    const currentSkills = form.getValues("questionCriteria.skillsToAssess");
    const newSkills = [...currentSkills];
    
    // Add all skills that aren't already in the array
    dynamicSkills.forEach(skill => {
      if (!currentSkills.includes(skill)) {
        newSkills.push(skill);
      }
    });
    
    // Replace skills array with the new one
    replaceSkills(newSkills);
    toast.success(`Added ${newSkills.length - currentSkills.length} skills`);
  };

  // Update topic distribution value
  const handleTopicValueChange = (topic: string, value: number) => {
    const currentDistribution = {
      ...form.getValues("questionCriteria.topicDistribution")
    };
    
    currentDistribution[topic] = value;
    form.setValue("questionCriteria.topicDistribution", currentDistribution);
  };

  // Balance all topic percentages to add up to 100%
  const handleBalanceTopics = () => {
    const currentDistribution = {
      ...form.getValues("questionCriteria.topicDistribution")
    };
    
    const topicCount = Object.keys(currentDistribution).length;
    if (topicCount === 0) return;
    
    // Even distribution for all topics
    const evenValue = Math.floor(100 / topicCount);
    const remainder = 100 - (evenValue * topicCount);
    
    // Update all topics to have even values
    const updatedDistribution: Record<string, number> = {};
    Object.keys(currentDistribution).forEach((topic, index) => {
      // Add the remainder to the first topic
      updatedDistribution[topic] = evenValue + (index === 0 ? remainder : 0);
    });
    
    form.setValue("questionCriteria.topicDistribution", updatedDistribution);
    toast.success("Topic distribution balanced to 100%");
  };

  // Calculate the total distribution percentage
  const calculateTotalTopicDistribution = () => {
    const distribution = form.getValues("questionCriteria.topicDistribution");
    return Object.values(distribution).reduce((sum, val) => sum + val, 0);
  };

  // Calculate the total difficulty distribution
  const calculateTotalDifficultyDistribution = () => {
    const difficultyValues = form.getValues(
      "questionCriteria.difficultyDistribution"
    );
    return (
      Number(difficultyValues.beginner) +
      Number(difficultyValues.intermediate) +
      Number(difficultyValues.advanced)
    );
  };

  // Balance difficulty distribution to add up to total questions
  const handleBalanceDifficulty = () => {
    const totalQuestions = form.getValues("questionCriteria.totalQuestions");
    
    if (totalQuestions === 0) {
      toast.error("Total questions must be greater than 0");
      return;
    }
    
    // Simple even distribution - divide questions into 3 parts
    let beginner = Math.floor(totalQuestions / 3);
    let intermediate = Math.floor(totalQuestions / 3);
    let advanced = totalQuestions - beginner - intermediate;
    
    // If totalQuestions < 3, ensure at least one question in each category if possible
    if (totalQuestions < 3) {
      if (totalQuestions === 1) {
        beginner = 1;
        intermediate = 0;
        advanced = 0;
      } else if (totalQuestions === 2) {
        beginner = 1;
        intermediate = 1;
        advanced = 0;
      }
    }
    
    form.setValue("questionCriteria.difficultyDistribution", {
      beginner,
      intermediate,
      advanced
    });
    
    toast.success(`Questions distributed evenly (${beginner}/${intermediate}/${advanced})`);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Validate that topic distribution adds up to 100%
      const topicTotal = calculateTotalTopicDistribution();
      if (topicTotal !== 100) {
        toast.error(
          `Topic distribution must add up to 100%. Current total: ${topicTotal}%`
        );
        return;
      }

      // Validate that difficulty distribution adds up to total questions
      const totalQuestions = Number(data.questionCriteria.totalQuestions);
      const difficultyTotal = calculateTotalDifficultyDistribution();
      if (difficultyTotal !== totalQuestions) {
        toast.error(
          `Difficulty distribution must add up to ${totalQuestions} questions. Current total: ${difficultyTotal}`
        );
        return;
      }

      // For aptitude tests, subject is required
      if (data.type === "aptitude" && !data.subjectId) {
        toast.error("Subject is required for aptitude tests");
        return;
      }
      
      // Log data before submission for debugging
      console.log("Submitting form data:", JSON.stringify(data, null, 2));
      
      // Make a copy of the data to avoid modifying the form state
      const submissionData = JSON.parse(JSON.stringify(data));
      
      // IMPORTANT: Ensure all numeric fields are actual numbers, not strings
      // This prevents issues with form data being submitted as strings
      submissionData.questionCriteria.totalQuestions = Number(submissionData.questionCriteria.totalQuestions);
      submissionData.questionCriteria.difficultyDistribution.beginner = Number(submissionData.questionCriteria.difficultyDistribution.beginner);
      submissionData.questionCriteria.difficultyDistribution.intermediate = Number(submissionData.questionCriteria.difficultyDistribution.intermediate);
      submissionData.questionCriteria.difficultyDistribution.advanced = Number(submissionData.questionCriteria.difficultyDistribution.advanced);
      submissionData.totalPoints = Number(submissionData.totalPoints);
      submissionData.passingScore = Number(submissionData.passingScore);
      submissionData.settings.timeLimit = Number(submissionData.settings.timeLimit);
      submissionData.settings.attemptsAllowed = Number(submissionData.settings.attemptsAllowed);
      
      // Process topic distribution to ensure values are numbers
      if (submissionData.questionCriteria.topicDistribution) {
        Object.keys(submissionData.questionCriteria.topicDistribution).forEach(key => {
          submissionData.questionCriteria.topicDistribution[key] = Number(submissionData.questionCriteria.topicDistribution[key]);
        });
      }

      if (template && template._id) {
        // Update existing template
        await updateAssessmentTemplate(template._id, submissionData);
        onSuccess("Assessment template updated successfully");
      } else {
        // Create new template
        await createAssessmentTemplate(submissionData);
        onSuccess("Assessment template created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:w-1/2 lg:w-1/2 xl:w-1/2 h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {template
              ? "Edit Assessment Template"
              : "Create Assessment Template"}
          </SheetTitle>
          <SheetDescription>
            {template
              ? "Update the assessment template details below."
              : "Fill in the form below to create a new assessment template."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <Accordion type="single" collapsible defaultValue="basics">
                <AccordionItem value="basics">
                  <AccordionTrigger>Basic Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Math Aptitude Test Template"
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
                                placeholder="A template for generating math aptitude tests"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a template type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="aptitude">
                                  Aptitude Test
                                </SelectItem>
                                <SelectItem value="lecture-activity">
                                  Lecture Activity
                                </SelectItem>
                                <SelectItem value="chapter-test">
                                  Chapter Test
                                </SelectItem>
                                <SelectItem value="final-exam">
                                  Final Exam
                                </SelectItem>
                              </SelectContent>
                            </Select>
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
                              onValueChange={(value) =>
                                handleClassChange(value)
                              }
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
                                {classes &&
                                  classes.map((cls) => (
                                    <SelectItem key={cls._id} value={cls._id}>
                                      {cls.displayName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("type") === "aptitude" && (
                        <FormField
                          control={form.control}
                          name="subjectId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Subject (Required for Aptitude Tests)
                              </FormLabel>
                              <Select
                                onValueChange={(value) => handleSubjectChange(value)}
                                defaultValue={field.value}
                                value={field.value}
                                disabled={!selectedClass || subjectsLoading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subjects &&
                                    subjects.map((subject) => (
                                      <SelectItem
                                        key={subject._id}
                                        value={subject._id}
                                      >
                                        {subject.displayName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Subject is required for aptitude tests
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="totalPoints"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Points</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passingScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Passing Score (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Question Criteria */}
                <AccordionItem value="questionCriteria">
                  <AccordionTrigger>Question Criteria</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="questionCriteria.totalQuestions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Questions</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              The total number of questions to include in
                              generated assessments
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Difficulty Distribution
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Set the number of questions for each difficulty level. Total must add up to {form.watch("questionCriteria.totalQuestions")} questions.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="questionCriteria.difficultyDistribution.beginner"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Beginner (questions)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={form.watch("questionCriteria.totalQuestions")}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    value={field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="questionCriteria.difficultyDistribution.intermediate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Intermediate (questions)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={form.watch("questionCriteria.totalQuestions")}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    value={field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="questionCriteria.difficultyDistribution.advanced"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Advanced (questions)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={form.watch("questionCriteria.totalQuestions")}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    value={field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p
                            className={`text-sm ${
                              calculateTotalDifficultyDistribution() === form.watch("questionCriteria.totalQuestions")
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            Total difficulty distribution:{" "}
                            {calculateTotalDifficultyDistribution()} / {form.watch("questionCriteria.totalQuestions")} questions
                          </p>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={handleBalanceDifficulty}
                          >
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Distribute Evenly
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Topic Distribution
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Set the percentage distribution of questions by topic.
                          Total must add up to 100%.
                        </p>

                        {selectedSubject && dynamicTopics.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium mb-2">Add from available topics:</h5>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                              {dynamicTopics.map((topic) => (
                                <Badge 
                                  key={topic}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-secondary"
                                  onClick={() => handleAddDynamicTopic(topic)}
                                >
                                  + {topic}
                                </Badge>
                              ))}
                              {dynamicTopics.length === 0 && isLoadingTopics && (
                                <p className="text-sm text-muted-foreground">Loading topics...</p>
                              )}
                              {dynamicTopics.length === 0 && !isLoadingTopics && (
                                <p className="text-sm text-muted-foreground">No topics found for this subject</p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="col-span-2">
                            <label className="text-sm font-medium">
                              Topic Name
                            </label>
                            <Input
                              placeholder="e.g., Algebra"
                              value={topicName}
                              onChange={(e) => setTopicName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Percentage (%)
                            </label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={topicValue}
                              onChange={(e) =>
                                setTopicValue(parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddTopic}
                          disabled={
                            !topicName.trim() ||
                            topicValue <= 0 ||
                            calculateTotalTopicDistribution() + topicValue > 100
                          }
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Custom Topic
                        </Button>

                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium mb-2">
                              Current Topics
                            </h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleBalanceTopics}
                              disabled={Object.keys(form.watch("questionCriteria.topicDistribution") || {}).length === 0}
                            >
                              <RefreshCcw className="h-4 w-4 mr-2" />
                              Balance to 100%
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {Object.entries(
                              form.watch(
                                "questionCriteria.topicDistribution"
                              ) || {}
                            ).map(([topic, percentage]) => (
                              <div
                                key={topic}
                                className="flex items-center justify-between bg-muted p-2 rounded-md"
                              >
                                <span className="font-medium">{topic}</span>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={percentage}
                                    onChange={(e) => handleTopicValueChange(topic, parseInt(e.target.value) || 0)}
                                    className="w-20 h-8"
                                  />
                                  <span>%</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveTopic(topic)}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {Object.keys(
                              form.watch(
                                "questionCriteria.topicDistribution"
                              ) || {}
                            ).length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                No topics added yet
                              </p>
                            )}
                          </div>
                          <div className="mt-2">
                            <p
                              className={`text-sm ${
                                calculateTotalTopicDistribution() === 100
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              Total topic distribution:{" "}
                              {calculateTotalTopicDistribution()}% (must be
                              100%)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">
                            Skills to Assess
                          </h4>
                          
                          {selectedSubject && dynamicSkills.length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddAllSkills}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add All Skills
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add skills that this assessment will evaluate
                        </p>

                        {selectedSubject && dynamicSkills.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium mb-2">Available skills:</h5>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                              {dynamicSkills.map((skill) => (
                                <Badge 
                                  key={skill}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-secondary"
                                  onClick={() => handleAddDynamicSkill(skill)}
                                >
                                  + {skill}
                                </Badge>
                              ))}
                              {dynamicSkills.length === 0 && isLoadingSkills && (
                                <p className="text-sm text-muted-foreground">Loading skills...</p>
                              )}
                              {dynamicSkills.length === 0 && !isLoadingSkills && (
                                <p className="text-sm text-muted-foreground">No skills found for this subject</p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          {skillFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="flex items-center gap-2"
                            >
                              <Input
                                {...form.register(
                                  `questionCriteria.skillsToAssess.${index}`
                                )}
                                placeholder="e.g., Problem Solving"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSkill(index)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendSkill("")}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Custom Skill
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Settings */}
                <AccordionItem value="settings">
                  <AccordionTrigger>Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="settings.timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Limit (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                value={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="settings.attemptsAllowed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attempts Allowed</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                value={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="settings.shuffleQuestions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Shuffle Questions</FormLabel>
                              <FormDescription>
                                Randomize the order of questions for each
                                student
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
                        name="settings.showResults"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Show Results</FormLabel>
                              <FormDescription>
                                Show detailed results to students after
                                completion
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
                        name="settings.isPublished"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Published</FormLabel>
                              <FormDescription>
                                Make this template available for generating
                                assessments
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Set the active status of this template
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-background py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {template ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};