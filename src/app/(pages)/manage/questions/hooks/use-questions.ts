// app/dashboard/questions/hooks/use-questions.ts
import useSWR from "swr";
import { getQuestions } from "../api/questions-api";

// Question interface
interface Question {
  _id: string;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  type: string;
  difficultyLevel: string;
  subjectId: string;
  points: number;
}

// Return type for useQuestions hook
interface UseQuestionsReturn {
  questions: Question[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useQuestions(): UseQuestionsReturn {
  const { data, error, isLoading, mutate } = useSWR<Question[], Error>(
    "questions",
    getQuestions,
    {
      revalidateOnFocus: false
    }
  );

  return {
    questions: data,
    isLoading,
    error,
    mutate
  };
}

// Hook for getting questions by subject
interface UseQuestionsBySubjectReturn {
  questions: Question[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useQuestionsBySubject(
  subjectId: string
): UseQuestionsBySubjectReturn {
  const fetcher = async () => {
    const response = await fetch(`/api/questions/subject/${subjectId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch questions for subject");
    }
    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR<Question[], Error>(
    subjectId ? `questions-subject-${subjectId}` : null,
    fetcher,
    {
      revalidateOnFocus: false
    }
  );

  return {
    questions: data,
    isLoading,
    error,
    mutate
  };
}
