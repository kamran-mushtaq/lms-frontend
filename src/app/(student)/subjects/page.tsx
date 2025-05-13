// src/app/(student)/subjects/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  Filter,
  CircleSlash,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Grid3X3,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentLayout } from "@/components/student-panel/content-layout";
import { useEnrollments } from "./hooks/use-enrollments";
import { useStudentProgress } from "./hooks/use-student-progress";
import { SubjectCard } from "./components/subject-card";
import { SubjectListItem } from "./components/subject-list-item";
import { EmptyState } from "./components/empty-state";
import { useAuth } from "@/contexts/AuthContext";
// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  isActive: boolean;
  coverImage?: string;
  description?: string;
}

// Progress data interface
interface SubjectProgress {
  subjectId: string;
  completionPercentage: number;
  completedChapters: number;
  totalChapters: number;
  nextChapterId?: string;
  nextChapterName?: string;
  lastAccessedAt?: string;
}

// Enrollment interface
interface Enrollment {
  _id: string;
  studentId: string;
  classId: {
    _id: string;
    name: string;
    displayName: string;
  };
  subjectId: {
    _id: string;
    name: string;
    displayName: string;
    description?: string;
  };
  aptitudeTestCompleted: boolean;
  aptitudeTestPassed: boolean;
  isEnrolled: boolean;
}

// View type options
type ViewType = "grid" | "list";

// Sort options
type SortOption = "name" | "lastAccessed" | "progress";

