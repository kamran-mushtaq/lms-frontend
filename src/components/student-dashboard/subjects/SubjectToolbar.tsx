'use client'; // Needed for state and event handlers

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ListFilter } from 'lucide-react'; // Using lucide-react for icons

interface SubjectToolbarProps {
  onSearchChange: (searchTerm: string) => void;
  onFilterChange: (filters: Record<string, boolean>) => void; // Example filter structure
  initialFilters?: Record<string, boolean>;
}

const SubjectToolbar: React.FC<SubjectToolbarProps> = ({
  onSearchChange,
  onFilterChange,
  initialFilters = { all: true, inProgress: false, completed: false }, // Default filters
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    onSearchChange(newSearchTerm);
  };

  const handleFilterSelect = (filterKey: string, checked: boolean) => {
    const newFilters = { ...filters, [filterKey]: checked };
    // Basic logic: if 'all' is selected, deselect others. If others selected, deselect 'all'.
    // You might need more complex logic depending on filter requirements.
    if (filterKey === 'all' && checked) {
        Object.keys(newFilters).forEach(key => {
            if (key !== 'all') newFilters[key] = false;
        });
    } else if (filterKey !== 'all' && checked) {
        newFilters['all'] = false;
    }
    // Ensure at least one filter is active (fallback to 'all')
    const isActiveFilter = Object.values(newFilters).some(val => val);
    if (!isActiveFilter) {
        newFilters['all'] = true;
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b mb-4 flex items-center gap-4">
      {/* Search Input */}
      <div className="flex-grow">
        <Input
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={handleSearchInputChange}
          className="max-w-sm" // Limit width on larger screens
        />
      </div>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <ListFilter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filters.all}
            onCheckedChange={(checked) => handleFilterSelect('all', !!checked)}
          >
            All
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.inProgress}
            onCheckedChange={(checked) => handleFilterSelect('inProgress', !!checked)}
          >
            In Progress
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.completed}
            onCheckedChange={(checked) => handleFilterSelect('completed', !!checked)}
          >
            Completed
          </DropdownMenuCheckboxItem>
          {/* Add more filters as needed (e.g., alphabetical, category) */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SubjectToolbar;