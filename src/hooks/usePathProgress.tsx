/**
 * @file usePathProgress.tsx
 * @description Custom hook for managing user's path progression state
 * @author Scripture Quest Team
 * @created 2025-01-23
 * @lastModified 2025-01-23
 * 
 * @purpose Tracks user position on the learning path, completed nodes,
 * and determines which nodes are unlocked based on progression logic.
 * Implements the core state management for the path-based navigation system.
 * 
 * @dependencies Supabase client, useAuth hook
 * @relatedFiles PathView.tsx, PathNode.tsx, pathGenerator.ts
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Path node structure from database
 * WHY: Matches database schema for type safety
 */
export interface PathNode {
  id: string;
  collection_id: string | null;
  verse_id: string | null;
  node_type: 'verse' | 'daily_challenge' | 'milestone' | 'character_story';
  position: number;
  unlock_requirements: {
    min_xp?: number;
    prev_node_complete?: boolean;
    min_mastery?: number;
  };
  character_appearance: string | null;
  title: string | null;
  description: string | null;
  created_at: string;
}

/**
 * Verse data joined with path nodes
 * WHY: Combines path metadata with verse content for display
 */
export interface PathNodeWithVerse extends PathNode {
  verse?: {
    id: string;
    reference: string;
    text: string;
    difficulty: string;
    xp_reward: number;
  };
}

/**
 * User's path progression data
 * WHY: Tracks user state separately from global path structure
 */
interface PathProgress {
  currentPosition: number;
  completedNodes: string[];
  userXP: number;
}

/**
 * Hook return type
 */
interface UsePathProgressReturn {
  nodes: PathNodeWithVerse[];
  loading: boolean;
  currentPosition: number;
  completedNodes: string[];
  isNodeUnlocked: (node: PathNode) => boolean;
  completeNode: (nodeId: string) => Promise<void>;
  refreshNodes: () => Promise<void>;
}

/**
 * Custom hook to manage path progression
 * 
 * @returns Path nodes, progress state, and progression functions
 * 
 * WHY: Centralizes path logic to avoid duplication across components.
 * Follows React hooks pattern for reusability.
 * 
 * @example
 * const { nodes, isNodeUnlocked, completeNode } = usePathProgress();
 */
export const usePathProgress = (): UsePathProgressReturn => {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<PathNodeWithVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<PathProgress>({
    currentPosition: 0,
    completedNodes: [],
    userXP: 0,
  });

  /**
   * Fetch path nodes from database
   * WHY: Loads the complete path structure with verse data via JOIN.
   * Sorting by position ensures correct display order.
   */
  const fetchNodes = async () => {
    try {
      // Fetch all path nodes with related verse data
      // WHY: LEFT JOIN because milestone/challenge nodes don't have verses
      const { data, error } = await supabase
        .from('path_nodes')
        .select(`
          *,
          verse:verses(id, reference, text, difficulty, xp_reward)
        `)
        .order('position', { ascending: true });

      if (error) throw error;

      // Transform data to match interface
      // WHY: Supabase returns verse as array, we want single object or undefined
      const transformedNodes = (data || []).map(node => ({
        ...node,
        verse: Array.isArray(node.verse) 
          ? node.verse[0] 
          : node.verse || undefined
      }));

      setNodes(transformedNodes as PathNodeWithVerse[]);
    } catch (error) {
      console.error('Error fetching path nodes:', error);
    }
  };

  /**
   * Fetch user's current path progress
   * WHY: Determines which nodes are completed and where user currently is.
   * Separated from node fetch for performance (user data changes more frequently).
   */
  const fetchProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_path_position, path_completed_nodes, xp')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProgress({
          currentPosition: data.current_path_position || 0,
          completedNodes: data.path_completed_nodes || [],
          userXP: data.xp || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching path progress:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determine if a node is unlocked for the user
   * 
   * @param node - The path node to check
   * @returns true if node is unlocked, false otherwise
   * 
   * WHY: Implements progressive unlocking to guide users through content.
   * Uses multiple criteria (XP, previous completion, mastery) for gating.
   * 
   * UNLOCK LOGIC:
   * 1. First node is always unlocked
   * 2. Check XP requirement if specified
   * 3. Check if previous node completed (linear progression)
   * 4. Milestone nodes unlock automatically when reached
   */
  const isNodeUnlocked = (node: PathNode): boolean => {
    // First node is always unlocked
    if (node.position === 10) return true;

    // Already completed nodes are "unlocked"
    if (progress.completedNodes.includes(node.id)) return true;

    const requirements = node.unlock_requirements || {};

    // Check XP requirement
    // WHY: Prevents users from rushing ahead without building foundation
    if (requirements.min_xp && progress.userXP < requirements.min_xp) {
      return false;
    }

    // Check previous node completion requirement
    // WHY: Enforces linear progression through path
    if (requirements.prev_node_complete !== false) {
      // Find previous node
      const currentNodeIndex = nodes.findIndex(n => n.id === node.id);
      if (currentNodeIndex > 0) {
        const prevNode = nodes[currentNodeIndex - 1];
        if (!progress.completedNodes.includes(prevNode.id)) {
          return false;
        }
      }
    }

    // Milestone nodes unlock when user reaches that position
    // WHY: Milestones are celebrations, not barriers
    if (node.node_type === 'milestone') {
      return progress.currentPosition >= node.position;
    }

    return true;
  };

  /**
   * Mark a node as completed and update user progress
   * 
   * @param nodeId - UUID of the completed node
   * 
   * WHY: Updates both local state (instant feedback) and database (persistence).
   * Increments position to move user forward on path.
   * 
   * NOTE: This is called after a verse game is completed successfully.
   * XP/coin rewards are handled separately in game completion logic.
   */
  const completeNode = async (nodeId: string) => {
    if (!user) return;

    try {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      // Optimistic update
      // WHY: Provides instant feedback while database updates
      const newCompletedNodes = [...progress.completedNodes, nodeId];
      setProgress(prev => ({
        ...prev,
        completedNodes: newCompletedNodes,
        currentPosition: Math.max(prev.currentPosition, node.position),
      }));

      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({
          path_completed_nodes: newCompletedNodes,
          current_path_position: Math.max(progress.currentPosition, node.position),
        })
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (error) {
      console.error('Error completing node:', error);
      // Rollback optimistic update on error
      fetchProgress();
    }
  };

  /**
   * Refresh nodes and progress data
   * WHY: Allows manual refresh after external changes (e.g., new content added)
   */
  const refreshNodes = async () => {
    setLoading(true);
    await Promise.all([fetchNodes(), fetchProgress()]);
    setLoading(false);
  };

  // Initial data fetch on mount and when user changes
  // WHY: Load data when component first renders or user logs in/out
  useEffect(() => {
    fetchNodes();
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [user]);

  return {
    nodes,
    loading,
    currentPosition: progress.currentPosition,
    completedNodes: progress.completedNodes,
    isNodeUnlocked,
    completeNode,
    refreshNodes,
  };
};
