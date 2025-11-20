import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import confetti from "canvas-confetti";

interface Verse {
  id: string;
  text: string;
  reference: string;
  difficulty: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const AFFIRMATIONS = {
  wrong: [
    "Keep seeking!",
    "You're getting closer!",
    "Every guess reveals more truth!",
    "Learning as you go!"
  ],
  right: [
    "Revealed! ✨",
    "Truth uncovered! 🔓",
    "Light shines! 💡",
    "Wisdom found! 📖"
  ]
};

export default function ScriptureReveal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [verse, setVerse] = useState<Verse | null>(null);
  const [targetWord, setTargetWord] = useState("");
  const [displayWord, setDisplayWord] = useState<string[]>([]);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);

  const maxWrongGuesses = 6;
  const revelationLights = maxWrongGuesses - wrongGuesses;

  useEffect(() => {
    loadVerse();
  }, []);

  useEffect(() => {
    if (targetWord && displayWord.length > 0) {
      checkWinCondition();
    }
  }, [displayWord, targetWord]);

  const loadVerse = async () => {
    try {
      const verseId = searchParams.get("verseId");
      if (!verseId) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("verses")
        .select("*")
        .eq("id", verseId)
        .single();

      if (error) throw error;

      setVerse(data);
      selectTargetWord(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading verse:", error);
      toast({
        title: "Error",
        description: "Failed to load verse",
        variant: "destructive"
      });
      navigate("/");
    }
  };

  const selectTargetWord = (verseData: Verse) => {
    const words = verseData.text.split(/\s+/).filter(w => w.length > 2);
    let selectedWord = "";

    // Select word based on difficulty
    const difficulty = verseData.difficulty.toLowerCase();
    const filteredWords = words.filter(w => {
      const cleanWord = w.replace(/[^a-zA-Z]/g, "");
      if (difficulty === "easy") return cleanWord.length >= 3 && cleanWord.length <= 5;
      if (difficulty === "medium") return cleanWord.length >= 6 && cleanWord.length <= 8;
      if (difficulty === "hard") return cleanWord.length >= 9;
      return cleanWord.length >= 6;
    });

    if (filteredWords.length > 0) {
      selectedWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    } else {
      selectedWord = words[Math.floor(Math.random() * words.length)];
    }

    const cleanWord = selectedWord.replace(/[^a-zA-Z]/g, "").toUpperCase();
    setTargetWord(cleanWord);
    setDisplayWord(cleanWord.split("").map(() => "_"));

    // For easy mode, pre-reveal 2 letters
    if (difficulty === "easy" && cleanWord.length > 2) {
      const indices = [0, Math.floor(cleanWord.length / 2)];
      const newDisplay = cleanWord.split("").map(() => "_");
      const newGuessed = new Set<string>();
      
      indices.forEach(idx => {
        newDisplay[idx] = cleanWord[idx];
        newGuessed.add(cleanWord[idx]);
      });
      
      setDisplayWord(newDisplay);
      setGuessedLetters(newGuessed);
    }
  };

  const handleLetterGuess = (letter: string) => {
    if (guessedLetters.has(letter) || gameOver) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (targetWord.includes(letter)) {
      // Correct guess
      const newDisplay = targetWord.split("").map((char, idx) => 
        char === letter || displayWord[idx] !== "_" ? char : "_"
      );
      setDisplayWord(newDisplay);
      
      toast({
        title: AFFIRMATIONS.right[Math.floor(Math.random() * AFFIRMATIONS.right.length)],
        duration: 1500
      });
    } else {
      // Wrong guess
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      
      toast({
        title: AFFIRMATIONS.wrong[Math.floor(Math.random() * AFFIRMATIONS.wrong.length)],
        duration: 1500
      });

      if (newWrong >= maxWrongGuesses) {
        handleLose();
      }
    }
  };

  const checkWinCondition = () => {
    if (!displayWord.includes("_") && targetWord.length > 0) {
      handleWin();
    }
  };

  const handleWin = async () => {
    setWon(true);
    setGameOver(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const baseXP = 45;
    const bonusXP = revelationLights * 10;
    const totalXP = baseXP + bonusXP;

    toast({
      title: `You revealed '${targetWord}'! 🔓`,
      description: `+${totalXP} XP (${revelationLights} lights remaining)`,
      duration: 3000
    });

    if (user && verse) {
      try {
        await supabase.rpc("update_verse_progress", {
          p_user_id: user.id,
          p_verse_id: verse.id,
          p_correct: true,
          p_xp_earned: totalXP
        });
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const handleLose = () => {
    setGameOver(true);
    setWon(false);
    setDisplayWord(targetWord.split(""));
  };

  const useHint = () => {
    if (hintsUsed >= 3 || gameOver) return;

    const newHints = hintsUsed + 1;
    setHintsUsed(newHints);
    setWrongGuesses(wrongGuesses + 1);

    if (newHints === 1) {
      // Reveal first letter
      const firstLetter = targetWord[0];
      const newDisplay = displayWord.map((char, idx) => 
        idx === 0 ? firstLetter : char
      );
      setDisplayWord(newDisplay);
      setGuessedLetters(new Set([...guessedLetters, firstLetter]));
    } else if (newHints === 2) {
      // Reveal a vowel
      const vowels = ["A", "E", "I", "O", "U"];
      const vowelInWord = targetWord.split("").find((char, idx) => 
        vowels.includes(char) && displayWord[idx] === "_"
      );
      if (vowelInWord) {
        handleLetterGuess(vowelInWord);
      }
    } else if (newHints === 3) {
      // Show word length hint
      toast({
        title: "Hint",
        description: `This word has ${targetWord.length} letters`,
        duration: 3000
      });
    }
  };

  const getVerseWithBlank = () => {
    if (!verse) return "";
    const words = verse.text.split(/(\s+)/);
    return words.map(word => {
      const cleanWord = word.replace(/[^a-zA-Z]/g, "").toUpperCase();
      if (cleanWord === targetWord) {
        return "________";
      }
      return word;
    }).join("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Scripture Reveal...</p>
        </div>
      </div>
    );
  }

  if (!verse) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Scripture Reveal 🔓</h1>
            <p className="text-muted-foreground">Unlock the hidden word</p>
          </div>
          <div className="w-24" />
        </div>

        <div className="grid md:grid-cols-[40%_60%] gap-8">
          {/* Left Section - Revelation Meter */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Revelation Light</h3>
            
            {/* Vertical Light Meter */}
            <div className="flex flex-col items-center gap-2 mb-6">
              {[...Array(maxWrongGuesses)].map((_, idx) => (
                <div
                  key={idx}
                  className={`w-full h-12 rounded-lg transition-all duration-500 ${
                    idx < revelationLights
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/50"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="text-center mb-4">
              <p className="text-2xl font-bold">
                {"⚡".repeat(revelationLights)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {revelationLights} lights remaining
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wrong guesses:</span>
                <span className="font-semibold">{wrongGuesses}/{maxWrongGuesses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Letters guessed:</span>
                <span className="font-semibold">{guessedLetters.size}</span>
              </div>
            </div>

            {/* Hint Button */}
            <Button
              onClick={useHint}
              disabled={hintsUsed >= 3 || gameOver}
              variant="outline"
              className="w-full mt-4 gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Need a Hint? ({3 - hintsUsed} available)
            </Button>
          </Card>

          {/* Right Section - Game Area */}
          <div className="space-y-6">
            {/* Verse Context */}
            <Card className="p-6">
              <p className="text-lg mb-2">{getVerseWithBlank()}</p>
              <p className="text-sm text-muted-foreground">{verse.reference}</p>
              <p className="text-sm text-primary mt-2">
                Find the missing word ({targetWord.length} letters)
              </p>
            </Card>

            {/* Word Display */}
            <Card className="p-6">
              <div className="flex justify-center gap-2 flex-wrap mb-6">
                {displayWord.map((letter, idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 transition-all ${
                      letter === "_"
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-primary bg-primary/10 text-primary animate-scale-in"
                    }`}
                  >
                    {letter === "_" ? "" : letter}
                  </div>
                ))}
              </div>

              {/* Alphabet Keyboard */}
              <div className="grid grid-cols-7 gap-2">
                {ALPHABET.map(letter => {
                  const isGuessed = guessedLetters.has(letter);
                  const isCorrect = targetWord.includes(letter);
                  
                  return (
                    <Button
                      key={letter}
                      onClick={() => handleLetterGuess(letter)}
                      disabled={isGuessed || gameOver}
                      variant={
                        isGuessed && isCorrect
                          ? "default"
                          : isGuessed && !isCorrect
                          ? "secondary"
                          : "outline"
                      }
                      className={`h-12 text-lg ${
                        isGuessed && !isCorrect ? "line-through opacity-50" : ""
                      }`}
                    >
                      {letter}
                    </Button>
                  );
                })}
              </div>
            </Card>

            {/* Game Over Messages */}
            {gameOver && (
              <Card className="p-6 text-center">
                {won ? (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">
                      You revealed '{targetWord}' with {revelationLights} lights remaining! 🔓
                    </h2>
                    <p className="text-lg">{verse.text}</p>
                    <p className="text-muted-foreground">{verse.reference}</p>
                    <Button onClick={() => navigate(-1)} className="gap-2">
                      Continue
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Almost there!</h2>
                    <p className="text-lg">The word was: <span className="text-primary font-bold">{targetWord}</span></p>
                    <p className="text-muted-foreground">{verse.text}</p>
                    <p className="text-muted-foreground">{verse.reference}</p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={() => window.location.reload()}>
                        Reveal Again
                      </Button>
                      <Button variant="outline" onClick={() => navigate(-1)}>
                        Try Different Word
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
