'use client'; // Required for useState hook

import React, { useState } from 'react';
import SubjectToolbar from '@/components/student-dashboard/subjects/SubjectToolbar';
import SubjectGrid from '@/components/student-dashboard/subjects/SubjectGrid';
// TODO: Import or use an auth hook to get the student ID
// import { useAuth } from '@/hooks/use-auth';

const SubjectsPage = () => {
  // const { user } = useAuth(); // Example: Get user/student info
  const studentId = 'student-123'; // Placeholder: Replace with actual student ID from auth context or props

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, boolean>>({
    all: true,
    inProgress: false,
    completed: false,
  });

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleFilterChange = (newFilters: Record<string, boolean>) => {
    setFilters(newFilters);
  };

  // TODO: Add logic for Quick Access Links if needed
  // TODO: Implement API calls for progress and access checks if required directly on this page or within cards

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar for search and filtering */}
      <SubjectToolbar
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Grid displaying subject cards */}
      {/* Pass studentId, searchTerm, and filters to the grid */}
      <div className="flex-grow overflow-auto"> {/* Allow grid to scroll */}
        <SubjectGrid
          studentId={studentId}
          searchTerm={searchTerm}
          filters={filters}
        />
      </div>

      {/* TODO: Add Quick Access Links section if required */}
    </div>
  );
};

export default SubjectsPage;