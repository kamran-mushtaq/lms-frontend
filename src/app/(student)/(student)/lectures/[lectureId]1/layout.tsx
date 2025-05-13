"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, ChevronRight, Check, X, 
  List, MessageSquare, Settings, Share2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LectureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progress, setProgress] = useState(45);
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top navigation - similar to Udemy design */}
      <header className="border-b bg-background flex items-center h-14 px-4 gap-2">
        <Button variant="ghost" size="icon" className="mr-1">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:flex flex-col">
          <h1 className="text-sm font-medium">5 tips to grow hair?</h1>
          <div className="text-xs text-muted-foreground">Section 3: Prompt Engineering Concepts</div>
        </div>
        
        <div className="flex-1 md:hidden">
          <h1 className="text-sm font-medium truncate">5 tips to grow hair?</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSidebar}
            className="text-xs md:text-sm"
          >
            {sidebarOpen ? (
              <>
                <X className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Hide content</span>
              </>
            ) : (
              <>
                <List className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Show content</span>
              </>
            )}
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <main className={`flex-1 overflow-auto transition-all ${sidebarOpen ? 'md:mr-80' : ''}`}>
          {children}
        </main>
        
        {/* Course content sidebar */}
        <div className={`fixed inset-y-0 right-0 w-80 border-l bg-background overflow-auto transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:transform-none top-14 z-10 ${sidebarOpen ? 'md:block' : 'md:hidden'}`}>
          <div className="p-4 border-b sticky top-0 bg-background z-10 flex justify-between items-center">
            <h2 className="font-semibold">Course content</h2>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="overflow-auto">
            <div className="p-4">
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Section 1: Introduction</span>
                  <span className="text-xs text-muted-foreground">13min</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-accent text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-green-600 bg-green-600 text-white shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="flex-1">1. What is Prompting?</span>
                    <span className="text-xs text-muted-foreground">3min</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-accent text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-green-600 bg-green-600 text-white shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="flex-1">2. Prompt Engineering Why?</span>
                    <span className="text-xs text-muted-foreground">3min</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Section 3: Prompt Engineering Concepts</span>
                  <span className="text-xs text-muted-foreground">16min</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 rounded bg-accent/50 font-medium text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <span className="flex-1">7. 5 tips to grow hair?</span>
                    <span className="text-xs text-muted-foreground">3min</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-accent text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground shrink-0">
                    </div>
                    <span className="flex-1">8. Types of Prompts</span>
                    <span className="text-xs text-muted-foreground">3min</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Section 4: Practical Examples Cases</span>
                  <span className="text-xs text-muted-foreground">16min</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-accent text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground shrink-0">
                    </div>
                    <span className="flex-1">9. Example 1: Writing assistant</span>
                    <span className="text-xs text-muted-foreground">5min</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-accent text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground shrink-0">
                    </div>
                    <span className="flex-1">10. Example 2: Code generator</span>
                    <span className="text-xs text-muted-foreground">5min</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Section 5: Important Terms & Factors</span>
                  <span className="text-xs text-muted-foreground">22min</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-accent text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground shrink-0">
                    </div>
                    <span className="flex-1">11. Key concepts in prompt engineering</span>
                    <span className="text-xs text-muted-foreground">5min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom navigation */}
      <footer className="border-t bg-background h-14 px-4 flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous lecture: Prompt Engineering Why?</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-2 w-1/3 max-w-xs">
          <Progress value={progress} className="h-2" />
          <span className="text-xs font-medium whitespace-nowrap">{progress}% complete</span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="primary" size="sm" className="text-xs">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next lecture: Types of Prompts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </footer>
    </div>
  );
}
