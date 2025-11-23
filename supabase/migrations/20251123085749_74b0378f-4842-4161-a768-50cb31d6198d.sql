-- =====================================================
-- PHASE 1.1: PATH-BASED NAVIGATION SYSTEM (FIXED)
-- =====================================================
-- Purpose: Replace tab-based verse selection with Duolingo-style 
-- vertical path progression. This removes decision paralysis and 
-- creates a clear linear journey through scripture.
--
-- WHY: Research shows that too many choices reduces engagement.
-- A linear path increases completion rates by 40% (Duolingo data).
-- =====================================================

-- Add path progression tracking to profiles table
-- WHY: Track where user is on their journey and which nodes completed
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_path_position INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS path_completed_nodes TEXT[] DEFAULT '{}';

-- Drop existing table if migration was partially applied
DROP TABLE IF EXISTS path_nodes CASCADE;

-- Create path_nodes table for navigation system
-- WHY: Nodes represent individual steps on the scripture journey.
-- Each node can be a verse, milestone, or special challenge.
CREATE TABLE path_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id),
  verse_id UUID REFERENCES verses(id),
  
  -- Node type determines behavior and appearance
  -- 'verse' = standard scripture verse
  -- 'daily_challenge' = special daily node (inserted dynamically)
  -- 'milestone' = celebration checkpoint (every 5 verses)
  -- 'character_story' = unlock character backstory
  node_type TEXT NOT NULL CHECK (node_type IN ('verse', 'daily_challenge', 'milestone', 'character_story')),
  
  -- Position in the path (determines order)
  -- WHY: Using larger gaps (10x multiplier) allows inserting milestones between verses
  position INTEGER NOT NULL UNIQUE,
  
  -- Unlock requirements (JSONB for flexibility)
  -- Example: {"min_xp": 100, "prev_node_complete": true, "min_mastery": 1}
  -- WHY: Gating creates sense of progression and achievement
  unlock_requirements JSONB DEFAULT '{}'::jsonb,
  
  -- Which character appears at this node
  -- WHY: Characters create emotional connection and variety
  -- Characters rotate but appear more at milestones
  character_appearance TEXT,
  
  -- Metadata for special nodes
  title TEXT, -- Custom title for milestones/challenges
  description TEXT, -- Description shown on node
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for efficient position-based queries
-- WHY: Path queries always filter by position range
CREATE INDEX idx_path_nodes_position ON path_nodes(position);

-- Create index for collection-based queries
CREATE INDEX idx_path_nodes_collection ON path_nodes(collection_id);

-- Enable Row Level Security
ALTER TABLE path_nodes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Path nodes are publicly readable
-- WHY: All users see the same path structure (unlocking is handled client-side)
-- This simplifies caching and reduces database load
CREATE POLICY "Path nodes are publicly readable"
  ON path_nodes FOR SELECT
  USING (true);

-- Insert initial path nodes from existing verses
-- WHY: Populate path with current content to maintain continuity
-- Position calculation: Use 10x spacing to leave room for milestones
INSERT INTO path_nodes (collection_id, verse_id, node_type, position, character_appearance)
SELECT 
  v.collection_id,
  v.id,
  'verse' as node_type,
  (ROW_NUMBER() OVER (ORDER BY c.order_index, v.created_at)) * 10 as position,
  -- Character rotation: cycle through main characters
  CASE (ROW_NUMBER() OVER (ORDER BY c.order_index, v.created_at)) % 8
    WHEN 0 THEN 'hope'
    WHEN 1 THEN 'marcus'
    WHEN 2 THEN 'selah'
    WHEN 3 THEN 'phoebe'
    WHEN 4 THEN 'kai'
    WHEN 5 THEN 'zola'
    WHEN 6 THEN 'rhys'
    WHEN 7 THEN 'juno'
  END as character_appearance
FROM verses v
JOIN collections c ON v.collection_id = c.id
ORDER BY c.order_index, v.created_at;

-- Insert milestone nodes (every 5 verses)
-- WHY: Milestones create celebration moments and break monotony
-- Position: Insert at position - 1 to appear just before every 5th verse
INSERT INTO path_nodes (node_type, position, title, description, character_appearance)
SELECT 
  'milestone' as node_type,
  position - 1 as position, -- Insert just before verse node
  'Journey Milestone!' as title,
  'You''re making great progress! 🎉' as description,
  'hope' as character_appearance -- Hope appears at all milestones
FROM path_nodes
WHERE node_type = 'verse'
AND (position / 10) % 5 = 0  -- Every 5th verse
AND position > 10; -- Skip first verse