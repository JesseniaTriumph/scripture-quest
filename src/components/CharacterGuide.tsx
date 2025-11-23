import { useState, useEffect, useMemo } from "react";
import { Character, getCharacterQuote } from "@/types/characters";
import { Card } from "@/components/ui/card";

interface CharacterGuideProps {
  character: Character;
  message?: string;
  position?: "top" | "bottom" | "float";
  animated?: boolean;
}

export const CharacterGuide = ({ 
  character, 
  message, 
  position = "top",
  animated = true 
}: CharacterGuideProps) => {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Memoize the quote to prevent it from changing on every render
  // WHY: getCharacterQuote returns random quote, causing constant re-animations
  const characterQuote = useMemo(() => getCharacterQuote(character), [character.name]);
  const finalMessage = message || characterQuote;

  useEffect(() => {
    // Reset and start animation only when message changes
    if (!animated) {
      setDisplayedMessage(finalMessage);
      setIsAnimating(false);
      return;
    }

    // Start fresh animation
    setDisplayedMessage("");
    setIsAnimating(true);
    let currentIndex = 0;
    let cancelled = false;

    const interval = setInterval(() => {
      if (cancelled) {
        clearInterval(interval);
        return;
      }

      if (currentIndex < finalMessage.length) {
        setDisplayedMessage(finalMessage.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsAnimating(false);
        clearInterval(interval);
      }
    }, 30);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [finalMessage, animated]);

  const positionClasses = {
    top: "mb-6",
    bottom: "mt-6",
    float: "fixed bottom-8 right-8 z-50 animate-fade-in"
  };

  return (
    <Card className={`p-4 ${positionClasses[position]} shadow-elegant`}>
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={character.imagePath}
            alt={`${character.name} - ${character.description}`}
            className="w-20 h-20 rounded-full object-cover border-4"
            style={{ borderColor: character.color }}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background"
            style={{ backgroundColor: character.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg" style={{ color: character.color }}>
              {character.name}
            </h3>
            <span className="text-xs text-muted-foreground">
              {character.description}
            </span>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm leading-relaxed">
              {displayedMessage}
              {animated && isAnimating && (
                <span className="animate-pulse">|</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
