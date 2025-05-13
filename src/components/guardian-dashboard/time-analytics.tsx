// src/components/guardian-dashboard/time-analytics.tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";

interface TimeAnalyticsData {
  totalTimeSpentMinutes: number;
  averageDailyTimeMinutes: number;
  mostProductiveDay: {
    day: string;
    timeSpentMinutes: number;
  };
  timeDistribution: Array<{
    activity: string;
    percentage: number;
  }>;
}

interface TimeAnalyticsProps {
  timeData: TimeAnalyticsData;
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

export default function TimeAnalytics({ timeData }: TimeAnalyticsProps) {
  const { 
    totalTimeSpentMinutes, 
    averageDailyTimeMinutes, 
    mostProductiveDay, 
    timeDistribution 
  } = timeData;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Analytics</CardTitle>
        <CardDescription>
          Study time distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="px-4 py-3 bg-muted/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Total Time</div>
            <div className="text-2xl font-bold">{formatTime(totalTimeSpentMinutes)}</div>
          </div>
          <div className="px-4 py-3 bg-muted/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Daily Average</div>
            <div className="text-2xl font-bold">{formatTime(averageDailyTimeMinutes)}</div>
          </div>
          <div className="px-4 py-3 bg-muted/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Most Productive</div>
            <div className="text-2xl font-bold">{mostProductiveDay.day}</div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Activity Distribution</h4>
          <div className="space-y-2">
            {timeDistribution.map((activity, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="text-sm w-24">{activity.activity}</div>
                <div className="h-2 bg-muted rounded-full flex-1 overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${activity.percentage}%` }}
                  />
                </div>
                <div className="text-sm w-12 text-right">{activity.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}