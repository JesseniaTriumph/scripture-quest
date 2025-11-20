import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Users } from "lucide-react";
import heroMascot from "@/assets/hero-mascot.jpg";

export const Hero = () => {
  return (
    <section className="gradient-hero min-h-screen flex items-center justify-center px-4 py-20">
      <div className="container max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                🎮 Duolingo for Scripture
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Make Scripture Memory{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                Fun & Engaging
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl">
              Learn Bible verses through interactive games, build daily streaks, and grow with a supportive community. Start your spiritual journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button size="lg" className="gradient-primary text-white hover:opacity-90 transition-opacity shadow-lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Learning Free
              </Button>
              <Button size="lg" variant="outline" className="border-2 hover:bg-secondary">
                Watch Demo
              </Button>
            </div>
            <div className="flex gap-8 justify-center lg:justify-start pt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-bold text-foreground">10,000+</p>
                  <p className="text-muted-foreground">Verses Memorized</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">2,000+</p>
                  <p className="text-muted-foreground">Active Learners</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative animate-float">
              <img 
                src={heroMascot} 
                alt="Scripture Quest Mascot - Friendly owl guide" 
                className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-6 py-3 rounded-2xl shadow-lg font-bold animate-pulse-soft">
                🔥 Join Today!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
