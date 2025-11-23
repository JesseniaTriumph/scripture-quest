-- Create daily_quests table for user quest tracking
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quest_type TEXT NOT NULL,
  quest_description TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  reward_coins INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_date, quest_type)
);

-- Enable RLS
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own quests"
ON public.daily_quests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quests"
ON public.daily_quests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests"
ON public.daily_quests
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_daily_quests_user_date ON public.daily_quests(user_id, quest_date);

-- Create function to auto-generate daily quests
CREATE OR REPLACE FUNCTION public.generate_daily_quests(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_quest_exists BOOLEAN;
BEGIN
  -- Check if quests already exist for today
  SELECT EXISTS(
    SELECT 1 FROM daily_quests 
    WHERE user_id = p_user_id AND quest_date = v_today
  ) INTO v_quest_exists;

  -- Only generate if no quests exist for today
  IF NOT v_quest_exists THEN
    -- Quest 1: Complete verses
    INSERT INTO daily_quests (user_id, quest_date, quest_type, quest_description, target_value, reward_xp, reward_coins)
    VALUES (p_user_id, v_today, 'complete_verses', 'Complete 3 verses', 3, 30, 15);

    -- Quest 2: Earn XP
    INSERT INTO daily_quests (user_id, quest_date, quest_type, quest_description, target_value, reward_xp, reward_coins)
    VALUES (p_user_id, v_today, 'earn_xp', 'Earn 50 XP', 50, 25, 10);

    -- Quest 3: Play different games
    INSERT INTO daily_quests (user_id, quest_date, quest_type, quest_description, target_value, reward_xp, reward_coins)
    VALUES (p_user_id, v_today, 'play_games', 'Play 2 different games', 2, 20, 10);
  END IF;
END;
$$;