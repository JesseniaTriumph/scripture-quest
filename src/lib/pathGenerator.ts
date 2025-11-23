/**
 * @file pathGenerator.ts
 * @description Utility functions for generating and managing path nodes
 * @author Scripture Quest Team
 * @created 2025-01-23
 * @lastModified 2025-01-23
 * 
 * @purpose Provides helper functions for path generation, node creation,
 * and dynamic path modifications (e.g., inserting daily challenges).
 * Not used directly in initial implementation but prepared for Phase 2.
 * 
 * @dependencies Supabase client
 * @relatedFiles usePathProgress.tsx, PathView.tsx
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Generate milestone nodes at specified intervals
 * 
 * @param interval - How often to place milestones (e.g., every 5 verses)
 * @returns Array of milestone node positions
 * 
 * WHY: Milestones break up the monotony and create celebration moments.
 * Research shows that regular positive reinforcement increases engagement.
 * Placed BETWEEN verse nodes using position - 1.
 * 
 * NOTE: This is a planning utility. Actual milestones are created via
 * SQL migration. This function is for future dynamic generation.
 */
export const generateMilestonePositions = (
  totalVerses: number,
  interval: number = 5
): number[] => {
  const positions: number[] = [];
  
  // Start at interval, skip first verse (no milestone before first)
  for (let i = interval; i <= totalVerses; i += interval) {
    // Position calculation: verse is at i*10, milestone at i*10-1
    positions.push(i * 10 - 1);
  }
  
  return positions;
};

/**
 * Insert a daily challenge node dynamically
 * 
 * @param userId - User's UUID
 * @param position - Where to insert the challenge in the path
 * @returns Created node ID or null on error
 * 
 * WHY: Daily challenges add variety and prevent path from feeling static.
 * These are inserted "just ahead" of user's current position to encourage
 * daily return visits.
 * 
 * FUTURE USE: Phase 2 - Daily Quests System
 * This will be called by an edge function that runs daily to insert
 * personalized challenges into each user's path.
 * 
 * TODO: [PHASE-2] Implement this with edge function scheduler
 */
export const insertDailyChallenge = async (
  userId: string,
  position: number
): Promise<string | null> => {
  try {
    // Insert between existing nodes (position + 0.5 not possible with integer)
    // WHY: Position will be calculated as currentPosition + 5 typically
    const { data, error } = await supabase
      .from('path_nodes')
      .insert({
        node_type: 'daily_challenge',
        position: position,
        title: 'Daily Challenge',
        description: 'Complete today\'s special challenge!',
        character_appearance: 'kai', // Kai is the disciplinarian/challenger
        unlock_requirements: {
          prev_node_complete: true,
        },
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error inserting daily challenge:', error);
    return null;
  }
};

/**
 * Calculate unlock requirements for a node
 * 
 * @param position - Node position in path
 * @param nodeType - Type of node
 * @returns Unlock requirements object
 * 
 * WHY: Centralized logic for determining unlock criteria based on position.
 * Makes it easy to adjust difficulty curve.
 * 
 * UNLOCK STRATEGY:
 * - First 10 nodes: No XP requirement (onboarding)
 * - 11-30 nodes: Minimal XP requirement (building habit)
 * - 31+ nodes: Scaled XP requirement (mastery phase)
 * 
 * This creates a gentle difficulty curve that doesn't overwhelm beginners
 * but maintains challenge for advanced users.
 */
export const calculateUnlockRequirements = (
  position: number,
  nodeType: 'verse' | 'daily_challenge' | 'milestone' | 'character_story'
) => {
  const requirements: {
    min_xp?: number;
    prev_node_complete?: boolean;
    min_mastery?: number;
  } = {};

  // All nodes except first require previous node completion
  // WHY: Enforces linear progression, prevents skipping
  if (position > 10) {
    requirements.prev_node_complete = true;
  }

  // XP requirements scale with position
  // WHY: Users need to earn XP through repetition and mastery
  if (position > 100) { // After ~10 verses
    requirements.min_xp = Math.floor((position / 10) * 50);
  }

  // Milestones don't have extra requirements
  // WHY: They're celebrations, not barriers
  if (nodeType === 'milestone') {
    delete requirements.min_xp;
  }

  return requirements;
};

/**
 * Get the appropriate character for a node position
 * 
 * @param position - Node position in path
 * @param nodeType - Type of node
 * @returns Character name
 * 
 * WHY: Characters rotate to maintain variety, but specific characters
 * appear at thematically appropriate moments:
 * - Hope: Milestones and beginnings
 * - Kai: Challenges and difficult verses
 * - Selah: Rest/reflection milestones
 * - Others: Rotate through standard verses
 * 
 * This creates narrative coherence and emotional variety.
 */
export const getCharacterForNode = (
  position: number,
  nodeType: 'verse' | 'daily_challenge' | 'milestone' | 'character_story'
): string => {
  // Special cases
  if (nodeType === 'milestone') return 'hope';
  if (nodeType === 'daily_challenge') return 'kai';
  if (nodeType === 'character_story') return 'selah';

  // Regular verse rotation (8 characters)
  // WHY: Keeps the journey feeling fresh and varied
  const characters = ['hope', 'marcus', 'selah', 'phoebe', 'kai', 'zola', 'rhys', 'juno'];
  const verseNumber = Math.floor(position / 10);
  return characters[verseNumber % characters.length];
};

/**
 * Regenerate path from current database state
 * 
 * @returns Success boolean
 * 
 * WHY: Admin utility to rebuild path structure if needed.
 * Useful for testing and content updates.
 * 
 * CAUTION: This will affect all users. Should only be called
 * during maintenance windows or by admin users.
 * 
 * TODO: [PHASE-4] Add admin authentication check
 */
export const regeneratePath = async (): Promise<boolean> => {
  try {
    // This would typically be an edge function call with admin auth
    // For now, it's a placeholder
    console.warn('regeneratePath: Not implemented - requires admin privileges');
    return false;
  } catch (error) {
    console.error('Error regenerating path:', error);
    return false;
  }
};
