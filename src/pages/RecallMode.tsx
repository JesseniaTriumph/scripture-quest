import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOilLamp } from "@/hooks/useOilLamp";
import { useSounds } from "@/hooks/useSounds";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { CharacterGuide } from "@/components/CharacterGuide";
import { CHARACTERS, getCharacterForContext } from "@/types/characters";

interface Verse {
  id: string;
  reference: string;
  text: string;
  xp_reward: number;
}

export default function RecallMode() {
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { oil, burnOil } = useOilLamp();
  const { toast } = useToast();
  const { playVictory } = useSounds();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [showVerse, setShowVerse] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate, toast]);

  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
  };

  const calculateAccuracy = () => {
    if (!verse) return 0;
    const normalized = normalizeText(userInput);
    const target = normalizeText(verse.text);
    
    const inputWords = normalized.split(/\s+/);
    const targetWords = target.split(/\s+/);
    
    let correct = 0;
    const minLength = Math.min(inputWords.length, targetWords.length);
    
    for (let i = 0; i < minLength; i++) {
      if (inputWords[i] === targetWords[i]) correct++;
    }
    
    return Math.round((correct / targetWords.length) * 100);
  };

  const handleCheck = async () => {
    if (!verse || !user) return;

    setHasChecked(true);
    const normalized = normalizeText(userInput);
    const target = normalizeText(verse.text);
    const accuracy = calculateAccuracy();

    if (normalized === target) {
      setIsCorrect(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      await supabase.rpc("update_verse_progress", {
        p_user_id: user.id,
        p_verse_id: verseId,
        p_correct: true,
        p_xp_earned: verse.xp_reward * 2, // Double XP for recall!
        p_coins_earned: 10,
      });

      toast({
        title: "Perfect Recall!",
        description: `Amazing! You earned ${verse.xp_reward * 2} XP and 10 coins!`,
      });
    } else {
      await burnOil();
      toast({
        title: accuracy >= 80 ? "Almost there!" : "Keep practicing",
        description: `You got ${accuracy}% correct. Try again!`,
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

  const accuracy = calculateAccuracy();

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary p-6 text-white">
        <div className="max-w-3xl mx-auto">
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
              <h1 className="text-2xl font-bold">Recall Mode</h1>
              <p className="text-white/90">Type the verse from memory</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Lamp Oil</p>
              <p className="text-2xl font-bold">{oil}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Character Guide - Marcus for Master stage */}
        <CharacterGuide 
          character={CHARACTERS.marcus}
          message="This requires deep focus. Take your time and recall what you've learned."
        />
        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{verse?.reference}</h2>
            <p className="text-sm text-muted-foreground">Can you recall the entire verse?</p>
          </div>

          {/* Peek Toggle */}
          <div className="mb-6 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVerse(!showVerse)}
            >
              {showVerse ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showVerse ? "Hide Verse" : "Peek at Verse"}
            </Button>
          </div>

          {/* Verse Display (when peeking) */}
          {showVerse && (
            <div className="bg-primary/5 p-6 rounded-lg mb-6">
              <p className="text-lg leading-relaxed text-center font-serif">
                {verse?.text}
              </p>
            </div>
          )}

          {/* Input Area */}
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the verse from memory..."
            className="min-h-[200px] text-lg mb-4"
            autoFocus
            disabled={hasChecked && isCorrect}
          />

          {/* Accuracy Display */}
          {hasChecked && !isCorrect && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Accuracy</span>
                <span className={`font-semibold ${accuracy >= 80 ? 'text-success' : 'text-destructive'}`}>
                  {accuracy}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    accuracy >= 80 ? 'bg-success' : 'bg-destructive'
                  }`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {isCorrect && (
            <div className="bg-success/10 border border-success text-success p-4 rounded-lg mb-6 text-center">
              <CheckCircle className="w-6 h-6 inline mr-2" />
              Perfect! You've completely mastered this verse!
            </div>
          )}

          {/* Action Buttons */}
          {isCorrect ? (
            <Button
              onClick={handleComplete}
              className="w-full gradient-primary text-white hover:opacity-90"
              size="lg"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleCheck}
              disabled={!userInput.trim() || oil === 0}
              className="w-full gradient-primary text-white hover:opacity-90"
              size="lg"
            >
              Check Answer
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
