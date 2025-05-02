import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SubjectProgress } from "@/types/parent-dashboard";

interface SubjectHeaderProps {
    data: SubjectProgress;
}

export default function SubjectHeader({ data }: SubjectHeaderProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{data.subject.name}</h1>
                        <p className="text-muted-foreground mb-4">{data.subject.description}</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                                {data.chaptersCompleted} of {data.totalChapters} chapters completed
                            </Badge>
                            <Badge variant="outline">
                                Average score: {data.averageAssessmentScore}%
                            </Badge>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Overall Progress</span>
                            <span className="font-medium">{data.completionPercentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${data.completionPercentage}%` }}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Current Chapter:</span>
                                <span className="font-medium">{data.currentChapter}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Study Time:</span>
                                <span className="font-medium">{data.totalStudyTimeHours.toFixed(1)} hours</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}