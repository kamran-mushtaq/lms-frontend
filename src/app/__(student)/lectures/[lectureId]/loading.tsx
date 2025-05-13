// src/app/(student)/lectures/[lectureId]/loading.tsx
export default function LectureLoading() {
  return (
    <div className="h-screen flex flex-col">
      {/* Skeleton header */}
      <div className="h-16 border-b bg-background flex items-center px-4">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse mr-4"></div>
        <div className="h-6 w-64 bg-muted animate-pulse rounded"></div>
        <div className="ml-auto h-8 w-8 rounded-full bg-muted animate-pulse"></div>
      </div>

      {/* Skeleton content */}
      <div className="flex-1 flex overflow-hidden p-4">
        <div className="flex-1">
          <div className="w-full h-96 bg-muted animate-pulse rounded-lg mb-4"></div>
          <div className="w-full h-8 bg-muted animate-pulse rounded-md mb-4"></div>
          <div className="w-3/4 h-6 bg-muted animate-pulse rounded-md mb-4"></div>
          <div className="w-1/2 h-6 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="w-80 border-l hidden md:block">
          <div className="p-4">
            <div className="flex mb-4">
              <div className="w-20 h-8 bg-muted animate-pulse rounded-md mr-2"></div>
              <div className="w-20 h-8 bg-muted animate-pulse rounded-md mr-2"></div>
              <div className="w-20 h-8 bg-muted animate-pulse rounded-md"></div>
            </div>
            <div className="w-full h-32 bg-muted animate-pulse rounded-md mb-4"></div>
            <div className="w-full h-32 bg-muted animate-pulse rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
