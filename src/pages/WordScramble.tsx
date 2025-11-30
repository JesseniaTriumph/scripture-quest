import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOilLamp } from "@/hooks/useOilLamp";
import { useSounds } from "@/hooks/useSounds";
import { ArrowLeft, RotateCcw, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { CharacterGuide } from "@/components/CharacterGuide";
import { CHARACTERS } from "@/types/characters";

interface Verse {
  id: string;
  reference: string;
  text: string;
  xp_reward: number;
}

export default function WordScramble() {
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { burnOil } = useOilLamp();
  const { playVictory } = useSounds();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPreview, setShowPreview] = useState(true);

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
      const words = data.text.split(/\s+/);
      const scrambled = [...words].sort(() => Math.random() - 0.5);
      setScrambledWords(words);
      setAvailableWords(scrambled);
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate, toast]);

  const handleWordClick = (word: string, index: number) => {
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (index: number) => {
    const word = selectedWords[index];
    setAvailableWords([...availableWords, word]);
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    if (!verse) return;
    const words = verse.text.split(/\s+/);
    const scrambled = [...words].sort(() => Math.random() - 0.5);
    setAvailableWords(scrambled);
    setSelectedWords([]);
    setIsComplete(false);
  };

  const handleCheck = async () => {
    setAttempts(prev => prev + 1);
    const userAnswer = selectedWords.join(" ");
    const correctAnswer = verse?.text;

    if (userAnswer === correctAnswer) {
      setIsComplete(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (user && verseId && verse) {
        await supabase.rpc("update_verse_progress", {
          p_user_id: user.id,
          p_verse_id: verseId,
          p_correct: true,
          p_xp_earned: verse.xp_reward,
          p_coins_earned: 5,
        });

        toast({
          title: "Perfect!",
          description: `You earned ${verse.xp_reward} XP and 5 coins!`,
        });
      }
    } else {
      await loseHeart();
      toast({
        title: "Not quite right",
        description: "Try again! The words need to be in the exact order.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    navigate(`/game-select?verseId=${verseId}&ref=${verse?.reference}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading verse...</p>
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
              <h1 className="text-2xl font-bold">Word Scramble</h1>
              <p className="text-white/90">Arrange the words in the correct order</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Lamp Oil</p>
              <p className="text-2xl font-bold">{hearts}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Character Guide - Kai for Practice stage */}
        <CharacterGuide 
          character={CHARACTERS.kai}
          message="Unscramble the words carefully. Every piece matters."
        />

        {showPreview ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">{verse?.reference}</h2>
            <p className="text-lg mb-6 leading-relaxed">{verse?.text}</p>
            <p className="text-muted-foreground mb-6">Read and memorize this verse. When you're ready, click below to start the game.</p>
            <Button
              onClick={() => setShowPreview(false)}
              className="gradient-primary text-white hover:opacity-90"
              size="lg"
            >
              I'm Ready - Start Game
            </Button>
          </Card>
        ) : (
          <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{verse?.reference}</h2>
            <p className="text-sm text-muted-foreground">Tap words to build the verse</p>
          </div>

          {/* Selected Words Area */}
          <div className="min-h-[200px] bg-primary/5 p-6 rounded-lg mb-6 border-2 border-dashed border-primary/20">
            {selectedWords.length === 0 ? (
              <p className="text-center text-muted-foreground">Tap words below to start building the verse</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedWords.map((word, index) => (
                  <Button
                    key={index}
                    onClick={() => handleRemoveWord(index)}
                    variant="secondary"
                    className="text-lg"
                  >
                    {word}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Available Words */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Available words:</p>
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <Button
                  key={index}
                  onClick={() => handleWordClick(word, index)}
                  variant="outline"
                  className="text-lg"
                >
                  {word}
                </Button>
              ))}
            </div>
          </div>

          {isComplete ? (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success text-success p-4 rounded-lg text-center">
                <CheckCircle className="w-6 h-6 inline mr-2" />
                Perfect! You've mastered this verse!
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
                disabled={selectedWords.length !== scrambledWords.length || hearts === 0}
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
        )}
      </div>
    </div>
  );
}
