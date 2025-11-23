import { Hero } from "@/components/Hero";
import { DailyVerse } from "@/components/DailyVerse";
import { Features } from "@/components/Features";
import { GamesHub } from "@/components/GamesHub";
import { PathView } from "@/components/PathView";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { CallToAction } from "@/components/CallToAction";
import { HeartsDisplay } from "@/components/HeartsDisplay";
import { GracePassIndicator } from "@/components/GracePassIndicator";
import { GracePassModal } from "@/components/GracePassModal";
import { UserStats } from "@/components/UserStats";
import { DailyQuestsPanel } from "@/components/DailyQuestsPanel";
import { useAuth } from "@/hooks/useAuth";
import { useGracePass } from "@/hooks/useGracePass";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Index Page - Main landing and dashboard
 * 
 * WHY: Main entry point for app. Implements:
 * - Phase 1.1: Path-Based Navigation (linear progression)
 * - Phase 1.2: Grace Pass System (streak protection) ← NEW
 * 
 * GRACE PASS INTEGRATION:
 * Hook checks on mount if user's streak would break.
 * If so, and grace passes available, shows modal offering protection.
 * This reduces anxiety and improves retention after breaks.
 * 
 * LAYOUT:
 * - Hero section (value prop)
 * - User stats + Grace Pass indicator (if logged in)
 * - Daily verse (motivational)
 * - PathView (main engagement loop)
 * - Features showcase
 * - Games hub (explore all games)
 * - Profile dashboard
 * - Call to action
 */
const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Phase 1.2: Grace Pass System
  // WHY: Detects streak breaks and offers protection on app load
  const {
    gracePassState,
    shouldShowModal,
    useGracePass: acceptGracePass,
    declineGracePass,
    dismissModal,
  } = useGracePass();

  /**
   * Handle grace pass acceptance
   * WHY: Show success feedback and update UI
   */
  const handleUseGracePass = async () => {
    const success = await acceptGracePass();
    if (success) {
      toast.success("Grace Pass Used! 🕊️", {
        description: "Your daily charge has been protected. Keep growing!",
      });
    } else {
      toast.error("Failed to use Grace Pass. Please try again.");
    }
  };

  /**
   * Handle grace pass decline
   * WHY: Provide encouragement even when streak breaks
   */
  const handleDeclineGracePass = async () => {
    const success = await declineGracePass();
    if (success) {
      toast.info("Fresh Start! 🌱", {
        description: "Every day is a new beginning. Let's build a new charge together!",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Hero />
      {user && (
        <>
          <div className="container max-w-7xl px-4 -mt-8 mb-8 space-y-4">
            <div className="flex justify-between items-start gap-4">
              {/* Lamp Oil (Hearts) and Grace Pass indicators */}
              <div className="flex gap-3">
                <HeartsDisplay />
                <GracePassIndicator />
              </div>
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

          {/* Phase 1.2: Grace Pass Modal */}
          {/* WHY: Shows on mount if streak would break and passes available */}
          {gracePassState && (
            <GracePassModal
              open={shouldShowModal}
              passesRemaining={gracePassState.passesRemaining}
              isPremium={gracePassState.isPremium}
              onUseGracePass={handleUseGracePass}
              onDeclineGracePass={handleDeclineGracePass}
              onClose={dismissModal}
            />
          )}
        </>
      )}
      <DailyVerse />
      {/* PHASE 1.1: Path-Based Navigation replaces tab-based VersesHub */}
      <PathView />
      <Features />
      <GamesHub />
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileDashboard />
          </div>
          <div>
            <DailyQuestsPanel userId={user?.id} />
          </div>
        </div>
      </div>
      <CallToAction />
    </div>
  );
};

export default Index;
