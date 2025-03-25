// app/dashboard/attributes/hooks/use-attribute-types-for-select.ts
import useSWR from "swr";
import { getAttributeTypes } from "../../attribute-types/api/attribute-types-api";

// AttributeType interface for select
interface AttributeType {
  _id: string;
  name: string;
  createdAt: string;
}

// Return type for useAttributeTypesForSelect hook
interface UseAttributeTypesForSelectReturn {
  attributeTypes: AttributeType[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

export function useAttributeTypesForSelect(): UseAttributeTypesForSelectReturn {
  const { data, error, isLoading } = useSWR<AttributeType[], Error>(
    "attribute-types-select",
    getAttributeTypes,
    {
      revalidateOnFocus: false
    }
  );

  return {
    attributeTypes: data,
    isLoading,
    error
  };
}
