import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHearts } from "@/hooks/useHearts";
import { ArrowLeft, RotateCcw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface Verse {
  id: string;
  reference: string;
  text: string;
  xp_reward: number;
}

interface WordBlock {
  word: string;
  correctPosition: number;
  currentPosition: number | null;
}

export default function VerseBuilder() {
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hearts, loseHeart } = useHearts();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [wordBlocks, setWordBlocks] = useState<WordBlock[]>([]);
  const [placedWords, setPlacedWords] = useState<(string | null)[]>([]);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!verseId || !user) {
      navigate("/");
      return;
    }

    const fetchVerse = async () => {
      const { data, error } = await supabase
        .from("verses")
        .select("*")
        .eq("id", verseId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load verse",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setVerse(data);
      setupGame(data);
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate, toast]);

  const setupGame = (verseData: Verse) => {
    const words = verseData.text.split(/\s+/);
    const blocks: WordBlock[] = words.map((word, index) => ({
      word,
      correctPosition: index,
      currentPosition: null
    }));
    
    // Shuffle blocks
    const shuffled = [...blocks].sort(() => Math.random() - 0.5);
    setWordBlocks(shuffled);
    setPlacedWords(Array(words.length).fill(null));
  };

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleDrop = (position: number) => {
    if (!draggedWord) return;

    const newPlaced = [...placedWords];
    
    // Remove word from previous position if it was placed
    const prevIndex = newPlaced.indexOf(draggedWord);
    if (prevIndex !== -1) {
      newPlaced[prevIndex] = null;
    }

    // Place word in new position
    newPlaced[position] = draggedWord;
    setPlacedWords(newPlaced);
    setDraggedWord(null);
  };

  const handleRemoveWord = (position: number) => {
    const newPlaced = [...placedWords];
    newPlaced[position] = null;
    setPlacedWords(newPlaced);
  };

  const handleReset = () => {
    if (!verse) return;
    setupGame(verse);
    setAttempts(0);
    setIsComplete(false);
  };

  const handleCheck = async () => {
    if (!verse) return;

    setAttempts(prev => prev + 1);
    const correctAnswer = verse.text.split(/\s+/);
    const userAnswer = placedWords;

    let allCorrect = true;
    for (let i = 0; i < correctAnswer.length; i++) {
      if (userAnswer[i] !== correctAnswer[i]) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setIsComplete(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (user && verseId) {
        await supabase.rpc("update_verse_progress", {
          p_user_id: user.id,
          p_verse_id: verseId,
          p_correct: true,
          p_xp_earned: verse.xp_reward,
          p_coins_earned: 7,
        });

        toast({
          title: "Perfect Build!",
          description: `You earned ${verse.xp_reward} XP and 7 coins!`,
        });
      }
    } else {
      await loseHeart();
      toast({
        title: "Not quite right",
        description: "Check the word order and try again!",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    navigate(`/game-select?verseId=${verseId}&ref=${verse?.reference}`);
  };

  const availableWords = wordBlocks
    .map(block => block.word)
    .filter(word => !placedWords.includes(word));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/game-select?verseId=${verseId}&ref=${verse?.reference}`)}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Verse Builder</h1>
              <p className="text-white/90">Drag and drop words to build the verse</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Hearts</p>
              <p className="text-2xl font-bold">{hearts}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{verse?.reference}</h2>
            <p className="text-sm text-muted-foreground">Drag words into the correct positions</p>
          </div>

          {/* Drop Zones */}
          <div className="min-h-[300px] bg-primary/5 p-6 rounded-lg mb-6 border-2 border-dashed border-primary/20">
            <div className="flex flex-wrap gap-2">
              {placedWords.map((word, index) => (
                <div
                  key={index}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={`min-w-[80px] min-h-[50px] flex items-center justify-center border-2 border-dashed rounded-lg transition-all ${
                    word 
                      ? "bg-primary/10 border-primary cursor-pointer hover:bg-primary/20" 
                      : "border-muted-foreground/30 bg-muted/30"
                  }`}
                  onClick={() => word && handleRemoveWord(index)}
                >
                  {word ? (
                    <span className="text-lg font-medium px-3 py-2">{word}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">{index + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Available Words */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Available words (drag to position):</p>
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(word)}
                  className="px-4 py-3 bg-accent text-accent-foreground rounded-lg cursor-move hover:bg-accent/80 transition-all text-lg font-medium"
                >
                  {word}
                </div>
              ))}
            </div>
            {availableWords.length === 0 && !isComplete && (
              <p className="text-center text-muted-foreground text-sm mt-4">
                All words placed! Click "Check Answer" to verify.
              </p>
            )}
          </div>

          {isComplete ? (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success text-success p-4 rounded-lg text-center">
                <CheckCircle className="w-6 h-6 inline mr-2" />
                Perfect! You've built the verse correctly!
              </div>
              <Button
                onClick={handleComplete}
                className="w-full gradient-primary text-white hover:opacity-90"
                size="lg"
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleCheck}
                disabled={placedWords.includes(null) || hearts === 0}
                className="flex-1 gradient-primary text-white hover:opacity-90"
                size="lg"
              >
                Check Answer
              </Button>
            </div>
          )}

          {attempts > 0 && !isComplete && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Attempts: {attempts}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
