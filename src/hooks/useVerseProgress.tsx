import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface VerseProgress {
  id: string;
  verse_id: string;
  mastery_level: number;
  last_played_at: string;
  times_correct: number;
  times_wrong: number;
}

export const useVerseProgress = (verseId?: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<VerseProgress | null>(null);
  const [allProgress, setAllProgress] = useState<VerseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      if (verseId) {
        // Fetch specific verse progress
        const { data, error } = await supabase
          .from('verse_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('verse_id', verseId)
          .maybeSingle();

        if (!error && data) {
          setProgress(data);
        }
      } else {
        // Fetch all verse progress
        const { data, error } = await supabase
          .from('verse_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('last_played_at', { ascending: false });

        if (!error && data) {
          setAllProgress(data);
        }
      }
      setLoading(false);
    };

    fetchProgress();

    // Subscribe to progress updates
    const channel = supabase
      .channel('verse-progress-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verse_progress',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (verseId && payload.new.verse_id === verseId) {
              setProgress(payload.new as VerseProgress);
            }
            // Update all progress
            setAllProgress((prev) => {
              const filtered = prev.filter((p) => p.verse_id !== payload.new.verse_id);
              return [payload.new as VerseProgress, ...filtered];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, verseId]);

  const getMasteryLabel = (level: number): string => {
    switch (level) {
      case 0:
        return 'Beginner';
      case 1:
        return 'Learning';
      case 2:
        return 'Advanced';
      case 3:
        return 'Mastered';
      default:
        return 'Unknown';
    }
  };

  const getMasteryColor = (level: number): string => {
    switch (level) {
      case 0:
        return 'text-muted-foreground';
      case 1:
        return 'text-blue-500';
      case 2:
        return 'text-purple-500';
      case 3:
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAccuracy = (progress: VerseProgress | null): number => {
    if (!progress) return 0;
    const total = progress.times_correct + progress.times_wrong;
    if (total === 0) return 0;
    return Math.round((progress.times_correct / total) * 100);
  };

  return {
    progress,
    allProgress,
    loading,
    getMasteryLabel,
    getMasteryColor,
    getAccuracy,
  };
};
