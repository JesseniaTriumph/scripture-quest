import { Flame, Infinity } from "lucide-react";
import { useOilLamp } from "@/hooks/useOilLamp";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const OilLampDisplay = () => {
  const { oil, maxOil, isPremium, isLoading, timeUntilRefill } = useOilLamp();

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

  const oilPercentage = (oil / maxOil) * 100;
  const oilColor = oil === 0 ? "text-muted-foreground" : "text-primary";

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Oil Lamps count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Array.from({ length: maxOil }).map((_, i) => (
              <Flame
                key={i}
                className={`h-5 w-5 ${
                  i < oil 
                    ? "fill-primary text-primary animate-pulse-soft" 
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className={`text-lg font-bold ${oilColor}`}>
            {oil}/{maxOil}
          </span>
        </div>

        {/* Progress bar */}
        <Progress value={oilPercentage} className="h-2" />

        {/* Regeneration timer */}
        {oil < maxOil && timeUntilRefill && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Next lamp oil refills in:</span>
            <span className="font-mono font-bold text-primary">{timeUntilRefill}</span>
          </div>
        )}

        {oil === maxOil && (
          <p className="text-xs text-success text-center font-semibold">
            ✨ All lamp oil restored!
          </p>
        )}

        {oil === 0 && (
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
