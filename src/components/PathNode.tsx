/**
 * @file PathNode.tsx
 * @description Individual node component in the path navigation system
 * @author Scripture Quest Team
 * @created 2025-01-23
 * @lastModified 2025-01-23
 * 
 * @purpose Renders a single node on the learning path with appropriate
 * visual states (locked, unlocked, completed) and handles user interaction.
 * Each node can represent a verse, milestone, or special challenge.
 * 
 * @dependencies PathNodeWithVerse interface, character assets
 * @relatedFiles PathView.tsx, usePathProgress.tsx
 */

import { PathNodeWithVerse } from "@/hooks/usePathProgress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, CheckCircle, Star, Book, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PathNodeProps {
  node: PathNodeWithVerse;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  onSelect: (node: PathNodeWithVerse) => void;
}

/**
 * PathNode Component
 * 
 * @param node - The node data to display
 * @param isUnlocked - Whether user can access this node
 * @param isCompleted - Whether user has completed this node
 * @param isCurrent - Whether this is the user's current position
 * @param onSelect - Callback when node is clicked
 * 
 * WHY: Separating node rendering into its own component allows for:
 * 1. Easier testing of individual node states
 * 2. Performance optimization via React.memo if needed
 * 3. Cleaner code separation of concerns
 * 
 * VISUAL STATES:
 * - Locked: Gray, lock icon, no interaction
 * - Unlocked: Colored, glowing effect, clickable
 * - Completed: Green checkmark, dimmed, still clickable for review
 * - Current: Extra glow effect, character appears
 * 
 * @example
 * <PathNode 
 *   node={nodeData} 
 *   isUnlocked={true}
 *   isCompleted={false}
 *   isCurrent={true}
 *   onSelect={handleNodeClick}
 * />
 */
export const PathNode = ({
  node,
  isUnlocked,
  isCompleted,
  isCurrent,
  onSelect,
}: PathNodeProps) => {
  
  /**
   * Get icon based on node type
   * WHY: Different node types have different visual identities
   * This helps users quickly recognize node purpose
   */
  const getNodeIcon = () => {
    switch (node.node_type) {
      case 'verse':
        return <Book className="h-6 w-6" />;
      case 'milestone':
        return <Trophy className="h-6 w-6" />;
      case 'daily_challenge':
        return <Star className="h-6 w-6" />;
      case 'character_story':
        return <Sparkles className="h-6 w-6" />;
      default:
        return <Book className="h-6 w-6" />;
    }
  };

  /**
   * Get display title for the node
   * WHY: Verse nodes show reference, special nodes show custom titles
   */
  const getNodeTitle = () => {
    if (node.node_type === 'verse' && node.verse) {
      return node.verse.reference;
    }
    return node.title || 'Special Challenge';
  };

  /**
   * Get node description/preview text
   * WHY: Gives users context about what this node contains
   */
  const getNodeDescription = () => {
    if (node.node_type === 'verse' && node.verse) {
      // Show first 60 characters of verse text
      // WHY: Preview helps users recognize verses they're working on
      const preview = node.verse.text.substring(0, 60);
      return preview.length < node.verse.text.length ? `${preview}...` : preview;
    }
    return node.description || 'Complete this challenge';
  };

  /**
   * Handle node click
   * WHY: Only allow interaction with unlocked nodes to prevent confusion
   */
  const handleClick = () => {
    if (!isUnlocked) return;
    onSelect(node);
  };

  return (
    <div className="relative flex items-center gap-4 mb-8">
      {/* Connecting line to previous node */}
      {/* WHY: Visual continuity shows progression path */}
      <div className={cn(
        "absolute left-1/2 -top-8 w-1 h-8 -translate-x-1/2",
        isCompleted ? "bg-primary" : "bg-border"
      )} />

      <Card
        className={cn(
          "relative w-full p-6 transition-all duration-300",
          // Locked state: grayed out, no hover
          !isUnlocked && "opacity-50 cursor-not-allowed",
          // Unlocked state: interactive, glow effect
          isUnlocked && !isCompleted && "hover:shadow-lg hover:scale-105 cursor-pointer border-primary/50",
          // Completed state: green accent, subtle
          isCompleted && "border-green-500/50 bg-green-500/5",
          // Current position: extra glow
          isCurrent && "ring-2 ring-primary animate-pulse-slow"
        )}
        onClick={handleClick}
      >
        <div className="flex items-start gap-4">
          {/* Node Icon */}
          <div className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
            isCompleted ? "bg-green-500 text-white" : "bg-primary/10 text-primary",
            !isUnlocked && "bg-muted text-muted-foreground"
          )}>
            {isCompleted ? (
              <CheckCircle className="h-6 w-6" />
            ) : !isUnlocked ? (
              <Lock className="h-6 w-6" />
            ) : (
              getNodeIcon()
            )}
          </div>

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{getNodeTitle()}</h3>
              
              {/* XP Reward Badge */}
              {node.node_type === 'verse' && node.verse && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                  +{node.verse.xp_reward} XP
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {getNodeDescription()}
            </p>

            {/* Character Appearance */}
            {/* WHY: Characters create emotional connection and variety */}
            {node.character_appearance && isUnlocked && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Guided by {node.character_appearance.charAt(0).toUpperCase() + node.character_appearance.slice(1)}</span>
              </div>
            )}

            {/* Action Button */}
            {isUnlocked && (
              <Button 
                size="sm" 
                className="mt-3"
                variant={isCompleted ? "outline" : "default"}
              >
                {isCompleted ? "Review" : "Start"}
              </Button>
            )}

            {/* Locked Message */}
            {!isUnlocked && (
              <p className="text-xs text-muted-foreground mt-2">
                Complete previous nodes to unlock
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
