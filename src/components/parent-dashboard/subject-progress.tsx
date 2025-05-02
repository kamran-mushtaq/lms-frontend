import { format } from "date-fns";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Subject } from "@/types/parent-dashboard";

interface SubjectProgressProps {
    childId: string;
    subject: Subject;
}

export default function SubjectProgress({ childId, subject }: SubjectProgressProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "on_track":
                return "bg-green-500";
            case "needs_attention":
                return "bg-yellow-500";
            case "falling_behind":
                return "bg-red-500";
            default:
                return "bg-slate-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "on_track":
                return "On Track";
            case "needs_attention":
                return "Needs Attention";
            case "falling_behind":
                return "Falling Behind";
            default:
                return "Unknown";
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle>{subject.name}</CardTitle>
                    <Badge className={getStatusColor(subject.status)}>
                        {getStatusText(subject.status)}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    Last activity: {format(new Date(subject.lastActivity), "MMM d, yyyy")}
                </p>
            </CardHeader>
            <CardContent>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{subject.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${getStatusColor(subject.status)}`}
                            style={{ width: `${subject.progress}%` }}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" size="sm" asChild>
                    <Link href={`/parent/children/${childId}/subjects/${subject.id}`}>
                        View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}