import { GameCard } from "./GameCard";
import { Eye, Keyboard, Grid3x3, Shuffle, Brain, Zap, Grid2x2, Boxes } from "lucide-react";

export const GamesHub = () => {
  const games = [
    {
      title: "Preview Mode",
      description: "Read and familiarize yourself with the verse. Start your learning journey here!",
      icon: Eye,
      difficulty: "Easy" as const,
      xpReward: 25,
      isNew: false,
    },
    {
      title: "Copy Mode",
      description: "Type the verse while viewing it. Build muscle memory!",
      icon: Keyboard,
      difficulty: "Easy" as const,
      xpReward: 30,
      isNew: false,
    },
    {
      title: "Fill in the Blank",
      description: "Select the correct words to complete the verse. Test your knowledge!",
      icon: Grid3x3,
      difficulty: "Medium" as const,
      xpReward: 50,
    },
    {
      title: "Word Scramble",
      description: "Unscramble the words to rebuild the verse. Challenge your recall!",
      icon: Shuffle,
      difficulty: "Medium" as const,
      xpReward: 60,
    },
    {
      title: "Verse Builder",
      description: "Drag and drop words in the correct order. Build it piece by piece!",
      icon: Boxes,
      difficulty: "Medium" as const,
      xpReward: 65,
    },
    {
      title: "Memory Match",
      description: "Match verse references with their text. Train your memory!",
      icon: Grid2x2,
      difficulty: "Hard" as const,
      xpReward: 75,
    },
    {
      title: "Recall Mode",
      description: "Type the entire verse from memory. Ultimate challenge!",
      icon: Brain,
      difficulty: "Hard" as const,
      xpReward: 100,
    },
    {
      title: "Quick Tap",
      description: "Answer rapid-fire questions about the verse. Test your speed!",
      icon: Zap,
      difficulty: "Hard" as const,
      xpReward: 80,
    },
  ];

  return (
    <section id="games-hub" className="py-20 px-4">
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
