import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Calendar, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CharacterGuide } from "@/components/CharacterGuide";
import { CHARACTERS } from "@/types/characters";

interface VerseWithProgress {
  id: string;
  reference: string;
  text: string;
  difficulty: string;
  xp_reward: number;
  mastery_level: number;
  last_played_at: string;
  times_correct: number;
  times_wrong: number;
}

export default function Review() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [versesForReview, setVersesForReview] = useState<VerseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStreak, setReviewStreak] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchReviewData();
  }, [user, navigate]);

  const fetchReviewData = async () => {
    if (!user) return;

    // Fetch verses that need review (spaced repetition logic)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("verse_progress")
      .select(`
        *,
        verses (
          id,
          reference,
          text,
          difficulty,
          xp_reward
        )
      `)
      .eq("user_id", user.id)
      .or(`
        and(mastery_level.eq.0,last_played_at.lt.${oneDayAgo.toISOString()}),
        and(mastery_level.eq.1,last_played_at.lt.${threeDaysAgo.toISOString()}),
        and(mastery_level.eq.2,last_played_at.lt.${weekAgo.toISOString()})
      `)
      .order("last_played_at", { ascending: true })
      .limit(10);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load review verses",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Transform data
    const transformed = data.map((item: any) => ({
      id: item.verses.id,
      reference: item.verses.reference,
      text: item.verses.text,
      difficulty: item.verses.difficulty,
      xp_reward: item.verses.xp_reward,
      mastery_level: item.mastery_level,
      last_played_at: item.last_played_at,
      times_correct: item.times_correct,
      times_wrong: item.times_wrong,
    }));

    setVersesForReview(transformed);
    setLoading(false);
  };

  const getDaysSinceLastPractice = (lastPlayedAt: string) => {
    const now = new Date();
    const lastPlayed = new Date(lastPlayedAt);
    const diffTime = Math.abs(now.getTime() - lastPlayed.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getReviewPriority = (mastery: number, daysSince: number) => {
    if (mastery === 0 && daysSince >= 1) return "High";
    if (mastery === 1 && daysSince >= 3) return "High";
    if (mastery === 2 && daysSince >= 7) return "Medium";
    return "Low";
  };

  const handleStartReview = (verse: VerseWithProgress) => {
    navigate(`/game-select?verseId=${verse.id}&ref=${verse.reference}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading review verses...</p>
      </div>
    );
  }

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
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">📚 Scripture Review</h1>
          <p className="text-white/90">Keep your verses fresh with spaced repetition</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Character Guide - Selah for review/rest */}
        <CharacterGuide 
          character={CHARACTERS.selah}
          message="Take time to reflect on what you've learned. Rest and review strengthen your foundation."
        />
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground mb-1">Review Charge</p>
            <p className="text-3xl font-bold">{reviewStreak} days</p>
          </Card>
          <Card className="p-6 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground mb-1">Verses for Review</p>
            <p className="text-3xl font-bold">{versesForReview.length}</p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground mb-1">Total XP Available</p>
            <p className="text-3xl font-bold">
              {versesForReview.reduce((sum, v) => sum + v.xp_reward, 0)}
            </p>
          </Card>
        </div>

        {/* Review List */}
        {versesForReview.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mb-4">
              <span className="text-6xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
            <p className="text-muted-foreground mb-6">
              You're up to date with all your reviews. Great work!
            </p>
            <Button
              onClick={() => navigate("/")}
              className="gradient-primary text-white hover:opacity-90"
            >
              Learn New Verses
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Verses Needing Practice</h2>
            {versesForReview.map((verse) => {
              const daysSince = getDaysSinceLastPractice(verse.last_played_at);
              const priority = getReviewPriority(verse.mastery_level, daysSince);
              
              return (
                <Card key={verse.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{verse.reference}</h3>
                        <Badge variant={
                          priority === "High" ? "destructive" :
                          priority === "Medium" ? "default" : "secondary"
                        }>
                          {priority} Priority
                        </Badge>
                        <Badge variant="outline">
                          Mastery Level {verse.mastery_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {verse.text}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📅 Last practiced {daysSince} day{daysSince !== 1 ? 's' : ''} ago</span>
                        <span>✓ {verse.times_correct} correct</span>
                        <span>✗ {verse.times_wrong} wrong</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartReview(verse)}
                      className="gradient-primary text-white hover:opacity-90"
                    >
                      Review Now
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Spaced Repetition Info */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <h3 className="font-bold text-lg mb-3">📖 About Spaced Repetition</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Mastery 0:</strong> Review after 1 day</p>
            <p>• <strong>Mastery 1:</strong> Review after 3 days</p>
            <p>• <strong>Mastery 2:</strong> Review after 7 days</p>
            <p>• <strong>Mastery 3:</strong> Fully mastered - occasional review recommended</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
