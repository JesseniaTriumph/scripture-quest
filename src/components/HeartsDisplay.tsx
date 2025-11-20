import { Flame, Infinity } from "lucide-react";
import { useHearts } from "@/hooks/useHearts";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const HeartsDisplay = () => {
  const { hearts, maxHearts, isPremium, isLoading, timeUntilNextHeart } = useHearts();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </Card>
    );
  }

  if (isPremium) {
    return (
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Infinity className="h-6 w-6 text-primary animate-pulse-soft" />
            <div>
              <p className="font-bold text-primary">Unlimited Lamp Oil</p>
              <p className="text-xs text-muted-foreground">Premium Member</p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">PRO</Badge>
        </div>
      </Card>
    );
  }

  const heartsPercentage = (hearts / maxHearts) * 100;
  const heartColor = hearts === 0 ? "text-muted-foreground" : "text-primary";

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Oil Lamps count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Array.from({ length: maxHearts }).map((_, i) => (
              <Flame
                key={i}
                className={`h-5 w-5 ${
                  i < hearts 
                    ? "fill-primary text-primary animate-pulse-soft" 
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className={`text-lg font-bold ${heartColor}`}>
            {hearts}/{maxHearts}
          </span>
        </div>

        {/* Progress bar */}
        <Progress value={heartsPercentage} className="h-2" />

        {/* Regeneration timer */}
        {hearts < maxHearts && timeUntilNextHeart && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Next lamp oil refills in:</span>
            <span className="font-mono font-bold text-primary">{timeUntilNextHeart}</span>
          </div>
        )}

        {hearts === maxHearts && (
          <p className="text-xs text-success text-center font-semibold">
            ✨ All lamp oil restored!
          </p>
        )}

        {hearts === 0 && (
          <div className="text-center space-y-1">
            <p className="text-xs text-destructive font-semibold">
              🪔 Out of lamp oil!
            </p>
            <p className="text-xs text-muted-foreground">
              Wait for refill or upgrade to Premium
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
