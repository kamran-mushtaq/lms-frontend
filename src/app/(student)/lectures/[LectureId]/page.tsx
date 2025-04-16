
// "use client";

//   import React, { useState, useEffect, useRef } from 'react';
//   import { useParams, useRouter } from 'next/navigation';
//   import {
//     ChevronLeft, ChevronRight, AlignLeft, BookOpen,
//     Play, Pause, Volume2, VolumeX, Maximize,
//     Settings, FileText, Edit, Trash2, CheckCircle, X, MenuIcon
//   } from 'lucide-react';
//   import apiClient from '@/lib/api-client';

//   // UI Components
//   import { Button } from "@/components/ui/button";
//   import { Card, CardContent } from "@/components/ui/card";
//   import { Badge } from "@/components/ui/badge";
//   import { Textarea } from "@/components/ui/textarea";
//   import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
//   import {
//     Tooltip,
//     TooltipContent,
//     TooltipProvider,
//     TooltipTrigger,
//   } from "@/components/ui/tooltip";
//   import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
//   } from "@/components/ui/dropdown-menu";
//   import {
//     Sheet,
//     SheetContent,
//     SheetHeader,
//     SheetTitle,
//     SheetTrigger,
//   } from "@/components/ui/sheet";
//   import { Progress } from "@/components/ui/progress";
//   import { ScrollArea } from "@/components/ui/scroll-area";
//   import { Separator } from "@/components/ui/separator";
//   import { Slider } from "@/components/ui/slider";
//   import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
//   } from "@/components/ui/dialog";
//   import { toast } from 'sonner';

//   const LectureViewPage = () => {
//     const params = useParams();
//     const router = useRouter();
//     const lectureId = params.lectureId as string;

//     const videoRef = useRef(null);
//     const pdfContainerRef = useRef(null);

//     // State for lecture data
//     const [lecture, setLecture] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [contentType, setContentType] = useState('video'); // video, pdf, text, slideshow, interactive

//     // State for player controls
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [volume, setVolume] = useState(0.7);
//     const [isMuted, setIsMuted] = useState(false);
//     const [playbackRate, setPlaybackRate] = useState(1);

//     // State for UI components
//     const [showTranscript, setShowTranscript] = useState(false);
//     const [transcriptData, setTranscriptData] = useState([]);
//     const [isFullscreen, setIsFullscreen] = useState(false);
//     const [noteContent, setNoteContent] = useState('');
//     const [notes, setNotes] = useState([]);
//     const [editingNoteId, setEditingNoteId] = useState(null);
//     const [showNotesPanel, setShowNotesPanel] = useState(false);
//     const [navbarCollapsed, setNavbarCollapsed] = useState(false);
//     const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

//     // State for progress tracking
//     const [progress, setProgress] = useState(0);
//     const [isCompleted, setIsCompleted] = useState(false);

//     // State for navigation
//     const [nextLecture, setNextLecture] = useState(null);
//     const [prevLecture, setPrevLecture] = useState(null);
//     const [sidebarTab, setSidebarTab] = useState('outline');

//     // Intervals for progress saving
//     const progressInterval = useRef(null);

//     // Fetch lecture data
//     useEffect(() => {
//       if (lectureId) {
//         fetchLecture();
//         fetchNotes();
//         fetchTranscript();
//       }

//       // Set up interval to save progress periodically
//       progressInterval.current = setInterval(() => {
//         if (currentTime > 0 && !isCompleted) {
//           saveProgress();
//         }
//       }, 30000); // Save every 30 seconds

//       return () => {
//         if (progressInterval.current) {
//           clearInterval(progressInterval.current);
//         }
//       };
//     }, [lectureId, currentTime, isCompleted]);

//     // Event handler for updating progress when playing media
//     useEffect(() => {
//       const handleTimeUpdate = () => {
//         if (videoRef.current) {
//           setCurrentTime(videoRef.current.currentTime);

//           // Calculate percentage of progress
//           const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
//           setProgress(percentage);

//           // Auto mark as complete when reaching 90%+ of content
//           if (percentage >= 90 && !isCompleted) {
//             markAsCompleted();
//           }
//         }
//       };

