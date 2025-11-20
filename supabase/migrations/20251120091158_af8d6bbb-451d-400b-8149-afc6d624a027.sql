-- Create verse_progress table to track user progress on individual verses
CREATE TABLE public.verse_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id UUID NOT NULL REFERENCES public.verses(id) ON DELETE CASCADE,
  mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 3),
  last_played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  times_correct INTEGER NOT NULL DEFAULT 0,
  times_wrong INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, verse_id)
);

-- Enable Row Level Security
ALTER TABLE public.verse_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verse_progress
CREATE POLICY "Users can view their own verse progress"
ON public.verse_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verse progress"
ON public.verse_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verse progress"
ON public.verse_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_verse_progress_user_id ON public.verse_progress(user_id);
CREATE INDEX idx_verse_progress_verse_id ON public.verse_progress(verse_id);
CREATE INDEX idx_verse_progress_mastery ON public.verse_progress(mastery_level);

-- Create function to update or insert verse progress
CREATE OR REPLACE FUNCTION public.update_verse_progress(
  p_user_id UUID,
  p_verse_id UUID,
  p_correct BOOLEAN,
  p_xp_earned INTEGER DEFAULT 0,
  p_coins_earned INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_correct INTEGER;
  v_current_wrong INTEGER;
  v_current_mastery INTEGER;
  v_new_mastery INTEGER;
BEGIN
  -- Get current progress or create new record
  SELECT times_correct, times_wrong, mastery_level
  INTO v_current_correct, v_current_wrong, v_current_mastery
  FROM verse_progress
  WHERE user_id = p_user_id AND verse_id = p_verse_id;

  -- If no record exists, initialize values
  IF NOT FOUND THEN
    v_current_correct := 0;
    v_current_wrong := 0;
    v_current_mastery := 0;
  END IF;

  -- Update counters
  IF p_correct THEN
    v_current_correct := v_current_correct + 1;
  ELSE
    v_current_wrong := v_current_wrong + 1;
  END IF;

  -- Calculate new mastery level
  -- Mastery increases with correct answers and good accuracy
  IF v_current_correct >= 10 AND v_current_correct >= v_current_wrong * 3 THEN
    v_new_mastery := 3; -- Fully mastered
  ELSIF v_current_correct >= 5 AND v_current_correct >= v_current_wrong * 2 THEN
    v_new_mastery := 2; -- Advanced
  ELSIF v_current_correct >= 2 THEN
    v_new_mastery := 1; -- Learning
  ELSE
    v_new_mastery := 0; -- Beginner
  END IF;

  -- Upsert verse progress
  INSERT INTO verse_progress (
    user_id,
    verse_id,
    mastery_level,
    last_played_at,
    times_correct,
    times_wrong
  )
  VALUES (
    p_user_id,
    p_verse_id,
    v_new_mastery,
    now(),
    v_current_correct,
    v_current_wrong
  )
  ON CONFLICT (user_id, verse_id)
  DO UPDATE SET
    mastery_level = v_new_mastery,
    last_played_at = now(),
    times_correct = v_current_correct,
    times_wrong = v_current_wrong;

  -- Update user profile with XP and coins
  IF p_xp_earned > 0 OR p_coins_earned > 0 THEN
    UPDATE profiles
    SET
      xp = xp + p_xp_earned,
      coins = coins + p_coins_earned,
      level = CASE
        WHEN (xp + p_xp_earned) >= level * 50 THEN level + 1
        ELSE level
      END
    WHERE user_id = p_user_id;
  END IF;
END;
$$;