import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Trophy, Lock } from "lucide-react";
import { useVerseProgress } from "@/hooks/useVerseProgress";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";

interface Verse {
  id: string;
  reference: string;
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xp_reward: number;
}

interface VerseCardProps {
  verse: Verse;
  onPlay: (verse: Verse) => void;
  requiredMastery?: number;
}

export const VerseCard = ({ verse, onPlay, requiredMastery = 0 }: VerseCardProps) => {
  const { user } = useAuth();
  const { progress, getMasteryLabel, getMasteryColor, getAccuracy } = useVerseProgress(verse.id);

  const currentMastery = progress?.mastery_level ?? 0;
  const isLocked = requiredMastery > 0 && currentMastery < requiredMastery;
  const accuracy = getAccuracy(progress);

  const difficultyColor = {
    Easy: "bg-success/10 text-success",
    Medium: "bg-accent/10 text-accent-foreground",
    Hard: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className={`p-6 hover:shadow-xl transition-all duration-300 ${isLocked ? "opacity-60" : "hover:-translate-y-1"}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">{verse.reference}</h3>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {isLocked && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
            {!isLocked && progress && (
              <Badge className={getMasteryColor(currentMastery)}>
                {currentMastery === 3 && <Trophy className="h-3 w-3 mr-1" />}
                {getMasteryLabel(currentMastery)}
              </Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {verse.text}
        </p>

        {progress && !isLocked && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className={getMasteryColor(currentMastery)} >
                {currentMastery}/3 ⭐
              </span>
            </div>
            <Progress value={(currentMastery / 3) * 100} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Accuracy: {accuracy}%</span>
              <span>{progress.times_correct}✓ / {progress.times_wrong}✗</span>
            </div>
          </div>
        )}

        {isLocked && requiredMastery > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Reach {getMasteryLabel(requiredMastery)} level to unlock
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor[verse.difficulty]}`}>
              {verse.difficulty}
            </span>
            <span className="text-sm font-semibold text-accent flex items-center gap-1">
              <Target className="h-4 w-4" />
              +{verse.xp_reward} XP
            </span>
          </div>
          <Button
            size="sm"
            disabled={isLocked || !user}
            className="gradient-primary text-white hover:opacity-90"
            onClick={() => onPlay(verse)}
          >
            {isLocked ? "Locked" : "Play"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