//       const videoElement = videoRef.current;
//       if (videoElement) {
//         videoElement.addEventListener('timeupdate', handleTimeUpdate);
//         videoElement.addEventListener('loadedmetadata', () => {
//           setDuration(videoElement.duration);
//         });
//       }

//       return () => {
//         if (videoElement) {
//           videoElement.removeEventListener('timeupdate', handleTimeUpdate);
//         }
//       };
//     }, [videoRef.current, isCompleted]);

//     const fetchLecture = async () => {
//       try {
//         setLoading(true);

//         // Fetch lecture details
//         const response = await apiClient.get(`/lectures/${lectureId}/details`);
//         setLecture(response.data);

//         // Determine content type from lecture data
//         if (response.data.content) {
//           if (response.data.content.type) {
//             setContentType(response.data.content.type);
//           }
//         }

//         // Fetch next and previous lectures if available
//         if (response.data.chapterId) {
//           const chaptersResponse = await apiClient.get(`/lectures/byChapter/${response.data.chapterId}`);
//           const lectures = chaptersResponse.data;

//           // Find current lecture index
//           const currentIndex = lectures.findIndex(l => l._id === lectureId);

//           if (currentIndex > 0) {
//             setPrevLecture(lectures[currentIndex - 1]);
//           }

//           if (currentIndex < lectures.length - 1) {
//             setNextLecture(lectures[currentIndex + 1]);
//           }
//         }

//         // Load progress if exists
//         try {
//           const progressResponse = await apiClient.get(`/student-progress/lecture/${lectureId}`);
//           if (progressResponse.data) {
//             setProgress(progressResponse.data.progressPercentage || 0);
//             setIsCompleted(progressResponse.data.status === 'completed');

//             // Set video playback position if it's a video
//             if (videoRef.current && progressResponse.data.timeSpentSeconds) {
//               videoRef.current.currentTime = progressResponse.data.timeSpentSeconds;
//             }
//           }
//         } catch (e) {
//           // Progress may not exist yet, that's ok
//           console.log('No existing progress found');
//         }

//         setLoading(false);
//       } catch (err) {
//         setError(err.message || 'Failed to load lecture');
//         setLoading(false);
//         toast.error('Failed to load lecture content');
//       }
//     };

//     const fetchTranscript = async () => {
//       try {
//         const response = await apiClient.get(`/lectures/${lectureId}/transcript`);
//         setTranscriptData(response.data);
//       } catch (err) {
//         console.error('Failed to load transcript', err);
//         // Don't show error notification for transcript failure
//       }
//     };

//     const fetchNotes = async () => {
//       try {
//         const response = await apiClient.get(`/notes/lectures/${lectureId}`);
//         setNotes(response.data);
//       } catch (err) {
//         console.error('Failed to load notes', err);
//         toast.error('Failed to load notes');
//       }
//     };

//     const saveProgress = async () => {
//       try {
//         const playbackPosition = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;

//         await apiClient.post(`/lectures/${lectureId}/progress`, {
//           progressPercentage: progress,
//           timeSpentSeconds: playbackPosition
//         });

//         // No need to show success notification for background progress saving
//       } catch (err) {
//         console.error('Failed to save progress', err);
//         // Don't show error for background operations
//       }
//     };

//     const markAsCompleted = async () => {
//       try {
//         await apiClient.post(`/lectures/${lectureId}/complete`);
//         setIsCompleted(true);
//         toast.success('Lecture marked as completed');
//       } catch (err) {
//         console.error('Failed to mark lecture as completed', err);
//         toast.error('Failed to mark lecture as completed');
//       }
//     };

//     const togglePlayPause = () => {
//       if (videoRef.current) {
//         if (isPlaying) {
//           videoRef.current.pause();
//         } else {
//           videoRef.current.play();
//         }
//         setIsPlaying(!isPlaying);
//       }
//     };

//     const handleVolumeChange = (value) => {
//       const newVolume = value[0];
//       setVolume(newVolume);
//       if (videoRef.current) {
//         videoRef.current.volume = newVolume;
//       }

//       // Update mute state based on volume
//       if (newVolume === 0) {
//         setIsMuted(true);
//       } else {
//         setIsMuted(false);
//       }
//     };

//     const toggleMute = () => {
//       if (videoRef.current) {
//         videoRef.current.muted = !isMuted;
//         setIsMuted(!isMuted);
//       }
//     };

