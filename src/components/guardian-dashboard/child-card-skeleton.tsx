export default function ChildCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[200px] animate-pulse">
      {/* Profile section */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="w-2 h-2 bg-gray-200 rounded-full" />
      </div>

      {/* Progress section */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gray-300 h-2 rounded-full w-3/4" />
        </div>
      </div>

      {/* Recent activity */}
      <div className="border-t pt-4">
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-4">
        <div className="h-9 bg-gray-200 rounded w-24" />
        <div className="h-9 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}
