import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
  showNumbers?: boolean;
}

export const ProgressBar = ({ current, max, label, showNumbers = true }: ProgressBarProps) => {
  const percentage = (current / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-foreground">{label}</span>
        {showNumbers && (
          <span className="text-muted-foreground">
            {current} / {max}
          </span>
        )}
      </div>
      <Progress value={percentage} className="h-3" />
    </div>
  );
};
