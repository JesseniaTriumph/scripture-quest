-- Phase 4.1: Add SRS (Spaced Repetition System) tracking columns to verse_progress
-- WHY: Enable multi-day, multi-game progression with spaced repetition learning

-- Add SRS tracking columns to verse_progress table
ALTER TABLE verse_progress 
ADD COLUMN strength_score DECIMAL(3,2) DEFAULT 0.00 CHECK (strength_score >= 0 AND strength_score <= 5),
ADD COLUMN next_review_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN avg_completion_time INTEGER DEFAULT 0 CHECK (avg_completion_time >= 0),
ADD COLUMN stage TEXT DEFAULT 'learning' CHECK (stage IN ('learning', 'practice', 'master', 'review')),
ADD COLUMN games_completed TEXT[] DEFAULT '{}',
ADD COLUMN last_review_interval INTEGER DEFAULT 1 CHECK (last_review_interval > 0),
ADD COLUMN ease_factor DECIMAL(3,2) DEFAULT 2.50 CHECK (ease_factor >= 1.30);

-- Create index for efficient review queue queries
CREATE INDEX idx_verse_progress_next_review 
ON verse_progress(user_id, next_review_date) 
WHERE next_review_date IS NOT NULL;

-- Create index for stage-based queries
CREATE INDEX idx_verse_progress_stage 
ON verse_progress(user_id, stage);

-- Create game_sessions table to track individual game attempts
-- WHY: Track detailed performance data for strength calculation and adaptive learning
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  verse_id UUID NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN (
    'preview', 'copy', 'fill-blank', 'word-scramble', 'verse-builder',
    'memory-match', 'recall', 'quick-tap', 'word-search'
  )),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_time INTEGER NOT NULL CHECK (completion_time > 0), -- seconds
  accuracy DECIMAL(3,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1), -- 0.00 to 1.00
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts > 0),
  xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
  coins_earned INTEGER DEFAULT 0 CHECK (coins_earned >= 0),
  CONSTRAINT fk_game_sessions_user_id FOREIGN KEY (user_id) 
    REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- Create indexes for game_sessions queries
CREATE INDEX idx_game_sessions_user_verse 
ON game_sessions(user_id, verse_id, completed_at DESC);

CREATE INDEX idx_game_sessions_user_completed 
ON game_sessions(user_id, completed_at DESC);

-- Enable RLS on game_sessions
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_sessions
CREATE POLICY "Users can view their own game sessions" 
ON game_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game sessions" 
ON game_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions" 
ON game_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON COLUMN verse_progress.strength_score IS 'SRS strength score (0.00-5.00): 0-2=weak, 2-3.5=moderate, 3.5-5=strong';
COMMENT ON COLUMN verse_progress.stage IS 'Learning stage: learning → practice → master → review';
COMMENT ON COLUMN verse_progress.games_completed IS 'Array of completed game types for this verse';
COMMENT ON COLUMN verse_progress.ease_factor IS 'SM-2 ease factor for review interval calculation (1.3-2.5+)';
COMMENT ON TABLE game_sessions IS 'Tracks individual game attempts for detailed performance analytics and strength calculation';