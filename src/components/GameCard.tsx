import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  difficulty: "Easy" | "Medium" | "Hard";
  xpReward: number;
  isLocked?: boolean;
  isNew?: boolean;
}

export const GameCard = ({
  title,
  description,
  icon: Icon,
  difficulty,
  xpReward,
  isLocked = false,
  isNew = false,
}: GameCardProps) => {
  const { toast } = useToast();
  
  const difficultyColor = {
    Easy: "bg-success/10 text-success",
    Medium: "bg-accent/10 text-accent-foreground",
    Hard: "bg-destructive/10 text-destructive",
  };

  const handlePlay = () => {
    if (isLocked) {
      toast({
        title: "Game Locked 🔒",
        description: "Complete more verses to unlock this game!",
      });
    } else {
      toast({
        title: `Starting ${title}! 🎮`,
        description: `Get ready to earn +${xpReward} XP!`,
      });
    }
  };

  return (
    <Card className={`p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isLocked ? "opacity-60" : ""}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center ${isLocked ? "grayscale" : ""}`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col gap-2">
            {isNew && (
              <Badge className="bg-accent text-accent-foreground">NEW</Badge>
            )}
            {isLocked && (
              <Badge variant="secondary">🔒 Locked</Badge>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 flex-1">{description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor[difficulty]}`}>
              {difficulty}
            </span>
            <span className="text-sm font-semibold text-accent">
              +{xpReward} XP
            </span>
          </div>
          <Button 
            size="sm" 
            disabled={isLocked}
            className="gradient-primary text-white hover:opacity-90"
            onClick={handlePlay}
          >
            {isLocked ? "Locked" : "Play"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