export default function SubjectsPage() {
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [sortOption, setSortOption] = useState<SortOption>("name");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  // Get router for navigation
  const router = useRouter();
   const { user } = useAuth();
  
  // Use your actual student ID - based on API response example
  const studentId = user?._id || "studentId"; // Replace with actual student ID from context or props
  
  // Fetch enrolled subjects and progress data
  const { enrollments, isLoading: isLoadingEnrollments, error: enrollmentsError } = useEnrollments(studentId);
  const { progress, isLoading: isLoadingProgress, error: progressError } = useStudentProgress(studentId);
  
  // Merge enrollments with progress data
  const subjectsWithProgress = enrollments?.map(enrollment => {
    // Get progress data for this subject if available
    const subjectProgress = progress?.find(p => p.subjectId === enrollment.subjectId._id);
    
    // Create a default progress object if none exists
    const defaultProgress = {
      completionPercentage: 0,
      completedChapters: 0,
      totalChapters: enrollment.subjectId.chapters?.length || 0
    };
    
    // Return combined object
    return {
      ...enrollment,
      progress: subjectProgress || defaultProgress
    };
  }) || [];
  
  // Get unique classes for the filter dropdown
  const classes = enrollments 
    ? Array.from(new Set(enrollments.map(e => e.classId._id))).map(id => {
        const classInfo = enrollments.find(e => e.classId._id === id)?.classId;
        return { id, name: classInfo?.displayName || "Unknown" };
      })
    : [];
  
  // Filter subjects based on search, class filter, and active tab
  const filteredSubjects = subjectsWithProgress.filter(subject => {
    // Filter by search term
    const matchesSearch = subject.subjectId.displayName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    // Filter by selected class
    const matchesClass = selectedClassId 
      ? subject.classId._id === selectedClassId 
      : true;
    
    // Filter by tab
    const matchesTab = 
      activeTab === "all" ? true :
      activeTab === "inProgress" ? 
        (subject.progress.completionPercentage > 0 && subject.progress.completionPercentage < 100) :
      activeTab === "completed" ? 
        subject.progress.completionPercentage === 100 :
      activeTab === "notStarted" ? 
        subject.progress.completionPercentage === 0 :
      true;
    
    return matchesSearch && matchesClass && matchesTab;
  });
  
  // Sort the filtered subjects
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    if (sortOption === "name") {
      return a.subjectId.displayName.localeCompare(b.subjectId.displayName);
    } else if (sortOption === "progress") {
      return b.progress.completionPercentage - a.progress.completionPercentage;
    } else if (sortOption === "lastAccessed") {
      const dateA = a.progress.lastAccessedAt ? new Date(a.progress.lastAccessedAt).getTime() : 0;
      const dateB = b.progress.lastAccessedAt ? new Date(b.progress.lastAccessedAt).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });
  
  // Navigate to a subject
  const handleSubjectClick = (subjectId: string) => {
    console.log("Navigating to subject:", subjectId);
    
    // Make sure the ID is valid
    if (!subjectId || typeof subjectId !== 'string') {
      console.error("Invalid subject ID:", subjectId);
      toast.error("Invalid subject ID. Please try again.");
      return;
    }
    
    // Try both navigation approaches
    try {
      // Primary navigation method
      router.push(`/subjects/${subjectId}`);
      console.log("Navigation initiated");
    } catch (error) {
      console.error("Navigation error:", error);
      
      // Fallback to window.location if router.push fails
      window.location.href = `/subjects/${subjectId}`;
      console.log("Using fallback navigation");
    }
  };
  
  // Handle error display - only show critical errors
  useEffect(() => {
    if (enrollmentsError) {
      toast.error("Failed to load enrolled subjects: " + enrollmentsError.message);
    }
    // Only show progress error if it's not a 404 (no progress data found yet)
    if (progressError && progressError.response?.status !== 404) {
      toast.error("Failed to load progress data: " + progressError.message);
    }
  }, [enrollmentsError, progressError]);
  
  // Loading state
  const isLoading = isLoadingEnrollments || isLoadingProgress;

  // Log the subject data structure for debugging
  useEffect(() => {
    if (enrollments && enrollments.length > 0) {
      console.log('Sample subject data structure:', enrollments[0].subjectId);
    }
  }, [enrollments]);

  // Get a subject cover image from the API or use a placeholder
  const getSubjectCover = (subject: any) => {
    // First priority: Use the imageUrl field if it exists
    if (subject.imageUrl) {
      return subject.imageUrl;
    }
    
    // Second priority: Use coverImage if it exists
    if (subject.coverImage) {
      return subject.coverImage.startsWith('http') 
        ? subject.coverImage 
        : `https://phpstack-732216-5200333.cloudwaysapps.com${subject.coverImage}`;
    }
    
    // Last resort: If no image is provided, use a placeholder based on subject name
    const name = subject.name?.toLowerCase() || subject.displayName?.toLowerCase() || '';
    
    // Create a subject type mapping for placeholders
    let subjectType = 'default';
    
    if (name.includes('math')) subjectType = 'math';
    else if (name.includes('science')) subjectType = 'science';
    else if (name.includes('history')) subjectType = 'history';
    else if (name.includes('english')) subjectType = 'english';
    else if (name.includes('geography')) subjectType = 'geography';
    else if (name.includes('computer')) subjectType = 'computer';
    
    // Use a placeholder service as absolute last resort
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${subjectType.charAt(0).toUpperCase() + subjectType.slice(1)}`;
  };

  return (
    // <ContentLayout title="My Subjects">
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">My Subjects</h1>
            
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filter and view controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              <Select 
                value={selectedClassId || "all"} 
                onValueChange={(value) => setSelectedClassId(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <span>Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOption("name")}>
                    Alphabetical
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("progress")}>
                    Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("lastAccessed")}>
                    Recently Accessed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewType === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewType("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewType("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="inProgress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="notStarted">Not Started</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                /* Loading State */
                viewType === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                      <Card key={i}>
                        <Skeleton className="w-full h-40" />
                        <CardHeader>
                          <Skeleton className="h-6 w-2/3" />
                          <Skeleton className="h-4 w-full mt-2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5 mt-2" />
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-8 w-full" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center p-4 border rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="ml-4 flex-1">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-1/2 mt-2" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                      </div>
                    ))}
                  </div>
                )
              ) : sortedSubjects.length === 0 ? (
                /* Empty State */
                <EmptyState 
                  title="No subjects found" 
                  description={searchTerm 
                    ? "Try adjusting your search or filters" 
                    : activeTab !== "all"
                      ? `You don't have any ${activeTab === "inProgress" ? "in-progress" : activeTab} subjects`
                      : "You're not enrolled in any subjects yet"
                  }
                  icon={<BookOpen className="h-12 w-12" />}
                />
              ) : (
                /* Subjects Display */
                viewType === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedSubjects.map((subject) => (
                      <SubjectCard
                        key={subject._id}
                        title={subject.subjectId.displayName}
                        description={subject.subjectId.description || `This is the ${subject.subjectId.displayName} course.`}
                        className={subject.classId.displayName}
                        progress={subject.progress.completionPercentage}
                        completedChapters={subject.progress.completedChapters}
                        totalChapters={subject.progress.totalChapters}
                        image={getSubjectCover(subject.subjectId)}
                        onClick={() => handleSubjectClick(subject.subjectId._id)}
                        lastAccessedAt={subject.progress.lastAccessedAt}
                        nextChapterName={subject.progress.nextChapterName}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedSubjects.map((subject) => (
                      <SubjectListItem
                        key={subject._id}
                        title={subject.subjectId.displayName}
                        className={subject.classId.displayName}
                        progress={subject.progress.completionPercentage}
                        completedChapters={subject.progress.completedChapters}
                        totalChapters={subject.progress.totalChapters}
                        image={getSubjectCover(subject.subjectId)}
                        onClick={() => handleSubjectClick(subject.subjectId._id)}
                        lastAccessedAt={subject.progress.lastAccessedAt}
                      />
                    ))}
                  </div>
                )
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    // </ContentLayout>
  );
}