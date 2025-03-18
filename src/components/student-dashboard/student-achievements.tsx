"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  earnedAt: string;
}

export default function StudentAchievements() {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch("/api/student/achievements");
        if (!response.ok) throw new Error("Failed to fetch achievements");
        const data = await response.json();
        setAchievements(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load achievements. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [toast]);

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "completion":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "excellence":
        return <Star className="h-5 w-5 text-purple-500" />;
      case "progress":
        return <Target className="h-5 w-5 text-blue-500" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return <div>Loading achievements...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Achievements</CardTitle>
        <CardDescription>Your latest learning milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {achievements.slice(0, 3).map((achievement) => (
            <Card key={achievement.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {getAchievementIcon(achievement.type)}
                  <div>
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
