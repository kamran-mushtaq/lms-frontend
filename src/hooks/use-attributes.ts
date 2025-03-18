// hooks/use-attributes.ts
import useSWR from 'swr';
import apiClient from "@/lib/api-client";

interface AttributeType {
  _id: string;
  name: string;
}

interface Attribute {
  _id: string;
  title: string;
  type: string;
  parentId?: string;
  status: string;
}

// Cache to store type IDs once resolved
const typeIdCache: Record<string, string> = {};

// Fetch all attribute types
export function useAttributeTypes() {
  const { data, error, isLoading } = useSWR<AttributeType[]>(
    'attribute-types',
    async () => {
      const response = await apiClient.get('/attribute-types');
      return response.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    attributeTypes: data,
    isLoading,
    error
  };
}

// Fetch a specific attribute type by name (to get its ID)
export function useAttributeTypeByName(typeName: string) {
  const { attributeTypes, isLoading: typesLoading, error: typesError } = useAttributeTypes();

  // Try to get from cache first
  if (typeIdCache[typeName]) {
    return { 
      typeId: typeIdCache[typeName], 
      isLoading: false, 
      error: null 
    };
  }

  if (attributeTypes && !typesLoading) {
    const typeItem = attributeTypes.find(type => 
      type.name.toLowerCase() === typeName.toLowerCase()
    );
    
    if (typeItem) {
      // Cache for future use
      typeIdCache[typeName] = typeItem._id;
      return { 
        typeId: typeItem._id, 
        isLoading: false, 
        error: null 
      };
    }
    
    return { 
      typeId: null, 
      isLoading: false, 
      error: new Error(`Attribute type "${typeName}" not found`) 
    };
  }

  return { 
    typeId: null, 
    isLoading: typesLoading, 
    error: typesError 
  };
}

// Fetch attributes by type and optional parent
export function useAttributes(typeName: string, parentId?: string) {
  const { typeId, isLoading: typeLoading, error: typeError } = useAttributeTypeByName(typeName);

  const shouldFetch = !!typeId && (!parentId || !!parentId);
  
  const { data, error, isLoading } = useSWR<Attribute[]>(
    shouldFetch ? ['attributes', typeId, parentId] : null,
    async () => {
      // Fetch attributes by type
      const response = await apiClient.get(`/attributes/type/${typeId}`);
      const attributes = response.data;
      
      // If parentId is provided, filter by parent
      if (parentId) {
        return attributes.filter((attr: Attribute) => attr.parentId === parentId);
      }
      
      // Otherwise return all attributes of this type
      return attributes;
    },
    { revalidateOnFocus: false }
  );

  return {
    attributes: data,
    isLoading: typeLoading || isLoading,
    error: typeError || error
  };
}

// Helper hook for countries (attributes of type "Country")
export function useCountries() {
  return useAttributes('Country');
}

// Helper hook for cities (attributes of type "City" with parent country)
export function useCities(countryId?: string) {
  return useAttributes('City', countryId);
}