// app/dashboard/attribute-types/hooks/use-attribute-types.ts
import useSWR from "swr";
import { getAttributeTypes } from "../api/attribute-types-api";

// AttributeType interface
interface AttributeType {
  _id: string;
  name: string;
  createdAt: string;
}

// Return type for useAttributeTypes hook
interface UseAttributeTypesReturn {
  attributeTypes: AttributeType[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useAttributeTypes(): UseAttributeTypesReturn {
  const { data, error, isLoading, mutate } = useSWR<AttributeType[], Error>(
    "attribute-types",
    getAttributeTypes,
    {
      revalidateOnFocus: false
    }
  );

  return {
    attributeTypes: data,
    isLoading,
    error,
    mutate
  };
}