//     const handlePlaybackRateChange = (rate) => {
//       if (videoRef.current) {
//         videoRef.current.playbackRate = rate;
//         setPlaybackRate(rate);
//       }
//     };

//     const handleSeek = (value) => {
//       if (videoRef.current) {
//         const seekTime = (value[0] / 100) * videoRef.current.duration;
//         videoRef.current.currentTime = seekTime;
//         setCurrentTime(seekTime);
//       }
//     };

//     const toggleFullscreen = () => {
//       const videoContainer = document.querySelector('.video-container');
//       if (!isFullscreen) {
//         if (videoContainer.requestFullscreen) {
//           videoContainer.requestFullscreen();
//         } else if (videoContainer.webkitRequestFullscreen) {
//           videoContainer.webkitRequestFullscreen();
//         } else if (videoContainer.msRequestFullscreen) {
//           videoContainer.msRequestFullscreen();
//         }
//       } else {
//         if (document.exitFullscreen) {
//           document.exitFullscreen();
//         } else if (document.webkitExitFullscreen) {
//           document.webkitExitFullscreen();
//         } else if (document.msExitFullscreen) {
//           document.msExitFullscreen();
//         }
//       }
//       setIsFullscreen(!isFullscreen);
//     };

//     const formatTime = (seconds) => {
//       const mins = Math.floor(seconds / 60);
//       const secs = Math.floor(seconds % 60);
//       return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//     };

//     // Notes management functions
//     const saveNote = async () => {
//       if (!noteContent.trim()) {
//         toast.error('Note content cannot be empty');
//         return;
//       }

//       try {
//         if (editingNoteId) {
//           // Update existing note
//           await apiClient.put(`/notes/${editingNoteId}`, {
//             content: noteContent
//           });

//           // Update notes in state
//           setNotes(notes.map(note =>
//             note._id === editingNoteId ? { ...note, content: noteContent } : note
//           ));

//           setEditingNoteId(null);
//           toast.success('Note updated successfully');
//         } else {
//           // Create new note
//           const timestamp = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;

//           const response = await apiClient.post(`/notes/lectures/${lectureId}`, {
//             content: noteContent,
//             timestamp: timestamp
//           });

//           // Add new note to state
//           setNotes([...notes, response.data]);
//           toast.success('Note saved successfully');
//         }

//         setNoteContent('');
//       } catch (err) {
//         console.error('Failed to save note', err);
//         toast.error('Failed to save note');
//       }
//     };

//     const editNote = (note) => {
//       setNoteContent(note.content);
//       setEditingNoteId(note._id);
//     };

//     const deleteNote = async (noteId) => {
//       try {
//         await apiClient.delete(`/notes/${noteId}`);
//         setNotes(notes.filter(note => note._id !== noteId));

//         if (editingNoteId === noteId) {
//           setEditingNoteId(null);
//           setNoteContent('');
//         }

//         toast.success('Note deleted successfully');
//       } catch (err) {
//         console.error('Failed to delete note', err);
//         toast.error('Failed to delete note');
//       }
//     };

//     const exportNotes = async (format = 'pdf') => {
//       try {
//         const response = await apiClient.get(
//           `/notes/lectures/${lectureId}/export?format=${format}`,
//           { responseType: 'blob' }
//         );

//         // Create a URL for the blob
//         const url = window.URL.createObjectURL(new Blob([response.data]));

//         // Create a temporary link element
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', `notes-lecture-${lectureId}.${format}`);
//         document.body.appendChild(link);

//         // Start download
//         link.click();

//         // Clean up
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url);

//         toast.success(`Notes exported as ${format.toUpperCase()}`);
//       } catch (err) {
//         console.error('Failed to export notes', err);
//         toast.error('Failed to export notes');
//       }
//     };

//     const toggleNotesPanel = () => {
//       setShowNotesPanel(!showNotesPanel);
//     };

//     const navigateToLecture = (lectureId) => {
//       if (lectureId) {
//         router.push(`/lectures/${lectureId}`);
//       }
//     };

//     // Rendering content based on content type
//     const renderContent = () => {
//       if (loading) {
//         return (
//           <div className="flex items-center justify-center h-[400px]">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
//           </div>
//         );
//       }

