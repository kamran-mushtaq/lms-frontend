import { useChildrenList } from '@/app/(guardian)/child-list/hooks/use-children-list-direct';
import ChildCard from './child-card';
import ChildCardSkeleton from './child-card-skeleton';
import AddChildButton from './add-child-button';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';

interface ChildrenListProps {
  parentId: string;
}

export default function ChildrenList({ parentId }: ChildrenListProps) {
  const { children, isLoading, isError, error, refetch, totalChildren } = useChildrenList(parentId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
          <AddChildButton />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <ChildCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
          <AddChildButton />
        </div>
        
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load children</h3>
          <p className="text-gray-600 mb-2">There was an error loading your children's information.</p>
          {error && <p className="text-red-600 text-sm mb-4">Error: {error}</p>}
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
          <AddChildButton />
        </div>
        
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first child to monitor their education progress.</p>
          <AddChildButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
          <p className="text-gray-600">{totalChildren} child{totalChildren !== 1 ? 'ren' : ''} registered</p>
        </div>
        <AddChildButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <ChildCard key={child.id} child={child} />
        ))}
      </div>
    </div>
  );
}
