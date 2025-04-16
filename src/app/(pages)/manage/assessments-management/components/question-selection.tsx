// app/dashboard/assessments/components/question-selection.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuestions } from "../hooks/use-questions";
import { Question } from "../api/assessments-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface QuestionSelectionProps {
  selectedQuestions: string[];
  onQuestionsChange: (questions: string[]) => void;
  subjectId?: string;
}

export function QuestionSelection({
  selectedQuestions,
  onQuestionsChange,
  subjectId
}: QuestionSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [difficultyFilter, setDifficultyFilter] = useState<string | undefined>(
    undefined
  );
  const { questions, isLoading, error, filters, setFilters, mutate } =
    useQuestions();

  // Apply filters when they change
  useEffect(() => {
    const newFilters = {
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(difficultyFilter ? { difficultyLevel: difficultyFilter } : {}),
      ...(subjectId ? { subjectId } : {})
    };

    setFilters(newFilters);
  }, [searchTerm, typeFilter, difficultyFilter, subjectId, setFilters]);

  const handleCheckQuestion = (questionId: string, isChecked: boolean) => {
    if (isChecked) {
      onQuestionsChange([...selectedQuestions, questionId]);
    } else {
      onQuestionsChange(selectedQuestions.filter((id) => id !== questionId));
    }
  };

  const handleSelectAll = () => {
    if (questions) {
      if (selectedQuestions.length === questions.length) {
        // If all are selected, deselect all
        onQuestionsChange([]);
      } else {
        // Otherwise, select all
        onQuestionsChange(questions.map((q) => q._id));
      }
    }
  };

  const handleSearch = () => {
    // The search is already applied via useEffect when searchTerm changes
    // This is just an explicit function for the search button
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter(undefined);
    setDifficultyFilter(undefined);
  };

  // Calculate if all are selected
  const allSelected = questions
    ? selectedQuestions.length === questions.length && questions.length > 0
    : false;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <p>Error loading questions: {error.message}</p>
        <Button className="mt-2" variant="outline" onClick={() => mutate()}>
          Retry
        </Button>
      </div>
    );
  }

  // Ensure questions is at least an empty array if undefined
  const questionsList = questions || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) =>
              setTypeFilter(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Question Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mcq">Multiple Choice</SelectItem>
              <SelectItem value="true-false">True/False</SelectItem>
              <SelectItem value="short-answer">Short Answer</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={difficultyFilter || "all"}
            onValueChange={(value) =>
              setDifficultyFilter(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleClearFilters}>
            Clear
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 lg:px-3"
            onClick={handleSelectAll}
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 mr-2" />
            ) : (
              <Square className="h-4 w-4 mr-2" />
            )}
            {allSelected ? "Deselect All" : "Select All"}
          </Button>

          <div className="text-sm text-muted-foreground">
            {selectedQuestions.length} of {questionsList.length} selected
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Select</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-[150px]">Type</TableHead>
              <TableHead className="w-[150px]">Difficulty</TableHead>
              <TableHead className="w-[80px] text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questionsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No questions found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            ) : (
              questionsList.map((question) => (
                <TableRow key={question._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedQuestions.includes(question._id)}
                      onCheckedChange={(checked) =>
                        handleCheckQuestion(question._id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{question.text}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {question.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {question.type === "mcq" && <Badge>Multiple Choice</Badge>}
                    {question.type === "true-false" && (
                      <Badge>True/False</Badge>
                    )}
                    {question.type === "short-answer" && (
                      <Badge>Short Answer</Badge>
                    )}
                    {question.type === "essay" && <Badge>Essay</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        question.difficultyLevel === "beginner"
                          ? "bg-green-100 text-green-800"
                          : question.difficultyLevel === "intermediate"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
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
      </div>

      {selectedQuestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Selected Questions</CardTitle>
            <CardDescription>
              You have selected {selectedQuestions.length} questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {selectedQuestions.length > 0 &&
                questionsList.filter((q) => selectedQuestions.includes(q._id))
                  .length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <div className="font-medium">Type:</div>
                    {Array.from(
                      new Set(
                        questionsList
                          .filter((q) => selectedQuestions.includes(q._id))
                          .map((q) => q.type)
                      )
                    ).map((type) => (
                      <Badge key={type} variant="outline">
                        {type === "mcq"
                          ? "Multiple Choice"
                          : type === "true-false"
                          ? "True/False"
                          : type === "short-answer"
                          ? "Short Answer"
                          : "Essay"}
                      </Badge>
                    ))}
                  </div>
                )}

              {selectedQuestions.length > 0 &&
                questionsList.filter((q) => selectedQuestions.includes(q._id))
                  .length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="font-medium">Difficulty:</div>
                    {Array.from(
                      new Set(
                        questionsList
                          .filter((q) => selectedQuestions.includes(q._id))
                          .map((q) => q.difficultyLevel)
                      )
                    ).map((level) => (
                      <Badge key={level} variant="outline">
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
          </CardContent>
          <CardFooter className="pt-3">
            <div className="flex justify-between w-full">
              <div>
                Total Points:{" "}
                <span className="font-bold">
                  {questionsList
                    .filter((q) => selectedQuestions.includes(q._id))
                    .reduce((sum, q) => sum + q.points, 0)}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onQuestionsChange([])}
              >
                Clear All
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