//       if (error || !lecture) {
//         return (
//           <div className="flex flex-col items-center justify-center h-[400px] text-center">
//             <div className="text-destructive text-4xl mb-4">
//               <X className="w-16 h-16 mx-auto" />
//             </div>
//             <h3 className="text-xl font-semibold mb-2">Failed to load lecture</h3>
//             <p className="text-muted-foreground mb-4">{error || 'Lecture content not available'}</p>
//             <Button onClick={fetchLecture}>Retry</Button>
//           </div>
//         );
//       }

//       switch (contentType) {
//         case 'video':
//           return (
//             <div className="video-container relative w-full aspect-video bg-black rounded-lg overflow-hidden">
//               <video
//                 ref={videoRef}
//                 src={lecture.content?.data?.videoUrl}
//                 className="w-full h-full"
//                 poster={lecture.content?.data?.thumbnail || '/images/video-placeholder.jpg'}
//                 preload="metadata"
//                 onClick={togglePlayPause}
//               />

//               {/* Video Controls Overlay */}
//               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300">
//                 {/* Progress bar */}
//                 <div className="mb-3">
//                   <Slider
//                     value={[progress]}
//                     min={0}
//                     max={100}
//                     step={0.01}
//                     onValueChange={handleSeek}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <Button variant="ghost" size="icon" onClick={togglePlayPause} className="text-white hover:bg-white/20">
//                       {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
//                     </Button>

//                     <div className="flex items-center space-x-2">
//                       <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
//                         {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
//                       </Button>
//                       <div className="w-20">
//                         <Slider
//                           value={[isMuted ? 0 : volume]}
//                           min={0}
//                           max={1}
//                           step={0.01}
//                           onValueChange={handleVolumeChange}
//                         />
//                       </div>
//                     </div>

//                     <span className="text-white text-sm">
//                       {formatTime(currentTime)} / {formatTime(duration)}
//                     </span>
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
//                           <Settings className="h-5 w-5" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem onClick={() => handlePlaybackRateChange(0.5)}>
//                           0.5x {playbackRate === 0.5 && <CheckCircle className="h-4 w-4 ml-2" />}
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handlePlaybackRateChange(0.75)}>
//                           0.75x {playbackRate === 0.75 && <CheckCircle className="h-4 w-4 ml-2" />}
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handlePlaybackRateChange(1)}>
//                           1x {playbackRate === 1 && <CheckCircle className="h-4 w-4 ml-2" />}
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handlePlaybackRateChange(1.25)}>
//                           1.25x {playbackRate === 1.25 && <CheckCircle className="h-4 w-4 ml-2" />}
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handlePlaybackRateChange(1.5)}>
//                           1.5x {playbackRate === 1.5 && <CheckCircle className="h-4 w-4 ml-2" />}
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handlePlaybackRateChange(2)}>
//                           2x {playbackRate === 2 && <CheckCircle className="h-4 w-4 ml-2" />}
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>

//                     <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
//                       <Maximize className="h-5 w-5" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );

//         case 'pdf':
//           return (
//             <div className="pdf-container w-full h-[600px] bg-white rounded-lg shadow overflow-hidden" ref={pdfContainerRef}>
//               <iframe
//                 src={`${lecture.content?.data?.pdfUrl}#toolbar=0&navpanes=0`}
//                 className="w-full h-full"
//                 title={lecture.title}
//               />
//             </div>
//           );

//         case 'text':
//           return (
//             <div className="text-content p-6 bg-white rounded-lg shadow">
//               <div className="prose prose-sm sm:prose lg:prose-lg mx-auto" dangerouslySetInnerHTML={{ __html: lecture.content?.data?.html }} />
//             </div>
//           );

//         case 'slideshow':
//           return (
//             <div className="slideshow-container w-full aspect-video bg-white rounded-lg shadow overflow-hidden">
//               <iframe
//                 src={lecture.content?.data?.slideshowUrl}
//                 className="w-full h-full"
//                 title={lecture.title}
//                 allowFullScreen
//               />
//             </div>
//           );

//         case 'interactive':
//           return (
//             <div className="interactive-container w-full aspect-video bg-white rounded-lg shadow overflow-hidden">
//               <iframe
//                 src={lecture.content?.data?.interactiveUrl}
//                 className="w-full h-full"
//                 title={lecture.title}
//                 allowFullScreen
//               />
//             </div>
//           );

