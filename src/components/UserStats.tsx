import { Card } from "@/components/ui/card";
import { Trophy, Zap, Flame, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";

export const UserStats = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();

    // Subscribe to profile updates
    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user || loading) {
    return null;
  }

  if (!profile) {
    return null;
  }

  const xpToNextLevel = profile.level * 50;
  const xpProgress = (profile.xp % 50) / 50 * 100;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">Level {profile.level}</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {profile.xp % 50}/{xpToNextLevel % 50 || 50} XP to next level
              </p>
              <Progress value={xpProgress} className="h-1" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Zap className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{profile.xp}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <Flame className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{profile.streak_count}</p>
            <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Coins className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-500">{profile.coins}</p>
            <p className="text-xs text-muted-foreground">Coins</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
