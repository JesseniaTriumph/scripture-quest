import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Coins } from "lucide-react";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyQuestsPanelProps {
  userId: string | undefined;
}

export const DailyQuestsPanel = ({ userId }: DailyQuestsPanelProps) => {
  const { quests, loading } = useDailyQuests(userId);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Daily Quests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const completedCount = quests.filter((q) => q.completed).length;
  const allCompleted = completedCount === quests.length;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Daily Quests
          </div>
          <Badge variant={allCompleted ? "default" : "secondary"}>
            {completedCount}/{quests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quests.map((quest) => {
          const progressPercentage = (quest.current_progress / quest.target_value) * 100;

          return (
            <div
              key={quest.id}
              className={`p-4 rounded-lg border transition-all ${
                quest.completed
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">
                    {quest.quest_description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {quest.reward_xp} XP
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {quest.reward_coins}
                    </span>
                  </div>
                </div>
                {quest.completed && (
                  <Badge variant="default" className="ml-2">
                    ✓ Done
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {quest.current_progress}/{quest.target_value}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
