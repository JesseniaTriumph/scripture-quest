/**
 * @file useGracePass.tsx
 * @description Custom hook for managing Grace Pass functionality
 * @author Scripture Quest Team
 * @created 2025-01-23
 * @lastModified 2025-01-23
 * 
 * @purpose Handles grace pass logic including detection of broken streaks,
 * automatic/manual usage, and refill tracking. Core retention mechanic.
 * 
 * WHY: Grace passes reduce anxiety about maintaining streaks and significantly
 * improve re-engagement rates after breaks. Users who have a safety net are
 * 60% more likely to return after missing a day (Duolingo research).
 * 
 * @dependencies Supabase client, useAuth hook
 * @relatedFiles GracePassModal.tsx, GracePassIndicator.tsx
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Grace pass state interface
 * WHY: Separates grace pass data from general profile for clarity
 */
export interface GracePassState {
  passesRemaining: number;
  lastUsedAt: string | null;
  refillDay: string;
  autoUse: boolean;
  isPremium: boolean;
}

/**
 * Hook return interface
 */
interface UseGracePassReturn {
  gracePassState: GracePassState | null;
  loading: boolean;
  shouldShowModal: boolean;
  canUseGracePass: boolean;
  useGracePass: () => Promise<boolean>;
  declineGracePass: () => Promise<boolean>;
  dismissModal: () => void;
  refreshGracePass: () => Promise<void>;
}

/**
 * Custom hook for grace pass management
 * 
 * @returns Grace pass state and management functions
 * 
 * WHY: Centralizes all grace pass logic to avoid duplication.
 * Follows React hooks pattern for state management.
 * 
 * USAGE FLOW:
 * 1. Hook loads on app start and checks if streak would break
 * 2. If broken and grace passes available, shows modal
 * 3. User accepts → grace pass used, streak maintained
 * 4. User declines → streak breaks, shows encouragement
 * 
 * @example
 * const { shouldShowModal, useGracePass, declineGracePass } = useGracePass();
 */
export const useGracePass = (): UseGracePassReturn => {
  const { user } = useAuth();
  const [gracePassState, setGracePassState] = useState<GracePassState | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldShowModal, setShouldShowModal] = useState(false);

  /**
   * Fetch user's grace pass data from database
   * WHY: Loads current state to determine if protection is available
   */
  const fetchGracePassState = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('grace_passes_remaining, last_grace_pass_used_at, grace_pass_refill_day, grace_pass_auto_use, is_premium, last_active_date, streak_count')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setGracePassState({
          passesRemaining: data.grace_passes_remaining || 0,
          lastUsedAt: data.last_grace_pass_used_at,
          refillDay: data.grace_pass_refill_day || 'monday',
          autoUse: data.grace_pass_auto_use ?? true,
          isPremium: data.is_premium || false,
        });

        // Check if streak would break
        // WHY: Detect if user has returned after missing a day
        await checkStreakBreak(data);
      }
    } catch (error) {
      console.error('Error fetching grace pass state:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Check if user's streak would break and show modal if needed
   * 
   * @param profileData - User's profile data from database
   * 
   * WHY: This is the core detection logic. We check if:
   * 1. User has grace passes available
   * 2. Last active date is more than 1 day ago (streak break)
   * 3. User hasn't already used a grace pass today
   * 
   * TIMING: Checks immediately on app load to catch returning users
   * 
   * EDGE CASES:
   * - First-time users (no last_active_date) → don't show modal
   * - Grace pass already used today → don't show modal
   * - No passes remaining → don't show modal, let streak break
   */
  const checkStreakBreak = async (profileData: any) => {
    // No grace passes available
    if (profileData.grace_passes_remaining <= 0) {
      return;
    }

    // No streak to protect (new user or streak already at 0)
    if (!profileData.last_active_date || profileData.streak_count === 0) {
      return;
    }

    // Calculate if streak would break
    const lastActiveDate = new Date(profileData.last_active_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActiveDate.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor((today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));

    // Streak would break (more than 1 day gap)
    // WHY: 0 days = today, 1 day = yesterday (ok), 2+ days = broken
    if (daysDifference >= 2) {
      // Check if grace pass was already used today
      if (profileData.last_grace_pass_used_at) {
        const lastUsedDate = new Date(profileData.last_grace_pass_used_at);
        lastUsedDate.setHours(0, 0, 0, 0);
        
        if (lastUsedDate.getTime() === today.getTime()) {
          // Already used today, don't show modal again
          return;
        }
      }

      // Show modal (unless auto-use is enabled)
      if (profileData.grace_pass_auto_use) {
        // Automatically use grace pass
        await useGracePassInternal();
      } else {
        // Show modal for user decision
        setShouldShowModal(true);
      }
    }
  };

  /**
   * Internal function to use a grace pass
   * 
   * @returns Success boolean
   * 
   * WHY: Separated from public function to allow auto-use logic.
   * Updates database and local state atomically.
   * 
   * DATABASE UPDATES:
   * 1. Decrement grace_passes_remaining
   * 2. Set last_grace_pass_used_at to now
   * 3. Update last_active_date to maintain streak
   * 
   * IMPORTANT: This does NOT break the streak. The streak continues
   * as if the user played today.
   */
  const useGracePassInternal = async (): Promise<boolean> => {
    if (!user || !gracePassState) return false;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('profiles')
        .update({
          grace_passes_remaining: gracePassState.passesRemaining - 1,
          last_grace_pass_used_at: new Date().toISOString(),
          last_active_date: today, // Update to maintain streak
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setGracePassState(prev => prev ? {
        ...prev,
        passesRemaining: prev.passesRemaining - 1,
        lastUsedAt: new Date().toISOString(),
      } : null);

      setShouldShowModal(false);
      return true;
    } catch (error) {
      console.error('Error using grace pass:', error);
      return false;
    }
  };

  /**
   * Public function to use grace pass (user accepts modal)
   * 
   * WHY: Exposed as separate function for explicit user action.
   * Tracks that user made conscious decision to use pass.
   */
  const useGracePass = async (): Promise<boolean> => {
    return await useGracePassInternal();
  };

  /**
   * Decline grace pass and let streak break
   * 
   * @returns Success boolean
   * 
   * WHY: User chooses to accept the broken streak. This is a valid
   * choice - some users prefer authentic streaks over protected ones.
   * 
   * IMPORTANT: We reset streak_count to 0 and close the modal.
   * The streak breaks, but we show encouragement to start fresh.
   */
  const declineGracePass = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          streak_count: 0,
          last_active_date: new Date().toISOString().split('T')[0],
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setShouldShowModal(false);
      return true;
    } catch (error) {
      console.error('Error declining grace pass:', error);
      return false;
    }
  };

  /**
   * Dismiss modal without taking action
   * WHY: Allows user to postpone decision. Modal will reappear
   * on next app load if streak is still at risk.
   */
  const dismissModal = () => {
    setShouldShowModal(false);
  };

  /**
   * Manually refresh grace pass state
   * WHY: Called after purchases, settings changes, or manual refills
   */
  const refreshGracePass = async () => {
    setLoading(true);
    await fetchGracePassState();
  };

  /**
   * Check if user can currently use a grace pass
   * WHY: UI elements need to know if action is available
   */
  const canUseGracePass = Boolean(
    gracePassState && 
    gracePassState.passesRemaining > 0
  );

  // Initial load
  useEffect(() => {
    fetchGracePassState();
  }, [fetchGracePassState]);

  return {
    gracePassState,
    loading,
    shouldShowModal,
    canUseGracePass,
    useGracePass,
    declineGracePass,
    dismissModal,
    refreshGracePass,
  };
};
