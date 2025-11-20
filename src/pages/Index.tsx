import { Hero } from "@/components/Hero";
import { DailyVerse } from "@/components/DailyVerse";
import { Features } from "@/components/Features";
import { GamesHub } from "@/components/GamesHub";
import { VersesHub } from "@/components/VersesHub";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { CallToAction } from "@/components/CallToAction";
import { HeartsDisplay } from "@/components/HeartsDisplay";
import { UserStats } from "@/components/UserStats";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Hero />
      {user && (
        <div className="container max-w-7xl px-4 -mt-8 mb-8 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <HeartsDisplay />
            <Button
              onClick={() => navigate("/review")}
              className="gradient-primary text-white hover:opacity-90"
              size="lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Review Verses
            </Button>
          </div>
          <UserStats />
        </div>
      )}
      <DailyVerse />
      <VersesHub />
      <Features />
      <GamesHub />
      <ProfileDashboard />
      <CallToAction />
    </div>
  );
};

export default Index;
