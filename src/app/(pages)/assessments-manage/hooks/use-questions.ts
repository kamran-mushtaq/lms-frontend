// app/dashboard/assessments/hooks/use-questions.ts
import useSWR from "swr";
import { getQuestions, getQuestionsBySubject } from "../api/assessments-api";

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

// Get questions by subject ID
export function useQuestionsBySubject(
  subjectId: string | null
): UseQuestionsReturn {
  const { data, error, isLoading, mutate } = useSWR<Question[], Error>(
    subjectId ? `questions/subject/${subjectId}` : null,
    subjectId ? () => getQuestionsBySubject(subjectId) : null,
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
