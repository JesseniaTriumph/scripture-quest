import { Hero } from "@/components/Hero";
import { DailyVerse } from "@/components/DailyVerse";
import { Features } from "@/components/Features";
import { GamesHub } from "@/components/GamesHub";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { CallToAction } from "@/components/CallToAction";
import { HeartsDisplay } from "@/components/HeartsDisplay";
import { UserStats } from "@/components/UserStats";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Hero />
      {user && (
        <div className="container max-w-7xl px-4 -mt-8 mb-8 space-y-4">
          <HeartsDisplay />
          <UserStats />
        </div>
      )}
      <DailyVerse />
      <Features />
      <GamesHub />
      <ProfileDashboard />
      <CallToAction />
    </div>
  );
};

export default Index;
