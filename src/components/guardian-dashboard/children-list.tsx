import { useChildrenList } from '@/app/(guardian)/child-list/hooks/use-children-list-direct';
import ChildCard from './child-card';
import ChildCardSkeleton from './child-card-skeleton';
import AddChildButton from './add-child-button';
import { Users, AlertCircle, RefreshCw, BookOpen, Trophy, Clock, PlusCircle } from 'lucide-react';

interface ChildrenListProps {
  parentId: string;
}

export default function ChildrenList({ parentId }: ChildrenListProps) {
  const { children, isLoading, isError, error, refetch, totalChildren } = useChildrenList(parentId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-xl shadow-sm animate-pulse"></div>
            ))}
          </div>
          
          {/* Children Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <ChildCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
              <p className="text-gray-600 mt-1">Monitor your children's learning progress</p>
            </div>
            <AddChildButton />
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Unable to load children</h3>
            <p className="text-gray-600 mb-2 max-w-md mx-auto">There was an error loading your children's information. This might be a temporary issue.</p>
            {error && (
              <div className="bg-red-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-red-700 text-sm">Error: {error}</p>
              </div>
            )}
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
              <p className="text-gray-600 mt-1">Monitor your children's learning progress</p>
            </div>
            <AddChildButton />
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No children added yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Get started by adding your first child to monitor their education progress and track their academic journey.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Track subjects</p>
              </div>
              <div className="text-center p-4">
                <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Monitor progress</p>
              </div>
              <div className="text-center p-4">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">View activity</p>
              </div>
            </div>
            
            <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg">
              <PlusCircle className="w-5 h-5" />
              Add Your First Child
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeChildren = children.filter(child => child.isActive).length;
  const totalSubjects = children.reduce((sum, child) => sum + (child.quickStats?.subjectsEnrolled || 0), 0);
  const avgProgress = Math.round(children.reduce((sum, child) => sum + child.overallProgress, 0) / children.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
            <p className="text-gray-600 mt-1">
              {totalChildren} child{totalChildren !== 1 ? 'ren' : ''} registered
            </p>
          </div>
          <AddChildButton />
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activeChildren}</p>
                <p className="text-xs text-gray-500 mt-1">of {totalChildren} total</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalSubjects}</p>
                <p className="text-xs text-gray-500 mt-1">across all children</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{avgProgress}%</p>
                <p className="text-xs text-gray-500 mt-1">overall completion</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      </div>
    </div>
  );
}