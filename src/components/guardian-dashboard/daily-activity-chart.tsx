// src/components/guardian-dashboard/daily-activity-chart.tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { BarChart, Calendar, BookOpen } from "lucide-react";
import { format } from "date-fns";

interface DailyActivityData {
  date: string;
  chaptersCompleted: number;
  timeSpentMinutes: number;
  averageScore: number;
}

interface DailyActivityChartProps {
  dailyData: DailyActivityData[];
}

// Format time function
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export default function DailyActivityChart({ dailyData }: DailyActivityChartProps) {
  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d');
    } catch (error) {
      return "Invalid date";
    }
  };
  
  // Get recent activity metrics
  const getTotalRecentChapters = () => {
    return dailyData.reduce((total, day) => total + day.chaptersCompleted, 0);
  };
  
  const getTotalRecentTime = () => {
    return dailyData.reduce((total, day) => total + day.timeSpentMinutes, 0);
  };
  
  const getAverageScore = () => {
    if (dailyData.length === 0) return 0;
    
    const sum = dailyData.reduce((total, day) => total + day.averageScore, 0);
    return Math.round(sum / dailyData.length);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Activity</CardTitle>
        <CardDescription>
          Student's daily learning activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dailyData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No activity data available for the selected period.
          </div>
        ) : (
          <>
            {/* Activity Summary */}
            <div className="grid gap-4 grid-cols-3 mb-6">
              <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                <BookOpen className="h-5 w-5 mb-1 text-primary" />
                <div className="text-2xl font-bold">{getTotalRecentChapters()}</div>
                <div className="text-xs text-muted-foreground">Chapters Completed</div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                <Calendar className="h-5 w-5 mb-1 text-primary" />
                <div className="text-2xl font-bold">{formatTime(getTotalRecentTime())}</div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                <BarChart className="h-5 w-5 mb-1 text-primary" />
                <div className="text-2xl font-bold">{getAverageScore()}%</div>
                <div className="text-xs text-muted-foreground">Average Score</div>
              </div>
            </div>
            
            {/* Activity Chart - Simplified version */}
            <div className="h-[250px] relative">
              <div className="absolute inset-0 flex items-end justify-between px-2">
                {dailyData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center w-1/7">
                    <div 
                      className="w-12 bg-primary rounded-t" 
                      style={{ 
                        height: `${(day.timeSpentMinutes / 180) * 200}px`,
                        maxHeight: '200px'
                      }}
                    ></div>
                    <div className="text-xs mt-2">{formatDateForDisplay(day.date)}</div>
                  </div>
                ))}
              </div>
              <div className="h-full flex items-center justify-center text-muted-foreground">
                In a real implementation, this would be a proper chart using recharts or another charting library
              </div>
            </div>
            
            {/* Activity List */}
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
              {dailyData.slice(0, 5).map((day, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="text-sm">{formatDateForDisplay(day.date)}</div>
                  <div className="text-sm flex items-center gap-4">
                    <span>{day.chaptersCompleted} chapters</span>
                    <span>{formatTime(day.timeSpentMinutes)}</span>
                    <span>{day.averageScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}