// app/dashboard/components/course-cards.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Book, Bookmark, FileText, Video, Lightbulb, ArrowRight, AlertCircle } from "lucide-react";

interface CourseCardsProps {
  subjects: any[];
  enrollments: any[];
  studentId: string;
}

export function CourseCards({ subjects, enrollments, studentId }: CourseCardsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("lectures");
  
  // Get subjects with aptitude test passed
  const availableSubjects = subjects.filter(subject => {
    const enrollment = enrollments.find(e => 
      (e.subjectId._id === subject._id) || (e.subjectId === subject._id)
    );
    return enrollment && enrollment.aptitudeTestPassed;
  });
  
  // If no subjects available or not passed aptitude tests
  if (availableSubjects.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No course materials available</AlertTitle>
        <AlertDescription>
          You need to pass aptitude tests for your enrolled subjects to access course materials.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Navigate to subject detail page
  const handleNavigateToSubject = (subjectId: string) => {
    router.push(`/dashboard/subjects/${subjectId}`);
  };
  
  // Sample data for lectures, resources, and exercises (in a real app, this would come from the API)
  const sampleLectures = [
    {
      id: '1',
      title: 'Introduction to the Course',
      subjectId: availableSubjects[0]?._id,
      subjectName: availableSubjects[0]?.displayName || 'Subject',
      type: 'video',
      duration: '45 min',
      completed: true
    },
    {
      id: '2',
      title: 'Core Concepts Overview',
      subjectId: availableSubjects[0]?._id,
      subjectName: availableSubjects[0]?.displayName || 'Subject',
      type: 'video',
      duration: '30 min',
      completed: false
    },
    {
      id: '3',
      title: 'Advanced Topics',
      subjectId: availableSubjects.length > 1 ? availableSubjects[1]._id : availableSubjects[0]._id,
      subjectName: availableSubjects.length > 1 ? 
        availableSubjects[1].displayName : availableSubjects[0].displayName,
      type: 'reading',
      duration: '20 min',
      completed: false
    }
  ];
  
  const sampleResources = [
    {
      id: '1',
      title: 'Course Syllabus',
      subjectId: availableSubjects[0]?._id,
      subjectName: availableSubjects[0]?.displayName || 'Subject',
      type: 'document',
      size: '215 KB'
    },
    {
      id: '2',
      title: 'Reference Guide',
      subjectId: availableSubjects[0]?._id,
      subjectName: availableSubjects[0]?.displayName || 'Subject',
      type: 'document',
      size: '1.2 MB'
    },
    {
      id: '3',
      title: 'Supplementary Reading',
      subjectId: availableSubjects.length > 1 ? availableSubjects[1]._id : availableSubjects[0]._id,
      subjectName: availableSubjects.length > 1 ? 
        availableSubjects[1].displayName : availableSubjects[0].displayName,
      type: 'document',
      size: '560 KB'
    }
  ];
  
  const sampleExercises = [
    {
      id: '1',
      title: 'Practice Problems - Module 1',
      subjectId: availableSubjects[0]?._id,
      subjectName: availableSubjects[0]?.displayName || 'Subject', 
      type: 'exercise',
      difficulty: 'Beginner',
      completed: false
    },
    {
      id: '2',
      title: 'Quiz - Key Concepts',
      subjectId: availableSubjects[0]?._id,
      subjectName: availableSubjects[0]?.displayName || 'Subject',
      type: 'quiz',
      difficulty: 'Intermediate',
      completed: false
    },
    {
      id: '3',
      title: 'Challenge Problems',
      subjectId: availableSubjects.length > 1 ? availableSubjects[1]._id : availableSubjects[0]._id,
      subjectName: availableSubjects.length > 1 ? 
        availableSubjects[1].displayName : availableSubjects[0].displayName,
      type: 'exercise',
      difficulty: 'Advanced',
      completed: false
    }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Course Materials</CardTitle>
        <CardDescription>
          Access your lectures, resources, and practice exercises
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="lectures" onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lectures">Lectures</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="lectures" className="pt-3">
            <div className="px-6 space-y-4">
              {sampleLectures.map((lecture) => (
                <div 
                  key={lecture.id} 
                  className="flex items-start p-3 border rounded-md"
                >
                  <div className={`mt-0.5 rounded-full p-1.5 ${
                    lecture.type === 'video' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    {lecture.type === 'video' ? (
                      <Video className={`h-4 w-4 ${
                        lecture.type === 'video' ? 'text-blue-600' : 'text-amber-600'
                      }`} />
                    ) : (
                      <FileText className={`h-4 w-4 ${
                        lecture.type === 'reading' ? 'text-amber-600' : ''
                      }`} />
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{lecture.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {lecture.subjectName} • {lecture.duration}
                        </p>
                      </div>
                      
                      {lecture.completed && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Completed
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="link" 
                      className="p-0 h-6 mt-1 text-xs"
                      onClick={() => handleNavigateToSubject(lecture.subjectId)}
                    >
                      View Lecture
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="pt-3">
            <div className="px-6 space-y-4">
              {sampleResources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="flex items-start p-3 border rounded-md"
                >
                  <div className="mt-0.5 rounded-full p-1.5 bg-purple-100">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{resource.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {resource.subjectName} • {resource.size}
                        </p>
                      </div>
                      
                      <Badge variant="outline">
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="link" 
                      className="p-0 h-6 mt-1 text-xs"
                      onClick={() => handleNavigateToSubject(resource.subjectId)}
                    >
                      Download
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="exercises" className="pt-3">
            <div className="px-6 space-y-4">
              {sampleExercises.map((exercise) => (
                <div 
                  key={exercise.id} 
                  className="flex items-start p-3 border rounded-md"
                >
                  <div className="mt-0.5 rounded-full p-1.5 bg-green-100">
                    <Lightbulb className="h-4 w-4 text-green-600" />
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{exercise.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {exercise.subjectName} • {exercise.difficulty}
                        </p>
                      </div>
                      
                      <Badge variant={
                        exercise.difficulty === 'Beginner' ? 'secondary' : 
                        exercise.difficulty === 'Intermediate' ? 'default' : 
                        'destructive'
                      }>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="link" 
                      className="p-0 h-6 mt-1 text-xs"
                      onClick={() => handleNavigateToSubject(exercise.subjectId)}
                    >
                      Start Exercise
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <p className="text-xs text-muted-foreground mt-1">
          Showing course materials for all subjects with passed aptitude tests
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (activeTab === 'lectures') {
              router.push('/dashboard/lectures');
            } else if (activeTab === 'resources') {
              router.push('/dashboard/resources');
            } else {
              router.push('/dashboard/exercises');
            }
          }}
        >
          View All
        </Button>
      </CardFooter>
    </Card>
  );
}