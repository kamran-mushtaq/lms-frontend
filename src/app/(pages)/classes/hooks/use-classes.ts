// app/dashboard/classes/hooks/use-classes.ts
import useSWR from "swr";
import { getClasses } from "../api/classes-api";

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
  subjects: string[];
  assessmentCriteria: {
    aptitudeTest: {
      required: boolean;
      passingPercentage: number;
      attemptsAllowed: number;
    };
    chapterTests: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    finalExam: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
  };
  isActive: boolean;
}

// Return type for useClasses hook
interface UseClassesReturn {
  classes: Class[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useClasses(): UseClassesReturn {
  const { data, error, isLoading, mutate } = useSWR<Class[], Error>(
    "classes",
    getClasses,
    {
      revalidateOnFocus: false
    }
  );

  return {
    classes: data,
    isLoading,
    error,
    mutate
  };
}
