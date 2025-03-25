// app/dashboard/attributes/hooks/use-attributes.ts
import useSWR from "swr";
import { getAttributes, getAttributesByType } from "../api/attributes-api";

// Attribute interface
interface Attribute {
  _id: string;
  title: string;
  type: {
    _id: string;
    name: string;
  };
  parentId?: {
    _id: string;
    title: string;
  };
  status: string;
  createdAt: string;
}

// Return type for useAttributes hook
interface UseAttributesReturn {
  attributes: Attribute[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useAttributes(typeId?: string): UseAttributesReturn {
  const { data, error, isLoading, mutate } = useSWR<Attribute[], Error>(
    typeId ? `attributes/type/${typeId}` : "attributes",
    () => (typeId ? getAttributesByType(typeId) : getAttributes()),
    {
      revalidateOnFocus: false
    }
  );

  return {
    attributes: data,
    isLoading,
    error,
    mutate
  };
}