//         default:
//           return (
//             <div className="flex flex-col items-center justify-center h-[400px] text-center">
//               <p className="text-muted-foreground">Content format not supported</p>
//             </div>
//           );
//       }
//     };

//     return (
//       <div className="lecture-view-container flex flex-col md:flex-row min-h-screen bg-secondary/10">
//         {/* Mobile nav toggle */}
//         <div className="md:hidden p-2 bg-background border-b">
//           <Button variant="outline" size="icon" onClick={() => setMobileSidebarOpen(true)}>
//             <MenuIcon className="h-5 w-5" />
//           </Button>
//         </div>

//         {/* Sidebar/Navigation - Hidden on mobile */}
//         <aside className={`hidden md:block bg-background border-r w-[260px] flex-shrink-0 transition-all duration-300 ${navbarCollapsed ? 'md:w-[60px]' : 'md:w-[260px]'}`}>
//           <div className="p-4 flex items-center justify-between border-b">
//             <h2 className={`font-semibold ${navbarCollapsed ? 'hidden' : 'block'}`}>
//               {lecture?.subjectName || 'Course Content'}
//             </h2>
//             <Button variant="ghost" size="icon" onClick={() => setNavbarCollapsed(!navbarCollapsed)}>
//               <ChevronLeft className={`h-5 w-5 transition-transform ${navbarCollapsed ? 'rotate-180' : ''}`} />
//             </Button>
//           </div>

//           {!navbarCollapsed && (
//             <div className="p-2">
//               <Tabs defaultValue="outline" value={sidebarTab} onValueChange={setSidebarTab}>
//                 <TabsList className="grid grid-cols-2 w-full">
//                   <TabsTrigger value="outline">Outline</TabsTrigger>
//                   <TabsTrigger value="resources">Resources</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="outline" className="pt-4">
//                   <ScrollArea className="h-[calc(100vh-160px)]">
//                     <div className="space-y-4 px-1">
//                       {lecture?.chapterName && (
//                         <div className="text-sm font-medium text-muted-foreground mb-2">
//                           {lecture.chapterName}
//                         </div>
//                       )}

//                       {/* Lectures list would render here */}
//                       <div className="space-y-2">
//                         {lecture && (
//                           <Card className="border-l-4 border-l-primary bg-secondary/20">
//                             <CardContent className="p-3">
//                               <div className="flex items-start">
//                                 <div className="flex-grow">
//                                   <div className="flex items-center">
//                                     <span className="font-medium text-sm">{lecture.title}</span>
//                                     {isCompleted && (
//                                       <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
//                                         Completed
//                                       </Badge>
//                                     )}
//                                   </div>
//                                   <div className="text-xs text-muted-foreground mt-1">
//                                     {lecture.estimatedDuration ? `${lecture.estimatedDuration} mins` : ''}
//                                   </div>
//                                 </div>
//                               </div>
//                             </CardContent>
//                           </Card>
//                         )}

//                         {/* Render other lectures when available */}
//                         {prevLecture && (
//                           <Card className="cursor-pointer hover:bg-secondary/20" onClick={() => navigateToLecture(prevLecture._id)}>
//                             <CardContent className="p-3">
//                               <div className="flex items-center">
//                                 <div>
//                                   <div className="text-sm">{prevLecture.title}</div>
//                                   <div className="text-xs text-muted-foreground">
//                                     {prevLecture.estimatedDuration ? `${prevLecture.estimatedDuration} mins` : ''}
//                                   </div>
//                                 </div>
//                               </div>
//                             </CardContent>
//                           </Card>
//                         )}

//                         {nextLecture && (
//                           <Card className="cursor-pointer hover:bg-secondary/20" onClick={() => navigateToLecture(nextLecture._id)}>
//                             <CardContent className="p-3">
//                               <div className="flex items-center">
//                                 <div>
//                                   <div className="text-sm">{nextLecture.title}</div>
//                                   <div className="text-xs text-muted-foreground">
//                                     {nextLecture.estimatedDuration ? `${nextLecture.estimatedDuration} mins` : ''}
//                                   </div>
//                                 </div>
//                               </div>
//                             </CardContent>
//                           </Card>
//                         )}
//                       </div>
//                     </div>
//                   </ScrollArea>
//                 </TabsContent>

