import { Child } from '@/types/child';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, FileText, Calendar, BookOpen, Award, Zap } from 'lucide-react';

interface ChildCardProps {
  child: Child;
}

export default function ChildCard({ child }: ChildCardProps) {
  // Get progress color based on percentage
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 bg-green-100';
    if (progress >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Format the last activity time
  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lecture_completed':
        return <BookOpen className="w-4 h-4" />;
      case 'assessment_completed':
        return <Award className="w-4 h-4" />;
      case 'subject_enrolled':
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[200px] hover:shadow-md transition-shadow">
      {/* Header with profile and status */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          {child.profileImage ? (
            <Image
              src={child.profileImage}
              alt={child.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xl">
              {child.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
          <p className="text-sm text-gray-600">
            {child.grade && child.age ? `${child.grade} • Age ${child.age}` : 
             child.grade ? child.grade : 
             child.age ? `Age ${child.age}` : 
             'Student'}
          </p>
        </div>
        
        <div className={`w-3 h-3 rounded-full ${
          child.isActive 
            ? formatLastActivity(child.lastActivity) === 'Just now' || formatLastActivity(child.lastActivity).includes('h ago')
              ? 'bg-blue-500' 
              : 'bg-green-500'
            : 'bg-gray-400'
        }`} />
      </div>

      {/* Progress section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${getProgressColor(child.overallProgress)}`}>
            {child.overallProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              child.overallProgress >= 80 ? 'bg-green-500' :
              child.overallProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${child.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <div className="text-lg font-bold text-gray-900">{child.quickStats.subjectsEnrolled}</div>
          <div className="text-xs text-gray-600">Subjects</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{child.quickStats.assessmentsPending}</div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{child.quickStats.studyStreakDays}</div>
          <div className="text-xs text-gray-600">Day Streak</div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="border-t pt-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {getActivityIcon(child.recentActivity.type)}
          <span className="font-medium">{child.recentActivity.subject}</span>
          <span>•</span>
          <span>{child.recentActivity.item}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatLastActivity(child.recentActivity.timestamp)}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Link
          href={`/guardian/child/${child.id}`}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View Details
        </Link>
        
        {child.quickStats.assessmentsPending > 0 && (
          <Link
            href={`/guardian/child/${child.id}/assessments`}
            className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            Assessments
          </Link>
        )}
      </div>

      {/* Upcoming assessment indicator */}
      {child.upcomingAssessment && (
        <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-amber-700">{child.upcomingAssessment.title}</span>
          </div>
          <div className="text-xs text-amber-600 mt-1">
            Due: {new Date(child.upcomingAssessment.dueDate).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
