import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSounds } from './useSounds';

const MAX_OIL = 5;
const REGEN_TIME_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

interface Profile {
  hearts: number;
  hearts_updated_at: string;
  is_premium: boolean;
}

export const useOilLamp = () => {
  const { user } = useAuth();
  const { playBurn, playRefill } = useSounds();
  const [oil, setOil] = useState<number>(MAX_OIL);
  const [isPremium, setIsPremium] = useState(false);
  const [timeUntilRefill, setTimeUntilRefill] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const calculateRegeneratedOil = (
    currentOil: number,
    lastUpdated: string
  ): { oil: number; newTimestamp: string } => {
    if (currentOil >= MAX_OIL) {
      return { oil: currentOil, newTimestamp: lastUpdated };
    }

    const now = new Date();
    const lastUpdatedTime = new Date(lastUpdated);
    const timeDiff = now.getTime() - lastUpdatedTime.getTime();
    const oilToRegen = Math.floor(timeDiff / REGEN_TIME_MS);

    if (oilToRegen === 0) {
      return { oil: currentOil, newTimestamp: lastUpdated };
    }

    const newOil = Math.min(MAX_OIL, currentOil + oilToRegen);
    const timeForRegenOil = oilToRegen * REGEN_TIME_MS;
    const newTimestamp = new Date(
      lastUpdatedTime.getTime() + timeForRegenOil
    ).toISOString();

    return { oil: newOil, newTimestamp };
  };

  const fetchAndUpdateOil = async () => {
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

      // Premium users have unlimited oil
      if (profile.is_premium) {
        setOil(MAX_OIL);
        setTimeUntilRefill(0);
        setIsLoading(false);
        return;
      }

      // Calculate regenerated oil
      const { oil: newOil, newTimestamp } = calculateRegeneratedOil(
        profile.hearts,
        profile.hearts_updated_at
      );

      // Update in database if oil changed
      if (newOil !== profile.hearts) {
        await supabase
          .from('profiles')
          .update({
            hearts: newOil,
            hearts_updated_at: newTimestamp,
          })
          .eq('user_id', user.id);
      }

      setOil(newOil);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching oil:', error);
      setIsLoading(false);
    }
  };

  const burnOil = async () => {
    if (!user || isPremium || oil <= 0) return false;

    const newOil = oil - 1;
    const now = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          hearts: newOil,
          hearts_updated_at: now,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setOil(newOil);
      playBurn(); // Play burn sound when oil is lost
      return true;
    } catch (error) {
      console.error('Error burning oil:', error);
      return false;
    }
  };

  const refillOil = async (amount: number) => {
    if (!user) return false;

    const newOil = Math.min(MAX_OIL, oil + amount);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          hearts: newOil,
          hearts_updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setOil(newOil);
      playRefill(); // Play refill sound when oil is restored
      return true;
    } catch (error) {
      console.error('Error refilling oil:', error);
      return false;
    }
  };

  // Calculate time until next oil regenerates
  useEffect(() => {
    if (!user || isPremium || oil >= MAX_OIL) {
      setTimeUntilRefill(0);
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

      setTimeUntilRefill(Math.max(0, timeUntilNext));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [user, isPremium, oil]);

  // Check for oil regeneration every minute
  useEffect(() => {
    if (!user || isPremium) return;

    fetchAndUpdateOil();
    const interval = setInterval(fetchAndUpdateOil, 60000);

    return () => clearInterval(interval);
  }, [user, isPremium]);

  const formatTimeUntilNext = () => {
    if (timeUntilRefill === 0) return null;
    
    const minutes = Math.floor(timeUntilRefill / 60000);
    const seconds = Math.floor((timeUntilRefill % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    oil,
    maxOil: MAX_OIL,
    isPremium,
    isLoading,
    timeUntilRefill: formatTimeUntilNext(),
    burnOil,
    refillOil,
    refreshOil: fetchAndUpdateOil,
  };
};
