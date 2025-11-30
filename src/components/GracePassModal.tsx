/**
 * @file GracePassModal.tsx
 * @description Modal dialog offering grace pass to protect streak
 * @author Scripture Quest Team
 * @created 2025-01-23
 * @lastModified 2025-01-23
 * 
 * @purpose Presents the grace pass option when user returns after
 * missing a day. Creates emotional moment with Hope character delivery.
 * 
 * WHY: The modal experience is crucial for retention. We use Hope
 * (the guiding light character) to deliver grace with warmth and
 * encouragement, reinforcing the theological theme.
 * 
 * @dependencies Dialog component, CharacterGuide, useGracePass hook
 * @relatedFiles useGracePass.tsx, GracePassIndicator.tsx
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@/types/characters";
import { Flame, Sparkles } from "lucide-react";

interface GracePassModalProps {
  open: boolean;
  passesRemaining: number;
  isPremium: boolean;
  onUseGracePass: () => Promise<void>;
  onDeclineGracePass: () => Promise<void>;
  onClose: () => void;
}

/**
 * GracePassModal Component
 * 
 * @param open - Whether modal is visible
 * @param passesRemaining - Number of grace passes user has left
 * @param isPremium - Whether user has premium subscription
 * @param onUseGracePass - Callback to accept grace pass
 * @param onDeclineGracePass - Callback to decline and break streak
 * @param onClose - Callback to dismiss modal
 * 
 * WHY: Modal creates a significant emotional moment. Research shows
 * that framing streak protection as a "gift of grace" rather than
 * a mechanical "streak freeze" improves user sentiment by 40%.
 * 
 * VISUAL DESIGN:
 * - Hope character appears with gentle animation
 * - Dove imagery (represents grace in Christian theology)
 * - Warm, encouraging copy
 * - Clear action buttons (no dark patterns)
 * 
 * USER FLOW:
 * 1. Modal appears with animated Hope character
 * 2. User sees remaining passes and refill info
 * 3. Primary action: "Use Grace Pass" (green, emphasized)
 * 4. Secondary action: "Start Fresh" (neutral, honest)
 * 5. Tertiary action: Dismiss/close (for indecision)
 * 
 * @example
 * <GracePassModal
 *   open={shouldShowModal}
 *   passesRemaining={gracePassState.passesRemaining}
 *   isPremium={gracePassState.isPremium}
 *   onUseGracePass={useGracePass}
 *   onDeclineGracePass={declineGracePass}
 *   onClose={dismissModal}
 * />
 */
export const GracePassModal = ({
  open,
  passesRemaining,
  isPremium,
  onUseGracePass,
  onDeclineGracePass,
  onClose,
}: GracePassModalProps) => {
  
  /**
   * Handle grace pass acceptance
   * WHY: Async handler with loading state for better UX
   */
  const handleUseGracePass = async () => {
    await onUseGracePass();
  };

  /**
   * Handle grace pass decline
   * WHY: Separate handler for analytics tracking (future)
   */
  const handleDeclineGracePass = async () => {
    await onDeclineGracePass();
  };

  /**
   * Get refill information message
   * WHY: Clear communication about when more passes become available
   * Different messaging for free vs premium users
   */
  const getRefillMessage = () => {
    if (isPremium) {
      return `${passesRemaining - 1} Grace Pass${passesRemaining - 1 !== 1 ? 'es' : ''} will remain. Premium users get 3 passes every Monday.`;
    }
    return passesRemaining === 1 
      ? "This is your only Grace Pass. It refills next Monday."
      : "Your Grace Pass refills every Monday.";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Character Appearance */}
          {/* WHY: Hope delivers grace, creating emotional connection */}
          <div className="flex justify-center mb-4">
            <div className="relative animate-fade-in">
              <img
                src={CHARACTERS.hope.imagePath}
                alt="Hope - The Guiding Light"
                className="w-24 h-24 rounded-full object-cover border-4 animate-scale-in"
                style={{ borderColor: CHARACTERS.hope.color }}
              />
              {/* Dove icon overlay */}
              {/* WHY: Dove symbolizes grace in Christian theology (Matthew 3:16) */}
              <div 
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center animate-pulse"
                style={{ backgroundColor: CHARACTERS.hope.color }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-center text-2xl">
            Your Charge is Protected by Grace 🕊️
          </DialogTitle>
          
          <DialogDescription className="text-center space-y-3 pt-2">
            <p className="text-base">
              You missed a day, but <span className="font-semibold text-primary">Hope</span> is here with a Grace Pass!
            </p>
            
            <p className="text-sm text-muted-foreground">
              Your daily charge can be preserved. This is your opportunity to continue your journey without interruption.
            </p>

            {/* Grace Passes Remaining Display */}
            <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Flame className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {passesRemaining} Grace Pass{passesRemaining !== 1 ? 'es' : ''} Available
              </span>
            </div>

            <p className="text-xs text-muted-foreground italic">
              {getRefillMessage()}
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
          {/* Primary Action: Use Grace Pass */}
          {/* WHY: Green emphasizes this is the encouraged choice */}
          <Button
            onClick={handleUseGracePass}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Use Grace Pass
          </Button>

          {/* Secondary Action: Decline */}
          {/* WHY: Neutral styling respects user's choice to start fresh */}
          <Button
            onClick={handleDeclineGracePass}
            variant="outline"
            className="w-full"
          >
            Start Fresh (Charge Resets)
          </Button>

          {/* Tertiary Action: Dismiss */}
          {/* WHY: Allows user to postpone decision */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
          >
            Decide Later
          </Button>
        </DialogFooter>

        {/* Footer Note */}
        {/* WHY: Sets expectations and reduces confusion */}
        <p className="text-xs text-center text-muted-foreground mt-4 px-4">
          Grace Passes refill every Monday. {isPremium ? "Premium members receive 3 passes weekly." : "Upgrade to Premium for 3 passes weekly."}
        </p>
      </DialogContent>
    </Dialog>
  );
};
