/**
 * @file PathView.tsx
 * @description Main path navigation component - Duolingo-style vertical progression
 * @author Scripture Quest Team
 * @created 2025-01-23
 * @lastModified 2025-01-23
 * 
 * @purpose Replaces the tab-based VersesHub with a linear vertical path.
 * Displays all path nodes in order, showing user's progress and next steps.
 * Implements the core engagement loop of the app.
 * 
 * @dependencies PathNode, usePathProgress hook, game selection navigation
 * @relatedFiles PathNode.tsx, usePathProgress.tsx, GameSelectionScreen.tsx
 */

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PathNode } from "@/components/PathNode";
import { usePathProgress, PathNodeWithVerse } from "@/hooks/usePathProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

/**
 * PathView Component
 * 
 * WHY: This component is the heart of the engagement loop. Research shows
 * that reducing choice paralysis increases completion rates by 40%.
 * Duolingo's 2023 redesign to vertical paths significantly improved retention.
 * 
 * FEATURES:
 * - Vertical scrollable list of nodes
 * - Auto-scroll to current position on mount
 * - Visual connection lines between nodes
 * - Character appearances at key points
 * - Milestone celebrations every 5 verses
 * 
 * USER FLOW:
 * 1. User sees path with their current position highlighted
 * 2. Completed nodes show checkmarks, future nodes show locks
 * 3. Click unlocked node → navigate to game selection
 * 4. Complete game → node marked complete, next unlocks
 * 5. Every 5th verse → milestone celebration
 * 
 * @example
 * <PathView />
 */
export const PathView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    nodes,
    loading,
    currentPosition,
    completedNodes,
    isNodeUnlocked,
  } = usePathProgress();
  
  const currentNodeRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to current position on mount
   * WHY: Users should immediately see where they are, not start at top.
   * Reduces cognitive load by showing relevant context first.
   */
  useEffect(() => {
    if (!loading && currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [loading, currentPosition]);

  /**
   * Handle node selection
   * 
   * @param node - The selected path node
   * 
   * WHY: Different node types have different behaviors:
   * - Verse nodes → game selection screen
   * - Milestone nodes → celebration modal (future)
   * - Challenge nodes → special mini-game (future)
   */
  const handleNodeSelect = (node: PathNodeWithVerse) => {
    // Require authentication for verse games
    // WHY: Need user ID to track progress and award XP
    if (!user) {
      toast.error("Please sign in to start learning!");
      navigate("/auth");
      return;
    }

    // Handle verse nodes - navigate to game selection
    if (node.node_type === 'verse' && node.verse_id) {
      navigate(`/game-select?verseId=${node.verse_id}`);
      return;
    }

    // Handle milestone nodes - show celebration
    // WHY: Milestones are motivational checkpoints, not barriers
    if (node.node_type === 'milestone') {
      toast.success("Milestone reached! 🎉", {
        description: node.description || "You're making great progress!",
      });
      return;
    }

    // Placeholder for other node types
    // TODO: [PHASE-2] Implement daily challenges and character stories
    toast.info("Coming soon!", {
      description: "This feature is under development.",
    });
  };

  /**
   * Loading state skeleton
   * WHY: Provides visual feedback while data loads, reduces perceived wait time
   */
  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-3xl">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-12" />
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /**
   * Empty state - no nodes loaded
   * WHY: Should never happen in production, but handle gracefully
   */
  if (nodes.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="container max-w-3xl text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Path Available</h2>
          <p className="text-muted-foreground">
            Path content is being set up. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            Your Learning Path
          </h2>
          <p className="text-xl text-muted-foreground">
            Follow the path to master Scripture verse by verse
          </p>
          
          {/* Progress indicator */}
          {user && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">
                {completedNodes.length} of {nodes.length} completed
              </span>
            </div>
          )}
        </div>

        {/* Path nodes */}
        <div className="relative">
          {/* Starting point indicator */}
          <div className="absolute left-1/2 top-0 w-1 h-4 -translate-x-1/2 bg-primary" />
          
          {nodes.map((node, index) => {
            const isUnlocked = isNodeUnlocked(node);
            const isCompleted = completedNodes.includes(node.id);
            const isCurrent = node.position === currentPosition;

            return (
              <div
                key={node.id}
                ref={isCurrent ? currentNodeRef : null}
                className="relative"
              >
                <PathNode
                  node={node}
                  isUnlocked={isUnlocked}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  onSelect={handleNodeSelect}
                />
              </div>
            );
          })}

          {/* Path continues indicator */}
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-1 h-8 bg-gradient-to-b from-border to-transparent" />
              <span className="text-sm">More verses coming soon...</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { CheckCircle } from "lucide-react";
