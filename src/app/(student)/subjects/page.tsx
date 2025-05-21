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
  List,
  TrendingUp,
  Target,
  ChevronRight
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
import { useAuth } from "@/contexts/AuthContext";
import { 
  getCompletedLecturesFromStorage, 
  getCompletedChapters,
  calculateChapterProgressPercentage 
} from '@/utils/sequential-learning';
import { getStudentId } from '@/utils/progress-utils';
import apiClient from '@/lib/api-client';

// Subject interface (unchanged)
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  isActive: boolean;
  coverImage?: string;
  description?: string;
  chapters?: string[];
}

// Progress data interface (unchanged)
interface SubjectProgress {
  subjectId: string;
  completionPercentage: number;
  completedChapters: number;
  totalChapters: number;
  nextChapterId?: string;
  nextChapterName?: string;
  lastAccessedAt?: string;
}

// Enrollment interface (unchanged)
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
    chapters?: string[];
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
  // State for UI controls (unchanged)
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [sortOption, setSortOption] = useState<SortOption>("name");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [subjectsWithRealProgress, setSubjectsWithRealProgress] = useState<any[]>([]);
  const [isLoadingRealProgress, setIsLoadingRealProgress] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  
  // Get router for navigation
  const router = useRouter();
  const { user } = useAuth();
  
  // Use your actual student ID
  const studentId = user?._id || getStudentId() || "studentId";

  // Fetch enrollments (simplified hook replacement)
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setIsLoadingEnrollments(true);
        // Replace with your actual enrollment fetching logic
        const response = await apiClient.get(`/enrollment/student/${studentId}`);
        setEnrollments(response.data || []);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        toast.error('Failed to load enrolled subjects');
      } finally {
        setIsLoadingEnrollments(false);
      }
    };

    if (studentId) {
      fetchEnrollments();
    }
  }, [studentId]);
  
  // Calculate real progress for all subjects (unchanged logic, just cleaner organization)
  useEffect(() => {
    const calculateRealProgress = async () => {
      if (!enrollments || enrollments.length === 0) return;
      
      setIsLoadingRealProgress(true);
      
      try {
        const completedLectures = getCompletedLecturesFromStorage();
        
        const subjectsWithProgress = await Promise.all(
          enrollments.map(async (enrollment) => {
            try {
              const chaptersResponse = await apiClient.get(`/chapters/subject/${enrollment.subjectId._id}`);
              const chapters = chaptersResponse.data || [];
              
              let totalLectures = 0;
              let completedLecturesInSubject = 0;
              let completedChaptersCount = 0;
              let nextChapterId = null;
              let nextChapterName = null;
              
              const sortedChapters = chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
              
              for (let i = 0; i < sortedChapters.length; i++) {
                const chapter = sortedChapters[i];
                
                try {
                  const lecturesResponse = await apiClient.get(`/lectures/byChapter/${chapter._id}`);
                  const lectures = lecturesResponse.data || [];
                  
                  totalLectures += lectures.length;
                  
                  const completedInChapter = lectures.filter(lecture => 
                    completedLectures.includes(lecture._id)
                  ).length;
                  
                  completedLecturesInSubject += completedInChapter;
                  
                  if (lectures.length > 0 && completedInChapter === lectures.length) {
                    completedChaptersCount++;
                  } else if (!nextChapterId && (i === 0 || completedChaptersCount === i)) {
                    nextChapterId = chapter._id;
                    nextChapterName = chapter.displayName || chapter.name;
                  }
                } catch (lectureError) {
                  console.error(`Error fetching lectures for chapter ${chapter._id}:`, lectureError);
                }
              }
              
              const completionPercentage = totalLectures > 0 
                ? Math.round((completedLecturesInSubject / totalLectures) * 100)
                : 0;
              
              const lastViewedLecture = localStorage.getItem('last_viewed_lecture');
              let lastAccessedAt = null;
              
              if (lastViewedLecture) {
                for (const chapter of chapters) {
                  try {
                    const lecturesResponse = await apiClient.get(`/lectures/byChapter/${chapter._id}`);
                    const lectures = lecturesResponse.data || [];
                    
                    if (lectures.some(lecture => lecture._id === lastViewedLecture)) {
                      lastAccessedAt = new Date().toISOString();
                      break;
                    }
                  } catch (err) {
                    // Continue to next chapter
                  }
                }
              }
              
              return {
                ...enrollment,
                progress: {
                  completionPercentage,
                  completedChapters: completedChaptersCount,
                  totalChapters: chapters.length,
                  nextChapterId,
                  nextChapterName,
                  lastAccessedAt,
                  totalLectures,
                  completedLectures: completedLecturesInSubject
                }
              };
            } catch (error) {
              console.error(`Error calculating progress for subject ${enrollment.subjectId._id}:`, error);
              
              return {
                ...enrollment,
                progress: {
                  completionPercentage: 0,
                  completedChapters: 0,
                  totalChapters: 0,
                  nextChapterId: null,
                  nextChapterName: null,
                  lastAccessedAt: null,
                  totalLectures: 0,
                  completedLectures: 0
                }
              };
            }
          })
        );
        
        setSubjectsWithRealProgress(subjectsWithProgress);
      } catch (error) {
        console.error('Error calculating real progress:', error);
        toast.error('Failed to calculate progress data');
      } finally {
        setIsLoadingRealProgress(false);
      }
    };
    
    calculateRealProgress();
  }, [enrollments]);
  
  // Filter and sort logic (unchanged)
  const classes = enrollments 
    ? Array.from(new Set(enrollments.map(e => e.classId._id))).map(id => {
        const classInfo = enrollments.find(e => e.classId._id === id)?.classId;
        return { id, name: classInfo?.displayName || "Unknown" };
      })
    : [];
  
  const filteredSubjects = subjectsWithRealProgress.filter(subject => {
    const matchesSearch = subject.subjectId.displayName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClassId 
      ? subject.classId._id === selectedClassId 
      : true;
    
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
    if (!subjectId || typeof subjectId !== 'string') {
      toast.error("Invalid subject ID. Please try again.");
      return;
    }
    
    try {
      router.push(`/subjects/${subjectId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = `/subjects/${subjectId}`;
    }
  };
  
  // Get a subject cover image
  const getSubjectCover = (subject: any) => {
    if (subject.imageUrl) return subject.imageUrl;
    if (subject.coverImage) {
      return subject.coverImage.startsWith('http') 
        ? subject.coverImage 
        : `https://phpstack-732216-5200333.cloudwaysapps.com${subject.coverImage}`;
    }
    
    const name = subject.name?.toLowerCase() || subject.displayName?.toLowerCase() || '';
    let subjectType = 'default';
    
    if (name.includes('math')) subjectType = 'math';
    else if (name.includes('science')) subjectType = 'science';
    else if (name.includes('history')) subjectType = 'history';
    else if (name.includes('english')) subjectType = 'english';
    else if (name.includes('geography')) subjectType = 'geography';
    else if (name.includes('computer')) subjectType = 'computer';
    
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${subjectType.charAt(0).toUpperCase() + subjectType.slice(1)}`;
  };

  // Loading state
  const isLoading = isLoadingEnrollments || isLoadingRealProgress;

  return (
    <div className="container mx-auto py-10">
      {/* Header - matching dashboard style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subjects</h1>
          <p className="text-muted-foreground">
            Continue your learning journey with your enrolled subjects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* Overview Cards - Similar to dashboard progress cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Subjects</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">{subjectsWithRealProgress.length}</span>
                  <span className="text-xs text-muted-foreground">enrolled</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">
                    {subjectsWithRealProgress.filter(s => s.progress.completionPercentage > 0 && s.progress.completionPercentage < 100).length}
                  </span>
                  <span className="text-xs text-muted-foreground">subjects</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">
                    {subjectsWithRealProgress.filter(s => s.progress.completionPercentage === 100).length}
                  </span>
                  <span className="text-xs text-muted-foreground">subjects</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Average Progress</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">
                    {subjectsWithRealProgress.length > 0 
                      ? Math.round(subjectsWithRealProgress.reduce((acc, s) => acc + s.progress.completionPercentage, 0) / subjectsWithRealProgress.length)
                      : 0}%
                  </span>
                  <span className="text-xs text-muted-foreground">complete</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Filter Controls */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
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
          </div>
        </CardHeader>
      </Card>
        
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="notStarted">Not Started</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            /* Loading State - Dashboard style */
            viewType === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : sortedSubjects.length === 0 ? (
            /* Empty State - Dashboard style */
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No subjects found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? "Try adjusting your search or filters" 
                  : activeTab !== "all"
                    ? `You don't have any ${activeTab === "inProgress" ? "in-progress" : activeTab} subjects`
                    : "You're not enrolled in any subjects yet"
                }
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </Card>
          ) : (
            /* Subjects Display */
            viewType === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedSubjects.map((subject) => (
                  <Card 
                    key={subject._id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSubjectClick(subject.subjectId._id)}
                  >
                    <div className="aspect-video relative">
                      <img
                        src={getSubjectCover(subject.subjectId)}
                        alt={subject.subjectId.displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(subject.subjectId.displayName)}`;
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={subject.progress.completionPercentage === 100 ? "default" : "secondary"}>
                          {subject.progress.completionPercentage}% Complete
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{subject.subjectId.displayName}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {subject.subjectId.description || `This is the ${subject.subjectId.displayName} course.`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {subject.progress.completedChapters} of {subject.progress.totalChapters} chapters
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {subject.classId.displayName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{subject.progress.completionPercentage}%</span>
                        </div>
                        <Progress value={subject.progress.completionPercentage} className="h-2" />
                      </div>
                      
                      {subject.progress.nextChapterName && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Next: {subject.progress.nextChapterName}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button className="w-full">
                        Continue Learning
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedSubjects.map((subject) => (
                  <Card 
                    key={subject._id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSubjectClick(subject.subjectId._id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={getSubjectCover(subject.subjectId)}
                            alt={subject.subjectId.displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(subject.subjectId.displayName)}`;
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-lg truncate">{subject.subjectId.displayName}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {subject.classId.displayName} • {subject.progress.completedChapters} of {subject.progress.totalChapters} chapters
                              </p>
                              
                              <div className="mt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span className="font-medium">{subject.progress.completionPercentage}%</span>
                                </div>
                                <Progress value={subject.progress.completionPercentage} className="h-2" />
                              </div>
                              
                              {subject.progress.nextChapterName && (
                                <div className="text-xs text-muted-foreground mt-2">
                                  Next: {subject.progress.nextChapterName}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={subject.progress.completionPercentage === 100 ? "default" : "secondary"}>
                                {subject.progress.completionPercentage}% Complete
                              </Badge>
                              <Button size="sm">
                                Continue
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}