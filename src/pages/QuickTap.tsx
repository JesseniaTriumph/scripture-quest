import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHearts } from "@/hooks/useHearts";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { CharacterGuide } from "@/components/CharacterGuide";
import { CHARACTERS } from "@/types/characters";

interface Verse {
  id: string;
  reference: string;
  text: string;
  keywords: string[];
  xp_reward: number;
}

interface Question {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  allAnswers: string[];
}

export default function QuickTap() {
  const [searchParams] = useSearchParams();
  const verseId = searchParams.get("verseId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hearts, loseHeart } = useHearts();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

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
      generateQuestions(data);
      setLoading(false);
    };

    fetchVerse();
  }, [verseId, user, navigate, toast]);

  const generateQuestions = (verseData: Verse) => {
    const words = verseData.text.split(/\s+/);
    const qs: Question[] = [];

    // Question 1: What's the reference?
    qs.push({
      question: "What is the reference for this verse?",
      correctAnswer: verseData.reference,
      wrongAnswers: ["John 3:16", "Psalm 23:1", "Romans 8:28"].filter(r => r !== verseData.reference),
      allAnswers: []
    });

    // Question 2: First word
    qs.push({
      question: "What is the first word of this verse?",
      correctAnswer: words[0],
      wrongAnswers: [words[Math.floor(words.length / 2)], words[words.length - 1], "The"],
      allAnswers: []
    });

    // Question 3: Last word
    qs.push({
      question: "What is the last word of this verse?",
      correctAnswer: words[words.length - 1],
      wrongAnswers: [words[0], words[Math.floor(words.length / 2)], "Amen"],
      allAnswers: []
    });

    // Question 4: Keyword check
    if (verseData.keywords.length > 0) {
      const keyword = verseData.keywords[0];
      qs.push({
        question: `Does this verse contain the word "${keyword}"?`,
        correctAnswer: "Yes",
        wrongAnswers: ["No"],
        allAnswers: []
      });
    }

    // Shuffle answers for each question
    qs.forEach(q => {
      q.allAnswers = [q.correctAnswer, ...q.wrongAnswers.slice(0, 3)]
        .sort(() => Math.random() - 0.5);
    });

    setQuestions(qs);
  };

  const handleAnswer = async (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
    } else {
      await loseHeart();
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        completeGame(isCorrect ? score + 1 : score);
      }
    }, 1500);
  };

  const completeGame = async (finalScore: number) => {
    setIsComplete(true);
    const percentage = (finalScore / questions.length) * 100;

    if (percentage >= 75) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    if (user && verseId && verse) {
      const xpEarned = Math.floor((verse.xp_reward * percentage) / 100);
      await supabase.rpc("update_verse_progress", {
        p_user_id: user.id,
        p_verse_id: verseId,
        p_correct: percentage >= 75,
        p_xp_earned: xpEarned,
        p_coins_earned: finalScore * 2,
      });

      toast({
        title: percentage >= 75 ? "Great Job!" : "Keep Practicing!",
        description: `You scored ${finalScore}/${questions.length} and earned ${xpEarned} XP!`,
      });
    }
  };

  const handleComplete = () => {
    navigate(`/game-select?verseId=${verseId}&ref=${verse?.reference}`);
  };

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (isComplete) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="min-h-screen bg-background">
        <div className="gradient-primary p-6 text-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Quick Tap Complete!</h1>
            <p className="text-white/90">{verse?.reference}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className={`text-6xl font-bold mb-4 ${percentage >= 75 ? 'text-success' : 'text-muted-foreground'}`}>
                {score}/{questions.length}
              </div>
              <p className="text-xl text-muted-foreground mb-2">
                {percentage >= 75 ? "Excellent work!" : "Keep practicing!"}
              </p>
              <p className="text-sm text-muted-foreground">
                You got {Math.round(percentage)}% correct
              </p>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full gradient-primary text-white hover:opacity-90"
              size="lg"
            >
              Continue
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQ.correctAnswer;

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
              <h1 className="text-2xl font-bold">Quick Tap</h1>
              <p className="text-white/90">Answer quickly and accurately</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Hearts</p>
              <p className="text-2xl font-bold">{hearts}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Character Guide - Rhys for timed challenges */}
        <CharacterGuide 
          character={CHARACTERS.rhys}
          message="Time to show what you've got! Quick thinking wins the day!"
        />
        <Card className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</span>
              <span className="text-primary font-semibold">Score: {score}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-8">{currentQ.question}</h2>

            {/* Answers */}
            <div className="grid grid-cols-1 gap-4">
              {currentQ.allAnswers.map((answer, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(answer)}
                  disabled={showFeedback}
                  variant="outline"
                  className={`h-auto py-6 text-lg ${
                    showFeedback && answer === currentQ.correctAnswer
                      ? "border-success bg-success/10 text-success"
                      : showFeedback && answer === selectedAnswer
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : ""
                  }`}
                >
                  {showFeedback && answer === currentQ.correctAnswer && (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  {showFeedback && answer === selectedAnswer && answer !== currentQ.correctAnswer && (
                    <X className="w-5 h-5 mr-2" />
                  )}
                  {answer}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
