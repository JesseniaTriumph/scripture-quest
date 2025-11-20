import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const MAX_HEARTS = 5;
const REGEN_TIME_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

interface Profile {
  hearts: number;
  hearts_updated_at: string;
  is_premium: boolean;
}

export const useHearts = () => {
  const { user } = useAuth();
  const [hearts, setHearts] = useState<number>(MAX_HEARTS);
  const [isPremium, setIsPremium] = useState(false);
  const [timeUntilNextHeart, setTimeUntilNextHeart] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const calculateRegeneratedHearts = (
    currentHearts: number,
    lastUpdated: string
  ): { hearts: number; newTimestamp: string } => {
    if (currentHearts >= MAX_HEARTS) {
      return { hearts: currentHearts, newTimestamp: lastUpdated };
    }

    const now = new Date();
    const lastUpdatedTime = new Date(lastUpdated);
    const timeDiff = now.getTime() - lastUpdatedTime.getTime();
    const heartsToRegen = Math.floor(timeDiff / REGEN_TIME_MS);

    if (heartsToRegen === 0) {
      return { hearts: currentHearts, newTimestamp: lastUpdated };
    }

    const newHearts = Math.min(MAX_HEARTS, currentHearts + heartsToRegen);
    const timeForRegenHearts = heartsToRegen * REGEN_TIME_MS;
    const newTimestamp = new Date(
      lastUpdatedTime.getTime() + timeForRegenHearts
    ).toISOString();

    return { hearts: newHearts, newTimestamp };
  };

  const fetchAndUpdateHearts = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('hearts, hearts_updated_at, is_premium')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!profile) return;

      setIsPremium(profile.is_premium);

      // Premium users have unlimited hearts
      if (profile.is_premium) {
        setHearts(MAX_HEARTS);
        setTimeUntilNextHeart(0);
        setIsLoading(false);
        return;
      }

      // Calculate regenerated hearts
      const { hearts: newHearts, newTimestamp } = calculateRegeneratedHearts(
        profile.hearts,
        profile.hearts_updated_at
      );

      // Update in database if hearts changed
      if (newHearts !== profile.hearts) {
        await supabase
          .from('profiles')
          .update({
            hearts: newHearts,
            hearts_updated_at: newTimestamp,
          })
          .eq('user_id', user.id);
      }

      setHearts(newHearts);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching hearts:', error);
      setIsLoading(false);
    }
  };

  const loseHeart = async () => {
    if (!user || isPremium || hearts <= 0) return false;

    const newHearts = hearts - 1;
    const now = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          hearts: newHearts,
          hearts_updated_at: now,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setHearts(newHearts);
      return true;
    } catch (error) {
      console.error('Error losing heart:', error);
      return false;
    }
  };

  const addHearts = async (amount: number) => {
    if (!user) return false;

    const newHearts = Math.min(MAX_HEARTS, hearts + amount);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          hearts: newHearts,
          hearts_updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setHearts(newHearts);
      return true;
    } catch (error) {
      console.error('Error adding hearts:', error);
      return false;
    }
  };

  // Calculate time until next heart regenerates
  useEffect(() => {
    if (!user || isPremium || hearts >= MAX_HEARTS) {
      setTimeUntilNextHeart(0);
      return;
    }

    const updateCountdown = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('hearts_updated_at')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const now = new Date().getTime();
      const lastUpdated = new Date(profile.hearts_updated_at).getTime();
      const timeSinceUpdate = now - lastUpdated;
      const timeUntilNext = REGEN_TIME_MS - (timeSinceUpdate % REGEN_TIME_MS);

      setTimeUntilNextHeart(Math.max(0, timeUntilNext));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [user, isPremium, hearts]);

  // Check for hearts regeneration every minute
  useEffect(() => {
    if (!user || isPremium) return;

    fetchAndUpdateHearts();
    const interval = setInterval(fetchAndUpdateHearts, 60000);

    return () => clearInterval(interval);
  }, [user, isPremium]);

  const formatTimeUntilNext = () => {
    if (timeUntilNextHeart === 0) return null;
    
    const minutes = Math.floor(timeUntilNextHeart / 60000);
    const seconds = Math.floor((timeUntilNextHeart % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    hearts,
    maxHearts: MAX_HEARTS,
    isPremium,
    isLoading,
    timeUntilNextHeart: formatTimeUntilNext(),
    loseHeart,
    addHearts,
    refreshHearts: fetchAndUpdateHearts,
  };
};
