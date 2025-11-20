import { Hero } from "@/components/Hero";
import { DailyVerse } from "@/components/DailyVerse";
import { Features } from "@/components/Features";
import { GamesHub } from "@/components/GamesHub";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { CallToAction } from "@/components/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <DailyVerse />
      <Features />
      <GamesHub />
      <ProfileDashboard />
      <CallToAction />
    </div>
  );
};

export default Index;
