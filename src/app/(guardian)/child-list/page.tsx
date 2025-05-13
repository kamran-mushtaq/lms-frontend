"use client";

import ChildrenList from '@/components/guardian-dashboard/children-list';
import { useEffect, useState } from 'react';

export default function ChildListPage() {
  const [parentId, setParentId] = useState<string>('');

  useEffect(() => {
    // In a real application, you would get the parent ID from:
    // 1. Authentication context
    // 2. Session storage
    // 3. API call to get current user
    
    // For now, using the test guardian ID you provided
    // Replace this with your actual authentication logic
    setParentId('68225a07b50bb66127b7168c');
    
    // Example of how you might get it from auth:
    // const user = getCurrentUser();
    // setParentId(user.id);
  }, []);

  if (!parentId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
        <ChildrenList parentId={parentId} />
  );
}
