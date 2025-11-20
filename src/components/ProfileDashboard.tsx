import { Card } from "@/components/ui/card";
import { StatsCard } from "./StatsCard";
import { ProgressBar } from "./ProgressBar";
import { Flame, Zap, BookOpen, Award, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ProfileDashboard = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Progress
          </h2>
          <p className="text-lg text-muted-foreground">
            See how far you've come on your scripture learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Current Charge"
            value="7 days"
            icon={Flame}
            trend="+2 days"
            gradient
          />
          <StatsCard
            title="Total XP"
            value="1,250"
            icon={Zap}
            trend="+150"
          />
          <StatsCard
            title="Verses Learned"
            value="24"
            icon={BookOpen}
          />
          <StatsCard
            title="Badges Earned"
            value="8"
            icon={Award}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Level Progress
            </h3>
            <div className="space-y-6">
              <div className="text-center p-4 rounded-xl bg-primary/5">
                <p className="text-sm text-muted-foreground mb-1">Current Level</p>
                <p className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
                  Level 5
                </p>
                <p className="text-sm text-muted-foreground mt-1">Scripture Scholar</p>
              </div>
              <ProgressBar 
                current={1250} 
                max={2000} 
                label="Progress to Level 6"
              />
              <p className="text-sm text-muted-foreground text-center">
                750 XP until next level
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Recent Achievements
            </h3>
            <div className="space-y-4">
              {[
                { name: "Week Warrior", desc: "7 day charge", color: "gradient-accent" },
                { name: "Verse Master", desc: "25 verses learned", color: "gradient-primary" },
                { name: "Quick Learner", desc: "Completed 10 games", color: "bg-success" },
              ].map((achievement, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className={`w-12 h-12 rounded-full ${achievement.color} flex items-center justify-center text-2xl`}>
                    🏆
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                  </div>
                  <Badge variant="secondary">New!</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