//                 <TabsContent value="resources" className="pt-4">
//                   <ScrollArea className="h-[calc(100vh-160px)]">
//                     <div className="space-y-4 px-1">
//                       <h3 className="text-sm font-medium">Lecture Resources</h3>
//                       <div className="space-y-2">
//                         {lecture?.resources?.length > 0 ? (
//                           lecture.resources.map((resource, index) => (
//                             <Card key={index} className="cursor-pointer hover:bg-secondary/20">
//                               <CardContent className="p-3">
//                                 <div className="flex items-center">
//                                   <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
//                                   <div>
//                                     <div className="text-sm">{resource.title}</div>
//                                     <div className="text-xs text-muted-foreground">{resource.type}</div>
//                                   </div>
//                                 </div>
//                               </CardContent>
//                             </Card>
//                           ))
//                         ) : (
//                           <p className="text-sm text-muted-foreground">No resources available</p>
//                         )}
//                       </div>
//                     </div>
//                   </ScrollArea>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           )}
//         </aside>

//         {/* Mobile sidebar */}
//         {/* Mobile sidebar */}
//         <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
//           <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
//             <SheetHeader className="p-4 border-b">
//               <SheetTitle>{lecture?.subjectName || 'Course Content'}</SheetTitle>
//             </SheetHeader>

//             <div className="p-2">
//               <div className="border-b">
//                 <div className="flex space-x-1">
//                   <button
//                     onClick={() => setSidebarTab('outline')}
//                     className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-t-md ${sidebarTab === 'outline'
//                         ? 'bg-background text-foreground border-b-2 border-primary'
//                         : 'text-muted-foreground hover:bg-secondary/30'
//                       }`}
//                   >
//                     Outline
//                   </button>
//                   <button
//                     onClick={() => setSidebarTab('resources')}
//                     className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-t-md ${sidebarTab === 'resources'
//                         ? 'bg-background text-foreground border-b-2 border-primary'
//                         : 'text-muted-foreground hover:bg-secondary/30'
//                       }`}
//                   >
//                     Resources
//                   </button>
//                 </div>
//               </div>

//               <div className="pt-4">
//                 {sidebarTab === 'outline' && (
//                   <div className="h-[calc(100vh-160px)] overflow-auto pr-2">
//                     <div className="space-y-4 px-1">
//                       {lecture?.chapterName && (
//                         <div className="text-sm font-medium text-muted-foreground mb-2">
//                           {lecture.chapterName}
//                         </div>
//                       )}

//                       {/* Lectures list would render here */}
//                       <div className="space-y-2">
//                         {lecture && (
//                           <Card className="border-l-4 border-l-primary bg-secondary/20">
//                             <CardContent className="p-3">
//                               <div className="flex items-start">
//                                 <div className="flex-grow">
//                                   <div className="flex items-center">
//                                     <span className="font-medium text-sm">{lecture.title}</span>
//                                     {isCompleted && (
//                                       <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
//                                         Completed
//                                       </Badge>
//                                     )}
//                                   </div>
//                                   <div className="text-xs text-muted-foreground mt-1">
//                                     {lecture.estimatedDuration ? `${lecture.estimatedDuration} mins` : ''}
//                                   </div>
//                                 </div>
//                               </div>
//                             </CardContent>
//                           </Card>
//                         )}

//                         {/* Render other lectures when available */}
//                         {prevLecture && (
//                           <Card className="cursor-pointer hover:bg-secondary/20" onClick={() => navigateToLecture(prevLecture._id)}>
//                             <CardContent className="p-3">
//                               <div className="flex items-center">
//                                 <ChevronLeft className="h-4 w-4 mr-2" />
//                                 <div>
//                                   <div className="text-sm">Previous: {prevLecture.title}</div>
//                                   <div className="text-xs text-muted-foreground">
//                                     {prevLecture.estimatedDuration ? `${prevLecture.estimatedDuration} mins` : ''}
//                                   </div>
//                                 </div>
//                               </div>
//                             </CardContent>
//                           </Card>
//                         )}

