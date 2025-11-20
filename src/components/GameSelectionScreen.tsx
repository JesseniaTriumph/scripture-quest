import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Keyboard, 
  Shuffle, 
  Grid3x3, 
  Brain, 
  Zap,
  Lock,
  ArrowLeft
} from "lucide-react";
import { useVerseProgress } from "@/hooks/useVerseProgress";

interface GameType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  requiredMastery: number;
  stage: "LEARN" | "PRACTICE" | "MASTER";
  difficulty: "Easy" | "Medium" | "Hard";
}

const GAME_TYPES: GameType[] = [
  {
    id: "preview",
    name: "Preview Mode",
    description: "Read and familiarize yourself with the verse",
    icon: <Eye className="w-6 h-6" />,
    route: "/game/preview",
    requiredMastery: 0,
    stage: "LEARN",
    difficulty: "Easy"
  },
  {
    id: "copy",
    name: "Copy Mode",
    description: "Type the verse while viewing it",
    icon: <Keyboard className="w-6 h-6" />,
    route: "/game/copy",
    requiredMastery: 0,
    stage: "LEARN",
    difficulty: "Easy"
  },
  {
    id: "fill-blank",
    name: "Fill in the Blank",
    description: "Select the correct words to complete the verse",
    icon: <Grid3x3 className="w-6 h-6" />,
    route: "/game/fill-blank",
    requiredMastery: 1,
    stage: "PRACTICE",
    difficulty: "Medium"
  },
  {
    id: "scramble",
    name: "Word Scramble",
    description: "Unscramble the words to rebuild the verse",
    icon: <Shuffle className="w-6 h-6" />,
    route: "/game/scramble",
    requiredMastery: 1,
    stage: "PRACTICE",
    difficulty: "Medium"
  },
  {
    id: "recall",
    name: "Recall Mode",
    description: "Type the entire verse from memory",
    icon: <Brain className="w-6 h-6" />,
    route: "/game/recall",
    requiredMastery: 2,
    stage: "MASTER",
    difficulty: "Hard"
  },
  {
    id: "quick-tap",
    name: "Quick Tap",
    description: "Answer rapid-fire questions about the verse",
    icon: <Zap className="w-6 h-6" />,
    route: "/game/quick-tap",
    requiredMastery: 2,
    stage: "MASTER",
    difficulty: "Hard"
  }
];

export const GameSelectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const verseId = searchParams.get("verseId");
  const verseRef = searchParams.get("ref") || "Unknown";

  const { progress } = useVerseProgress(verseId || undefined);
  const currentMastery = progress?.mastery_level ?? 0;

  const getStageGames = (stage: string) => {
    return GAME_TYPES.filter(game => game.stage === stage);
  };

  const isGameUnlocked = (game: GameType) => {
    return currentMastery >= game.requiredMastery;
  };

  const handleGameSelect = (game: GameType) => {
    if (!isGameUnlocked(game)) return;
    navigate(`${game.route}?verseId=${verseId}`);
  };

  const stages = [
    { name: "LEARN", mastery: 0, unlocked: currentMastery >= 0 },
    { name: "PRACTICE", mastery: 1, unlocked: currentMastery >= 1 },
    { name: "MASTER", mastery: 2, unlocked: currentMastery >= 2 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Verses
          </Button>
          <h1 className="text-3xl font-bold mb-2">{verseRef}</h1>
          <p className="text-white/90">Choose your learning mode</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex-1 text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                stage.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {stage.unlocked ? "✓" : <Lock className="w-5 h-5" />}
              </div>
              <p className={`font-semibold ${stage.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {stage.name}
              </p>
              <p className="text-xs text-muted-foreground">Level {stage.mastery}+</p>
              {index < stages.length - 1 && (
                <div className={`h-1 w-full mt-2 ${stage.unlocked ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Game Selection by Stage */}
        {["LEARN", "PRACTICE", "MASTER"].map((stage) => {
          const stageGames = getStageGames(stage);
          const stageUnlocked = currentMastery >= (stage === "LEARN" ? 0 : stage === "PRACTICE" ? 1 : 2);

          return (
            <div key={stage} className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${!stageUnlocked && 'text-muted-foreground'}`}>
                {stage} Stage
                {!stageUnlocked && <Lock className="w-5 h-5 inline ml-2" />}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stageGames.map((game) => {
                  const unlocked = isGameUnlocked(game);
                  return (
                    <Card
                      key={game.id}
                      className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                        !unlocked && 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => handleGameSelect(game)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          unlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {game.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{game.name}</h3>
                            {!unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {game.description}
                          </p>
                          <div className="flex gap-2">
                            <Badge variant={
                              game.difficulty === "Easy" ? "secondary" :
                              game.difficulty === "Medium" ? "default" : "destructive"
                            }>
                              {game.difficulty}
                            </Badge>
                            {unlocked ? (
                              <Badge variant="outline" className="bg-success/10 text-success border-success">
                                Unlocked
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Level {game.requiredMastery} Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
