import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHearts } from "@/hooks/useHearts";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, Trophy, Coins, ArrowLeft, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { CharacterGuide } from "@/components/CharacterGuide";
import { CHARACTERS } from "@/types/characters";

interface Verse {
  id: string;
  reference: string;
  text: string;
  keywords: string[];
  xp_reward: number;
  difficulty: string;
}

interface BlankQuestion {
  keyword: string;
  options: string[];
  correctAnswer: string;
}

export default function FillInTheBlank() {
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hearts, loseHeart, refreshHearts } = useHearts();
  const { toast } = useToast();

  const [verse, setVerse] = useState<Verse | null>(null);
  const [questions, setQuestions] = useState<BlankQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch verse and generate questions
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
        toast({
          title: "Error",
          description: "Failed to load verse",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setVerse(data);
      generateQuestions(data);
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate]);

  const generateQuestions = (verseData: Verse) => {
    const { keywords, text } = verseData;
    
    // Take up to 3 keywords for the game
    const selectedKeywords = keywords.slice(0, 3);
    
    const questionsList: BlankQuestion[] = selectedKeywords.map((keyword) => {
      // Generate distractors (wrong options)
      const distractors = generateDistractors(keyword, keywords, text);
      const options = [keyword, ...distractors].sort(() => Math.random() - 0.5);
      
      return {
        keyword,
        options,
        correctAnswer: keyword,
      };
    });

    setQuestions(questionsList);
  };

  const generateDistractors = (correctWord: string, allKeywords: string[], text: string): string[] => {
    // Get other words from the verse as potential distractors
    const verseWords = text.split(/\s+/).filter(word => 
      word.length > 3 && 
      word.toLowerCase() !== correctWord.toLowerCase() &&
      !allKeywords.includes(word)
    );

    // Mix verse words with other keywords
    const potentialDistractors = [...verseWords, ...allKeywords.filter(k => k !== correctWord)];
    
    // Select 3 random distractors
    const shuffled = potentialDistractors.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = async () => {
    if (!selectedAnswer || !verse) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setIsAnswerChecked(true);

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      toast({
        title: "Correct! ✅",
        description: "Great job! Keep going!",
      });
    } else {
      setWrongAnswers(wrongAnswers + 1);
      const heartLost = await loseHeart();
      
      if (heartLost) {
        toast({
          title: "Incorrect 💔",
          description: `Lost a heart! Correct answer: ${currentQuestion.correctAnswer}`,
          variant: "destructive",
        });
      }

      // Check if out of lamp oil
      if (hearts <= 1) {
        toast({
          title: "Out of Lamp Oil!",
          description: "Wait for lamp oil to refill or upgrade to Premium",
          variant: "destructive",
        });
        setTimeout(() => navigate("/"), 2000);
        return;
      }
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
      } else {
        completeGame();
      }
    }, 1500);
  };

  const completeGame = async () => {
    if (!verse || !user) return;

    setGameComplete(true);

    // Calculate rewards
    const totalQuestions = questions.length;
    const accuracy = correctAnswers / totalQuestions;
    const xpEarned = Math.round(verse.xp_reward * accuracy);
    const coinsEarned = correctAnswers * 2;

    // Update verse progress in database
    try {
      const { error } = await supabase.rpc("update_verse_progress", {
        p_user_id: user.id,
        p_verse_id: verse.id,
        p_correct: accuracy >= 0.5, // Consider success if 50%+ correct
        p_xp_earned: xpEarned,
        p_coins_earned: coinsEarned,
      });

      if (error) throw error;

      // Refresh hearts to update the display
      await refreshHearts();

      // Show confetti for good performance
      if (accuracy >= 0.7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      toast({
        title: "Game Complete! 🎉",
        description: `Earned ${xpEarned} XP and ${coinsEarned} coins!`,
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <p className="text-lg">Loading verse...</p>
      </div>
    );
  }

  if (!verse || questions.length === 0) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center">Failed to load game. Please try again.</p>
          <Button onClick={() => navigate("/")} className="w-full mt-4">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Create display text with blank for current keyword
  const displayText = verse.text.replace(
    new RegExp(`\\b${currentQuestion.keyword}\\b`, "gi"),
    "______"
  );

  if (gameComplete) {
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
        <Card className="p-8 max-w-2xl w-full">
          <div className="text-center space-y-6">
            <img
              src={CHARACTERS.hope.imagePath}
              alt="Hope celebrates"
              className="w-32 h-32 mx-auto animate-float"
            />
            
            <h2 className="text-3xl font-bold">Game Complete! 🎉</h2>
            
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-8 w-8 text-success" />
                </div>
                <p className="text-2xl font-bold text-success">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <p className="text-2xl font-bold text-accent">
                  +{Math.round(verse.xp_reward * (correctAnswers / questions.length))} XP
                </p>
                <p className="text-xs text-muted-foreground">Experience</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                  <Coins className="h-8 w-8 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-amber-500">
                  +{correctAnswers * 2}
                </p>
                <p className="text-xs text-muted-foreground">Coins</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">{verse.reference}</p>
              <p className="text-sm text-muted-foreground italic">{verse.text}</p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 gradient-primary text-white"
              >
                Play Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="container max-w-4xl">
        {/* Character Guide - Kai for Practice stage */}
        <div className="mb-6">
          <CharacterGuide 
            character={CHARACTERS.kai}
            message="Focus and fill in the missing words. You're building lasting mastery."
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive fill-destructive" />
              <span className="font-bold">{hearts}</span>
            </div>
            <Badge variant="outline">
              Question {currentQuestionIndex + 1}/{questions.length}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3" />
        </div>

        {/* Main Game Card */}
        <Card className="p-8">
          <div className="space-y-6">
            {/* Verse Reference */}
            <div className="text-center">
              <Badge className="mb-4">{verse.reference}</Badge>
              <p className="text-lg leading-relaxed">{displayText}</p>
            </div>

            {/* Question */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Fill in the blank:
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showResult = isAnswerChecked;
                
                let buttonClass = "h-auto py-4 text-lg";
                if (isSelected && !showResult) {
                  buttonClass += " ring-2 ring-primary";
                }
                if (showResult && isSelected && isCorrect) {
                  buttonClass += " bg-success text-white hover:bg-success";
                }
                if (showResult && isSelected && !isCorrect) {
                  buttonClass += " bg-destructive text-white hover:bg-destructive";
                }
                if (showResult && !isSelected && isCorrect) {
                  buttonClass += " ring-2 ring-success";
                }
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={buttonClass}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswerChecked}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>

            {/* Check Answer Button */}
            <Button
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer || isAnswerChecked}
              className="w-full gradient-primary text-white text-lg py-6"
            >
              {isAnswerChecked ? "Next Question..." : "Check Answer"}
            </Button>

            {/* Stats */}
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                ✅ Correct: <strong className="text-success">{correctAnswers}</strong>
              </span>
              <span className="flex items-center gap-1">
                ❌ Wrong: <strong className="text-destructive">{wrongAnswers}</strong>
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