//                         {nextLecture && (
//                           <Card className="cursor-pointer hover:bg-secondary/20" onClick={() => navigateToLecture(nextLecture._id)}>
//                             <CardContent className="p-3">
//                               <div className="flex items-center">
//                                 <div className="flex-1">
//                                   <div className="text-sm">Next: {nextLecture.title}</div>
//                                   <div className="text-xs text-muted-foreground">
//                                     {nextLecture.estimatedDuration ? `${nextLecture.estimatedDuration} mins` : ''}
//                                   </div>
//                                 </div>
//                                 <ChevronRight className="h-4 w-4 ml-2" />
//                               </div>
//                             </CardContent>
//                           </Card>
//                         )}
//                       </div>
//                     </div>
//                   </ScrollArea>
//             </TabsContent>

//               <TabsContent value="resources" className="pt-4">
//                 <ScrollArea className="h-[calc(100vh-160px)]">
//                   <div className="space-y-4 px-1">
//                     <h3 className="text-sm font-medium">Lecture Resources</h3>
//                     <div className="space-y-2">
//                       {lecture?.resources?.length > 0 ? (
//                         lecture.resources.map((resource, index) => (
//                           <Card key={index} className="cursor-pointer hover:bg-secondary/20">
//                             <CardContent className="p-3">
//                               <div className="flex items-center">
//                                 <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
//                                 <div>
//                                   <div className="text-sm">{resource.title}</div>
//                                   <div className="text-xs text-muted-foreground">{resource.type}</div>
//                                 </div>
//                               </div>
//                             </CardContent>
//                           </Card>
//                         ))
//                       ) : (
//                         <p className="text-sm text-muted-foreground">No resources available</p>
//                       )}
//                     </div>
//                   </div>
//                 </ScrollArea>
//               </TabsContent>
//             </Tabs>
//           </SheetContent>
//         </Sheet>

//         {/* Main content area */}
//         <main className="flex-1 p-4 md:p-6 flex flex-col">
//           {/* Lecture header */}
//           <div className="mb-6">
//             <div className="flex items-center gap-4 mb-2">
//               {prevLecture && (
//                 <Button variant="outline" size="sm" onClick={() => navigateToLecture(prevLecture._id)}>
//                   <ChevronLeft className="h-4 w-4 mr-1" />
//                   Previous
//                 </Button>
//               )}

//               {nextLecture && (
//                 <Button variant="outline" size="sm" onClick={() => navigateToLecture(nextLecture._id)}>
//                   Next
//                   <ChevronRight className="h-4 w-4 ml-1" />
//                 </Button>
//               )}

//               <div className="flex-1"></div>

//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button variant="outline" size="sm" onClick={() => setShowTranscript(!showTranscript)} className={showTranscript ? 'bg-secondary' : ''}>
//                       <AlignLeft className="h-4 w-4 mr-1" />
//                       Transcript
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <p>{showTranscript ? 'Hide' : 'Show'} Transcript</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>

//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button variant="outline" size="sm" onClick={toggleNotesPanel} className={showNotesPanel ? 'bg-secondary' : ''}>
//                       <BookOpen className="h-4 w-4 mr-1" />
//                       Notes
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <p>{showNotesPanel ? 'Hide' : 'Show'} Notes</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>

//               {!isCompleted && (
//                 <Button variant="default" size="sm" onClick={markAsCompleted}>
//                   <CheckCircle className="h-4 w-4 mr-1" />
//                   Mark Complete
//                 </Button>
//               )}
//             </div>

//             <h1 className="text-2xl font-bold">{lecture?.title || 'Loading lecture...'}</h1>

//             <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
//               {lecture?.chapterName && (
//                 <>
//                   <span>{lecture.chapterName}</span>
//                   <Separator orientation="vertical" className="h-4" />
//                 </>
//               )}

//               {lecture?.estimatedDuration && (
//                 <>
//                   <span>{lecture.estimatedDuration} minutes</span>
//                   <Separator orientation="vertical" className="h-4" />
//                 </>
//               )}

//               <div className="flex items-center">
//                 <span>Progress:</span>
//                 <Progress value={progress} className="w-20 h-2 ml-2" />
//                 <span className="ml-2">{Math.round(progress)}%</span>
//               </div>
//             </div>

//             {lecture?.description && (
//               <p className="mt-2 text-sm text-muted-foreground">{lecture.description}</p>
//             )}
//           </div>

