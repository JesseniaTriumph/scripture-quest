import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CircleDollarSign } from "lucide-react";
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

type WheelSegment = "vowel" | "consonant" | "lose" | "jackpot";

export default function ScriptureSpinOff() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const { user } = useAuth();
  const { oil, burnOil, refreshOil } = useOilLamp();

  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [phrase, setPhrase] = useState("");
  const [revealedLetters, setRevealedLetters] = useState<Set<string>>(new Set());
  const [xpBank, setXpBank] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [currentSegment, setCurrentSegment] = useState<WheelSegment | null>(null);
  const [completed, setCompleted] = useState(false);
  const [canSolve, setCanSolve] = useState(false);

  const vowels = new Set(['A', 'E', 'I', 'O', 'U']);
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ".split("");

  const wheelSegments: WheelSegment[] = [
    "consonant", "consonant", "consonant", "consonant",
    "vowel", "vowel",
    "lose",
    "jackpot",
    "consonant", "consonant", "consonant", "consonant"
  ];

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
      setPhrase(data.text.toUpperCase());
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate]);

  const handleSpin = () => {
    setSpinning(true);
    setCurrentSegment(null);

    setTimeout(() => {
      const randomSegment = wheelSegments[Math.floor(Math.random() * wheelSegments.length)];
      setCurrentSegment(randomSegment);
      setSpinning(false);

      switch (randomSegment) {
        case "consonant":
          toast.success("Spin landed on CONSONANT! Pick a consonant.");
          break;
        case "vowel":
          toast.success("Spin landed on VOWEL! Pick a vowel.");
          break;
        case "lose":
          toast.error("Lose turn! Bank cleared.");
          setXpBank(0);
          break;
        case "jackpot":
          const bonus = 50;
          setXpBank(xpBank + bonus);
          toast.success(`JACKPOT! +${bonus} XP to bank!`);
          break;
      }
    }, 2000);
  };

  const handleLetterGuess = (letter: string) => {
    if (!currentSegment || revealedLetters.has(letter) || currentSegment === "lose" || currentSegment === "jackpot") return;

    const isVowel = vowels.has(letter);
    const isConsonant = !isVowel;

    if ((currentSegment === "vowel" && !isVowel) || (currentSegment === "consonant" && !isConsonant)) {
      toast.error(`You must pick a ${currentSegment}!`);
      return;
    }

    const newRevealed = new Set(revealedLetters);
    newRevealed.add(letter);
    setRevealedLetters(newRevealed);

    const count = phrase.split('').filter(l => l === letter).length;
    if (count > 0) {
      const xpGain = count * 10;
      setXpBank(xpBank + xpGain);
      toast.success(`Found ${count} ${letter}'s! +${xpGain} XP to bank.`);
      setCanSolve(true);
    } else {
      toast.error(`No ${letter}'s found. Spin again!`);
      setCurrentSegment(null);
    }

    // Check if all letters revealed
    const allRevealed = phrase.split('').every(l => {
      if (l === ' ' || !/[A-Z]/.test(l)) return true;
      return newRevealed.has(l);
    });

    if (allRevealed) {
      handleComplete();
    }
  };

  const handleSolve = () => {
    if (!canSolve) return;
    handleComplete();
  };

  const handleComplete = async () => {
    if (!verse || !user) return;

    setCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const totalXP = verse.xp_reward + xpBank;
    const coinsEarned = Math.floor(totalXP / 10);

    try {
      await supabase.rpc("update_verse_progress", {
        p_user_id: user.id,
        p_verse_id: verse.id,
        p_correct: true,
        p_xp_earned: totalXP,
        p_coins_earned: coinsEarned
      });

      toast.success(`Solved! Earned ${totalXP} XP and ${coinsEarned} coins!`);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const renderPhrase = () => {
    return phrase.split('').map((char, idx) => {
      if (char === ' ') {
        return <span key={idx} className="inline-block w-4" />;
      }
      if (!/[A-Z]/.test(char)) {
        return <span key={idx} className="inline-block w-6 text-center text-2xl font-bold">{char}</span>;
      }
      return (
        <span key={idx} className="inline-block w-8 sm:w-10 h-10 sm:h-12 border-b-2 border-primary mx-1 text-center text-2xl font-bold">
          {revealedLetters.has(char) ? char : ''}
        </span>
      );
    });
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
            ? "Outstanding! You solved it! Your XP treasure is yours! 💎" 
            : "Spin the wheel to reveal letters and solve the verse! Buy vowels for 50 XP or guess consonants!"
          }
        />

        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CircleDollarSign className="w-6 h-6 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {xpBank} XP
                </span>
              </div>
              <p className="text-sm text-muted-foreground">XP Bank</p>
            </div>

            <div className="text-center py-8">
              <div className="flex flex-wrap justify-center">
                {renderPhrase()}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                disabled={spinning || completed || currentSegment === "consonant" || currentSegment === "vowel"}
                onClick={handleSpin}
                className="w-32 h-32 rounded-full text-xl font-bold"
              >
                {spinning ? "🎡" : "SPIN"}
              </Button>
            </div>

            {currentSegment && (
              <div className="text-center">
                <p className="text-lg font-semibold mb-4">
                  {currentSegment === "consonant" && "Pick a Consonant"}
                  {currentSegment === "vowel" && "Pick a Vowel"}
                  {currentSegment === "lose" && "Lost Turn!"}
                  {currentSegment === "jackpot" && "Jackpot!"}
                </p>

                {currentSegment === "consonant" && (
                  <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
                    {consonants.map(letter => (
                      <Button
                        key={letter}
                        variant={revealedLetters.has(letter) ? "secondary" : "outline"}
                        size="sm"
                        disabled={revealedLetters.has(letter)}
                        onClick={() => handleLetterGuess(letter)}
                      >
                        {letter}
                      </Button>
                    ))}
                  </div>
                )}

                {currentSegment === "vowel" && (
                  <div className="flex gap-2 justify-center">
                    {Array.from(vowels).map(letter => (
                      <Button
                        key={letter}
                        variant={revealedLetters.has(letter) ? "secondary" : "outline"}
                        disabled={revealedLetters.has(letter)}
                        onClick={() => handleLetterGuess(letter)}
                      >
                        {letter}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {canSolve && !completed && (
              <div className="text-center">
                <Button onClick={handleSolve} variant="default" size="lg">
                  Solve Phrase
                </Button>
              </div>
            )}

            {completed && (
              <div className="text-center space-y-4 pt-4 border-t">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Phrase solved! 🎉
                </p>
                <Button onClick={() => navigate(`/game-select?verseId=${verseId}&verseRef=${verse.reference}`)}>
                  Continue
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
