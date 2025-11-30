import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOilLamp } from "@/hooks/useOilLamp";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { OilLampDisplay } from "@/components/OilLampDisplay";
import { CharacterGuide } from "@/components/CharacterGuide";
import { getCharacterForContext } from "@/types/characters";

interface Verse {
  id: string;
  reference: string;
  text: string;
  xp_reward: number;
}

export default function ScriptureReveal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const { user } = useAuth();
  const { oil, burnOil, refreshOil } = useOilLamp();

  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hiddenWord, setHiddenWord] = useState("");
  const [revealedLetters, setRevealedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);

  const maxWrongGuesses = 6;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

      if (error || !data) {
        toast.error("Failed to load verse");
        navigate("/");
        return;
      }

      setVerse(data);
      selectHiddenWord(data.text);
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate]);

  const selectHiddenWord = (text: string) => {
    // Select a key word (longest word, excluding common words)
    const commonWords = new Set(['the', 'and', 'but', 'for', 'not', 'with', 'that', 'this', 'from', 'they', 'have', 'been', 'were', 'said', 'are', 'his', 'her', 'was', 'all', 'you', 'will', 'him', 'her']);
    const words = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !commonWords.has(w));

    const selectedWord = words.sort((a, b) => b.length - a.length)[0] || "word";
    setHiddenWord(selectedWord.toUpperCase());
  };

  const handleLetterGuess = (letter: string) => {
    if (completed || failed || revealedLetters.has(letter)) return;

    const newRevealed = new Set(revealedLetters);
    newRevealed.add(letter);
    setRevealedLetters(newRevealed);

    if (hiddenWord.includes(letter)) {
      // Check if word is complete
      const isComplete = hiddenWord.split('').every(l => newRevealed.has(l));
      if (isComplete) {
        handleComplete(wrongGuesses);
      }
    } else {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= maxWrongGuesses) {
        handleFail();
      }
    }
  };

  const handleComplete = async (wrong: number) => {
    if (!verse || !user) return;

    setCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const remainingLights = maxWrongGuesses - wrong;
    const bonusXP = remainingLights * 10;
    const xpEarned = 45 + bonusXP;
    const coinsEarned = Math.floor(xpEarned / 10);

    try {
      await supabase.rpc("update_verse_progress", {
        p_user_id: user.id,
        p_verse_id: verse.id,
        p_correct: true,
        p_xp_earned: xpEarned,
        p_coins_earned: coinsEarned
      });

      toast.success(`Revealed! Earned ${xpEarned} XP and ${coinsEarned} coins!`);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleFail = async () => {
    if (!user) return;

    setFailed(true);
    await burnOil();
    await refreshOil();
    toast.error("Out of revelation lights! Try again.");
  };

  const renderWord = () => {
    return hiddenWord.split('').map((letter, idx) => (
      <span key={idx} className="inline-block w-8 sm:w-10 h-10 sm:h-12 border-b-2 border-primary mx-1 text-center text-2xl font-bold">
        {revealedLetters.has(letter) ? letter : ''}
      </span>
    ));
  };

  const renderRevelationLights = () => {
    const lights = Array(maxWrongGuesses).fill(null);
    return (
      <div className="flex gap-2 justify-center">
        {lights.map((_, idx) => (
          <Lightbulb
            key={idx}
            className={`w-8 h-8 ${
              idx < wrongGuesses
                ? "text-muted fill-muted"
                : "text-yellow-500 fill-yellow-500"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!verse) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <OilLampDisplay />
        </div>

        <h1 className="text-2xl font-bold text-center">{verse.reference}</h1>

        <CharacterGuide 
          character={getCharacterForContext("master")} 
          message={completed 
            ? "Incredible! You revealed the word! The light of understanding is yours! 🌟" 
            : failed
            ? "Don't give up! Try again and the word will be revealed."
            : "Guess letters to reveal the hidden word. Each wrong guess dims a light!"
          }
        />

        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Revelation Lights Remaining</p>
              {renderRevelationLights()}
            </div>

            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">Reveal the hidden word:</p>
              <div className="flex flex-wrap justify-center">
                {renderWord()}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
              {alphabet.map(letter => (
                <Button
                  key={letter}
                  variant={revealedLetters.has(letter) ? "secondary" : "outline"}
                  size="sm"
                  disabled={revealedLetters.has(letter) || completed || failed}
                  onClick={() => handleLetterGuess(letter)}
                  className="aspect-square"
                >
                  {letter}
                </Button>
              ))}
            </div>

            {completed && (
              <div className="text-center space-y-4 pt-4 border-t">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Word revealed! 🎉
                </p>
                <p className="text-muted-foreground">The word was: <span className="font-bold">{hiddenWord}</span></p>
                <Button onClick={() => navigate(`/game-select?verseId=${verseId}&verseRef=${verse.reference}`)}>
                  Continue
                </Button>
              </div>
            )}

            {failed && (
              <div className="text-center space-y-4 pt-4 border-t">
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  All revelation lights dimmed 💔
                </p>
                <p className="text-muted-foreground">The word was: <span className="font-bold">{hiddenWord}</span></p>
                <Button onClick={() => navigate(`/game-select?verseId=${verseId}&verseRef=${verse.reference}`)}>
                  Try Another Game
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
