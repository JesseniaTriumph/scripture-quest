import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  gradient?: boolean;
}

export const StatsCard = ({ title, value, icon: Icon, trend, gradient = false }: StatsCardProps) => {
  return (
    <Card className={`p-6 ${gradient ? "gradient-primary text-white" : ""} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${gradient ? "bg-white/20" : "bg-primary/10"} flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${gradient ? "text-white" : "text-primary"}`} />
        </div>
        {trend && (
          <span className={`text-sm font-semibold ${gradient ? "text-white" : "text-success"}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold mb-1 ${gradient ? "text-white" : "text-foreground"}`}>
          {value}
        </p>
        <p className={`text-sm ${gradient ? "text-white/80" : "text-muted-foreground"}`}>
          {title}
        </p>
      </div>
    </Card>
  );
};
