// app/dashboard/assessments/components/question-assignment.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  addQuestionsToAssessment,
  removeQuestionsFromAssessment,
  getAssessmentById
} from "../api/assessments-api";
import { useQuestionsBySubject } from "../hooks/use-questions";

// Interfaces
interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: string;
  classId: string;
  subjectId: string;
  questions: Question[];
  totalPoints: number;
  passingScore: number;
  settings: {
    timeLimit: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    attemptsAllowed: number;
    isPublished: boolean;
  };
}

interface Question {
  _id: string;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  type: string;
  difficultyLevel: string;
  points: number;
}

// Props interface
interface QuestionAssignmentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  assessment: Assessment | null;
  questions: Question[];
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

export function QuestionAssignment({
  open,
  setOpen,
  assessment,
  questions,
  onSuccess,
  onError
}: QuestionAssignmentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [selectedTab, setSelectedTab] = useState("available");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [assignedQuestions, setAssignedQuestions] = useState<Question[]>([]);

  // Get questions specific to the assessment's subject
  const { questions: subjectQuestions, isLoading } = useQuestionsBySubject(
    assessment?.subjectId || null
  );

  // Initialize assignedQuestions when assessment changes
  useEffect(() => {
    if (assessment) {
      setAssignedQuestions(assessment.questions || []);
    } else {
      setAssignedQuestions([]);
    }
    setSelectedQuestions([]);
  }, [assessment]);

  // Filter available questions - exclude already assigned ones
  const availableQuestions = subjectQuestions
    ? subjectQuestions.filter(
        (question) =>
          !assignedQuestions.some((assigned) => assigned._id === question._id)
      )
    : [];

  // Apply search and difficulty filters
  const filteredQuestions = (
    selectedTab === "available" ? availableQuestions : assignedQuestions
  ).filter((question) => {
    const matchesSearch = question.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      difficultyFilter && difficultyFilter !== "all-difficulties"
        ? question.difficultyLevel === difficultyFilter
        : true;
    return matchesSearch && matchesDifficulty;
  });

  // Handle adding questions to assessment
  const handleAddQuestions = async () => {
    if (!assessment || selectedQuestions.length === 0) return;

    try {
      await addQuestionsToAssessment(assessment._id, selectedQuestions);

      // Update local state
      const newAssignedQuestions = [
        ...assignedQuestions,
        ...availableQuestions.filter((q) => selectedQuestions.includes(q._id))
      ];
      setAssignedQuestions(newAssignedQuestions);
      setSelectedQuestions([]);
      onSuccess("Questions added to assessment successfully");

      // Switch to assigned tab
      setSelectedTab("assigned");
    } catch (error) {
      onError(error as Error);
    }
  };

  // Handle removing questions from assessment
  const handleRemoveQuestions = async () => {
    if (!assessment || selectedQuestions.length === 0) return;

    try {
      await removeQuestionsFromAssessment(assessment._id, selectedQuestions);

      // Update local state
      const newAssignedQuestions = assignedQuestions.filter(
        (q) => !selectedQuestions.includes(q._id)
      );
      setAssignedQuestions(newAssignedQuestions);
      setSelectedQuestions([]);
      onSuccess("Questions removed from assessment successfully");
    } catch (error) {
      onError(error as Error);
    }
  };

  // Toggle selection of a question
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Select all visible questions
  const selectAllVisible = () => {
    setSelectedQuestions(filteredQuestions.map((q) => q._id));
  };

  // Deselect all questions
  const deselectAll = () => {
    setSelectedQuestions([]);
  };

  // Get difficulty badge color
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className="w-full sm:max-w-5xl overflow-hidden flex flex-col h-full"
        side="right"
      >
        <SheetHeader>
          <SheetTitle>
            {assessment
              ? `Manage Questions: ${assessment.title}`
              : "Manage Questions"}
          </SheetTitle>
          <SheetDescription>
            Add or remove questions from this assessment.
          </SheetDescription>
        </SheetHeader>

        <div className="flex space-x-4 my-4">
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-difficulties">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs
          defaultValue="available"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="flex-1 flex flex-col"
        >
          <TabsList>
            <TabsTrigger value="available">Available Questions</TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned Questions ({assignedQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="flex-1 flex flex-col">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                {filteredQuestions.length} questions available
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllVisible}
                  disabled={filteredQuestions.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  disabled={selectedQuestions.length === 0}
                >
                  Deselect All
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddQuestions}
                  disabled={selectedQuestions.length === 0}
                >
                  Add Selected ({selectedQuestions.length})
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No questions available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuestions.map((question) => (
                      <TableRow key={question._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedQuestions.includes(question._id)}
                            onCheckedChange={() =>
                              toggleQuestionSelection(question._id)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="line-clamp-2">{question.text}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {question.type === "mcq"
                              ? "Multiple Choice"
                              : question.type === "trueFalse"
                              ? "True/False"
                              : question.type === "shortAnswer"
                              ? "Short Answer"
                              : "Essay"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getDifficultyColor(
                              question.difficultyLevel
                            )}
                          >
                            {question.difficultyLevel.charAt(0).toUpperCase() +
                              question.difficultyLevel.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {question.points}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="assigned" className="flex-1 flex flex-col">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                {filteredQuestions.length} questions assigned
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllVisible}
                  disabled={filteredQuestions.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  disabled={selectedQuestions.length === 0}
                >
                  Deselect All
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveQuestions}
                  disabled={selectedQuestions.length === 0}
                >
                  Remove Selected ({selectedQuestions.length})
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No questions assigned.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuestions.map((question) => (
                      <TableRow key={question._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedQuestions.includes(question._id)}
                            onCheckedChange={() =>
                              toggleQuestionSelection(question._id)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="line-clamp-2">{question.text}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {question.type === "mcq"
                              ? "Multiple Choice"
                              : question.type === "trueFalse"
                              ? "True/False"
                              : question.type === "shortAnswer"
                              ? "Short Answer"
                              : "Essay"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getDifficultyColor(
                              question.difficultyLevel
                            )}
                          >
                            {question.difficultyLevel.charAt(0).toUpperCase() +
                              question.difficultyLevel.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {question.points}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
