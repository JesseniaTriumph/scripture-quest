import { GameCard } from "./GameCard";
import { Search, Grid3x3, Type, Trophy, Puzzle, Target, Heart, Zap } from "lucide-react";

export const GamesHub = () => {
  const games = [
    {
      title: "Verse Completion",
      description: "Fill in the missing words from memory. Perfect for reinforcing what you've learned!",
      icon: Type,
      difficulty: "Easy" as const,
      xpReward: 50,
      isNew: true,
    },
    {
      title: "Word Search",
      description: "Find key words hidden in the puzzle. Great for vocabulary building!",
      icon: Search,
      difficulty: "Easy" as const,
      xpReward: 40,
      isNew: true,
    },
    {
      title: "Memory Match",
      description: "Match verses with their references. Train your memory and recall!",
      icon: Grid3x3,
      difficulty: "Medium" as const,
      xpReward: 75,
    },
    {
      title: "Bible Jeopardy",
      description: "Answer questions about verses and their context. Test your knowledge!",
      icon: Trophy,
      difficulty: "Medium" as const,
      xpReward: 80,
    },
    {
      title: "Verse Crossword",
      description: "Solve crossword clues using scripture references. Challenge accepted!",
      icon: Puzzle,
      difficulty: "Hard" as const,
      xpReward: 100,
      isLocked: true,
    },
    {
      title: "Scripture Hangman",
      description: "Guess the verse phrase letter by letter. Classic fun with purpose!",
      icon: Target,
      difficulty: "Easy" as const,
      xpReward: 45,
      isLocked: true,
    },
    {
      title: "Verse Typing Race",
      description: "Type verses from memory as fast as you can. Speed and accuracy count!",
      icon: Zap,
      difficulty: "Hard" as const,
      xpReward: 120,
      isLocked: true,
    },
    {
      title: "Wheel of Scripture",
      description: "Spin to reveal letters and complete verses. Exciting game show style!",
      icon: Heart,
      difficulty: "Medium" as const,
      xpReward: 90,
      isLocked: true,
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            8 Fun Ways to Learn
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your favorite game mode or try them all! Each game is designed to help you memorize scripture in a unique and engaging way.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <GameCard key={index} {...game} />
          ))}
        </div>
      </div>
    </section>
  );
};
