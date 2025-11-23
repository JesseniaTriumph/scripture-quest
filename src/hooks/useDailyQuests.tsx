import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DailyQuest {
  id: string;
  quest_type: string;
  quest_description: string;
  target_value: number;
  current_progress: number;
  reward_xp: number;
  reward_coins: number;
  completed: boolean;
  completed_at: string | null;
}

export const useDailyQuests = (userId: string | undefined) => {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuests = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Generate quests for today if they don't exist
      await supabase.rpc("generate_daily_quests", { p_user_id: userId });

      // Fetch today's quests
      const { data, error } = await supabase
        .from("daily_quests")
        .select("*")
        .eq("user_id", userId)
        .eq("quest_date", new Date().toISOString().split("T")[0])
        .order("created_at", { ascending: true });

      if (error) throw error;

      setQuests(data || []);
    } catch (error) {
      console.error("Error fetching daily quests:", error);
      toast({
        title: "Failed to load quests",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuestProgress = async (
    questType: string,
    incrementBy: number = 1
  ) => {
    if (!userId) return;

    try {
      const quest = quests.find((q) => q.quest_type === questType && !q.completed);
      if (!quest) return;

      const newProgress = Math.min(
        quest.current_progress + incrementBy,
        quest.target_value
      );
      const isCompleted = newProgress >= quest.target_value;

      const { error } = await supabase
        .from("daily_quests")
        .update({
          current_progress: newProgress,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq("id", quest.id);

      if (error) throw error;

      // Award rewards if completed
      if (isCompleted && !quest.completed) {
        // Fetch current profile to calculate new values
        const { data: profile } = await supabase
          .from("profiles")
          .select("xp, coins")
          .eq("user_id", userId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              xp: profile.xp + quest.reward_xp,
              coins: profile.coins + quest.reward_coins,
            })
            .eq("user_id", userId);
        }

        toast({
          title: "Quest Completed! 🎉",
          description: `Earned ${quest.reward_xp} XP and ${quest.reward_coins} coins!`,
        });
      }

      // Refresh quests
      await fetchQuests();
    } catch (error) {
      console.error("Error updating quest progress:", error);
    }
  };

  useEffect(() => {
    fetchQuests();

    // Set up realtime subscription
    const channel = supabase
      .channel("daily_quests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_quests",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchQuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    quests,
    loading,
    updateQuestProgress,
    refetch: fetchQuests,
  };
};
