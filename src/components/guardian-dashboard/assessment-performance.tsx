// src/components/guardian-dashboard/assessment-performance.tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";

interface AssessmentPerformanceData {
  totalAttempted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
}

interface AssessmentPerformanceProps {
  assessmentData: AssessmentPerformanceData;
}

export default function AssessmentPerformance({ assessmentData }: AssessmentPerformanceProps) {
  const { totalAttempted, averageScore, highestScore, lowestScore, scoreDistribution } = assessmentData;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Performance</CardTitle>
        <CardDescription>
          Overview of assessment results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="px-4 py-3 bg-muted/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Total Attempted</div>
            <div className="text-2xl font-bold">{totalAttempted}</div>
          </div>
          <div className="px-4 py-3 bg-muted/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Average Score</div>
            <div className="text-2xl font-bold">{averageScore}%</div>
          </div>
          <div className="px-4 py-3 bg-muted/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Highest Score</div>
            <div className="text-2xl font-bold">{highestScore}%</div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Score Distribution</h4>
          <div className="space-y-2">
            {scoreDistribution.map((range, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="text-sm w-20">{range.range}</div>
                <div className="h-2 bg-muted rounded-full flex-1 overflow-hidden">
                  <div 
                    className={`h-full ${
                      range.range === "81-100%" ? "bg-green-500" :
                      range.range === "61-80%" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`} 
                    style={{ 
                      width: `${(range.count / totalAttempted) * 100}%` 
                    }}
                  />
                </div>
                <div className="text-sm w-8 text-right">{range.count}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}