//           {/* Lecture content area - main player */}
//           <div className="lecture-content-container mb-6">
//             {renderContent()}
//           </div>

//           {/* Transcript area - collapsible */}
//           {showTranscript && (
//             <div className="transcript-container bg-background rounded-lg border p-4 mb-6">
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="font-medium">Transcript</h3>
//                 <Button variant="ghost" size="sm" onClick={() => setShowTranscript(false)}>
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//               <ScrollArea className="h-[200px]">
//                 <div className="space-y-2">
//                   {transcriptData && transcriptData.length > 0 ? (
//                     transcriptData.map((segment, index) => (
//                       <div key={index} className="transcript-segment text-sm py-1 hover:bg-secondary/20 rounded px-2">
//                         <div className="text-muted-foreground text-xs mb-1">
//                           {formatTime(segment.startTime)}
//                         </div>
//                         <p>{segment.text}</p>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-muted-foreground text-sm">No transcript available</p>
//                   )}
//                 </div>
//               </ScrollArea>
//             </div>
//           )}

//           {/* Notes panel - collapsible */}
//           {showNotesPanel && (
//             <div className="notes-container bg-background rounded-lg border p-4">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-medium">Notes</h3>
//                 <div className="flex items-center gap-2">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button variant="outline" size="sm">Export</Button>
//                     </DialogTrigger>
//                     <DialogContent className="sm:max-w-[425px]">
//                       <DialogHeader>
//                         <DialogTitle>Export Notes</DialogTitle>
//                         <DialogDescription>
//                           Choose a format to export your notes
//                         </DialogDescription>
//                       </DialogHeader>
//                       <div className="grid grid-cols-2 gap-4 py-4">
//                         <Button
//                           variant="outline"
//                           className="flex flex-col items-center justify-center h-24 w-full"
//                           onClick={() => exportNotes('pdf')}
//                         >
//                           <FileText className="h-8 w-8 mb-2" />
//                           <span>PDF</span>
//                         </Button>
//                         <Button
//                           variant="outline"
//                           className="flex flex-col items-center justify-center h-24 w-full"
//                           onClick={() => exportNotes('docx')}
//                         >
//                           <FileText className="h-8 w-8 mb-2" />
//                           <span>Word (DOCX)</span>
//                         </Button>
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                   <Button variant="ghost" size="sm" onClick={() => setShowNotesPanel(false)}>
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <Textarea
//                   placeholder="Take notes here..."
//                   value={noteContent}
//                   onChange={(e) => setNoteContent(e.target.value)}
//                   className="mb-2 min-h-[100px]"
//                 />
//                 <div className="flex justify-end">
//                   {editingNoteId && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => {
//                         setNoteContent('');
//                         setEditingNoteId(null);
//                       }}
//                       className="mr-2"
//                     >
//                       Cancel
//                     </Button>
//                   )}
//                   <Button onClick={saveNote}>
//                     {editingNoteId ? 'Update Note' : 'Save Note'}
//                   </Button>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <h4 className="text-sm font-medium">Your Notes</h4>
//                 {notes.length > 0 ? (
//                   <ScrollArea className="h-[200px]">
//                     <div className="space-y-2">
//                       {notes.map((note) => (
//                         <Card key={note._id} className="p-3 bg-secondary/10">
//                           <div className="flex justify-between items-start">
//                             <p className="text-sm whitespace-pre-line break-words">{note.content}</p>
//                             <div className="flex items-center gap-1 ml-2">
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 onClick={() => editNote(note)}
//                                 className="h-6 w-6"
//                               >
//                                 <Edit className="h-3 w-3" />
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 onClick={() => deleteNote(note._id)}
//                                 className="h-6 w-6 text-destructive"
//                               >
//                                 <Trash2 className="h-3 w-3" />
//                               </Button>
//                             </div>
//                           </div>
//                           {note.timestamp && (
//                             <div className="text-xs text-muted-foreground mt-1">
//                               Timestamp: {formatTime(note.timestamp)}
//                             </div>
//                           )}
//                         </Card>
//                       ))}
//                     </div>
//                   </ScrollArea>
//                 ) : (
//                   <p className="text-sm text-muted-foreground p-2">No notes yet. Start taking notes!</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     );
//   };

//   export default LectureViewPage;